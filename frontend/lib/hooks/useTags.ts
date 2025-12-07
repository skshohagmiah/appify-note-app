import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { Tag, PaginatedResponse, Note } from "@/lib/api/types"

const TAGS_QUERY_KEY = "tags"

export function useTags() {
  return useQuery({
    queryKey: [TAGS_QUERY_KEY],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Tag[] }>("/tags")
      return response.data.data
    },
  })
}

export function useTag(slug: string | undefined) {
  return useQuery({
    queryKey: [TAGS_QUERY_KEY, slug],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Tag }>(`/tags/${slug}`)
      return response.data.data
    },
    enabled: !!slug,
  })
}

export function useTagNotes(slug: string | undefined, page = 1, limit = 20) {
  return useQuery({
    queryKey: [TAGS_QUERY_KEY, slug, "notes", page],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Note>>(`/tags/${slug}/notes`, {
        params: { page, limit },
      })
      return response.data
    },
    enabled: !!slug,
  })
}

export function usePopularTags() {
  return useQuery({
    queryKey: [TAGS_QUERY_KEY, "popular"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Tag[] }>("/tags/popular")
      return response.data.data
    },
  })
}

export function useSearchTags() {
  return useQuery({
    queryKey: [TAGS_QUERY_KEY, "search"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Tag[] }>("/tags/search")
      return response.data.data
    },
  })
}
