import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { Workspace, CreateWorkspaceRequest, UpdateWorkspaceRequest, WorkspaceStats } from "@/lib/api/types"

const WORKSPACES_QUERY_KEY = "workspaces"

export function useWorkspaces() {
  return useQuery({
    queryKey: [WORKSPACES_QUERY_KEY],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Workspace[] }>("/workspaces")
      return response.data.data
    },
  })
}

export function useWorkspace(id: string | undefined) {
  return useQuery({
    queryKey: [WORKSPACES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: Workspace }>(`/workspaces/${id}`)
      return response.data.data
    },
    enabled: !!id,
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateWorkspaceRequest) => {
      const response = await apiClient.post<{ data: Workspace }>("/workspaces", data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKSPACES_QUERY_KEY] })
    },
  })
}

export function useUpdateWorkspace(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateWorkspaceRequest) => {
      const response = await apiClient.put<{ data: Workspace }>(`/workspaces/${id}`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKSPACES_QUERY_KEY, id] })
      queryClient.invalidateQueries({ queryKey: [WORKSPACES_QUERY_KEY] })
    },
  })
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/workspaces/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORKSPACES_QUERY_KEY] })
    },
  })
}

export function useWorkspaceStats(workspaceId: string | undefined) {
  return useQuery({
    queryKey: [WORKSPACES_QUERY_KEY, workspaceId, "stats"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: WorkspaceStats }>(`/workspaces/${workspaceId}/stats`)
      return response.data.data
    },
    enabled: !!workspaceId,
  })
}
