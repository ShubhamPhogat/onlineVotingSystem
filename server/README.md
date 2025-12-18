# Online Voting System - Server

A Node.js/Express backend for an online voting system with PostgreSQL database, Redis pub/sub, and WebSocket support.

## 🚀 Features

- User registration and authentication
- Participant management
- Real-time voting system
- Leaderboard with live updates via WebSocket
- Redis pub/sub for real-time notifications
- PostgreSQL for data persistence

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start Docker Containers

The project uses Docker Compose to run PostgreSQL and Redis:

```bash
# From the root directory
docker-compose up -d
```

This will start:
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`

The database schema will be automatically initialized on first run.

### 3. Environment Variables

The `.env` file is already configured with default values:

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mydb
DB_USER=postgres
DB_PASSWORD=postgres

# Server Configuration
PORT=3000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000` and WebSocket on port `8002`.

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Participants Table
```sql
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);
```

### Votes Table
```sql
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    voter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);
```

## 🔌 API Endpoints

### Register as Participant

```bash
POST /api/v1/participate
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: {
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Get All Participants (Leaderboard)

```bash
GET /api/v1/participate/get

Response: {
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "score": "5"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "score": "0"
    }
  ]
}
```

### Cast a Vote

```bash
POST /api/v1/vote
Content-Type: application/json

{
  "name": "Voter Name",
  "email": "voter@example.com",
  "password": "password123",
  "candidateId": 1,
  "score": 5
}

Response: {
  "message": "Vote casted successfully"
}
```

## 🔄 Real-time Updates

The system uses WebSocket for real-time leaderboard updates. Connect to `ws://localhost:8002` to receive live updates when:
- A new participant joins
- A vote is cast or updated

## 🐳 Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker logs postgres-db
docker logs redis-cache
```

### Stop Containers
```bash
docker-compose down
```

### Restart Containers
```bash
docker-compose restart
```

### Access PostgreSQL CLI
```bash
docker exec -it postgres-db psql -U postgres -d mydb
```

### Access Redis CLI
```bash
docker exec -it redis-cache redis-cli
```

## 🗃️ Database Operations

### View all users
```bash
docker exec postgres-db psql -U postgres -d mydb -c "SELECT * FROM users;"
```

### View all participants
```bash
docker exec postgres-db psql -U postgres -d mydb -c "SELECT * FROM participants;"
```

### View all votes
```bash
docker exec postgres-db psql -U postgres -d mydb -c "SELECT * FROM votes;"
```

### Reset database (drop all data)
```bash
docker exec postgres-db psql -U postgres -d mydb -c "
TRUNCATE TABLE votes, participants, users RESTART IDENTITY CASCADE;
"
```

## 🧪 Testing the API

### Test Participant Registration
```bash
curl -X POST http://localhost:3000/api/v1/participate \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### Test Get Participants
```bash
curl http://localhost:3000/api/v1/participate/get
```

### Test Voting
```bash
curl -X POST http://localhost:3000/api/v1/vote \
  -H 'Content-Type: application/json' \
  -d '{"name":"Voter","email":"voter@example.com","password":"pass123","candidateId":1,"score":5}'
```

## 🔧 Troubleshooting

### Port Already in Use
If ports 5432 or 6379 are already in use:

```bash
# Find and stop conflicting services
lsof -i :5432
lsof -i :6379

# Or modify docker-compose.yml to use different ports
```

### Database Connection Issues
```bash
# Check if PostgreSQL is healthy
docker ps

# View PostgreSQL logs
docker logs postgres-db

# Test connection
docker exec postgres-db pg_isready -U postgres
```

### Redis Connection Issues
```bash
# Test Redis connection
docker exec redis-cache redis-cli ping
# Should return: PONG
```

## 📝 Development

### Run with auto-reload
```bash
npm run dev
```

## 🏗️ Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── dbClient.js         # PostgreSQL connection pool
│   ├── controller/
│   │   ├── participationController.js
│   │   ├── voteController.js
│   │   └── leaderBoardController.js
│   ├── routes/
│   │   ├── participateRouter.js
│   │   ├── voteRouter.js
│   │   └── leaderBoardRouter.js
│   ├── redisManager.js         # Redis pub/sub manager
│   ├── wsServer.js             # WebSocket server
│   └── index.js                # Main entry point
├── schema.sql                  # Database schema
├── .env                        # Environment variables
└── package.json
```

## 📦 Dependencies

- `express` - Web framework
- `pg` - PostgreSQL client
- `redis` - Redis client
- `ws` - WebSocket server
- `bcrypt` - Password hashing
- `dotenv` - Environment variables
- `cors` - CORS middleware

## 🔐 Security Notes

- Passwords are hashed using bcrypt
- Change default database credentials in production
- Add proper authentication/authorization for production use
- Use HTTPS in production
- Validate and sanitize all user inputs

## 📄 License

ISC

