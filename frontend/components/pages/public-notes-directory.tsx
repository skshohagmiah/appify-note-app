"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { NoteCard } from "@/components/note-card"
import { SearchBar } from "@/components/search-bar"

// Mock data - replace with API call
const mockNotes = [
  {
    id: "1",
    title: "Getting Started with React Hooks",
    preview: "A comprehensive guide to understanding React Hooks and how they can improve your component logic...",
    workspace: "Engineering",
    tags: ["react", "javascript", "hooks"],
    upvotes: 45,
    downvotes: 3,
    createdAt: "2 days ago",
  },
  {
    id: "2",
    title: "UI/UX Design Trends for 2025",
    preview: "Exploring the latest design trends including neomorphism, AI-assisted design, and accessibility focus...",
    workspace: "Design",
    tags: ["design", "ux", "trends"],
    upvotes: 120,
    downvotes: 8,
    createdAt: "1 hour ago",
  },
  {
    id: "3",
    title: "Database Optimization Tips",
    preview: "Learn how to optimize your database queries for better performance and scalability...",
    workspace: "Backend",
    tags: ["database", "performance", "sql"],
    upvotes: 78,
    downvotes: 5,
    createdAt: "5 hours ago",
  },
  {
    id: "4",
    title: "The Future of Web Development",
    preview: "Discussing emerging technologies and frameworks that will shape web development in the coming years...",
    workspace: "Tech Insights",
    tags: ["web", "future", "technology"],
    upvotes: 92,
    downvotes: 12,
    createdAt: "1 day ago",
  },
  {
    id: "5",
    title: "Product Management Best Practices",
    preview: "Essential strategies for managing product roadmaps, user feedback, and team coordination...",
    workspace: "Product",
    tags: ["product", "management", "strategy"],
    upvotes: 65,
    downvotes: 4,
    createdAt: "3 days ago",
  },
  {
    id: "6",
    title: "Machine Learning in Production",
    preview: "Deploying and maintaining ML models at scale with practical examples and best practices...",
    workspace: "AI/ML",
    tags: ["machine-learning", "ai", "production"],
    upvotes: 156,
    downvotes: 10,
    createdAt: "6 hours ago",
  },
]

export function PublicNotesDirectory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "upvotes" | "downvotes">("newest")

  const filteredAndSorted = useMemo(() => {
    const filtered = mockNotes.filter((note) => note.title.toLowerCase().includes(searchQuery.toLowerCase()))

    switch (sortBy) {
      case "newest":
        return filtered
      case "oldest":
        return filtered.reverse()
      case "upvotes":
        return filtered.sort((a, b) => b.upvotes - a.upvotes)
      case "downvotes":
        return filtered.sort((a, b) => b.downvotes - a.downvotes)
      default:
        return filtered
    }
  }, [searchQuery, sortBy])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Discover Public Notes</h1>
        <p className="text-lg text-muted-foreground">Explore ideas and insights shared by the community</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 max-w-md">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Search Notes</label>
          <SearchBar onSearch={setSearchQuery} placeholder="Search notes by title..." />
        </div>
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-muted-foreground">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded border border-border bg-background px-4 py-2 text-sm text-foreground hover:bg-muted-background transition-colors"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="upvotes">Most upvotes</option>
            <option value="downvotes">Most downvotes</option>
          </select>
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="rounded border border-border bg-muted-background p-12 text-center">
          <p className="text-muted-foreground">No notes found matching your search.</p>
          <Button className="mt-4" onClick={() => setSearchQuery("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((note) => (
            <NoteCard key={note.id} {...note} variant="grid" />
          ))}
        </div>
      )}
    </div>
  )
}
