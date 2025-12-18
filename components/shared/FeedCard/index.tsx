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

export default function FeedCard({ postList }: { postList: Post[] }) {
    const [posts, setPosts] = useState(postList);
    const [isLoading, setIsLoading] = useState(false);
    const loaderRef = useRef(null);

    // Sync state with props (e.g. when parent loads data)
    useEffect(() => {
        setPosts(postList);
    }, [postList]);

    // Fake API fetch (replace with real API)
    const loadMore = async () => {
        if (isLoading) return;
        setIsLoading(true);

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const newPosts: Post[] = [
            { id: Date.now() + 1, title: "More Post " + (posts.length + 1), content: "More content" },
            { id: Date.now() + 2, title: "More Post " + (posts.length + 2), content: "More content" },
        ];

        setPosts((prev) => [...prev, ...newPosts]);
        setIsLoading(false);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting) {
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

    return (
        <div>
            {posts.map((p) => (
                <PostCard key={p.id} {...p as any} />
            ))}

            <div ref={loaderRef} className="h-10 flex justify-center items-center py-4 text-sm text-muted-foreground">
                {isLoading && <span className="animate-pulse">Loading more...</span>}
            </div>
        </div>
    );
}