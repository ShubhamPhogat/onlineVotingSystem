# Migration Guide: Supabase to PostgreSQL

This document outlines the changes made to migrate from Supabase to PostgreSQL with Docker.

## 🔄 Changes Summary

### 1. Database Migration
- **Before**: Supabase (cloud-hosted PostgreSQL with REST API)
- **After**: Self-hosted PostgreSQL 15 in Docker container

### 2. Dependencies Added
```json
"pg": "^8.x.x"  // Node.js PostgreSQL client
```

### 3. Files Modified

#### `/server/src/config/dbClient.js` (renamed from supabaseClient.js)
- Replaced Supabase client with PostgreSQL connection pool
- Uses `pg` library for direct database connections
- Supports connection pooling for better performance

#### `/server/src/controller/participationController.js`
- Replaced Supabase queries with raw SQL
- Uses parameterized queries to prevent SQL injection
- Optimized `getParticipants` with a single JOIN query
- Proper connection handling with `client.release()`

#### `/server/src/controller/voteController.js`
- Converted all Supabase queries to PostgreSQL queries
- Maintained voting logic (new vote vs update vote)
- Proper error handling and connection management

#### `/server/src/index.js`
- Updated dotenv configuration for better module loading
- Uses dynamic imports to ensure environment variables load first
- Added debugging for environment variable loading

### 4. New Files Created

#### `/server/schema.sql`
Database schema with:
- Users table
- Participants table
- Votes table
- Proper indexes and foreign key constraints
- Auto-incrementing IDs with SERIAL

#### `/docker-compose.yml`
Complete Docker setup including:
- PostgreSQL 15 container
- Redis 7 container
- Health checks
- Volume persistence
- Network configuration
- Schema auto-initialization

#### `/server/.env`
Updated environment variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### `/server/README.md`
Comprehensive documentation for:
- Setup instructions
- API endpoints
- Docker commands
- Database operations
- Troubleshooting

### 5. Redis Configuration Updated

#### `/server/src/redisManager.js`
- Changed from cloud Redis to local Redis
- Removed authentication
- Connects to `localhost:6379`

## 📊 Database Schema Changes

### Table Name Changes
- `User` → `users` (lowercase, following PostgreSQL conventions)
- `userId` → `user_id` (snake_case, following PostgreSQL conventions)
- `voterId` → `voter_id`

### Column Naming Convention
Changed from camelCase to snake_case:
- `userId` → `user_id`
- `voterId` → `voter_id`
- `createdAt` → `created_at`
- `updatedAt` → `updated_at`

## 🚀 How to Run

### Start Everything
```bash
# 1. Start Docker containers
docker-compose up -d

# 2. Wait for containers to be healthy (about 5 seconds)
docker ps

# 3. Start the Node.js server
cd server
npm start
```

### Verify Everything is Working
```bash
# Test participant registration
curl -X POST http://localhost:3000/api/v1/participate \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Get leaderboard
curl http://localhost:3000/api/v1/participate/get

# Cast a vote
curl -X POST http://localhost:3000/api/v1/vote \
  -H 'Content-Type: application/json' \
  -d '{"name":"Voter","email":"voter@example.com","password":"pass","candidateId":1,"score":5}'
```

## ✅ Benefits of This Migration

1. **Local Development**: No internet required for database
2. **Full Control**: Complete control over database configuration
3. **Cost**: No Supabase subscription needed
4. **Performance**: Direct database connections (no REST API overhead)
5. **Debugging**: Easy access to database for debugging
6. **Portability**: Docker ensures consistency across environments
7. **Learning**: Better understanding of PostgreSQL and database management

## 🔧 Key Technical Improvements

### Before (Supabase)
```javascript
const { data, error } = await supabase
  .from("User")
  .select("*")
  .eq("email", email);
```

### After (PostgreSQL)
```javascript
const client = await pool.connect();
try {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await client.query(query, [email]);
  // Use result.rows
} finally {
  client.release();
}
```

### Advantages:
- **Parameterized queries**: Built-in SQL injection protection
- **Connection pooling**: Better performance under load
- **Explicit connection management**: Better resource control
- **Direct SQL**: More flexibility and control
- **Transactions support**: Easy to implement if needed

## 🗄️ Data Migration (if needed)

If you have existing data in Supabase that needs to be migrated:

### 1. Export from Supabase
```bash
# Use Supabase dashboard or pg_dump
pg_dump -h <supabase-host> -U postgres -d postgres --table=users --data-only > users.sql
```

### 2. Import to PostgreSQL
```bash
docker exec -i postgres-db psql -U postgres -d mydb < users.sql
```

## 🔐 Security Considerations

### Development
- Default credentials are fine for local development
- `.env` file should be in `.gitignore`

### Production
Update these in `.env`:
```env
DB_PASSWORD=<strong-password>
DB_USER=<non-default-user>
```

Consider adding:
- SSL for database connections
- Database firewall rules
- Regular backups
- Monitoring and logging

## 📝 Testing Checklist

- [x] PostgreSQL container starts successfully
- [x] Redis container starts successfully
- [x] Database schema is created automatically
- [x] Server connects to PostgreSQL
- [x] Server connects to Redis
- [x] User registration works
- [x] Participant listing works
- [x] Voting works
- [x] Leaderboard scores update correctly
- [x] WebSocket real-time updates work

## 🎯 Next Steps

1. **Add authentication**: JWT or session-based auth
2. **Add validation**: Input validation middleware
3. **Add tests**: Unit and integration tests
4. **Add logging**: Winston or similar logging library
5. **Production setup**: Environment-specific configurations
6. **Backup strategy**: Automated database backups
7. **Monitoring**: Add health check endpoints

## 🆘 Rollback Plan

If you need to go back to Supabase:

1. Keep the old Supabase environment variables in `.env.backup`
2. Restore the old `supabaseClient.js` from git history
3. Revert the controller changes
4. Stop Docker containers: `docker-compose down`

## 📞 Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Verify containers are healthy: `docker ps`
3. Test database connection: `docker exec postgres-db pg_isready`
4. Check Redis: `docker exec redis-cache redis-cli ping`

---

**Migration completed successfully! ✅**

All systems are operational and tested.

