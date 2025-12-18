"use client";
import { useEffect, useRef, useState } from "react";
import PostCard from "../../feed/PostCard";

interface Post {
    id: string | number;
    title: string;
    content?: string;
    imageUrl?: string;
    linkUrl?: string;
    linkPreview?: {
        title?: string;
        description?: string;
        image?: string;
        domain?: string;
    };
    author?: {
        username: string;
        avatar?: string;
    };
    community?: {
        name: string;
        members?: number;
        href?: string;
    };
    votes?: number;
    voteState?: "up" | "down" | null;
    comments?: number;
    createdAt?: Date | string | number;
    onVote?: (direction: "up" | "down") => void;
    href?: string;
    className?: string;
}

interface FeedCardProps {
    postList: Post[];
    communityName?: string;
    myPosts?: boolean;
}

export default function FeedCard({ postList, communityName, myPosts }: FeedCardProps) {
    const [posts, setPosts] = useState(postList);
    const [isLoading, setIsLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef<HTMLDivElement>(null);

    // Sync state with props (e.g. when parent loads data)
    useEffect(() => {
        setPosts(postList);
        // If the parent passed an empty list, trigger initial load
        if (postList.length === 0) {
            setHasMore(true);
        } else {
            // We don't know the cursor from props yet, so we assume more exists
            setHasMore(true);
        }
    }, [postList]);

    const loadMore = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);

        try {
            const url = new URL('/api/posts', window.location.origin);
            if (nextCursor) url.searchParams.set('cursor', nextCursor);
            if (communityName) url.searchParams.set('communityName', communityName);
            if (myPosts) url.searchParams.set('myPosts', 'true');

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch posts");

            const data = await response.json();

            if (data.FeedData && data.FeedData.length > 0) {
                const mappedPosts: Post[] = data.FeedData.map((p: any) => ({
                    id: p.post_id,
                    title: p.title,
                    content: p.body,
                    imageUrl: p.picture_link,
                    author: { username: p.username || p.user_email },
                    community: { name: p.community_name },
                    votes: p.votes || 0,
                    comments: p.comment_count || 0,
                    createdAt: p.created_on,
                    href: `/r/${p.community_name}/post/${p.post_id}`
                }));

                setPosts((prev) => [...prev, ...mappedPosts]);
                setNextCursor(data.meta.nextCursor);
                setHasMore(!!data.meta.nextCursor);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to load posts:", error);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && !isLoading) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: "100px" }
        );

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [posts.length, isLoading]);

    const handlePostVote = async (postId: string | number, newVoteState: "up" | "down" | null) => {
        try {
            if (newVoteState === 'up') {
                await fetch(`/api/posts/${postId}/votes`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flag: 1 })
                });
            } else if (newVoteState === 'down') {
                await fetch(`/api/posts/${postId}/votes`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flag: -1 })
                });
            } else {
                await fetch(`/api/posts/${postId}/votes`, {
                    method: 'DELETE'
                });
            }
        } catch (err) {
            console.error("Failed to vote:", err);
        }
    };

    return (
        <div className="space-y-4">
            {posts.map((p) => (
                <PostCard
                    key={p.id}
                    {...p as any}
                    onVote={(newVote: "up" | "down" | null) => handlePostVote(p.id, newVote)}
                />
            ))}

            <div ref={loaderRef} className="h-10 flex justify-center items-center py-4 text-sm text-muted-foreground">
                {isLoading && <span className="animate-pulse">Loading more...</span>}
            </div>
        </div>
    );
}