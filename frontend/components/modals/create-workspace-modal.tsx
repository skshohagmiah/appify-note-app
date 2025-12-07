"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateWorkspace } from "@/lib/hooks/useWorkspaces"
import { FolderPlus, Loader2 } from "lucide-react"

interface CreateWorkspaceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateWorkspaceModal({ open, onOpenChange, onSuccess }: CreateWorkspaceModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const createWorkspace = useCreateWorkspace()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createWorkspace.mutateAsync({ name, description })
      setName("")
      setDescription("")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("[v0] Create workspace error:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-border/40 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
              <FolderPlus className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Create New Workspace</DialogTitle>
          </div>
          <DialogDescription>
            Create a new workspace to organize your notes and collaborate with team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Workspace Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Research, Team Wiki"
              required
              disabled={createWorkspace.isPending}
              className="rounded-lg border-border/50 bg-muted/30 px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground">Description (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this workspace is for..."
              rows={3}
              disabled={createWorkspace.isPending}
              className="rounded-lg border-border/50 bg-muted/30 px-4 py-3 text-sm transition-all duration-300 focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createWorkspace.isPending}
              className="border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name || createWorkspace.isPending}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
            >
              {createWorkspace.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create Workspace
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
