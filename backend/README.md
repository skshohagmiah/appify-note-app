# Production-Ready Note App Backend

A comprehensive backend API for a multi-tenant note-taking application built with Node.js, Express, Prisma, PostgreSQL, and TypeScript.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
- 🏢 **Multi-Tenancy**: Company-level data isolation
- 📝 **Notes Management**: Full CRUD with public/private notes, drafts, and publishing
- 🏷️ **Tagging System**: Flexible tagging with autocomplete and search
- 👍 **Voting System**: Upvote/downvote on public notes
- 📜 **Version History**: Automatic history tracking with restore capability
- 🔍 **Search & Filtering**: Full-text search with advanced filtering and sorting
- ⚡ **Caching**: Redis-based caching for performance
- 🤖 **Background Jobs**: Automated history cleanup with BullMQ
- 🔒 **Security**: Helmet, CORS, rate limiting, input validation
- 📊 **Statistics**: Workspace and platform-wide analytics

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Queue**: BullMQ
- **Validation**: Zod
- **Authentication**: JWT with bcrypt

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 7+ (optional, for caching and background jobs)
- Docker and Docker Compose (optional, for easy setup)

## Quick Start

### 1. Clone and Install

\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Environment Setup

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and configure your database and other settings:

\`\`\`env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/noteapp?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
REDIS_URL=redis://localhost:6379
\`\`\`

### 3. Start Services (Docker)

\`\`\`bash
docker-compose up -d
\`\`\`

This starts PostgreSQL and Redis in Docker containers.

### 4. Database Setup

\`\`\`bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
\`\`\`

### 5. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The API will be available at `http://localhost:3001/api/v1`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user and company
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/logout` - Logout (protected)
- `POST /api/v1/auth/refresh` - Refresh access token

### Workspaces
- `GET /api/v1/workspaces` - List all workspaces (protected)
- `POST /api/v1/workspaces` - Create workspace (protected)
- `GET /api/v1/workspaces/:id` - Get workspace (protected)
- `PUT /api/v1/workspaces/:id` - Update workspace (protected)
- `DELETE /api/v1/workspaces/:id` - Delete workspace (protected)
- `GET /api/v1/workspaces/:id/stats` - Get workspace statistics (protected)

### Notes
- `GET /api/v1/notes/public` - Get public notes (with pagination, filtering, sorting)
- `GET /api/v1/notes/workspace/:workspaceId` - Get workspace notes (protected)
- `GET /api/v1/notes/:id` - Get single note (conditional auth)
- `POST /api/v1/notes` - Create note (protected)
- `PUT /api/v1/notes/:id` - Update note (protected, creates history)
- `DELETE /api/v1/notes/:id` - Delete note (protected)
- `PATCH /api/v1/notes/:id/publish` - Publish note (protected)
- `PATCH /api/v1/notes/:id/unpublish` - Unpublish note (protected)
- `GET /api/v1/notes/search` - Search notes
- `GET /api/v1/notes/my-notes` - Get user's notes (protected)

### Voting
- `POST /api/v1/notes/:noteId/vote` - Vote on note (protected)
- `PUT /api/v1/notes/:noteId/vote` - Change vote (protected)
- `DELETE /api/v1/notes/:noteId/vote` - Remove vote (protected)
- `GET /api/v1/notes/:noteId/votes` - Get vote counts

### History
- `GET /api/v1/notes/:noteId/history` - List history entries (protected)
- `GET /api/v1/notes/:noteId/history/:historyId` - Get history entry (protected)
- `POST /api/v1/notes/:noteId/history/:historyId/restore` - Restore from history (protected)
- `DELETE /api/v1/notes/:noteId/history/:historyId` - Delete history entry (protected)

### Tags
- `GET /api/v1/tags` - Get all tags
- `GET /api/v1/tags/:slug` - Get tag details
- `GET /api/v1/tags/:slug/notes` - Get notes by tag
- `GET /api/v1/tags/popular` - Get popular tags
- `GET /api/v1/tags/search` - Search tags

### Health
- `GET /api/v1/health` - Health check
- `GET /api/v1/ping` - Ping
- `GET /api/v1/version` - API version

## Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
npm run studio       # Open Prisma Studio
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
\`\`\`

## Database Schema

The application uses the following main models:

- **Company**: Multi-tenant root entity
- **User**: Users with roles (Owner/Member)
- **Workspace**: Organizational unit for notes
- **Note**: Core content entity
- **Tag**: Categorization system
- **Vote**: Upvote/downvote system
- **NoteHistory**: Version tracking
- **NoteTag**: Many-to-many relation

## Multi-Tenancy

All data is isolated by `companyId`. Users can only access data within their company. This is enforced at:
- Middleware level (authentication)
- Database query level (Prisma)
- Controller level (validation)

## Caching Strategy

Redis caching is used for:
- Public notes list (5 min TTL)
- Vote counts (1 min TTL)
- Workspace stats (10 min TTL)
- Tag list (1 hour TTL)

Cache automatically invalidates on data updates.

## Background Jobs

- **History Cleanup**: Runs daily at 2:00 AM, deletes histories older than 7 days

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 req/15min general, 5 req/15min for auth)
- Input validation with Zod
- Password strength requirements
- JWT token expiration
- SQL injection prevention (Prisma)
- XSS protection

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secrets
3. Configure proper CORS origins
4. Use HTTPS
5. Set up proper database backups
6. Monitor with health check endpoints
7. Configure Redis for persistence

## License

MIT
