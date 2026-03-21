package story

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"sort"
	"time"

	"github.com/google/uuid"
	"github.com/mmcloughlin/geohash"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"

	"privacy-social-backend/internal/repository"
	"privacy-social-backend/internal/repository/db"
	"privacy-social-backend/internal/service/safety"
)

type CreateStoryParams struct {
	UserID       uuid.UUID
	MediaURL     string
	MediaType    string
	Latitude     float64
	Longitude    float64
	Caption      string
	IsAnonymous  bool
	ShowLocation bool
}

type GetFeedParams struct {
	UserID    uuid.UUID
	Latitude  float64
	Longitude float64
}

type Service interface {
	CreateStory(ctx context.Context, params CreateStoryParams) (*db.CreateStoryRow, error)
	GetFeed(ctx context.Context, params GetFeedParams) ([]db.GetStoriesWithinRadiusRow, string, float64, error)
	GetMapStories(ctx context.Context, params GetFeedParams) ([]db.GetStoriesWithinRadiusRow, error)
	GetMyStories(ctx context.Context, userID uuid.UUID) ([]db.GetActiveStoriesByUserIDRow, error)
	DeleteStory(ctx context.Context, storyID uuid.UUID, userID uuid.UUID) error
}

type ServiceImpl struct {
	store  repository.Store
	redis  *redis.Client
	safety *safety.Monitor
}

func NewService(store repository.Store, rdb *redis.Client, safety *safety.Monitor) Service {
	return &ServiceImpl{
		store:  store,
		redis:  rdb,
		safety: safety,
	}
}

func (s *ServiceImpl) CreateStory(ctx context.Context, req CreateStoryParams) (*db.CreateStoryRow, error) {
	hash := geohash.Encode(req.Latitude, req.Longitude)

	// Safety Check: Fake GPS
	val := s.safety.ValidateUserMovement(ctx, req.UserID.String(), req.Latitude, req.Longitude)
	if !val.Allowed {
		if val.ShouldBan {
			log.Warn().
				Str("user_id", req.UserID.String()).
				Float64("lat", req.Latitude).
				Float64("lng", req.Longitude).
				Msg("Fake GPS detected (Dev Bypass: User not banned)")
		}
	}

	user, err := s.store.GetUserByID(ctx, req.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	expiryDuration := 24 * time.Hour
	isPremium := false
	if user.IsPremium.Valid && user.IsPremium.Bool {
		expiryDuration = 48 * time.Hour
		isPremium = true
	}
	expiresAt := time.Now().UTC().Add(expiryDuration)

	var captionNull sql.NullString
	if req.Caption != "" {
		captionNull = sql.NullString{String: req.Caption, Valid: true}
	}

	story, err := s.store.CreateStory(ctx, db.CreateStoryParams{
		UserID:       req.UserID,
		MediaUrl:     req.MediaURL,
		MediaType:    req.MediaType,
		Caption:      captionNull,
		Geohash:      hash,
		Lng:          req.Longitude,
		Lat:          req.Latitude,
		IsAnonymous:  req.IsAnonymous,
		ShowLocation: req.ShowLocation,
		IsPremium:    sql.NullBool{Bool: isPremium, Valid: true},
		ExpiresAt:    expiresAt,
	})
	if err != nil {
		return nil, err
	}

	_, err = s.store.UpdateUserActivity(ctx, req.UserID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to update user activity")
	}

	userGeohash := hash
	if len(userGeohash) > 5 {
		userGeohash = userGeohash[:5]
	}
	s.invalidateFeedCache(ctx, userGeohash)

	return &story, nil
}

func (s *ServiceImpl) GetFeed(ctx context.Context, params GetFeedParams) ([]db.GetStoriesWithinRadiusRow, string, float64, error) {
	const maxRadius = 50000.0 // 50km

	// 1. Fetch stories using existing radius query (respects privacy/blocks)
	allStories, err := s.store.GetStoriesWithinRadius(ctx, db.GetStoriesWithinRadiusParams{
		Lng:          params.Longitude,
		Lat:          params.Latitude,
		RadiusMeters: maxRadius,
		UserID:       params.UserID,
	})
	if err != nil {
		return nil, "", 0, err
	}

	// 2. Fetch connections
	connections, err := s.store.ListConnections(ctx, params.UserID)
	if err != nil {
		return nil, "", 0, err
	}

	connectionMap := make(map[uuid.UUID]bool)
	for _, c := range connections {
		connectionMap[c.ID] = true
	}

	// 3. Filter: Only Self OR Connections
	var filtered []db.GetStoriesWithinRadiusRow
	for _, st := range allStories {
		if st.UserID == params.UserID || connectionMap[st.UserID] {
			filtered = append(filtered, st)
		}
	}

	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].CreatedAt.Before(filtered[j].CreatedAt)
	})

	message := "Stories found nearby"
	if len(filtered) == 0 {
		message = "No stories from connections found nearby"
	}

	return filtered, message, maxRadius, nil
}

func (s *ServiceImpl) GetMapStories(ctx context.Context, params GetFeedParams) ([]db.GetStoriesWithinRadiusRow, error) {
	// For map, we use a larger radius or specific bounds. 
	// To reuse GetStoriesWithinRadius for now, we use a large radius.
	// Ideally we'd use GetStoriesInBounds, but let's stick to radius for consistency with Feed for now.
	const mapRadius = 100000.0 // 100km for map view

	stories, err := s.store.GetStoriesWithinRadius(ctx, db.GetStoriesWithinRadiusParams{
		Lng:          params.Longitude,
		Lat:          params.Latitude,
		RadiusMeters: mapRadius,
		UserID:       params.UserID,
	})
	if err != nil {
		return nil, err
	}

	connections, err := s.store.ListConnections(ctx, params.UserID)
	if err != nil {
		return nil, err
	}

	connectionMap := make(map[uuid.UUID]bool)
	for _, c := range connections {
		connectionMap[c.ID] = true
	}

	var filtered []db.GetStoriesWithinRadiusRow
	for _, st := range stories {
		if st.UserID == params.UserID || connectionMap[st.UserID] {
			filtered = append(filtered, st)
		}
	}

	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].CreatedAt.Before(filtered[j].CreatedAt)
	})

	return filtered, nil
}

func (s *ServiceImpl) GetMyStories(ctx context.Context, userID uuid.UUID) ([]db.GetActiveStoriesByUserIDRow, error) {
	stories, err := s.store.GetActiveStoriesByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return stories, nil
}

func (s *ServiceImpl) DeleteStory(ctx context.Context, storyID uuid.UUID, userID uuid.UUID) error {
	story, err := s.store.GetStoryByID(ctx, storyID)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("story not found")
		}
		return err
	}

	if story.UserID != userID {
		return errors.New("you can only delete your own stories")
	}

	err = s.store.DeleteStory(ctx, storyID)
	if err != nil {
		return err
	}

	userGeohash := story.Geohash
	if len(userGeohash) > 5 {
		userGeohash = userGeohash[:5]
	}
	s.invalidateFeedCache(ctx, userGeohash)

	return nil
}

func (s *ServiceImpl) invalidateFeedCache(ctx context.Context, geohash string) {
	cacheKey := "feed:" + geohash
	s.redis.Del(ctx, cacheKey)
}
