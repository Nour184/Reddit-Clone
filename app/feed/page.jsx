"use client";

import { useState, useEffect } from "react";
import FeedCard from '@/components/shared/FeedCard/index';
import PostSkeleton from "components/feed/PostSkeleton/index"; // Using the skeleton we discussed
import { Button } from "components/ui/button";

export default function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    // 1. Function to fetch data from your GET /api/posts endpoint
    const fetchFeed = async (cursor = null) => {
        try {
            const url = new URL('/api/posts', window.location.origin);
            if (cursor) url.searchParams.set('cursor', cursor);

            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();

                // 2. THE ADAPTER: Map API response (FeedData) to Component Props
                const formattedPosts = data.FeedData.map(p => ({
                    id: p.post_id,
                    title: p.title,
                    content: p.body,
                    author: { username: p.user_email },
                    community: {
                        name: p.community_name,
                        href: `/r/${p.community_name}`
                    },
                    imageUrl: p.picture_link,
                    initialVoteState: p.user_vote === 1 ? 'up' : p.user_vote === -1 ? 'down' : null,
                    votes: Number(p.vote_count) || 0, //total vote count
                    // Use the real comment count from the database!
                    comments: parseInt(p.comment_count || 0),
                    createdAt: p.created_on,
                    href: `/r/${p.community_name}/post/${p.post_id}`
                }));

                // If it's a "Load More" action, append posts; otherwise replace.
                setPosts(prev => cursor ? [...prev, ...formattedPosts] : formattedPosts);
                setNextCursor(data.meta.nextCursor);
            }
        } catch (error) {
            console.error("Error loading feed:", error);
        } finally {
            setLoading(false);
            setIsFetchingMore(false);
        }
    };

    // Initial load on page mount
    useEffect(() => {
        fetchFeed();
        const handlePostUpdate = () => {
            console.log("Post updated elsewhere, refreshing Home feed...");
            fetchFeed();
        };

        window.addEventListener('post-updated', handlePostUpdate);

        return () => {
            window.removeEventListener('post-updated', handlePostUpdate);
        };
    }, []);

    const handleLoadMore = () => {
        if (!nextCursor) return;
        setIsFetchingMore(true);
        fetchFeed(nextCursor);
    };

    // 3. Loading State with Skeletons
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">
                <h1 className="text-2xl font-bold mb-4">Home</h1>
                {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4">
            <h1 className="text-2xl font-bold mb-4">Home</h1>

            {/* 4. Display the real list from DB */}
            <FeedCard postList={posts} initialNextCursor={nextCursor} />

            {/* 5. Pagination Button */}
            {nextCursor && (
                <div className="mt-8 flex justify-center">
                    <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        disabled={isFetchingMore}
                    >
                        {isFetchingMore ? "Loading more..." : "Load More"}
                    </Button>
                </div>
            )}

            {posts.length === 0 && !loading && (
                <p className="text-center text-muted-foreground py-10">
                    No posts found in this feed.
                </p>
            )}
        </div>
    );
}