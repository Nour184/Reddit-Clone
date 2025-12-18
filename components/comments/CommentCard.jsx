"use client";

// components/comments/CommentCard.jsx
import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Share2, MoreHorizontal, Reply } from "lucide-react";
import VoteButtons from "components/post/VoteButtons/index.jsx";
import UserAvatar from "components/user/UserAvatar/index.jsx";
import TimeAgo from "components/shared/TimeAgo/index.jsx";
import ShareDropdown from "components/post/ShareDropdown/index.jsx";
import { Button } from "components/ui/button";
import { cn } from "@/lib/utils";
import CommentForm from "./CommentForm";

/**
 * CommentCard Component
 * 
 * Displays a single comment with:
 * - Vote buttons
 * - Author info and timestamp
 * - Comment content
 * - Reply button
 * - Action buttons (share, report, more)
 * - Nested replies support
 * 
 * Props:
 * - id: string - Comment ID
 * - author: object - { username, avatar }
 * - content: string - Comment text content
 * - votes: number - Vote count
 * - voteState: "up" | "down" | null - Current vote state
 * - createdAt: Date | string | number - Comment timestamp
 * - replies: array - Array of nested comments
 * - depth: number - Nesting depth (for indentation)
 * - onVote: function - Vote handler
 * - onReply: function - Reply handler (Optional now, as card handles submission)
 * - className: string - Additional CSS classes
 */
export default function CommentCard({
    id,
    author,
    content,
    votes = 0,
    voteState = null,
    createdAt,
    replies = [],
    depth = 0,
    onVote,
    onReply, // Legacy support if needed
    className,
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showReplies, setShowReplies] = useState(true);
    const [isReplying, setIsReplying] = useState(false);

    const handleReplyClick = () => {
        setIsReplying(!isReplying);
    };

    const handleReplySubmit = (text) => {
        if (onReply) {
            onReply(id, text);
            setIsReplying(false);
            setShowReplies(true);
        }
    };

    // Indentation based on depth
    const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 20)}` : "";

    return (
        <div className={cn("group", className)}>
            <div className={cn("flex gap-3 py-2", indentClass)}>
                {/* Vote Buttons */}
                <div className="flex-shrink-0">
                    <VoteButtons
                        initialVotes={votes}
                        initialVoteState={voteState}
                        onVote={onVote}
                        compact={true}
                    />
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Header: Author & Time */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <UserAvatar username={author?.username} avatar={author?.avatar} size="sm" />
                        <Link
                            href={`/u/${author?.username || ""}`}
                            className="text-xs font-medium hover:underline"
                        >
                            u/{author?.username || "unknown"}
                        </Link>
                        {createdAt && (
                            <>
                                <span className="text-xs text-muted-foreground">·</span>
                                <TimeAgo timestamp={createdAt} />
                            </>
                        )}
                        {votes !== 0 && (
                            <>
                                <span className="text-xs text-muted-foreground">·</span>
                                <span className="text-xs text-muted-foreground">
                                    {votes > 0 ? "+" : ""}{votes} {votes === 1 ? "point" : "points"}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Comment Text */}
                    {isExpanded && (
                        <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                            {content}
                        </div>
                    )}

                    {/* Action Buttons */}
                    {isExpanded && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                onClick={handleReplyClick}
                            >
                                <Reply className="w-3.5 h-3.5 mr-1" />
                                Reply
                            </Button>

                            <ShareDropdown
                                url={`${typeof window !== "undefined" ? window.location.origin : ""}/comment/${id}`}
                                title={content.substring(0, 100)}
                                size="sm"
                                variant="ghost"
                            />

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                aria-label="More options"
                            >
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Reply Form */}
                    {isReplying && isExpanded && (
                        <div className="mt-2">
                            <CommentForm
                                onSubmit={handleReplySubmit}
                                onCancel={() => setIsReplying(false)}
                                submitLabel="Reply"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Nested Replies */}
                    {replies && replies.length > 0 && isExpanded && (
                        <div className="space-y-1 pt-2">
                            {showReplies ? (
                                <>
                                    {replies.map((reply) => (
                                        <CommentCard
                                            key={reply.id}
                                            {...reply}
                                            depth={depth + 1}
                                            onVote={onVote}
                                            onReply={onReply}
                                        />
                                    ))}
                                    {replies.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs text-muted-foreground hover:text-foreground mt-1"
                                            onClick={() => setShowReplies(false)}
                                        >
                                            Hide {replies.length} {replies.length === 1 ? "reply" : "replies"}
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => setShowReplies(true)}
                                >
                                    Show {replies.length} {replies.length === 1 ? "reply" : "replies"}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}