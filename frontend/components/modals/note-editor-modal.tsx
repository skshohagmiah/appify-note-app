"use client"

import { useState, useEffect } from "react"
import { useCreateNote, useUpdateNote, useNote } from "@/lib/hooks/useNotes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/tag-input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Loader2, Globe, Lock } from "lucide-react"

interface NoteEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  noteId?: string
  workspaceId?: string
  onSave?: () => void
}

export function NoteEditorModal({ open, onOpenChange, mode, noteId, workspaceId, onSave }: NoteEditorModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [type, setType] = useState<"PUBLIC" | "PRIVATE">("PRIVATE")
  const [error, setError] = useState("")

  const { data: existingNote } = useNote(mode === "edit" ? noteId : undefined)
  const createMutation = useCreateNote()
  const updateMutation = useUpdateNote()

  useEffect(() => {
    if (mode === "edit" && existingNote) {
      setTitle(existingNote.title)
      setContent(existingNote.content)
      setTags(existingNote.tags.map((t) => t.name))
      setType(existingNote.type)
    } else if (mode === "create") {
      setTitle("")
      setContent("")
      setTags([])
      setType("PRIVATE")
    }
  }, [existingNote, mode, open])

  const handleSave = async (status: "DRAFT" | "PUBLISHED") => {
    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (!content.trim()) {
      setError("Content is required")
      return
    }

    if (mode === "create" && !workspaceId) {
      setError("Workspace ID is required to create a note")
      console.error("[v0] Missing workspaceId in create mode")
      return
    }

    try {
      setError("")

      if (mode === "create") {
        await createMutation.mutateAsync({
          title,
          content,
          tags,
          type,
          status,
          workspaceId: workspaceId!,
        })
      } else {
        await updateMutation.mutateAsync({
          id: noteId!,
          data: {
            title,
            content,
            tags,
            type,
            status,
          },
        })
      }

      onOpenChange(false)
      onSave?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note")
      console.error("[v0] Save note error:", err)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto border border-border/40 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">
              {mode === "create" ? "Create New Note" : "Edit Note"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {mode === "create"
              ? "Create a new note and choose to save as draft or publish"
              : "Update your note and republish"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20 flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-destructive">!</span>
              </div>
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Note Title</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              disabled={isPending}
              className="text-lg rounded-lg border-border/50 bg-muted/30 px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here..."
              className="min-h-64 text-base rounded-lg border-border/50 bg-muted/30 px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-primary/30"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Tags</label>
            <TagInput value={tags} onChange={setTags} />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-foreground">Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("PRIVATE")}
                disabled={isPending}
                className={`rounded-lg border-2 p-4 transition-all duration-300 ${
                  type === "PRIVATE"
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Private</span>
                </div>
                <p className="text-xs text-muted-foreground">Only you can see</p>
              </button>
              <button
                type="button"
                onClick={() => setType("PUBLIC")}
                disabled={isPending}
                className={`rounded-lg border-2 p-4 transition-all duration-300 ${
                  type === "PUBLIC"
                    ? "border-primary bg-primary/10"
                    : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Public</span>
                </div>
                <p className="text-xs text-muted-foreground">Visible to community</p>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => handleSave("DRAFT")}
              disabled={!title.trim() || !content.trim() || isPending}
              variant="outline"
              className="flex-1 border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-300"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save as Draft"
              )}
            </Button>
            <Button
              onClick={() => handleSave("PUBLISHED")}
              disabled={!title.trim() || !content.trim() || isPending}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
