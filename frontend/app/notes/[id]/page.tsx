import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NoteDetail } from "@/components/pages/note-detail"
import { Zap } from "lucide-react"

export const metadata = {
  title: "Note - NotesApp",
  description: "View and interact with notes",
}

interface NotePageProps {
  params: Promise<{ id: string }>
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md animate-slideInDown">
        <nav className="mx-auto max-w-8xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 transition-all duration-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NotesApp
              </span>
            </Link>
            <Link href="/workspaces">
              <Button variant="outline" className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                Back to Workspace
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <NoteDetail noteId={id} />
      </main>
    </>
  )
}
