"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { usePublicNotes } from "@/lib/hooks/useNotes"
import { NoteCard } from "@/components/note-card"
import { SearchBarEnhanced } from "@/components/search-bar-enhanced"
import { AdvancedFilters, type FilterState } from "@/components/advanced-filters"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { NoteCardGridSkeleton } from "@/components/skeletons/note-card-skeleton"
import { SearchBarSkeleton, PageHeaderSkeleton, PaginationSkeleton } from "@/components/skeletons/page-skeleton"

export function PublicNotesDirectoryEnhanced() {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    status: "PUBLISHED",
    type: "PUBLIC",
    tags: [],
    sortBy: "newest",
  })
  const [page, setPage] = useState(1)
  const limit = 12

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: filters.status === "all" ? undefined : filters.status,
      type: filters.type === "all" ? undefined : filters.type,
      tags: filters.tags.length > 0 ? filters.tags.join(",") : undefined,
      sortBy: filters.sortBy,
      page,
      limit,
    }),
    [search, filters, page],
  )

  const { data, isLoading, error } = usePublicNotes(params)

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 backdrop-blur-sm p-6 flex items-center gap-4 animate-slideInUp">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/20">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-destructive">Error loading notes</h3>
          <p className="text-sm text-destructive/80 mt-1">
            {error instanceof Error ? error.message : "Something went wrong. Please try again."}
          </p>
        </div>
      </div>
    )
  }

  const notes = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      {isLoading ? (
        <PageHeaderSkeleton />
      ) : (
        <div className="space-y-2 animate-slideInUp">
          <h2 className="text-4xl font-bold text-foreground">Discover Notes</h2>
          <p className="text-muted-foreground">Explore public notes shared by the community</p>
        </div>
      )}

      {/* Search and Filters Section */}
      {isLoading ? (
        <SearchBarSkeleton />
      ) : (
        <div className="space-y-4 animate-slideInUp">
          <SearchBarEnhanced onSearch={setSearch} placeholder="Search by title..." />
          <AdvancedFilters onFilterChange={setFilters} initialFilters={filters} />
        </div>
      )}

      {/* Notes Grid Section */}
      {isLoading ? (
        <NoteCardGridSkeleton columns={3} />
      ) : notes.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card p-16 text-center animate-slideInUp">
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">No notes found</p>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`} className="group">
                <NoteCard note={note} />
              </Link>
            ))}
          </div>

          {/* Pagination Section */}
          {pagination && pagination.totalPages > 1 && (
            isLoading ? (
              <PaginationSkeleton />
            ) : (
              <div className="flex items-center justify-center gap-3 pt-8 animate-slideInUp">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="hover:bg-primary/5 transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm text-muted-foreground px-4">
                  Page <span className="font-semibold text-foreground">{pagination.page}</span> of{" "}
                  <span className="font-semibold text-foreground">{pagination.totalPages}</span>
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="hover:bg-primary/5 transition-all duration-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}
