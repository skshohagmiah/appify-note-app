import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { NoteHistory } from "@/lib/api/types"
import { NOTES_QUERY_KEY } from "./useNotes"

export const HISTORY_QUERY_KEY = "history"

export function useNoteHistory(noteId: string | undefined) {
  return useQuery({
    queryKey: [HISTORY_QUERY_KEY, noteId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: NoteHistory[] }>(`/notes/${noteId}/history`)
      return response.data.data
    },
    enabled: !!noteId,
  })
}

export function useHistoryEntry(noteId: string | undefined, historyId: string | undefined) {
  return useQuery({
    queryKey: [HISTORY_QUERY_KEY, noteId, historyId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: NoteHistory }>(`/notes/${noteId}/history/${historyId}`)
      return response.data.data
    },
    enabled: !!noteId && !!historyId,
  })
}

export function useRestoreHistory(noteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (historyId: string) => {
      const response = await apiClient.post(`/notes/${noteId}/history/${historyId}/restore`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY, noteId] })
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, noteId] })
    },
  })
}

export function useDeleteHistory(noteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (historyId: string) => {
      await apiClient.delete(`/notes/${noteId}/history/${historyId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [HISTORY_QUERY_KEY, noteId] })
    },
  })
}
