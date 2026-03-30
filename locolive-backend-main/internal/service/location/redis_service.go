package location

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/mmcloughlin/geohash"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"

	"privacy-social-backend/internal/realtime"
	"privacy-social-backend/internal/repository"
	"privacy-social-backend/internal/repository/db"
)

const (
	// Key prefix for user locations
	userLocationsKey = "users:locations"

	// Key prefix for daily crossing duplications
	crossingKeyPrefix = "crossing:"

	// Crossing TTL (Don't trigger same crossing for 10 minutes)
	crossingTTL = 10 * time.Minute

	// Radius for "crossing paths" (approx 76m to match Geohash precision)
	crossingRadiusMeters = 80.0
)

type RedisLocationService struct {
	redis *redis.Client
	store repository.Store
	hub   *realtime.Hub
}

func NewRedisLocationService(redis *redis.Client, store repository.Store, hub *realtime.Hub) *RedisLocationService {
	return &RedisLocationService{
		redis: redis,
		store: store,
		hub:   hub,
	}
}

// UpdateUserLocation updates user position in Redis and triggers real-time crossing detection
func (s *RedisLocationService) UpdateUserLocation(ctx context.Context, userID uuid.UUID, lat, lng float64) error {
	// 1. Update Geo Index
	err := s.redis.GeoAdd(ctx, userLocationsKey, &redis.GeoLocation{
		Name:      userID.String(),
		Longitude: lng,
		Latitude:  lat,
	}).Err()
	if err != nil {
		return fmt.Errorf("failed to update geo location: %w", err)
	}

	// 2. Find nearby users (Real-time Crossing Detection)
	// Modern GEOSEARCH command replaces GEORADIUS
	matches, err := s.redis.GeoSearchLocation(ctx, userLocationsKey, &redis.GeoSearchLocationQuery{
		GeoSearchQuery: redis.GeoSearchQuery{
			Longitude:  lng,
			Latitude:   lat,
			Radius:     crossingRadiusMeters,
			RadiusUnit: "m",
			Sort:       "ASC",
		},
		WithDist:  true,
		WithCoord: true,
	}).Result()

	if err != nil {
		log.Error().Err(err).Msg("failed to query nearby users for crossings using GeoSearch")
		return nil
	}

	// 3. Process matches
	s.processCrossings(ctx, userID, matches)

	return nil
}

// GetNearbyUsers fetches filtered users within a radius using GEOSEARCH
func (s *RedisLocationService) GetNearbyUsers(ctx context.Context, userID uuid.UUID, lat, lng float64, radiusKm float64) ([]redis.GeoLocation, error) {
	// 1. Fetch from Redis
	matches, err := s.redis.GeoSearchLocation(ctx, userLocationsKey, &redis.GeoSearchLocationQuery{
		GeoSearchQuery: redis.GeoSearchQuery{
			Longitude:  lng,
			Latitude:   lat,
			Radius:     radiusKm,
			RadiusUnit: "km",
			Sort:       "ASC",
			Count:      50,
		},
		WithDist:  true,
		WithCoord: true,
	}).Result()

	if err != nil {
		return nil, fmt.Errorf("failed to search nearby users: %w", err)
	}

	// 2. Filter matches
	var filtered []redis.GeoLocation
	for _, match := range matches {
		targetIDStr := match.Name

		// Skip self
		if targetIDStr == userID.String() {
			continue
		}

		targetID, err := uuid.Parse(targetIDStr)
		if err != nil {
			continue
		}

		// Verify Privacy/Blocks
		valid, err := s.validateCrossingPrivacy(ctx, userID, targetID)
		if err != nil || !valid {
			continue
		}

		filtered = append(filtered, match)
	}

	return filtered, nil
}

func (s *RedisLocationService) processCrossings(ctx context.Context, userID uuid.UUID, matches []redis.GeoLocation) {
	for _, match := range matches {
		targetUserIDStr := match.Name

		// Skip self
		if targetUserIDStr == userID.String() {
			continue
		}

		targetUserID, err := uuid.Parse(targetUserIDStr)
		if err != nil {
			continue
		}

		u1, u2 := userID, targetUserID
		if u1.String() > u2.String() {
			u1, u2 = u2, u1
		}

		// Check De-duplication
		dedupKey := fmt.Sprintf("%s%s:%s", crossingKeyPrefix, u1.String(), u2.String())
		exists, err := s.redis.Exists(ctx, dedupKey).Result()
		if err == nil && exists > 0 {
			continue
		}

		valid, err := s.validateCrossingPrivacy(ctx, userID, targetUserID)
		if err != nil || !valid {
			continue
		}

		centerHash := geohash.Encode(match.Latitude, match.Longitude)

		crossing, err := s.store.CreateCrossing(ctx, db.CreateCrossingParams{
			UserID1:        u1,
			UserID2:        u2,
			LocationCenter: centerHash,
			OccurredAt:     time.Now().UTC(),
		})
		if err != nil {
			log.Error().Err(err).Msg("failed to persist crossing")
			continue
		}

		s.createNotification(ctx, userID, targetUserID, crossing.ID)
		s.createNotification(ctx, targetUserID, userID, crossing.ID)

		s.invalidateCrossingsCache(ctx, userID)
		s.invalidateCrossingsCache(ctx, targetUserID)

		s.redis.Set(ctx, dedupKey, "1", crossingTTL)
	}
}

func (s *RedisLocationService) validateCrossingPrivacy(ctx context.Context, u1, u2 uuid.UUID) (bool, error) {
	// Block Check
	blocked, err := s.store.IsUserBlocked(ctx, db.IsUserBlockedParams{
		BlockerID: u1,
		BlockedID: u2,
	})
	if err != nil || blocked {
		return false, err
	}

	blockedReverse, err := s.store.IsUserBlocked(ctx, db.IsUserBlockedParams{
		BlockerID: u2,
		BlockedID: u1,
	})
	if err != nil || blockedReverse {
		return false, err
	}

	// Status Check (Ghost/Shadow)
	user1, err := s.store.GetUserByID(ctx, u1)
	if err != nil || user1.IsGhostMode || user1.IsShadowBanned {
		return false, err
	}

	user2, err := s.store.GetUserByID(ctx, u2)
	if err != nil || user2.IsGhostMode || user2.IsShadowBanned {
		return false, err
	}

	return true, nil
}

func (s *RedisLocationService) createNotification(ctx context.Context, recipient, crossedWith uuid.UUID, crossingID uuid.UUID) {
	notif, err := s.store.CreateNotification(ctx, db.CreateNotificationParams{
		UserID:            recipient,
		Type:              "crossing_detected",
		Title:             "Path Crossed!",
		Message:           "You crossed paths with someone nearby",
		RelatedUserID:     uuid.NullUUID{UUID: crossedWith, Valid: true},
		RelatedCrossingID: uuid.NullUUID{UUID: crossingID, Valid: true},
	})
	if err != nil {
		log.Error().Err(err).Msg("failed to create notification for crossing")
		return
	}

	if s.hub != nil {
		s.hub.SendToUser(recipient, s.formatAlert("crossing_detected", notif))
	}
}

func (s *RedisLocationService) formatAlert(msgType string, payload interface{}) []byte {
	wsMsg := realtime.WSMessage{
		Type:    msgType,
		Payload: payload,
	}
	data, _ := json.Marshal(wsMsg)
	return data
}

func (s *RedisLocationService) invalidateCrossingsCache(ctx context.Context, userID uuid.UUID) {
	cacheKey := "crossings:v3:" + userID.String()
	s.redis.Del(ctx, cacheKey)
}
