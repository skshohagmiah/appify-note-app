"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useNote, useDeleteNote, usePublishNote, useUnpublishNote } from "@/lib/hooks/useNotes"
import { useVote as useVoteHook } from "@/lib/hooks/useVotes"
import { useCurrentUser } from "@/lib/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VoteButtons } from "@/components/vote-buttons"
import { NoteEditorModal } from "@/components/modals/note-editor-modal"
import { DeleteNoteModal } from "@/components/modals/delete-note-modal"
import { AlertCircle, Calendar, Clock, ArrowLeft, Edit, Trash2, Globe, Lock, FileText, Loader2 } from "lucide-react"
import { PageHeaderSkeleton } from "@/components/skeletons/page-skeleton"

interface NoteDetailProps {
  noteId: string
}

export function NoteDetail({ noteId }: NoteDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { data: user } = useCurrentUser()
  const { data: note, isLoading, error, refetch } = useNote(noteId)
  const { data: voteData } = useVoteHook(noteId)
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const deleteMutation = useDeleteNote()
  const publishMutation = usePublishNote()
  const unpublishMutation = useUnpublishNote()

  const isOwner = user && note && user.id === note.createdBy

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(noteId)
      refetch()
      toast({
        title: "Note Published",
        description: "Your note is now live.",
      })
    } catch (err: any) {
      console.error("Publish error:", err)
      toast({
        variant: "destructive",
        title: "Publish Failed",
        description: err.message || "Could not publish note",
      })
    }
  }

  const handleUnpublish = async () => {
    try {
      await unpublishMutation.mutateAsync(noteId)
      refetch()
      toast({
        title: "Note Unpublished",
        description: "Your note is now a draft.",
      })
    } catch (err: any) {
      console.error("Unpublish error:", err)
      toast({
        variant: "destructive",
        title: "Unpublish Failed",
        description: err.message || "Could not unpublish note",
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(noteId)
      router.push("/workspaces")
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted.",
      })
    } catch (err: any) {
      console.error("Delete error:", err)
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || "Could not delete note",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="space-y-8 animate-fadeIn">
          <PageHeaderSkeleton />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border/50 bg-card/50 p-8 backdrop-blur-sm space-y-6">
              <div className="h-64 rounded-lg bg-gradient-to-br from-muted to-muted/50 animate-shimmer" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-muted/50 animate-shimmer" />
                <div className="h-4 w-5/6 rounded bg-muted/50 animate-shimmer" />
                <div className="h-4 w-4/5 rounded bg-muted/50 animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-destructive/20 bg-card/50 p-8 backdrop-blur-sm animate-fadeIn space-y-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-destructive/10 p-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Error Loading Note</h3>
            </div>
          </div>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "The note could not be found or you don't have permission to view it."}
          </p>
          <Button 
            onClick={() => router.back()} 
            className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background pb-20 animate-fadeIn">
      {/* Header Section */}
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 animate-slideInDown">
            <Button 
              variant="ghost" 
              size="sm" 
              className="pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="space-y-6 animate-slideInUp">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl leading-tight">
                {note.title}
              </h1>
              {isOwner && (
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    onClick={() => setEditModalOpen(true)}
                    className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => setDeleteModalOpen(true)}
                    className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-all"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary/60" />
                <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary/60" />
                <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                {note.type === "PUBLIC" && note.status !== "DRAFT" ? (
                  <>
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-primary font-medium text-xs">Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">Private</span>
                  </>
                )}
              </div>
              {note.status === "DRAFT" && (
                <Badge variant="outline" className="border-yellow-500/30 text-yellow-600 dark:text-yellow-500 bg-yellow-500/10">
                  Draft
                </Badge>
              )}
            </div>

            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {note.tags.map((tag) => (
                  <Badge 
                    key={tag.id} 
                    className="px-3 py-1 text-sm bg-background/50 backdrop-blur-md text-primary font-medium border border-primary/30 shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 animate-slideInUp">
        <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl p-8 sm:p-10">
          <article className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed prose-headings:text-foreground prose-headings:font-bold prose-a:text-primary prose-a:underline prose-strong:text-foreground prose-code:text-accent prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded">
            {note.content.split("\n").map((paragraph, i) => (
              paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
            ))}
          </article>
        </div>

        {/* Footer Actions */}
        <div className="mt-16 pt-8 border-t border-border/40 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <VoteButtons noteId={noteId} upvotes={voteData?.upvotes} downvotes={voteData?.downvotes} size="md" />
              <Link href={`/notes/${noteId}/history`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View History
                </Button>
              </Link>
            </div>

            {isOwner && (
              <div className="flex items-center gap-3">
                {note.status === "DRAFT" ? (
                  <Button 
                    onClick={handlePublish} 
                    disabled={publishMutation.isPending}
                    className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    {publishMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        Publish Note
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleUnpublish} 
                    disabled={unpublishMutation.isPending}
                    className="border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all"
                  >
                    {unpublishMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Unpublishing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Unpublish Note
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NoteEditorModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        mode="edit"
        noteId={noteId}
        onSave={() => refetch()}
      />

      <DeleteNoteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        noteTitle={note?.title}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
