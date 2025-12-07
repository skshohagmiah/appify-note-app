import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WorkspacesList } from "@/components/pages/workspaces-list"
import { Zap } from "lucide-react"

export const metadata = {
  title: "Workspaces - NotesApp",
  description: "Manage your workspaces and organize notes by project",
}

export default function WorkspacesPage() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md animate-slideInDown">
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-2 transition-all duration-300">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  NotesApp
                </span>
              </Link>
              <div className="hidden gap-1 md:flex">
                <Link 
                  href="/" 
                  className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-primary transition-all duration-300 hover:bg-primary/5 rounded-lg"
                >
                  Public Notes
                </Link>
                <Link 
                  href="/workspaces" 
                  className="px-4 py-2 text-sm font-medium text-primary transition-all duration-300 bg-primary/10 rounded-lg"
                >
                  Workspaces
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="ghost" className="hover:bg-primary/5 transition-all duration-300">Profile</Button>
              </Link>
              <Link href="/logout">
                <Button variant="outline" className="border-border/50 hover:border-destructive/30 hover:bg-destructive/5 transition-all duration-300">Sign Out</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <WorkspacesList />
        </div>
      </main>
    </>
  )
}
