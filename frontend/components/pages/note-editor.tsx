"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/tag-input"

interface NoteEditorProps {
  noteId?: string
  mode: "create" | "edit"
}

export function NoteEditor({ noteId, mode }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (asDraft: boolean) => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Saved:", { title, content, tags, isPublic, asDraft })
    setIsSaving(false)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Note Title</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="text-lg"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note content here..."
            className="min-h-96 text-base"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
          <TagInput value={tags} onChange={setTags} />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Visibility</label>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input type="radio" checked={!isPublic} onChange={() => setIsPublic(false)} className="h-4 w-4" />
              <span className="text-sm text-foreground">Private</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" checked={isPublic} onChange={() => setIsPublic(true)} className="h-4 w-4" />
              <span className="text-sm text-foreground">Public</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6">
          <Button onClick={() => handleSave(true)} disabled={isSaving || !title.trim()} variant="outline">
            {isSaving ? "Saving..." : "Save as Draft"}
          </Button>
          <Button onClick={() => handleSave(false)} disabled={isSaving || !title.trim()}>
            {isSaving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  )
}
