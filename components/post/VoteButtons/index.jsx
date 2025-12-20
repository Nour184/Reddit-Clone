"use client";

import { useState, useEffect } from "react"; // 1. Import useEffect
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { cn } from "../../../lib/utils";

export default function VoteButtons({
  initialVotes = 0,
  initialVoteState = null,
  onVote,
  disabled = false,
  compact = false,
  horizontal = false,
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [voteState, setVoteState] = useState(initialVoteState);
  const [isAnimating, setIsAnimating] = useState(false);

  // ---------------------------------------------------------
  // 2. ADD THIS: Synchronize state when Parent updates Props
  // ---------------------------------------------------------
  useEffect(() => {
    setVotes(initialVotes);
  }, [initialVotes]);

  useEffect(() => {
    setVoteState(initialVoteState);
  }, [initialVoteState]);
  // ---------------------------------------------------------

  const handleVote = (newVote) => {
    if (disabled) return;

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

    // Optimistic Update (Immediate UI feedback)
    let newVoteState = voteState;
    let voteChange = 0;

    if (voteState === newVote) {
      newVoteState = null;
      voteChange = newVote === "up" ? -1 : 1;
    } else if (voteState === null) {
      newVoteState = newVote;
      voteChange = newVote === "up" ? 1 : -1;
    } else {
      voteChange = newVote === "up" ? 2 : -2;
      newVoteState = newVote;
    }

    setVoteState(newVoteState);
    setVotes((prev) => prev + voteChange);

    if (onVote) {
      onVote(newVoteState);
    }
  };

  const iconSize = compact ? 16 : 20;
  const buttonSize = compact ? "h-7 w-7" : "h-8 w-8";

  const formatVotes = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count;
  };

  return (
    <div className={cn(
      "flex items-center bg-secondary/50 rounded-full",
      horizontal ? "flex-row px-1 h-9" : "flex-col py-1 gap-1"
    )}>
      {/* Upvote Button */}
      <button
        type="button"
        onClick={() => handleVote("up")}
        disabled={disabled}
        className={cn(
          buttonSize,
          "flex items-center justify-center rounded-full transition-all duration-200",
          "hover:bg-orange-100 dark:hover:bg-orange-900/20",
          "active:scale-90",
          voteState === "up"
            ? "text-orange-500 bg-orange-50 dark:bg-orange-900/30"
            : "text-muted-foreground hover:text-orange-500",
          disabled && "opacity-50 cursor-not-allowed",
          isAnimating && "scale-95"
        )}
        aria-label="Upvote"
        aria-pressed={voteState === "up"}
      >
        <ArrowBigUp className={cn("transition-transform", isAnimating && "scale-125")} size={iconSize} strokeWidth={2.5} />
      </button>

      {/* Vote Count */}
      <span
        className={cn(
          "font-bold text-xs select-none transition-colors px-1 min-w-[3ch] text-center",
          voteState === "up" && "text-orange-500",
          voteState === "down" && "text-blue-500",
          !voteState && "text-foreground"
        )}
      >
        {formatVotes(votes)}
      </span>

      {/* Downvote Button */}
      <button
        type="button"
        onClick={() => handleVote("down")}
        disabled={disabled}
        className={cn(
          buttonSize,
          "flex items-center justify-center rounded-full transition-all duration-200",
          "hover:bg-blue-100 dark:hover:bg-blue-900/20",
          "active:scale-90",
          voteState === "down"
            ? "text-blue-500 bg-blue-50 dark:bg-blue-900/30"
            : "text-muted-foreground hover:text-blue-500",
          disabled && "opacity-50 cursor-not-allowed",
          isAnimating && "scale-95"
        )}
        aria-label="Downvote"
        aria-pressed={voteState === "down"}
      >
        <ArrowBigDown className={cn("transition-transform", isAnimating && "scale-125")} size={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  );
}