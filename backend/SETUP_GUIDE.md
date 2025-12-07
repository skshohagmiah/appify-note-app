# Backend Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm
- **Docker Desktop** (for PostgreSQL and Redis)
- **Git** (optional)

## Step-by-Step Setup

### 1. Navigate to Backend Directory

\`\`\`bash
cd /Users/shohag/Desktop/note-app/backend
\`\`\`

### 2. Install Dependencies

Dependencies are already installed. If you need to reinstall:

\`\`\`bash
npm install
\`\`\`

### 3. Start Docker Services

**Important**: Make sure Docker Desktop is running first!

\`\`\`bash
docker-compose up -d
\`\`\`

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

Verify services are running:

\`\`\`bash
docker-compose ps
\`\`\`

### 4. Configure Environment Variables

The `.env.example` file is already provided. You need to create your own `.env`:

\`\`\`bash
cp .env.example .env
\`\`\`

The default configuration should work if you're using Docker Compose. The `.env` file should contain:

\`\`\`env
NODE_ENV=development
PORT=3001

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/noteapp?schema=public"

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

REDIS_URL=redis://localhost:6379

CORS_ORIGIN=http://localhost:3000
\`\`\`

### 5. Run Database Migrations

\`\`\`bash
npm run migrate
\`\`\`

This will create all the necessary database tables.

### 6. Seed Database (Optional)

To populate the database with sample data:

\`\`\`bash
npm run seed
\`\`\`

This will create:
- 10 companies
- 50 users (5 per company)
- 100 workspaces (10 per company)
- 5,000 notes (50 per workspace)
- 20 tags
- Random votes on public notes

**Note**: Seeding may take 2-3 minutes.

### 7. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The server will start on `http://localhost:3001`

You should see:
\`\`\`
✅ Database connected successfully
✅ Redis initialized
✅ Background jobs initialized
🚀 Server running on port 3001
📝 Environment: development
🔗 API URL: http://localhost:3001/api/v1
\`\`\`

## Testing the API

### 1. Health Check

\`\`\`bash
curl http://localhost:3001/api/v1/health
\`\`\`

Expected response:
\`\`\`json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-07T...",
    "database": "connected",
    "redis": "optional"
  }
}
\`\`\`

### 2. Register a User

\`\`\`bash
curl -X POST http://localhost:3001/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User",
    "companyName": "Test Company"
  }'
\`\`\`

Save the `token` from the response.

### 3. Get Current User

\`\`\`bash
curl http://localhost:3001/api/v1/auth/me \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
\`\`\`

### 4. Create a Workspace

\`\`\`bash
curl -X POST http://localhost:3001/api/v1/workspaces \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My First Workspace",
    "description": "A workspace for my notes"
  }'
\`\`\`

Save the workspace `id` from the response.

### 5. Create a Note

\`\`\`bash
curl -X POST http://localhost:3001/api/v1/notes \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "My First Note",
    "content": "This is the content of my first note.",
    "workspaceId": "YOUR_WORKSPACE_ID",
    "tags": ["test", "demo"],
    "type": "PUBLIC",
    "status": "PUBLISHED"
  }'
\`\`\`

### 6. Get Public Notes

\`\`\`bash
curl http://localhost:3001/api/v1/notes/public
\`\`\`

## Connecting Frontend

Update your frontend `.env` file:

\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
\`\`\`

The frontend should now be able to communicate with the backend!

## Troubleshooting

### Docker Issues

If Docker services fail to start:

1. Make sure Docker Desktop is running
2. Check if ports 5432 and 6379 are available:
   \`\`\`bash
   lsof -i :5432
   lsof -i :6379
   \`\`\`
3. If ports are in use, stop the conflicting services or change ports in `docker-compose.yml`

### Database Connection Issues

If you get database connection errors:

1. Verify PostgreSQL is running:
   \`\`\`bash
   docker-compose ps
   \`\`\`
2. Check the `DATABASE_URL` in your `.env` file
3. Try restarting the database:
   \`\`\`bash
   docker-compose restart postgres
   \`\`\`

### Redis Issues

If Redis is not available:

- The app will still work but caching and background jobs will be disabled
- You'll see a warning: `⚠️ Redis not available - caching and background jobs disabled`

### Migration Issues

If migrations fail:

\`\`\`bash
# Reset database (WARNING: This deletes all data)
npm run migrate:reset

# Then run migrations again
npm run migrate
\`\`\`

## Useful Commands

\`\`\`bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v

# Open Prisma Studio (database GUI)
npm run studio

# Run linter
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Next Steps

1. ✅ Start Docker services
2. ✅ Run migrations
3. ✅ (Optional) Seed database
4. ✅ Start development server
5. ✅ Test API endpoints
6. ✅ Connect frontend
7. 🎉 Start building!
