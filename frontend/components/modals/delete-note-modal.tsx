"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Trash2, Loader2 } from "lucide-react"

interface DeleteNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  noteTitle?: string
  onConfirm?: () => void
  isDeleting?: boolean
}

export function DeleteNoteModal({ open, onOpenChange, noteTitle, onConfirm, isDeleting }: DeleteNoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-border/40 bg-gradient-to-br from-card/90 via-card/70 to-card/50 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Delete Note</DialogTitle>
          </div>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive/90">
              The note "<span className="font-semibold">{noteTitle}</span>" will be permanently deleted.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="flex-1 border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onConfirm?.()
                onOpenChange(false)
              }}
              disabled={isDeleting}
              className="flex-1 bg-destructive/90 text-white hover:bg-destructive hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:hover:scale-100"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Note
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
