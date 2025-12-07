"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTags } from "@/lib/hooks/useTags"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Filter, X } from "lucide-react"

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void
  initialFilters?: FilterState
}

export interface FilterState {
  status?: "DRAFT" | "PUBLISHED" | "all"
  type?: "PUBLIC" | "PRIVATE" | "all"
  tags: string[]
  sortBy?: "newest" | "oldest" | "most_upvoted" | "most_downvoted"
}

export function AdvancedFilters({ onFilterChange, initialFilters }: AdvancedFiltersProps) {
  const { data: tags } = useTags()
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      status: "all",
      type: "all",
      tags: [],
      sortBy: "newest",
    },
  )

  const handleStatusChange = (status: "DRAFT" | "PUBLISHED" | "all") => {
    const newFilters = { ...filters, status }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleTypeChange = (type: "PUBLIC" | "PRIVATE" | "all") => {
    const newFilters = { ...filters, type }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag]
    const newFilters = { ...filters, tags: newTags }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSortChange = (sortBy: "newest" | "oldest" | "most_upvoted" | "most_downvoted") => {
    const newFilters = { ...filters, sortBy }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const hasActiveFilters = filters.tags.length > 0 || filters.status !== "all" || filters.type !== "all"

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                Active
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            {/* Status Filter */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Status</h4>
              <div className="space-y-2">
                {(["all", "DRAFT", "PUBLISHED"] as const).map((status) => (
                  <label key={status} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.status === status}
                      onCheckedChange={() => handleStatusChange(status as "DRAFT" | "PUBLISHED" | "all")}
                    />
                    <span className="text-sm">{status === "all" ? "All" : status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="border-t pt-3">
              <h4 className="font-semibold text-sm mb-3">Type</h4>
              <div className="space-y-2">
                {(["all", "PUBLIC", "PRIVATE"] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={filters.type === type}
                      onCheckedChange={() => handleTypeChange(type as "PUBLIC" | "PRIVATE" | "all")}
                    />
                    <span className="text-sm">{type === "all" ? "All" : type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            {tags && tags.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="font-semibold text-sm mb-3">Tags</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tags.map((tag) => (
                    <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={filters.tags.includes(tag.slug)}
                        onCheckedChange={() => handleTagToggle(tag.slug)}
                      />
                      <span className="text-sm">{tag.name}</span>
                      <span className="text-xs text-muted-foreground">({tag.noteCount})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Sort */}
            <div className="border-t pt-3">
              <h4 className="font-semibold text-sm mb-3">Sort By</h4>
              <div className="space-y-2">
                {(["newest", "oldest", "most_upvoted", "most_downvoted"] as const).map((sort) => (
                  <label key={sort} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={filters.sortBy === sort} onCheckedChange={() => handleSortChange(sort)} />
                    <span className="text-sm capitalize">{sort.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Display active tags as badges */}
      {filters.tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-2">
          {tag}
          <button onClick={() => handleTagToggle(tag)} className="ml-1 hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Clear filters button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const newFilters: FilterState = {
              status: "all",
              type: "all",
              tags: [],
              sortBy: "newest",
            }
            setFilters(newFilters)
            onFilterChange(newFilters)
          }}
        >
          Clear
        </Button>
      )}
    </div>
  )
}
