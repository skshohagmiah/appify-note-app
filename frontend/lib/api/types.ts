export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
  details?: Record<string, unknown>
  statusCode?: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: PaginationMeta
  message?: string
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  companyName: string
  firstName: string
  lastName: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  companyId: string
  role: "Owner" | "Member"
  createdAt: string
  updatedAt: string
}

// Workspace Types
export interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  companyId: string
  createdAt: string
  updatedAt: string
  _count?: {
    notes: number
  }
}

export interface CreateWorkspaceRequest {
  name: string
  description?: string
}

export interface UpdateWorkspaceRequest {
  name?: string
  description?: string
}

export interface WorkspaceStats {
  totalNotes: number
  publishedNotes: number
  draftNotes: number
  totalViews?: number
  totalVotes?: number
}

// Note Types
export interface Note {
  id: string
  title: string
  content: string
  workspaceId: string
  createdBy: string
  status: "DRAFT" | "PUBLISHED"
  type: "PUBLIC" | "PRIVATE"
  tags: Tag[]
  votes: {
    upvotes: number
    downvotes: number
    userVote?: "upvote" | "downvote" | null
  }
  createdAt: string
  updatedAt: string
}

export interface CreateNoteRequest {
  title: string
  content: string
  workspaceId: string
  tags: string[]
  type: "PUBLIC" | "PRIVATE"
  status: "DRAFT" | "PUBLISHED"
}

export interface UpdateNoteRequest {
  title?: string
  content?: string
  tags?: string[]
  type?: "PUBLIC" | "PRIVATE"
  status?: "DRAFT" | "PUBLISHED"
}

// Tag Types
export interface Tag {
  id: string
  name: string
  slug: string
  noteCount: number
}

// Vote Types
export interface VoteRequest {
  type: "upvote" | "downvote"
}

export interface VoteResponse {
  success: boolean
  userVote: "upvote" | "downvote" | null
  upvotes: number
  downvotes: number
}

// History Types
export interface NoteHistory {
  id: string
  noteId: string
  previousTitle: string
  previousContent: string
  updatedBy: string
  createdAt: string
}
