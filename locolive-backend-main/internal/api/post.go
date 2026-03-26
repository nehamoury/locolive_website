package api

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"privacy-social-backend/internal/repository/db"
	"privacy-social-backend/internal/token"
)

// ─── Request / Response DTOs ────────────────────────────────────────────────

type createPostRequest struct {
	MediaURL     string  `json:"media_url"   binding:"required"`
	MediaType    string  `json:"media_type"  binding:"required,oneof=image video text"`
	Caption      string  `json:"caption"`
	LocationName string  `json:"location_name"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	HasLocation  bool    `json:"has_location"`
}

// ─── Handlers ────────────────────────────────────────────────────────────────

// createPost creates a new permanent post.
func (server *Server) createPost(ctx *gin.Context) {
	var req createPostRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	post, err := server.store.CreatePost(ctx, db.CreatePostParams{
		UserID:      authPayload.UserID,
		MediaUrl:    req.MediaURL,
		MediaType:   req.MediaType,
		Caption:     sql.NullString{String: req.Caption, Valid: req.Caption != ""},
		LocationName: sql.NullString{String: req.LocationName, Valid: req.LocationName != ""},
		Geohash:     sql.NullString{},
		HasLocation: req.HasLocation,
		Lat:         req.Latitude,
		Lng:         req.Longitude,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusCreated, post)
}

// getUserPosts returns a grid of permanent posts for a user profile.
func (server *Server) getUserPosts(ctx *gin.Context) {
	targetUserID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "12"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 12
	}

	posts, err := server.store.ListPostsByUserID(ctx, db.ListPostsByUserIDParams{
		UserID:   targetUserID,
		ViewerID: authPayload.UserID,
		Lim:      int32(pageSize),
		Off:      int32((page - 1) * pageSize),
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"posts": posts, "page": page, "page_size": pageSize})
}

// getMyPosts returns the authenticated user's own posts.
func (server *Server) getMyPosts(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "12"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 12
	}

	posts, err := server.store.ListPostsByUserID(ctx, db.ListPostsByUserIDParams{
		UserID:   authPayload.UserID,
		ViewerID: authPayload.UserID,
		Lim:      int32(pageSize),
		Off:      int32((page - 1) * pageSize),
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"posts": posts, "page": page, "page_size": pageSize})
}

// getConnectionsFeed returns posts from connections (following feed).
func (server *Server) getConnectionsFeed(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(ctx.DefaultQuery("page_size", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 20
	}

	posts, err := server.store.ListConnectionsPosts(ctx, db.ListConnectionsPostsParams{
		ViewerID: authPayload.UserID,
		Lim:      int32(pageSize),
		Off:      int32((page - 1) * pageSize),
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"posts": posts, "page": page, "page_size": pageSize})
}

// deletePost lets a user delete their own post.
func (server *Server) deletePost(ctx *gin.Context) {
	postID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	if err := server.store.DeletePost(ctx, db.DeletePostParams{
		ID:     postID,
		UserID: authPayload.UserID,
	}); err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "post deleted"})
}

// likePost likes a post and increments the counter.
func (server *Server) likePost(ctx *gin.Context) {
	postID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	_, err = server.store.LikePost(ctx, db.LikePostParams{
		PostID: postID,
		UserID: authPayload.UserID,
	})
	if err != nil {
		// Conflict (already liked) is treated as success
		ctx.JSON(http.StatusOK, gin.H{"message": "liked"})
		return
	}

	_ = server.store.IncrementPostLikes(ctx, postID)
	ctx.JSON(http.StatusOK, gin.H{"message": "liked"})
}

// unlikePost removes a like from a post.
func (server *Server) unlikePost(ctx *gin.Context) {
	postID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	if err := server.store.UnlikePost(ctx, db.UnlikePostParams{
		PostID: postID,
		UserID: authPayload.UserID,
	}); err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	_ = server.store.DecrementPostLikes(ctx, postID)
	ctx.JSON(http.StatusOK, gin.H{"message": "unliked"})
}

// addPostComment adds a comment to a post.
func (server *Server) addPostComment(ctx *gin.Context) {
	postID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var req struct {
		Content string `json:"content" binding:"required,min=1,max=500"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	comment, err := server.store.CreatePostComment(ctx, db.CreatePostCommentParams{
		PostID:  postID,
		UserID:  authPayload.UserID,
		Content: req.Content,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusCreated, comment)
}

// listPostComments returns comments for a post.
func (server *Server) listPostComments(ctx *gin.Context) {
	postID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	comments, err := server.store.ListPostComments(ctx, postID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, comments)
}

// deletePostComment deletes a comment the user owns.
func (server *Server) deletePostComment(ctx *gin.Context) {
	commentID, err := uuid.Parse(ctx.Param("commentId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	if err := server.store.DeletePostComment(ctx, db.DeletePostCommentParams{
		ID:     commentID,
		UserID: authPayload.UserID,
	}); err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "comment deleted"})
}
