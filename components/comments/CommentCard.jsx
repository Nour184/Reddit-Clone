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
import { cn } from "../../lib/utils";
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

const currentUserEmail = "hamadahelal@forfun.com"; //get the real current user email

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
    onReply,
    onDelete,
    onEdit, // Legacy support if needed
    className,
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showReplies, setShowReplies] = useState(true);
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false); //comment is being edited
    const [isDeleting, setIsDeleting] = useState(false); //comment is being deleted
    //const { data: session } = useSession(); 
    //const currentUserEmail = session 

    const isOwner = author?.username === currentUserEmail;

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

    const handleEditSubmit = async (newText) => {
        try {
            const res = await fetch(`/api/comments/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: newText }),
            });

            if (res.ok) {
                const updatedComment = await res.json();
                setIsEditing(false);
                // Update the UI via parent function
                if (onEdit) onEdit(id, newText); 
            } else {
                console.error("Failed to edit comment");
            }
        } catch (error) {
            console.error("Error editing comment:", error);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        
        try {
            setIsDeleting(true);
            const res = await fetch(`/api/comments/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                // Remove from UI via parent function
                if (onDelete) onDelete(id);
            } else {
                console.error("Failed to delete comment");
                setIsDeleting(false);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            setIsDeleting(false);
        }
    };

    // Indentation based on depth
    const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 20)}` : "";

    if (isDeleting) return null; //hide comment when deletedd immediatly
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
                            {/* Hide the domain for cleaner UI if it's an email */}
                            u/{author?.username?.split('@')[0] || "unknown"}
                        </Link>
                        {createdAt && (
                            <>
                                <span className="text-xs text-muted-foreground">·</span>
                                <TimeAgo timestamp={createdAt} />
                            </>
                        )}
                    </div>

                    {/* --- CONTENT AREA (Edit Mode vs View Mode) --- */}
                    {isEditing ? (
                        <div className="mt-2">
                            <CommentForm
                                initialValue={content}
                                onSubmit={handleEditSubmit}
                                onCancel={() => setIsEditing(false)}
                                submitLabel="Save"
                                autoFocus
                            />
                        </div>
                    ) : (
                        isExpanded && (
                            <div className="text-sm text-foreground whitespace-pre-wrap break-words">
                                {content}
                            </div>
                        )
                    )}

                    {/* Action Buttons */}
                    {!isEditing && isExpanded && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setIsReplying(!isReplying)}
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

                            {/* --- MORE MENU (Edit/Delete) --- */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                    {isOwner && (
                                        <>
                                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                                <Pencil className="w-4 h-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuItem>Report</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    {/* Reply Form (Keep existing logic) */}
                    {isReplying && isExpanded && (
                         <div className="mt-2">
                            <CommentForm
                                onSubmit={(text) => {
                                    if(onReply) {
                                        onReply(id, text);
                                        setIsReplying(false);
                                    }
                                }}
                                onCancel={() => setIsReplying(false)}
                                submitLabel="Reply"
                                autoFocus
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}