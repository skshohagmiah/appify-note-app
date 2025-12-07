"use client"

import { useState } from "react"
import Link from "next/link"
import { useWorkspaces } from "@/lib/hooks/useWorkspaces"
import { Button } from "@/components/ui/button"
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal"
import { AlertCircle, FolderPlus, ArrowRight, Calendar, BookOpen } from "lucide-react"
import { NoteCardGridSkeleton } from "@/components/skeletons/note-card-skeleton"

export function WorkspacesList() {
  const { data: workspaces, isLoading, error } = useWorkspaces()
  const [createOpen, setCreateOpen] = useState(false)

  if (isLoading) {
    return <NoteCardGridSkeleton columns={2} />
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 backdrop-blur-sm p-6 flex items-center gap-4 animate-slideInUp">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/20">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-destructive">Error loading workspaces</h3>
          <p className="text-sm text-destructive/80 mt-1">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        </div>
      </div>
    )
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-12 text-center max-w-md space-y-6 animate-slideInUp">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
              <FolderPlus className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">No workspaces yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first workspace to get started organizing your notes.
            </p>
          </div>
          <Button 
            onClick={() => setCreateOpen(true)}
            className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
          <CreateWorkspaceModal open={createOpen} onOpenChange={setCreateOpen} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Workspaces</h1>
          <p className="text-muted-foreground">Organize and manage your notes by workspace</p>
        </div>
        <Button 
          onClick={() => setCreateOpen(true)}
          className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          New Workspace
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Link key={workspace.id} href={`/workspace/${workspace.id}`} className="group">
            <div className="relative rounded-xl border border-border/50 bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden h-full cursor-pointer animate-slideInUp">
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                    <FolderPlus className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary/40 group-hover:text-primary/80 group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {workspace.name}
                  </h3>
                  {workspace.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-muted-foreground/80 transition-colors">
                      {workspace.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="group-hover:text-foreground transition-colors">{new Date(workspace.createdAt).toLocaleDateString()}</span>
                  </div>
                  {workspace._count && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="group-hover:text-foreground transition-colors">{workspace._count.notes} notes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <CreateWorkspaceModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
