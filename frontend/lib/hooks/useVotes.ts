import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { VoteRequest, VoteResponse } from "@/lib/api/types"

const VOTES_QUERY_KEY = "votes"

export function useVote(noteId: string) {
  return useQuery({
    queryKey: [VOTES_QUERY_KEY, noteId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: VoteResponse }>(`/notes/${noteId}/votes`)
      return response.data.data
    },
    enabled: !!noteId,
  })
}

export function useAddVote(noteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: VoteRequest) => {
      const response = await apiClient.post<{ data: VoteResponse }>(`/notes/${noteId}/vote`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VOTES_QUERY_KEY, noteId] })
    },
  })
}

export function useChangeVote(noteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: VoteRequest) => {
      const response = await apiClient.put<{ data: VoteResponse }>(`/notes/${noteId}/vote`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VOTES_QUERY_KEY, noteId] })
    },
  })
}

export function useRemoveVote(noteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/notes/${noteId}/vote`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VOTES_QUERY_KEY, noteId] })
    },
  })
}
