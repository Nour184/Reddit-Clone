"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "components/ui/card";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import VoteButtons from "components/post/VoteButtons";
import AISummarizeButton from "components/post/AISummarizeButton";
import PostActions from "components/post/PostActions";
import {
    MessageSquare,
    Share,
    Bookmark,
    MoreHorizontal,
    ArrowLeft,
    ExternalLink,
    Image as ImageIcon,
    Video
} from "lucide-react";
import Link from "next/link";
import { cn } from "lib/utils";
import CommentForm from "components/comments/CommentForm";
import CommentCard from "components/comments/CommentCard";

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { community, postId } = params;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        // Fetch post from database API
        const loadPost = async () => {
            try {
                const response = await fetch(`/api/posts/${postId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setNotFound(true);
                    } else {
                        throw new Error('Failed to fetch post');
                    }
                    setLoading(false);
                    return;
                }

                const data = await response.json();

                // Transform API response to match component expectations
                const transformedPost = {
                    id: data.post_id,
                    title: data.title,
                    content: data.body,
                    user_email: data.user_email, // Required for permission checks
                    author: data.user_email?.split('@')[0] || 'user', // Extract username from email
                    community: { name: data.community_name },
                    upvotes: 0, // Will be fetched separately if needed
                    comments: 0, // Will be fetched separately if needed
                    createdAt: data.created_on,
                    type: data.picture_link ? 'image' : 'post',
                    media: data.picture_link ? [{ preview: data.picture_link, type: 'image' }] : null,
                    pictureLink: data.picture_link,
                    href: `/r/${data.community_name}/post/${data.post_id}`,
                };

                setPost(transformedPost);
                setNotFound(false);
            } catch (error) {
                console.error('Error loading post:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            loadPost();
        }
    }, [postId]);

   useEffect(() => {
    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/posts/${postId}/comments`);
            
            // 1. Handle "No Comments" (404) or other errors gracefully
            if (!res.ok) {
                if (res.status === 404) {
                    setComments([]); // Zero comments is a valid state, not an error
                } else {
                    console.error('Failed to fetch comments');
                }
                return; // Stop execution here so we don't call res.json() again
            }

            // 2. Only read the stream ONCE
            const data = await res.json();
            
            const commentsWithVotes = await Promise.all(
                data.map(async (comment) => {
                    try {
                        const voteRes = await fetch(`/api/posts/${postId}/comments/${comment.comment_id}/votes`);
                        if (voteRes.ok) {
                            const voteData = await voteRes.json();
                            
                            // FIX: Ensure this is a NUMBER. 
                            // Accessing 'VoteCount' directly as it is now returned from your SQL BIGINT sum
                            const count = Number(voteData.VoteCount) || 0;
                            return { ...comment, votes: count };
                        }
                    } catch (error) {
                        console.error(`Error fetching votes for comment ${comment.comment_id}:`, error);
                    }
                    return { ...comment, votes: 0 };
                })
            );
            
            setComments(commentsWithVotes);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    if (postId) fetchComments();
}, [postId]);

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

   const handleAddComment = async (text) => {
    try {
        const res = await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ body: text }),
        });
        
        if (res.ok) {
            const fetchRes = await fetch(`/api/posts/${postId}/comments`);
            if (fetchRes.ok) {
                const data = await fetchRes.json();
                setComments(data);

                // --- ADD THIS LINE ---
                // Notify the rest of the app that this post was updated
                window.dispatchEvent(new CustomEvent('post-updated', { detail: postId }));
            }
        }
    } catch (error) {
        console.error('Error adding comment:', error);
    }
};

