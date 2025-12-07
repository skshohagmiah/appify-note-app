"use client"

import { use } from "react"
import Link from "next/link"
import { useNote } from "@/lib/hooks"
import { Button } from "@/components/ui/button"
import { NoteHistory } from "@/components/pages/note-history"
import { Skeleton } from "@/components/ui/skeleton"

interface NoteHistoryPageProps {
  params: Promise<{ id: string }>
}

export default function NoteHistoryPage({ params }: NoteHistoryPageProps) {
  const { id } = use(params)
  const { data: note, isLoading } = useNote(id)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href={`/notes/${id}`}>
              <Button variant="ghost" className="gap-2">
                ← Back to Note
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="min-h-screen bg-background">
        {isLoading ? (
          <div className="mx-auto max-w-4xl px-4 py-12 space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-64" />
          </div>
        ) : (

          <NoteHistory noteId={id} noteTitle={note?.title || "Note"} />
        )}
      </main>
    </>
  )
}
