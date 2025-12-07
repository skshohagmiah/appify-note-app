"use client"

import { useNoteHistory, useRestoreHistory } from "@/lib/hooks/useHistory"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { useState } from "react"

interface NoteHistoryProps {
  noteId: string
  noteTitle: string
}

export function NoteHistory({ noteId, noteTitle }: NoteHistoryProps) {
  const { data: history, isLoading, error, refetch } = useNoteHistory(noteId)
  const restoreMutation = useRestoreHistory(noteId)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  const handleRestore = async (historyId: string) => {
    if (confirm("Are you sure you want to restore this version?")) {
      try {
        await restoreMutation.mutateAsync(historyId)
        refetch()
        setSelectedVersion(null)
      } catch (err) {
        console.error("[v0] Restore error:", err)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="font-semibold text-destructive">Error loading history</h3>
            <p className="text-sm text-destructive/80">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded border border-border bg-background p-12 text-center">
          <p className="text-muted-foreground">No history available for this note.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-bold text-foreground">Version History</h1>
      <p className="mb-6 text-sm text-muted-foreground">Note: "{noteTitle}"</p>

      <div className="space-y-4">
        {history.map((version) => (
          <div
            key={version.id}
            className="rounded border border-border bg-background p-6 cursor-pointer transition-colors hover:bg-muted-background"
            onClick={() => setSelectedVersion(version.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-foreground">📅 {new Date(version.createdAt).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Changed by: {version.updatedBy}</p>
                <div className="mt-3 rounded border border-border bg-muted-background p-3">
                  <p className="text-sm text-foreground line-clamp-3">{version.previousContent}</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRestore(version.id)
                }}
                disabled={restoreMutation.isPending}
              >
                {restoreMutation.isPending ? "Restoring..." : "Restore"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
