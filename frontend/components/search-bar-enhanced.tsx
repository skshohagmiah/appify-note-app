"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface SearchBarEnhancedProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export function SearchBarEnhanced({
  onSearch,
  placeholder = "Search notes...",
  debounceMs = 300,
}: SearchBarEnhancedProps) {
  const [value, setValue] = useState("")
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      const newTimeout = setTimeout(() => {
        onSearch(newValue)
      }, debounceMs)

      setTimeoutId(newTimeout)
    },
    [debounceMs, onSearch, timeoutId],
  )

  const handleClear = () => {
    setValue("")
    onSearch("")
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
