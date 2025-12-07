"use client"

import { useAddVote, useChangeVote, useRemoveVote, useVote } from "@/lib/hooks/useVotes"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface VoteButtonsProps {
  noteId: string
  upvotes?: number
  downvotes?: number
  size?: "sm" | "md"
}

export function VoteButtons({ noteId, upvotes = 0, downvotes = 0, size = "md" }: VoteButtonsProps) {
  const { toast } = useToast()
  const { data: voteData } = useVote(noteId)
  const addVoteMutation = useAddVote(noteId)
  const changeVoteMutation = useChangeVote(noteId)
  const removeVoteMutation = useRemoveVote(noteId)

  const handleVote = async (type: "upvote" | "downvote", e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    try {
      if (voteData?.userVote === type) {
        // Remove vote if already voted
        await removeVoteMutation.mutateAsync()
      } else if (voteData?.userVote) {
        // Change vote if already voted differently
        await changeVoteMutation.mutateAsync({ type })
      } else {
        // Add new vote
        await addVoteMutation.mutateAsync({ type })
      }
    } catch (err: any) {
      console.error("[v0] Vote error:", err)
      const message = err.response?.data?.message || err.message || "Failed to vote"
      toast({
        variant: "destructive",
        title: "Vote Failed",
        description: message,
      })
    }
  }

  const buttonSize = size === "sm" ? "sm" : "default"
  const isUpvoted = voteData?.userVote === "upvote"
  const isDownvoted = voteData?.userVote === "downvote"

  return (
    <div className="flex items-center gap-2">
      <Button
        size={buttonSize}
        variant={isUpvoted ? "default" : "outline"}
        onClick={(e) => handleVote("upvote", e)}
        className="gap-1"
        disabled={addVoteMutation.isPending || changeVoteMutation.isPending || removeVoteMutation.isPending}
      >
        <ThumbsUp className="h-4 w-4" />
        {voteData?.upvotes ?? upvotes}
      </Button>
      <Button
        size={buttonSize}
        variant={isDownvoted ? "default" : "outline"}
        onClick={(e) => handleVote("downvote", e)}
        className="gap-1"
        disabled={addVoteMutation.isPending || changeVoteMutation.isPending || removeVoteMutation.isPending}
      >
        <ThumbsDown className="h-4 w-4" />
        {voteData?.downvotes ?? downvotes}
      </Button>
    </div>
  )
}
