package api

import (
	"database/sql"
	"net/http"
	"privacy-social-backend/internal/service/admin"
	"privacy-social-backend/internal/util"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
	"privacy-social-backend/internal/repository/db"
	"privacy-social-backend/internal/token"
)

const (
	adminStatsCacheTTL = 1 * time.Minute
)

// Response Models for Clean JSON
type AdminUserResponse struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	FullName  string    `json:"full_name"`
	AvatarUrl string    `json:"avatar_url"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	Status    string    `json:"status"`
	IsBanned  bool      `json:"is_banned"`
	CreatedAt time.Time `json:"created_at"`
}

type listUsersRequest struct {
	PageID   int32 `form:"page" binding:"required,min=1"`
	PageSize int32 `form:"page_size" binding:"required,min=5,max=100"`
}

func newAdminUserResponse(user db.User) AdminUserResponse {
	return AdminUserResponse{
		ID:        user.ID.String(),
		Username:  user.Username,
		FullName:  user.FullName,
		AvatarUrl: user.AvatarUrl.String,
		Email:     user.Email.String,
		Role:      string(user.Role),
		Status:    "offline", // Default, will be updated by Hub if needed
		IsBanned:  user.IsShadowBanned,
		CreatedAt: user.CreatedAt,
	}
}

func (server *Server) listUsers(ctx *gin.Context) {
	var req listUsersRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	users, count, err := server.admin.ListUsers(ctx, admin.ListUsersParams{
		PageID:   req.PageID,
		PageSize: req.PageSize,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	userResponses := make([]AdminUserResponse, len(users))
	for i, u := range users {
		userResponses[i] = newAdminUserResponse(u)
		if server.hub.IsUserOnline(u.ID) {
			userResponses[i].Status = "online"
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"items":     userResponses,
			"total":     count,
			"page":      req.PageID,
			"page_size": req.PageSize,
		},
	})
}

// Admin: Ban/Unban User
type banUserRequest struct {
	UserID string `json:"user_id" binding:"required,uuid"`
	Ban    bool   `json:"ban" binding:"required"`
}

func (server *Server) banUser(ctx *gin.Context) {
	var req banUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	_, ok := parseUUIDParam(ctx, req.UserID, "user_id")
	if !ok {
		return
	}

	// Wait, req.UserID is string in my param struct but the parser helper returns uuid.
	// Actually banUserRequest defined UserID as string.
	// Service expects BanUserParams with string UserID to be parsed inside or UUID?
	// AdminService.BanUser takes params.UserID as string and parses it.
	// So I can pass req.UserID directly if I want, or pass the UUID.
	// Let's check AdminService signature again.
	// func (s *ServiceImpl) BanUser(ctx context.Context, params BanUserParams) (db.User, error)
	// type BanUserParams struct { UserID string; Ban bool }

	// So I should pass string. parseUUIDParam is doing validation which is good.
	// I will keep validation but just pass the string to service.

	user, err := server.admin.BanUser(ctx, admin.BanUserParams{
		UserID: req.UserID,
		Ban:    req.Ban,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    newAdminUserResponse(user),
	})
}

// Admin: Delete User
type deleteUserRequest struct {
	UserID string `uri:"id" binding:"required,uuid"`
}

func (server *Server) deleteUser(ctx *gin.Context) {
	var req deleteUserRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	err := server.admin.DeleteUser(ctx, req.UserID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"message": "user deleted"},
	})
}

// Admin: Get Statistics (with Redis caching)
func (server *Server) getStats(ctx *gin.Context) {
	response, isCached, err := server.admin.GetStats(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if isCached {
		ctx.Header("X-Cache", "HIT")
	} else {
		ctx.Header("X-Cache", "MISS")
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    response,
	})
}

// Admin: List Reports
type listReportsRequest struct {
	Resolved bool  `form:"resolved"`
	PageID   int32 `form:"page" binding:"required,min=1"`
	PageSize int32 `form:"page_size" binding:"required,min=5,max=100"`
}

func (server *Server) listReports(ctx *gin.Context) {
	var req listReportsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	reports, err := server.admin.ListReports(ctx, req.Resolved, req.PageID, req.PageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"items":     reports,
			"page":      req.PageID,
			"page_size": req.PageSize,
		},
	})
}

// Admin: Resolve Report
type resolveReportRequest struct {
	ReportID string `uri:"id" binding:"required,uuid"`
}

func (server *Server) resolveReport(ctx *gin.Context) {
	var req resolveReportRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	report, err := server.admin.ResolveReport(ctx, req.ReportID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    report,
	})
}

// Admin: Delete Story
type deleteStoryRequest struct {
	StoryID string `uri:"id" binding:"required,uuid"`
}

func (server *Server) deleteStory(ctx *gin.Context) {
	var req deleteStoryRequest
	if err := ctx.ShouldBindUri(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	err := server.admin.DeleteStory(ctx, req.StoryID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"message": "story deleted"},
	})
}

// Admin: List All Stories
type listAllStoriesRequest struct {
	PageID   int32 `form:"page" binding:"required,min=1"`
	PageSize int32 `form:"page_size" binding:"required,min=5,max=100"`
}

func (server *Server) listAllStories(ctx *gin.Context) {
	var req listAllStoriesRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	stories, err := server.admin.ListAllStories(ctx, req.PageID, req.PageSize)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"items":     stories,
			"page":      req.PageID,
			"page_size": req.PageSize,
		},
	})
}

// ─── Admin: Map Active Users ──────────────────────────────────────────────

type mapActiveRequest struct {
	Radius float64 `form:"radius,default=5"` // km
	Lat    float64 `form:"lat"`
	Lng    float64 `form:"lng"`
}

type mapUserResponse struct {
	ID        string  `json:"id"`
	Username  string  `json:"username"`
	FullName  string  `json:"full_name"`
	AvatarUrl string  `json:"avatar_url"`
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Online    bool    `json:"online"`
}

func (server *Server) getMapActiveUsers(ctx *gin.Context) {
	// Get all users with positions in Redis GEO
	positions, err := server.redis.GeoSearchLocation(ctx, "users:locations", &redis.GeoSearchLocationQuery{
		GeoSearchQuery: redis.GeoSearchQuery{
			// Search entire globe – we filter per viewport on client
			Longitude:  77.5946, // Default center (Bangalore)
			Latitude:   12.9716,
			Radius:     20000, // 20,000 km = global
			RadiusUnit: "km",
			Sort:       "ASC",
			Count:      500,
		},
		WithCoord: true,
		WithDist:  true,
	}).Result()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	users := make([]mapUserResponse, 0, len(positions))
	for _, pos := range positions {
		userID, err := uuid.Parse(pos.Name)
		if err != nil {
			continue
		}
		user, err := server.store.GetUserByID(ctx, userID)
		if err != nil || user.IsGhostMode || user.IsShadowBanned {
			continue
		}

		avatar := ""
		if user.AvatarUrl.Valid {
			avatar = user.AvatarUrl.String
		}

		online := user.LastActiveAt.Valid && time.Since(user.LastActiveAt.Time) < 5*time.Minute

		users = append(users, mapUserResponse{
			ID:        pos.Name,
			Username:  user.Username,
			FullName:  user.FullName,
			AvatarUrl: avatar,
			Lat:       pos.Latitude,
			Lng:       pos.Longitude,
			Online:    online,
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"users": users,
			"total": len(users),
		},
	})
}

// ─── Admin: Logout ──────────────────────────────────────────────────────

func (server *Server) adminLogout(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Block all sessions for this user
	err := server.store.BlockSession(ctx, authPayload.UserID)
	if err != nil {
		// Non-critical – log but don't fail
		log.Warn().Err(err).Msg("Failed to block sessions on logout")
	}

	// Add token to Redis blacklist until its natural expiry
	tokenStr := ctx.GetHeader("Authorization")
	if len(tokenStr) > 7 {
		tokenStr = tokenStr[7:] // Strip "Bearer "
		ttl := time.Until(authPayload.ExpiredAt)
		if ttl > 0 {
			server.redis.Set(ctx, "blacklist:"+tokenStr, "1", ttl)
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    gin.H{"message": "logged out successfully"},
	})
}

// ─── Admin: Search Users ─────────────────────────────────────────────────

type searchUsersAdminRequest struct {
	Query    string `form:"q" binding:"required,min=1"`
	PageID   int32  `form:"page,default=1"`
	PageSize int32  `form:"page_size,default=20"`
}

func (server *Server) searchUsersAdmin(ctx *gin.Context) {
	var req searchUsersAdminRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	users, err := server.store.SearchUsersAdmin(ctx, db.SearchUsersAdminParams{
		Query:  req.Query,
		Limit:  req.PageSize,
		Offset: (req.PageID - 1) * req.PageSize,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	count, err := server.store.CountSearchUsersAdmin(ctx, req.Query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	userResponses := make([]AdminUserResponse, len(users))
	for i, u := range users {
		userResponses[i] = newAdminUserResponse(u)
		if server.hub.IsUserOnline(u.ID) {
			userResponses[i].Status = "online"
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"items":     userResponses,
			"total":     count,
			"page":      req.PageID,
			"page_size": req.PageSize,
		},
	})
}

// ─── Admin: List Crossings ───────────────────────────────────────────────

type listAdminCrossingsRequest struct {
	PageID   int32 `form:"page,default=1"`
	PageSize int32 `form:"page_size,default=20"`
}

type adminCrossingResponse struct {
	ID       string             `json:"id"`
	UserA    AdminUserResponse  `json:"userA"`
	UserB    AdminUserResponse  `json:"userB"`
	Time     time.Time          `json:"time"`
	Location map[string]float64 `json:"location"`
	Distance int                `json:"distance"`
}

func (server *Server) listAdminCrossings(ctx *gin.Context) {
	var req listAdminCrossingsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	crossings, err := server.store.ListAdminCrossings(ctx, db.ListAdminCrossingsParams{
		Column1: req.PageSize,
		Column2: (req.PageID - 1) * req.PageSize,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	total, err := server.store.CountAdminCrossings(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	responses := make([]adminCrossingResponse, len(crossings))
	for i, c := range crossings {
		// Basic mapping
		userA := AdminUserResponse{
			ID:       c.U1ID.String(),
			Username: c.U1Username,
			FullName: c.U1FullName,
		}
		if c.U1AvatarUrl.Valid {
			userA.AvatarUrl = c.U1AvatarUrl.String
		}
		if server.hub.IsUserOnline(c.U1ID) {
			userA.Status = "online"
		} else {
			userA.Status = "offline"
		}

		userB := AdminUserResponse{
			ID:       c.U2ID.String(),
			Username: c.U2Username,
			FullName: c.U2FullName,
		}
		if c.U2AvatarUrl.Valid {
			userB.AvatarUrl = c.U2AvatarUrl.String
		}
		if server.hub.IsUserOnline(c.U2ID) {
			userB.Status = "online"
		} else {
			userB.Status = "offline"
		}

		// Add dummy distance, or 0 since we mock it
		responses[i] = adminCrossingResponse{
			ID:    c.ID.String(),
			UserA: userA,
			UserB: userB,
			Time:  c.OccurredAt,
			Location: map[string]float64{
				"lat": c.Lat.(float64),
				"lng": c.Lng.(float64),
			},
			Distance: 0,
		}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"items":     responses,
			"total":     total,
			"page":      req.PageID,
			"page_size": req.PageSize,
		},
	})
}

type adminResetPasswordRequest struct {
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func (server *Server) adminResetUserPassword(ctx *gin.Context) {
	userID := ctx.Param("id")
	if userID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "user id is required"})
		return
	}

	var req adminResetPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	user, err := server.store.GetUserByID(ctx, uid)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user"})
		return
	}

	hashedPassword, err := util.HashPassword(req.NewPassword)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	err = server.store.UpdateUserPassword(ctx, db.UpdateUserPasswordParams{
		ID:           uid,
		PasswordHash: hashedPassword,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
		return
	}

	log.Info().Str("username", user.Username).Str("email", user.Email.String).Msg("admin reset user password")
	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "password updated successfully"})
}
