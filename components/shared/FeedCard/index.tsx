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
    initialVoteState?: "up" | "down" | null;
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

            const response = await fetch(url, { cache: 'no-store' });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Failed to fetch posts: ${response.status} ${response.statusText}`, errorBody);
                throw new Error(`Failed to fetch posts: ${response.status}`);
            }

            const data = await response.json();

            if (data.FeedData && data.FeedData.length > 0) {
                const mappedPosts: Post[] = data.FeedData.map((p: any) => ({
                    id: p.post_id,
                    title: p.title,
                    content: p.body,
                    imageUrl: p.picture_link,
                    author: { username: p.username || p.user_email },
                    community: { name: p.community_name },
                    votes: Number(p.vote_count) || 0,
                    initialVoteState: p.user_vote === 1 ? 'up' : p.user_vote === -1 ? 'down' : null,
                    comments: p.comment_count || 0,
                    createdAt: p.created_on,
                    href: `/r/${p.community_name}/post/${p.post_id}` 
                }
            ));
                
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
       let res;
       try{
            if (newVoteState === 'up') {
                res = await fetch(`/api/posts/${postId}/votes`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flag: 1 })
                });
            } else if (newVoteState === 'down') {
                res = await fetch(`/api/posts/${postId}/votes`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flag: -1 })
                });
            } else {
                res = await fetch(`/api/posts/${postId}/votes`, {
                    method: 'DELETE'
                });
            }
            if (res.ok) {
                // Fetch fresh vote count to keep numbers accurate
                const voteRes = await fetch(`/api/posts/${postId}/votes`, { cache: 'no-store' });
                if (voteRes.ok) {
                    const voteData = await voteRes.json();
                    
                    setPosts(currentPosts => currentPosts.map(p => {
                        if (p.id === postId) {
                            return {
                                ...p,
                                votes: voteData.totalVotes,
                                initialVoteState: voteData.userVote // Update the "memory"
                            };
                        }
                        return p;
                    }));
                }
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
                    onDelete={() => setPosts(prev => prev.filter(item => item.id !== p.id))}
                />
            ))}

            <div ref={loaderRef} className="h-10 flex justify-center items-center py-4 text-sm text-muted-foreground">
                {isLoading && <span className="animate-pulse">Loading more...</span>}
            </div>
        </div>
    );
}