# Note-Taking Application

A modern, production-ready note-taking application with multi-tenancy support, built with Next.js, Express, and PostgreSQL. Features real-time collaboration, version history, voting system, and advanced caching.

![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Express%20%7C%20PostgreSQL%20%7C%20Redis-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Development Setup](#-development-setup)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)

## ✨ Features

### Core Features
- **Multi-Tenancy**: Complete company-based isolation with workspace organization
- **Note Management**: Create, edit, delete notes with rich text support
- **Version History**: Automatic tracking of note changes with rollback capability
- **Voting System**: Upvote/downvote notes for community-driven content curation
- **Tag System**: Organize notes with flexible tagging and filtering
- **Search & Filter**: Advanced search with multiple filter options
- **Public/Private Notes**: Control note visibility (public vs private)
- **Draft/Published Status**: Manage note publication workflow

### Security & Performance
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **Role-Based Access Control (RBAC)**: Owner and Member roles with different permissions
- **Rate Limiting**: Protect API endpoints from abuse
- **Redis Caching**: Multi-layer caching for optimal performance
- **Background Jobs**: Automated cleanup and maintenance tasks
- **Database Indexing**: Optimized queries for fast data retrieval

### Developer Experience
- **TypeScript**: Full type safety across frontend and backend
- **API Versioning**: Structured API with version control
- **Comprehensive Error Handling**: Detailed error messages and logging
- **Docker Support**: Complete containerization for easy deployment
- **Database Migrations**: Version-controlled schema changes with Prisma
- **Code Quality**: ESLint, Prettier, and TypeScript strict mode

## 🛠 Tech Stack

### Frontend
| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Next.js 16** | React framework | Server-side rendering, routing, and optimal performance out of the box |
| **React 19** | UI library | Component-based architecture with latest features |
| **TypeScript** | Type safety | Catch errors at compile time, better developer experience |
| **Tailwind CSS** | Styling | Utility-first CSS for rapid UI development |
| **shadcn/ui** | Component library | Beautiful, accessible components built on Radix UI |
| **TanStack Query** | Data fetching | Powerful async state management with caching |
| **React Hook Form** | Form handling | Performant forms with easy validation |
| **Zod** | Schema validation | Type-safe runtime validation |
| **Axios** | HTTP client | Promise-based HTTP requests with interceptors |

### Backend
| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Express** | Web framework | Minimal, flexible, and battle-tested Node.js framework |
| **TypeScript** | Type safety | Consistent type system across the stack |
| **Prisma ORM** | Database toolkit | Type-safe database access with migrations |
| **PostgreSQL** | Database | Robust, ACID-compliant relational database |
| **Redis** | Cache & Queue | In-memory data store for caching and job queues |
| **BullMQ** | Job queue | Reliable background job processing |
| **JWT** | Authentication | Stateless authentication with refresh token rotation |
| **Bcrypt** | Password hashing | Industry-standard password security |
| **Helmet** | Security headers | Protect against common web vulnerabilities |
| **Morgan** | HTTP logging | Request logging for debugging and monitoring |
| **Zod** | Validation | Consistent validation across frontend and backend |

### Infrastructure
| Technology | Purpose | Why We Chose It |
|------------|---------|-----------------|
| **Docker** | Containerization | Consistent environments across dev and production |
| **Docker Compose** | Orchestration | Easy multi-container application management |
| **PostgreSQL 16** | Database | Latest features and performance improvements |
| **Redis 7** | Cache/Queue | Latest Redis with improved performance |

## 🏗 Architecture

### Multi-Tenant Design
```
Company (Root Entity)
  ├── Users (with roles: OWNER, MEMBER)
  └── Workspaces
      └── Notes
          ├── Tags (many-to-many)
          ├── Votes (upvote/downvote)
          └── History (version tracking)
```

### Caching Strategy
- **Public Notes**: 5-minute TTL for frequently accessed content
- **Vote Counts**: 1-minute TTL for real-time updates
- **Workspace Stats**: 10-minute TTL for dashboard data
- **Tag Lists**: 1-hour TTL for rarely changing data
- **Note Details**: 5-minute TTL with cache invalidation on updates

### Background Jobs
- **History Cleanup**: Daily job to remove old version history (configurable retention)
- **Cache Warming**: Preload frequently accessed data
- **Analytics**: Process usage statistics

### 📜 History Retention System
The system implements a robust, automated history retention policy to manage storage and performance efficiently.

**Execution Mechanism:**
- **Offloaded Processing**: We use **BullMQ** (Redis-based message queue) to handle cleanup tasks. This ensures the heavy database delete operations happen in a background worker process, completely separate from the main API server. This means **zero impact** on user request latency.
- **Scheduled Job (Cron)**: A cron-style scheduler (`history-cleanup.job.ts`) triggers the cleanup job automatically every day at **2:00 AM (UTC)**.
- **Retention Logic**: The worker executes a batch delete query using Prisma to remove all `NoteHistory` records where `createdAt` is older than **7 days** (configurable via `HISTORY_RETENTION_DAYS` env var).
- **Graceful Failure**: If the job fails (e.g., DB down), BullMQ will retry it automatically with exponential backoff.

This design ensures the system scales comfortably even with millions of history records, as the cleanup is performed in the background during off-peak hours.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Run with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd note-app
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (optional for development)
   ```

3. **Start all services**
   ```bash
   docker compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api/v1
   - API Health: http://localhost:3001/api/v1/health

5. **View logs**
   ```bash
   docker compose logs -f
   ```

6. **Stop services**
   ```bash
   docker compose down
   ```

## 💻 Development Setup

### Without Docker (Local Development)

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

4. **Start PostgreSQL and Redis** (using Docker)
   ```bash
   docker compose up -d
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

   Backend will run on http://localhost:3001

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file** (optional)
   ```bash
   # Create .env.local if you need custom API URL
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will run on http://localhost:3000

### Database Management

**Prisma Studio** - Visual database browser
```bash
cd backend
npm run studio
```
Access at http://localhost:5555

**Create new migration**
```bash
cd backend
npm run migrate
```

**Reset database** (⚠️ deletes all data)
```bash
cd backend
npm run migrate:reset
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout user |

### Note Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/notes` | List notes with filters | ✅ |
| GET | `/api/v1/notes/:id` | Get note details | ✅ |
| POST | `/api/v1/notes` | Create new note | ✅ |
| PUT | `/api/v1/notes/:id` | Update note | ✅ |
| DELETE | `/api/v1/notes/:id` | Delete note | ✅ |
| GET | `/api/v1/notes/:id/history` | Get note history | ✅ |

### Workspace Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/workspaces` | List workspaces | ✅ |
| GET | `/api/v1/workspaces/:slug` | Get workspace | ✅ |
| POST | `/api/v1/workspaces` | Create workspace | ✅ (Owner) |
| PUT | `/api/v1/workspaces/:id` | Update workspace | ✅ (Owner) |
| DELETE | `/api/v1/workspaces/:id` | Delete workspace | ✅ (Owner) |

### Tag Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/tags` | List all tags | ✅ |
| GET | `/api/v1/tags/:slug` | Get tag details | ✅ |
| POST | `/api/v1/tags` | Create tag | ✅ |

### Vote Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/votes` | Vote on note | ✅ |
| DELETE | `/api/v1/votes/:noteId` | Remove vote | ✅ |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/health` | System health status | ❌ |

## 🗄 Database Schema

### Core Models

**Company** - Multi-tenant root entity
- Isolates data between different organizations
- One-to-many with Users and Workspaces

**User** - Authentication and authorization
- Email/password authentication
- Role-based access (OWNER, MEMBER)
- Belongs to one Company

**Workspace** - Organizational unit for notes
- Unique slug per company
- Contains multiple Notes
- Belongs to one Company

**Note** - Core content entity
- Title and rich text content
- Status: DRAFT or PUBLISHED
- Type: PUBLIC or PRIVATE
- Belongs to Workspace and User
- Has many Tags, Votes, and History entries

**Tag** - Categorization system
- Unique slug globally
- Many-to-many with Notes

**Vote** - Community curation
- UPVOTE or DOWNVOTE
- One vote per user per note

**NoteHistory** - Version tracking
- Stores previous title and content
- Tracks who made changes
- Automatic retention policy

### Indexes
Optimized indexes on:
- Foreign keys for join performance
- Email for user lookup
- Slugs for workspace/tag lookup
- Status, type, and creation date for filtering
- Title for search functionality

## 🚢 Deployment

### Production Deployment

1. **Update environment variables**
   ```bash
   # Set production values in .env
   NODE_ENV=production
   BACKEND_TARGET=production
   FRONTEND_TARGET=production
   
   # Change JWT secrets to secure random values
   JWT_SECRET=<your-secure-random-string>
   JWT_REFRESH_SECRET=<your-secure-random-string>
   
   # Update database credentials
   POSTGRES_PASSWORD=<secure-password>
   ```

2. **Build and run**
   ```bash
   docker compose up -d --build
   ```

3. **Run migrations**
   ```bash
   docker compose exec backend npx prisma migrate deploy
   ```

### Environment Variables

See [.env.example](.env.example) for all available configuration options.

**Critical Production Settings:**
- Change all `JWT_SECRET` values
- Use strong `POSTGRES_PASSWORD`
- Set appropriate `CORS_ORIGIN`
- Configure `RATE_LIMIT_*` for your traffic
- Adjust cache TTL values based on your needs

### Scaling Considerations

- **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
- **Redis**: Use managed Redis (AWS ElastiCache, Redis Cloud)
- **Backend**: Horizontal scaling with load balancer
- **Frontend**: Deploy to Vercel, Netlify, or CDN
- **File Storage**: Add S3 or similar for attachments

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Express, and PostgreSQL
# appify-note-app
