"use client";

import { useState, useEffect } from "react";
import { getComments, addComment } from "../../lib/comment-store";
import CommentSort from "./CommentSort";
import CommentForm from "./CommentForm";
import CommentCard from "./CommentCard";
import LoadingSpinner from "../../components/shared/LoadingSpinner/index.jsx";

export default function CollapsibleThread({ postId }) {
    const [comments, setComments] = useState([]);
    const [sortBy, setSortBy] = useState("best");
    const [isLoading, setIsLoading] = useState(true);

    const loadComments = () => {
        const loadedComments = getComments(postId);

        // Sort comments based on sortBy
        // specific sorting logic would go here, for now we just load them
        // Real implementation would sort based on votes, date, etc.
        let sorted = [...loadedComments];
        if (sortBy === 'new') {
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'top') {
            sorted.sort((a, b) => b.votes - a.votes);
        }
        // 'best' and 'controversial' would require more complex algo, keeping simple for now

        setComments(sorted);
        setIsLoading(false);
    };

    useEffect(() => {
        loadComments();

        const handler = (e) => {
            if (!e.detail || e.detail === postId) loadComments();
        };
        window.addEventListener('comments-updated', handler);
        return () => window.removeEventListener('comments-updated', handler);
    }, [postId, sortBy]);

    const handleAddComment = (text) => {
        try {
            addComment(postId, text);
            // Event is dispatched by addComment helper in some versions, but looking at lib/comment-store.js it might not be.
            // The store I read earlier didn't dispatch event.
            // Wait, let's check comment-store.js content again.
            // It DOES NOT dispatch event. I should dispatch it manually or just reload.

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('comments-updated', { detail: postId }));
            }
            loadComments();
        } catch (err) {
            console.error("Failed to add comment:", err);
        }
    };

    const handleReply = (parentId, text) => {
        // This needs to be passed down to CommentCard, but CommentCard currently handles its own reply state locally 
        // and calls a prop `onReply`. 
        // Wait, CommentCard's onReply prop in the existing file (line 55) just calls onReply(id).
        // It doesn't seem to have the form logic inside the card itself for SUBMITTING, 
        // BUT line 107 in previous view of CommentThread.jsx showed a reply form handled by CommentThread.

        // Ah, looking at CommentCard.jsx again (Step 19):
        // It calls `onReply(id)` when reply button is clicked. 
        // It DOES NOT have a form inside it.

        // So CollapsibleThread needs to manage which comment is being replied to, and show a form there?
        // OR I should update CommentCard to have the reply form inline (which is better UX).

        // Given standard Reddit behavior, reply forms are inline.
        // I'll update CommentCard later or handle it here.
        // If I handle it here, I need to know WHERE to render the form.

        // Let's look at CommentThread.jsx again. It managed `replyingTo` state.

        // Ideally, I should refactor CommentCard to accept a `replyComponent` or handle the form itself.

        // For now, I'll stick to the pattern in CommentThread: 
        // `CommentCard` fires onReply. Parent `CollapsibleThread` manages state?
        // Actually, if `CommentCard` is recursive, passing `replyingTo` state down eagerly is painful.

        // BETTER APPROACH:
        // Modify `CommentCard` to use the new `CommentForm` and handle its own "isReplying" state locally. 
        // This is much cleaner.
    };

    // We need a wrapper to handle the reply logic integration if we want to change it.
    // But let's first get the main list rendering.

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-lg p-4 border">
                <CommentForm onSubmit={handleAddComment} submitLabel="Comment" />
            </div>

            <div className="bg-card rounded-lg border p-4">
                <CommentSort sortBy={sortBy} onSortChange={setSortBy} />

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <CommentCard
                                key={comment.id}
                                {...comment}
                                onReply={(parentId) => {
                                    // This is tricky if CommentCard expects parent to handle form.
                                    // I will update CommentCard next to use local state for form.
                                    console.log("Reply requested for", parentId);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}