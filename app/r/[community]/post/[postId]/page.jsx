"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import VoteButtons from "@/components/post/VoteButtons";
import AISummarizeButton from "@/components/post/AISummarizeButton";
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
import { cn } from "@/lib/utils";
import CollapsibleThread from "@/components/comments/CollapsibleThread";
import { getComments, addComment } from "@/lib/comment-store";

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { community, postId } = params;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        // Load post from localStorage or use mock data
        const loadPost = () => {
            try {
                const posts = JSON.parse(localStorage.getItem('posts') || '[]');
                let foundPost = posts.find(p => p.id == postId || p.id === parseInt(postId));

                // If no post found, use mock data for testing AI feature
                if (!foundPost) {
                    const mockPosts = [
                        {
                            id: 1,
                            title: "Understanding React Hooks and Their Benefits",
                            content: "React Hooks revolutionized how we write React components. They allow us to use state and other React features without writing a class. The useState hook lets us add state to functional components, making it easy to manage component state. The useEffect hook handles side effects like data fetching, subscriptions, and manual DOM manipulations. Hooks make code more reusable and easier to understand by allowing you to extract stateful logic from components. They also reduce the complexity of component hierarchies and make it easier to share logic between components without using higher-order components or render props.",
                            author: "demo_user",
                            community: { name: community },
                            upvotes: 150,
                            comments: 23,
                            createdAt: new Date(Date.now() - 3600000).toISOString(),
                            type: 'post',
                            href: `/r/${community}/post/1`,
                        },
                        {
                            id: 2,
                            title: "Getting Started with Next.js 14 App Router",
                            content: "Next.js 14 introduces powerful new features including Server Actions and improved performance. The App Router provides a new way to build applications with React Server Components. Server Actions allow you to run server-side code directly from your components without creating API routes. The new metadata API makes SEO optimization easier than ever before. Turbopack integration speeds up local development significantly, making the developer experience much better.",
                            author: "nextjs_fan",
                            community: { name: community },
                            upvotes: 89,
                            comments: 12,
                            createdAt: new Date(Date.now() - 7200000).toISOString(),
                            type: 'post',
                            href: `/r/${community}/post/2`,
                        }
                    ];

                    // Try matching by numeric id, string id, or legacy ids like 'post1'
                    foundPost = mockPosts.find(p => p.id == postId || p.id === parseInt(postId) || p.id === Number(postId) || p.id === `post${postId}` || p.id === `post${String(postId)}`);
                }

                if (foundPost) {
                    setPost(foundPost);
                    setNotFound(false);
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error('Error loading post:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [postId, community]);

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
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

    const communityName = typeof post.community === 'string'
        ? post.community
        : post.community?.name || community;

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
                                    <span>Posted by u/{post.author || 'CurrentUser'}</span>
                                    <span>•</span>
                                    <span>{formatTimeAgo(post.createdAt)}</span>
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
                                    {post.type === 'post' && post.content && (
                                        <div className="prose dark:prose-invert max-w-none mb-4">
                                            <p className="whitespace-pre-wrap">{post.content}</p>
                                        </div>
                                    )}

                                    {/* Link Content */}
                                    {post.type === 'link' && post.content && (
                                        <a
                                            href={post.content}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors mb-4"
                                        >
                                            <ExternalLink className="w-5 h-5 text-blue-500" />
                                            <span className="text-blue-500 hover:underline truncate">
                                                {post.content}
                                            </span>
                                        </a>
                                    )}

                                    {/* Media Content */}
                                    {post.type === 'image' && post.media && post.media.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {post.media.map((media, idx) => (
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
                                        content={post.content || post.title}
                                        className="mb-4"
                                    />

                                    <Separator className="my-4" />

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="sm" className="gap-2">
                                            <MessageSquare className="w-4 h-4" />
                                            {post.comments || 0} Comments
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
                                {/* Use new CollapsibleThread component */}
                                <CollapsibleThread postId={post.id} />
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