"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useWorkspaceNotes, useDeleteNote, usePublishNote, useUnpublishNote } from "@/lib/hooks/useNotes"
import { useWorkspace } from "@/lib/hooks/useWorkspaces"
import { Button } from "@/components/ui/button"
import { SearchBarEnhanced } from "@/components/search-bar-enhanced"
import { Badge } from "@/components/ui/badge"
import { NoteEditorModal } from "@/components/modals/note-editor-modal"
import { DeleteNoteModal } from "@/components/modals/delete-note-modal"
import { AlertCircle, Plus, FileText, Calendar } from "lucide-react"
import { NoteCardListSkeleton } from "@/components/skeletons/note-card-skeleton"
import { PageHeaderSkeleton } from "@/components/skeletons/page-skeleton"

interface WorkspaceNotesProps {
  workspaceId: string
}

export function WorkspaceNotes({ workspaceId }: WorkspaceNotesProps) {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "PUBLISHED" | "DRAFT">("all")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const { data: workspaceData, isLoading: workspaceLoading } = useWorkspace(workspaceId)
  const { data, isLoading, error, refetch } = useWorkspaceNotes(workspaceId, {
    search: searchQuery || undefined,
    status: filterStatus === "all" ? undefined : filterStatus,
  })

  const deleteMutation = useDeleteNote()
  const publishMutation = usePublishNote()
  const unpublishMutation = useUnpublishNote()

  const notes = data?.data || []
  const selectedNote = notes.find((n) => n.id === selectedNoteId)
  const workspace = workspaceData

  const filtered = useMemo(() => {
    let items = notes.filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase()))

    if (filterStatus === "PUBLISHED") {
      items = items.filter((n) => n.status === "PUBLISHED")
    } else if (filterStatus === "DRAFT") {
      items = items.filter((n) => n.status === "DRAFT")
    }

    return items
  }, [notes, searchQuery, filterStatus])

  const handleEdit = (id: string) => {
    setSelectedNoteId(id)
    setEditModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setSelectedNoteId(id)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedNoteId) {
      try {
        await deleteMutation.mutateAsync(selectedNoteId)
        setDeleteModalOpen(false)
        setSelectedNoteId(null)
        refetch()
        toast({
          title: "Note Deleted",
          description: "Note deleted successfully",
        })
      } catch (err: any) {
        console.error("[v0] Delete error:", err)
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: err.message || "Could not delete note",
        })
      }
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await publishMutation.mutateAsync(id)
      refetch()
      toast({
        title: "Note Published",
        description: "Note is now live",
      })
    } catch (err: any) {
      console.error("[v0] Publish error:", err)
      toast({
        variant: "destructive",
        title: "Publish Failed",
        description: err.message || "Could not publish note",
      })
    }
  }

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishMutation.mutateAsync(id)
      refetch()
      toast({
        title: "Note Unpublished",
        description: "Note is back to draft",
      })
    } catch (err: any) {
      console.error("[v0] Unpublish error:", err)
      toast({
        variant: "destructive",
        title: "Unpublish Failed",
        description: err.message || "Could not unpublish note",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <PageHeaderSkeleton />
        <NoteCardListSkeleton />
        <NoteCardListSkeleton />
        <NoteCardListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 backdrop-blur-sm p-6 flex items-center gap-4 animate-slideInUp">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/20">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-destructive">Error loading notes</h3>
            <p className="text-sm text-destructive/80 mt-1">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Header Section */}
      <div className="flex items-center justify-between animate-slideInDown">
        {workspaceLoading ? (
          <PageHeaderSkeleton />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">{workspace?.name || "Workspace"}</h1>
            </div>
            {workspace?.description && (
              <p className="text-muted-foreground">{workspace.description}</p>
            )}
          </div>
        )}
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Note
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 animate-slideInUp">
        <SearchBarEnhanced onSearch={setSearchQuery} placeholder="Search my notes..." />
        <div className="flex flex-wrap gap-2">
          {(["all", "PUBLISHED", "DRAFT"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                filterStatus === status
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md hover:scale-105"
                  : "border border-border/50 text-foreground hover:border-primary/30 hover:bg-primary/5"
              }`}
            >
              {status === "all" ? "All Notes" : status === "PUBLISHED" ? "Published" : "Drafts"}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-12 text-center max-w-md space-y-6 animate-slideInUp">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">No notes found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "Create your first note to get started"}
              </p>
            </div>
            {!searchQuery && (
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Note
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3 animate-fadeIn">
          {filtered.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <div className="group relative rounded-xl border border-border/50 bg-card p-5 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden cursor-pointer">
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                        {note.title}
                      </h3>
                      {note.status === "DRAFT" && (
                        <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30 text-xs flex-shrink-0">
                          Draft
                        </Badge>
                      )}
                      {note.type === "PUBLIC" && (
                        <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs flex-shrink-0">
                          Public
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {note.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {note.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            #{tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {note.status === "DRAFT" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePublish(note.id)
                        }}
                        className="border-border/50 hover:border-green-500/30 hover:bg-green-500/5 transition-all duration-300"
                      >
                        Publish
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault()
                          handleUnpublish(note.id)
                        }}
                        className="border-border/50 hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all duration-300"
                      >
                        Unpublish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        handleEdit(note.id)
                      }}
                      className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault()
                        handleDelete(note.id)
                      }}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modals */}
      <NoteEditorModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        mode="create"
        workspaceId={workspaceId}
        onSave={() => refetch()}
      />

      <NoteEditorModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        mode="edit"
        noteId={selectedNoteId || undefined}
        onSave={() => refetch()}
      />

      <DeleteNoteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        noteTitle={selectedNote?.title}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
