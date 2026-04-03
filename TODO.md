# Crossings System Enhancement TODO

## Status: In Progress

### 1. [x] Backend - Update Radius to 50m **DONE**
   - internal/service/location/redis_service.go: crossingRadiusMeters = 50.0
   
### 2. [ ] Backend - Add Connection-Aware Notifications
   - redis_service.go: Add connection check + custom messages/count
   
### 3. [ ] DB - Add GetCrossingCount Query
   - db/query/crossings.sql: `-- name: GetCrossingCount :one SELECT COUNT(*) FROM crossings WHERE (user_id_1 = LEAST($1,$2) AND user_id_2 = GREATEST($1,$2)) OR (user_id_1 = GREATEST($1,$2) AND user_id_2 = LEAST($1,$2))`
   - sqlc generate
   
### 4. [ ] Update Worker
   - internal/worker/crossing.go: connection logic
   
### 5. [x] API - /crossings already aggregates count **DONE**
   
### 6. [ ] Frontend UI
   - useNotifications.ts, map components
   
### 7. [ ] Testing
