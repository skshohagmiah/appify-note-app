"use client"

import { Badge } from "@/components/ui/badge"
import { VoteButtons } from "@/components/vote-buttons"
import type { Note } from "@/lib/api/types"
import { Sparkles } from "lucide-react"

interface NoteCardProps {
  id?: string
  title?: string
  preview?: string
  workspace?: string
  tags?: string[]
  upvotes?: number
  downvotes?: number
  createdAt?: string
  variant?: "grid" | "list"
  onViewNote?: (id: string) => void
  note?: Note
}

export function NoteCard({
  id: propId,
  title: propTitle,
  preview: propPreview,
  workspace: propWorkspace,
  tags: propTags,
  upvotes: propUpvotes,
  downvotes: propDownvotes,
  createdAt: propCreatedAt,
  variant = "grid",
  onViewNote,
  note,
}: NoteCardProps) {
  // Use note object if provided, otherwise fallback to props
  const id = note?.id || propId || ""
  const title = note?.title || propTitle || ""
  // Map content to preview, taking first 150 chars
  const preview = note?.content?.substring(0, 150) || propPreview || ""
  // Parse workspace name if available, otherwise default
  const workspace = note?.workspaceId ? "Workspace" : propWorkspace || "Workspace"
  // Map tags object array to string array if needed
  const tags = note?.tags?.map(t => t.name) || propTags || []
  const upvotes = note?.votes?.upvotes ?? propUpvotes ?? 0
  const downvotes = note?.votes?.downvotes ?? propDownvotes ?? 0
  const createdAt = note ? new Date(note.createdAt).toLocaleDateString() : propCreatedAt || ""

  const handleClick = () => {
    onViewNote?.(id)
  }

  if (variant === "list") {
    return (
      <div
        onClick={handleClick}
        role="button"
        tabIndex={0}
        className="group relative rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:shadow-md hover:border-primary/30 cursor-pointer animate-fadeIn"
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
      >
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{title}</h3>
              {tags.length > 0 && <Sparkles className="h-4 w-4 text-primary/60 flex-shrink-0" />}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{createdAt}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0">
            <VoteButtons noteId={id} upvotes={upvotes} downvotes={downvotes} size="sm" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className="group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer overflow-hidden animate-fadeIn"
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
            <span className="text-xl">📝</span>
          </div>
          {tags.length > 0 && (
            <Sparkles className="h-5 w-5 text-primary/40 group-hover:text-primary/80 transition-colors duration-300" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-muted-foreground/80 transition-colors">
            {preview}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>🏢</span>
          <span className="group-hover:text-foreground transition-colors">{workspace}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300">
              #{tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
              +{tags.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <VoteButtons noteId={id} upvotes={upvotes} downvotes={downvotes} size="sm" />
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            📅 {createdAt}
          </span>
        </div>
      </div>
    </div>
  )
}
