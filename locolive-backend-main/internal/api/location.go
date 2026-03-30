package api

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mmcloughlin/geohash"
	"github.com/rs/zerolog/log"

	"privacy-social-backend/internal/repository/db"
	"privacy-social-backend/internal/token"
)

const (
	locationPrecision = 7                // +/- 76m approx
	bucketDuration    = 10 * time.Minute // 10 min time buckets
	locationTTL       = 24 * time.Hour
)

type updateLocationRequest struct {
	Latitude  float64 `json:"latitude" binding:"required,min=-90,max=90"`
	Longitude float64 `json:"longitude" binding:"required,min=-180,max=180"`
}

func (server *Server) updateLocation(ctx *gin.Context) {
	var req updateLocationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Ghost Mode Logic
	user, userErr := server.store.GetUserByID(ctx, authPayload.UserID)
	if userErr == nil && user.IsGhostMode {
		if user.GhostModeExpiresAt.Valid && time.Now().After(user.GhostModeExpiresAt.Time) {
			server.store.ToggleGhostMode(ctx, db.ToggleGhostModeParams{
				ID:                 authPayload.UserID,
				IsGhostMode:        false,
				GhostModeExpiresAt: sql.NullTime{},
			})
		} else {
			ctx.JSON(http.StatusOK, gin.H{"status": "ghost"})
			return
		}
	}

	hash := geohash.Encode(req.Latitude, req.Longitude)
	if len(hash) > locationPrecision {
		hash = hash[:locationPrecision]
	}

	// Safety Check: Fake GPS
	val := server.safety.ValidateUserMovement(ctx, authPayload.UserID.String(), req.Latitude, req.Longitude)
	if !val.Allowed {
		if val.ShouldBan {
			server.store.BanUser(ctx, db.BanUserParams{
				ID:             authPayload.UserID,
				IsShadowBanned: true,
			})
			log.Warn().Str("user_id", authPayload.UserID.String()).Msg("User shadow-banned for fake GPS")
		}
		ctx.JSON(http.StatusOK, gin.H{"status": "updated"})
		return
	}

	now := time.Now().UTC()
	bucketTime := now.Truncate(bucketDuration)
	expiresAt := now.Add(locationTTL)

	_, err := server.store.CreateLocation(ctx, db.CreateLocationParams{
		UserID:     authPayload.UserID,
		Geohash:    hash,
		Lng:        req.Longitude,
		Lat:        req.Latitude,
		TimeBucket: bucketTime,
		ExpiresAt:  expiresAt,
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	_, err = server.store.UpdateUserActivity(ctx, authPayload.UserID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to update user activity on location ping")
	}

	// Redis GEO Update & Crossing Detection
	if err := server.location.UpdateUserLocation(ctx, authPayload.UserID, req.Latitude, req.Longitude); err != nil {
		log.Error().Err(err).Msg("Failed to update redis location service")
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "updated"})
}

func (server *Server) getHeatmap(ctx *gin.Context) {
	data, err := server.store.GetHeatmapData(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	type heatmapPoint struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
		Weight    int64   `json:"weight"`
	}

	rsp := make([]heatmapPoint, len(data))
	for i, d := range data {
		lat, _ := d.Latitude.(float64)
		lng, _ := d.Longitude.(float64)
		rsp[i] = heatmapPoint{
			Latitude:  lat,
			Longitude: lng,
			Weight:    d.Weight,
		}
	}

	ctx.JSON(http.StatusOK, rsp)
}

type getNearbyUsersRequest struct {
	Latitude  float64 `form:"lat" binding:"required,min=-90,max=90"`
	Longitude float64 `form:"lng" binding:"required,min=-180,max=180"`
	Radius    float64 `form:"radius,default=5"` // in km (Default 5km as per req)
}

type nearbyUserResponse struct {
	UserID    string  `json:"userId"`
	Distance  float64 `json:"distance"`
	Latitude  float64 `json:"lat"`
	Longitude float64 `json:"lng"`
}

func (server *Server) getNearbyUsers(ctx *gin.Context) {
	var req getNearbyUsersRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Fetch from Redis via Service
	matches, err := server.location.GetNearbyUsers(ctx, authPayload.UserID, req.Latitude, req.Longitude, req.Radius)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	rsp := make([]nearbyUserResponse, len(matches))
	for i, match := range matches {
		rsp[i] = nearbyUserResponse{
			UserID:    match.Name,
			Distance:  match.Dist,
			Latitude:  match.Latitude,
			Longitude: match.Longitude,
		}
	}

	ctx.JSON(http.StatusOK, rsp)
}
