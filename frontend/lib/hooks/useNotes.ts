import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { HISTORY_QUERY_KEY } from "./useHistory"
import type { Note, CreateNoteRequest, UpdateNoteRequest, PaginatedResponse } from "@/lib/api/types"

export const NOTES_QUERY_KEY = "notes"

interface NotesFilterParams {
  workspaceId?: string
  search?: string
  status?: "DRAFT" | "PUBLISHED" | "all"
  type?: "PUBLIC" | "PRIVATE" | "all"
  tags?: string[]
  sortBy?: "newest" | "oldest" | "most_upvoted" | "most_downvoted"
  page?: number
  limit?: number
}

export function usePublicNotes(params?: Omit<NotesFilterParams, "workspaceId">) {
  return useQuery({
    queryKey: [NOTES_QUERY_KEY, "public", params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Note>>("/notes/public", { params })
      return response.data
    },
    placeholderData: keepPreviousData,
  })
}

export function useWorkspaceNotes(workspaceId: string | undefined, params?: Omit<NotesFilterParams, "workspaceId">) {
  return useQuery({
    queryKey: [NOTES_QUERY_KEY, "workspace", workspaceId, params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Note>>(`/notes/workspace/${workspaceId}`, { params })
      return response.data
    },
    enabled: !!workspaceId,
    placeholderData: keepPreviousData,
  })
}

export function useNote(id: string | undefined) {
  return useQuery({
    queryKey: [NOTES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Note }>(`/notes/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateNoteRequest) => {
      const response = await apiClient.post<{ data: Note }>("/notes", data)
      return response.data.data
    },
    onSuccess: (data) => {
      // Invalidate all workspace notes queries for this workspace
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, "workspace", data.workspaceId] })
      // Also invalidate public notes in case it's a public note
      if (data.type === "PUBLIC") {
        queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, "public"] })
      }
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateNoteRequest }) => {
      const response = await apiClient.put<{ data: Note }>(`/notes/${id}`, data)
      return response.data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, data.id] })
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, "workspace", data.workspaceId] })
      queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY, data.id] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/notes/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] })
    },
  })
}

export function usePublishNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<{ data: Note }>(`/notes/${id}/publish`)
      return response.data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, data.id] })
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, "workspace", data.workspaceId] })
    },
  })
}

export function useUnpublishNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<{ data: Note }>(`/notes/${id}/unpublish`)
      return response.data.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, data.id] })
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, "workspace", data.workspaceId] })
    },
  })
}

export function useSearchNotes() {
  return useMutation({
    mutationFn: async (params: NotesFilterParams) => {
      const response = await apiClient.get<PaginatedResponse<Note>>("/notes/search", { params })
      return response.data
    },
  })
}
