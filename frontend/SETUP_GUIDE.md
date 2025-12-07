# NotesApp - Frontend Setup Guide

This is a production-ready Next.js frontend for the NotesApp API. It includes full API integration with TanStack Query, authentication flows, and a complete note management system.

## Project Structure

\`\`\`
app/                          # Next.js app directory
├── page.tsx                   # Home/Public notes directory
├── login/page.tsx             # Login page
├── signup/page.tsx            # Signup page
├── profile/page.tsx           # User profile & settings
├── workspaces/page.tsx        # Workspaces list page
├── workspace/[id]/page.tsx    # Single workspace notes
└── notes/
    └── [id]/
        ├── page.tsx           # Note detail page
        └── history/page.tsx   # Note version history page

components/
├── auth/                      # Authentication forms
│   ├── login-form.tsx
│   └── signup-form.tsx
├── modals/                    # Reusable modals
│   ├── note-editor-modal.tsx
│   ├── delete-note-modal.tsx
│   └── create-workspace-modal.tsx
├── pages/                     # Page components
│   ├── public-notes-directory-enhanced.tsx
│   ├── workspace-notes.tsx
│   ├── workspaces-list.tsx
│   ├── user-profile.tsx
│   ├── note-detail.tsx
│   └── note-history.tsx
├── providers/
│   └── query-provider.tsx     # TanStack Query provider
├── ui/                        # shadcn/ui components
├── advanced-filters.tsx       # Advanced filter UI
├── search-bar-enhanced.tsx    # Enhanced search component
├── vote-buttons.tsx           # Voting interaction
└── ...

lib/
├── api-client.ts              # Axios instance with interceptors
├── api/
│   └── types.ts               # TypeScript types for all API responses
├── hooks/                     # TanStack Query hooks for all endpoints
│   ├── useAuth.ts
│   ├── useWorkspaces.ts
│   ├── useNotes.ts
│   ├── useVotes.ts
│   ├── useTags.ts
│   ├── useHistory.ts
│   └── index.ts               # Export all hooks
└── utils/
    └── api-client-utils.ts    # API error handling utilities
\`\`\`

## Environment Setup

1. Copy `.env.example` to `.env.local`:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Update the API URL in `.env.local`:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
# For production:
# NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
\`\`\`

## API Client Setup

The API client is configured in `lib/api-client.ts`:

- **Axios Instance**: Global instance with base URL and default headers
- **Request Interceptor**: Automatically adds JWT token from localStorage
- **Response Interceptor**: Handles 401 errors and redirects to login
- **Error Handling**: Centralized error handling with user-friendly messages

## TanStack Query Hooks

All API operations are wrapped in TanStack Query hooks located in `lib/hooks/`:

### Authentication Hooks
- `useLogin()` - Login user
- `useRegister()` - Register new user
- `useCurrentUser()` - Get authenticated user
- `useLogout()` - Logout user
- `useForgotPassword()` - Request password reset
- `useResetPassword()` - Reset password with token

### Workspace Hooks
- `useWorkspaces()` - Get all workspaces
- `useWorkspace(id)` - Get single workspace
- `useCreateWorkspace()` - Create new workspace
- `useUpdateWorkspace(id)` - Update workspace
- `useDeleteWorkspace()` - Delete workspace
- `useWorkspaceStats(workspaceId)` - Get workspace statistics

### Note Hooks
- `usePublicNotes(params)` - Get public published notes with filters
- `useWorkspaceNotes(workspaceId, params)` - Get notes in workspace
- `useNote(id)` - Get single note
- `useCreateNote()` - Create new note
- `useUpdateNote(id)` - Update note
- `useDeleteNote()` - Delete note
- `usePublishNote(id)` - Publish draft note
- `useUnpublishNote(id)` - Unpublish note
- `useSearchNotes()` - Search notes

### Vote Hooks
- `useVote(noteId)` - Get vote data for note
- `useAddVote(noteId)` - Add vote to note
- `useChangeVote(noteId)` - Change existing vote
- `useRemoveVote(noteId)` - Remove vote from note

### Tag Hooks
- `useTags()` - Get all tags
- `useTag(slug)` - Get single tag
- `useTagNotes(slug, page, limit)` - Get notes by tag
- `usePopularTags()` - Get popular tags
- `useSearchTags()` - Search tags

### History Hooks
- `useNoteHistory(noteId)` - Get note history
- `useHistoryEntry(noteId, historyId)` - Get single history entry
- `useRestoreHistory(noteId)` - Restore from history
- `useDeleteHistory(noteId)` - Delete history entry

## Key Features

### 1. Authentication Flow
- Login/Signup with email and password
- Automatic token storage in localStorage
- Protected routes with automatic redirect
- Token refresh on 401 errors

### 2. Workspace Management
- Create multiple workspaces
- View all user workspaces
- Update workspace details
- Delete workspaces with cascade delete

### 3. Note CRUD Operations
- Create notes with title, content, tags
- Edit existing notes
- Delete notes
- Publish/unpublish drafts
- Toggle note visibility (public/private)

### 4. Advanced Filtering & Search
- Search notes by title (debounced)
- Filter by status (draft/published)
- Filter by type (public/private)
- Filter by tags
- Sort options (newest, oldest, most upvoted, most downvoted)
- Clear filters button

### 5. Voting System
- Upvote/downvote public notes
- Change vote without removing
- Remove vote
- Real-time vote count updates

### 6. Version History
- View all note versions
- See who updated and when
- Restore from any version
- View previous content

### 7. User Profile
- View and edit user profile
- Manage account settings
- Change password (placeholder)
- 2FA settings (placeholder)

## Usage Example

\`\`\`tsx
"use client"

import { useWorkspaceNotes, useDeleteNote } from "@/lib/hooks"
import { SearchBarEnhanced } from "@/components/search-bar-enhanced"

export function MyComponent({ workspaceId }: { workspaceId: string }) {
  const [search, setSearch] = useState("")
  const { data, isLoading, error } = useWorkspaceNotes(workspaceId, {
    search: search || undefined,
  })
  const deleteMutation = useDeleteNote()

  const handleDelete = async (noteId: string) => {
    try {
      await deleteMutation.mutateAsync(noteId)
      // Data automatically refetched
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  return (
    <div>
      <SearchBarEnhanced onSearch={setSearch} />
      {data?.data.map((note) => (
        <div key={note.id}>
          <h3>{note.title}</h3>
          <button onClick={() => handleDelete(note.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
\`\`\`

## Error Handling

All API errors are handled gracefully:

\`\`\`tsx
const { error, isLoading } = useWorkspaceNotes(workspaceId)

if (error) {
  return (
    <div className="rounded-lg border border-destructive/50 p-4">
      <h3 className="font-semibold text-destructive">Error loading notes</h3>
      <p className="text-sm text-destructive/80">{error.message}</p>
    </div>
  )
}
\`\`\`

## Deployment

1. Build the project:
\`\`\`bash
npm run build
\`\`\`

2. Deploy to Vercel (recommended):
\`\`\`bash
vercel deploy
\`\`\`

3. Set environment variable in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` with your backend API URL

## Performance Optimizations

- **Debounced Search**: Search input is debounced to reduce API calls
- **Query Caching**: TanStack Query caches data with configurable TTL
- **Pagination**: Large lists use cursor-based pagination
- **Lazy Loading**: Components load data on demand
- **Server Components**: Pages use Server Components where possible for better performance

## Security

- JWT tokens stored in localStorage
- Authorization header added to all authenticated requests
- 401/403 errors redirect to login
- Input validation on forms
- XSS protection with React's built-in sanitization

## Support

For API documentation, see your backend repository.
For component documentation, check individual component comments.
