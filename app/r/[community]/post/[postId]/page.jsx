"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "components/ui/card";
import { Button } from "components/ui/button";
import { Separator } from "components/ui/separator";
import VoteButtons from "components/post/VoteButtons";
import AISummarizeButton from "components/post/AISummarizeButton";
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
        const fetchPost = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/posts/${postId}`);
                
                if (res.ok) {
                    const rawData = await res.json();
                    
                    // --- DATA TRANSFORMATION (The Fix) ---
                    const formattedPost = {
                        ...rawData, // Keep all original API fields (title, user_email, etc.)
                        
                        // 1. Calculate 'type' since API doesn't send it
                        type: rawData.picture_link ? 'image' : 'post',
                        
                        // 2. Convert single picture string into the Array of Objects your JSX expects
                        picture_link: rawData.picture_link 
                            ? [{ type: 'image', preview: rawData.picture_link }] 
                            : []
                    };
                    // -------------------------------------

                    setPost(formattedPost);
                    setNotFound(false);
                } else {
                    console.error('Failed to fetch post');
                    setNotFound(true);
                }
            } catch (error) {
                console.error('Error loading post:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await fetch(`/api/posts/${postId}/comments`);
                if (res.ok) {
                    const data = await res.json();
                    setComments(data);
                } else {
                    console.error('Failed to fetch comments');
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        if (postId) {
            fetchComments();
        }
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ body: text }),
            });
            if (res.ok) {
                // Refetch comments
                const fetchRes = await fetch(`/api/posts/${postId}/comments`);
                if (fetchRes.ok) {
                    const data = await fetchRes.json();
                    setComments(data);
                    localStorage.setItem(`count_for_post_${postId}`, data.length);//Save the new count to "Frontend Memory"
                }
            } else {
                console.error('Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    // 1. Function to remove a comment from state
    const handleCommentDeleted = (deletedCommentId) => {
    setComments(prev => prev.filter(c => c.comment_id !== deletedCommentId));
    // Update local storage count
    const newCount = comments.length - 1;
    localStorage.setItem(`count_for_post_${postId}`, newCount);
   };

    // 2. Function to update comment text in state
    const handleCommentEdited = (commentId, newText) => {
    setComments(prev => prev.map(c => 
        c.comment_id === commentId ? { ...c, body: newText } : c
    ));
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
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
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
                                                votes={0} // API doesn't return votes yet
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