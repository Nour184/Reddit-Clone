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
import CollapsibleThread from "components/comments/CollapsibleThread";
import { getComments, addComment } from "lib/comment-store";

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { community, postId } = params;

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

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

        loadPost();
    }, [postId, community]);

    const [communityData, setCommunityData] = useState(null);

    // Fetch Community Data for sidebar
    useEffect(() => {
        const loadCommunityData = async () => {
            const name = post?.community?.name || community;
            if (!name) return;

            try {
                const [commRes, membersRes] = await Promise.all([
                    fetch(`/api/subreddits/${name}`),
                    fetch(`/api/subreddits/${name}/members`)
                ]);

                if (commRes.ok) {
                    const data = await commRes.json();
                    const membersCount = membersRes.ok ? await membersRes.json() : 0;
                    setCommunityData({
                        ...data,
                        members: membersCount,
                        createdAt: data.created_on
                    });
                }
            } catch (error) {
                console.error("Error loading community data:", error);
            }
        };

        if (post || community) {
            loadCommunityData();
        }
    }, [post, community]);

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const formatMembers = (count) => {
        if (typeof count === 'number') {
            if (count >= 1000000) return (count / 1000000).toFixed(1) + 'm';
            if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
            return count.toString();
        }
        return count;
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
            {/* Main Centered Container */}
            <div className="max-w-[1100px] mx-auto px-4 py-6 relative">
                {/* Back Button - Constrained to 740px alignment */}
                <div className="max-w-[740px] mx-auto mb-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="gap-2 px-0 hover:bg-transparent"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </div>

                <div className="relative">
                    {/* Main Content - Centered 740px */}
                    <div className="max-w-[740px] mx-auto">
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

                            {/* Post Content Cluster */}
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
                                        postId={post.id}
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
                                        <PostActions post={post} />
                                    </div>
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="border-t p-4">
                                <CollapsibleThread postId={post.id} />
                            </div>
                        </Card>
                    </div>

                    {/* Right Sidebar - Positioned relative to the 1100px container */}
                    <aside className="hidden xl:block absolute top-0 left-[calc(50%+390px)] w-80">
                        {communityData && (
                            <Card className="p-4 sticky top-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">About Community</h2>
                                </div>

                                <p className="text-sm mb-4 leading-relaxed">
                                    {communityData.description}
                                </p>

                                <div className="h-px bg-border my-4" />

                                <div className="flex justify-between mb-2">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg">{formatMembers(communityData.members)}</span>
                                        <span className="text-xs text-muted-foreground">Members</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">
                                            Online
                                        </span>
                                        <span className="text-xs text-muted-foreground">Guess how many</span>
                                    </div>
                                </div>

                                <div className="h-px bg-border my-4" />

                                <Link href={`/r/${communityName}`} className="w-full block">
                                    <Button className="w-full rounded-full font-bold">
                                        View Community
                                    </Button>
                                </Link>
                            </Card>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}