const handleCommentDeleted = (deletedCommentId) => {
    setComments(prev => prev.filter(c => c.comment_id !== deletedCommentId));
    
    // --- ADD THIS LINE ---
    // Notify the rest of the app that a comment was removed
    window.dispatchEvent(new CustomEvent('post-updated', { detail: postId }));
};
    // 2. Function to update comment text in state
    const handleCommentEdited = (commentId, newText) => {
    setComments(prev => prev.map(c => 
        c.comment_id === commentId ? { ...c, body: newText } : c
    ));
    };

  const handleCommentVote = async (commentId, newVoteState) => {
    try {
        const url = `/api/posts/${postId}/comments/${commentId}/votes`;

        // 1. Send the correct request based on the state from VoteButtons
        if (newVoteState === 'up') {
            await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flag: 1 })
            });
        } else if (newVoteState === 'down') {
            await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flag: -1 })
            });
        } else {
            // This handles the 'null' state when a user un-clicks a button
            await fetch(url, { method: 'DELETE' });
        }

        // 2. Refresh only this comment's vote count from the server
        const voteRes = await fetch(url);
        if (voteRes.ok) {
            const voteData = await voteRes.json();
            
            // Use Number() to ensure we don't pass an object to React
            const updatedCount = Number(voteData.VoteCount) || 0;

            setComments(prev => prev.map(c => 
                c.comment_id === commentId ? { ...c, votes: updatedCount } : c
            ));
        }
    } catch (err) {
        console.error("Failed to vote on comment:", err);
    }
};

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading post...</p>
                </div>
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Post not found</h1>
                    <p className="text-muted-foreground mb-6">
                        This post may have been deleted or the link is incorrect.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => router.back()} variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                        <Link href="/">
                            <Button>Go Home</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const communityName = typeof post.community_name === 'string'
        ? post.community_name
        : post.community_name?.name || community;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>

                <div className="flex gap-6">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <Card className="overflow-hidden">
                            {/* Post Header */}
                            <div className="p-4 border-b">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <Link
                                        href={`/r/${communityName}`}
                                        className="font-medium hover:underline"
                                    >
                                        r/{communityName}
                                    </Link>
                                    <span>•</span>
                                    <span>Posted by u/{post.user_email || 'CurrentUser'}</span>
                                    <span>•</span>
                                    <span>{formatTimeAgo(post.created_on)}</span>
                                </div>

                                <h1 className="text-2xl font-bold mb-3">{post.title}</h1>

                               {/* Post Type Badge */}
                                {post.type && post.type !== 'post' && (
                                    <span className={cn(
                                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                        post.type === 'image' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                                        post.type === 'link' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    )}>
                                        {post.type === 'image' && <ImageIcon className="w-3 h-3" />}
                                        {post.type === 'link' && <ExternalLink className="w-3 h-3" />}
                                        {post.type}
                                    </span>
                                )}
                            </div>

                            {/* Post Content */}
                            <div className="flex gap-4 p-4">
                                {/* Vote Buttons */}
                                <div className="flex-shrink-0">
                                    <VoteButtons
                                        initialVotes={post.upvotes || 0}
                                        initialVoteState={null}
                                    />
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 min-w-0">
                                    {/* Text Content */}
                                    {post.type === 'post' && post.body && (
                                        <div className="prose dark:prose-invert max-w-none mb-4">
                                            <p className="whitespace-pre-wrap">{post.body}</p>
                                        </div>
                                    )}

                                    {/* Link Content */}
                                    {post.type === 'link' && post.body && (
                                        <a
                                            href={post.body}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors mb-4"
                                        >
                                            <ExternalLink className="w-5 h-5 text-blue-500" />
                                            <span className="text-blue-500 hover:underline truncate">
                                                {post.body}
                                            </span>
                                        </a>
                                    )}

                                    {/* Media Content */}
                                    {post.type === 'image' && post.picture_link && post.picture_link.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {post.picture_link.map((media, idx) => (
                                                <div key={idx} className="rounded-lg overflow-hidden border">
                                                    {media.type === 'video' ? (
                                                        <video
                                                            src={media.preview}
                                                            controls
                                                            className="w-full"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={media.preview}
                                                            alt={`Media ${idx + 1}`}
                                                            className="w-full h-auto"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* AI Summarize Button - THE MAIN FEATURE */}
                                    <AISummarizeButton
                                        postId={post.id}
                                        title={post.title}
                                        content={post.body || post.title}
                                        className="mb-4"
                                    />

                                    <Separator className="my-4" />

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            {comments.length} Comments 
                                        </Button>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <Share className="w-4 h-4" />
                                            Share
                                        </Button>
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <Bookmark className="w-4 h-4" />
                                            Save
                                        </Button>
                                        <PostActions post={post} />
                                    </div>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="border-t p-4">
                                <div className="space-y-4">
                                    <CommentForm onSubmit={handleAddComment} submitLabel="Comment" />
                                    {comments.length === 0 ? (
                                        <p className="text-muted-foreground">No comments yet.</p>
                                    ) : (
                                        comments.map((comment) => (
                                            <CommentCard
                                                key={comment.comment_id}
                                                id={comment.comment_id}
                                                author={{ username: comment.user_email }} // Assuming email as username for now
                                                content={comment.body}
                                                createdAt={comment.created_on}
                                                votes={Number(comment.votes) || 0}
                                                onVote={(type) => handleCommentVote(comment.comment_id, type)}
                                                onDelete={handleCommentDeleted}
                                                onEdit={handleCommentEdited}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <Card className="p-4 sticky top-4">
                            <h3 className="font-semibold mb-3">About Community</h3>
                            <Link href={`/r/${communityName}`}>
                                <Button className="w-full" variant="outline">
                                    View r/{communityName}
                                </Button>
                            </Link>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}