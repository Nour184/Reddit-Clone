"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SubredditHeader from "@/components/subreddit/SubredditHeader";
import FeedCard from "@/components/shared/FeedCard/index";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, TrendingUp, Clock, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { getCommunity } from "@/lib/community-store";

function formatMembers(count) {
    if (typeof count === 'number') {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'm';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
        return count.toString();
    }
    return count;
}

export default function CommunityPage() {
    const params = useParams();
    // Decode URI component because params.community might have encoded characters if routed wildly
    const communityName = decodeURIComponent(params.community);

    const [sortBy, setSortBy] = useState("best");
    const [posts, setPosts] = useState([]);
    const [communityData, setCommunityData] = useState(null);
    const [notFound, setNotFound] = useState(false);

    // Load Community Data
    const loadCommunityData = () => {
        if (typeof window === 'undefined') return;

        const data = getCommunity(communityName);
        console.log('Loading community:', communityName, 'Found:', data);

        if (data) {
            setCommunityData(data);
            setNotFound(false);
        } else {
            console.error("Community not found:", communityName);
            setNotFound(true);
        }
    };

    useEffect(() => {
        // Ensure we're on the client
        if (typeof window === 'undefined') return;

        loadCommunityData();

        // Listen for updates (e.g. from Join/Leave button)
        const handleUpdate = (e) => {
            if (e.detail === communityName) {
                loadCommunityData();
            }
        };

        window.addEventListener('community-updated', handleUpdate);
        return () => window.removeEventListener('community-updated', handleUpdate);
    }, [communityName]);


    // Load Posts
    useEffect(() => {
        // Mock posts - replace with API call
        const mockPosts = [
            {
                id: 1,
                title: "Welcome to r/" + communityName,
                content: "This is a welcome post for the community.",
                author: { username: "admin", avatar: null },
                community: { name: communityName, href: `/r/${communityName}` },
                votes: 150,
                comments: 23,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                href: `/r/${communityName}/post/1`,
            }
        ];

        // Load local posts
        try {
            const localPosts = JSON.parse(localStorage.getItem('posts') || '[]');

            // Filter posts for this community
            const communityLocalPosts = localPosts.filter(p => {
                if (!p.community) return false;

                // Handle complex object or simple string community
                let pName = "";
                if (typeof p.community === 'string') pName = p.community;
                else if (p.community.name) pName = p.community.name;

                // Normalizing names: remove 'r/' prefix and lowercase
                const normalize = (s) => s.toLowerCase().replace(/^r\//, '').trim();

                return normalize(pName) === normalize(communityName);
            }).map(p => ({
                id: p.id,
                title: p.title,
                content: p.content,
                author: { username: p.author || "CurrentUser", avatar: null },
                community: { name: communityName, href: `/r/${communityName}` },
                votes: p.upvotes || 0,
                comments: p.comments || 0,
                createdAt: p.createdAt,
                href: `/r/${communityName}/post/${p.id}`,
                type: p.type,
                media: p.media
            }));

            const allPosts = [...communityLocalPosts, ...mockPosts];
            allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setPosts(allPosts);
        } catch (e) {
            console.error("Error loading posts", e);
            setPosts(mockPosts);
        }

    }, [communityName]);

    const sortOptions = [
        { name: "Best", value: "best", icon: Flame },
        { name: "Hot", value: "hot", icon: Flame },
        { name: "New", value: "new", icon: Clock },
        { name: "Top", value: "top", icon: TrendingUp },
        { name: "Rising", value: "rising", icon: ArrowUpDown },
    ];

    if (notFound) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                    <span className="text-4xl font-bold text-muted-foreground">?</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">Sorry, there aren’t any communities on Reddit with that name.</h1>
                <p className="text-muted-foreground mb-6">This community may have been banned or the community name is incorrect.</p>
                <div className="flex gap-4">
                    <Link href="/r/create">
                        <Button>Create Community</Button>
                    </Link>
                    <Link href="/">
                        <Button variant="outline">Go Home</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!communityData) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-background">
            {/* Community Banner */}
            <div className={`relative w-full h-32 md:h-48 bg-gradient-to-r ${communityData.color || "from-blue-500 to-blue-600"}`}>
                {communityData.banner && (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${communityData.banner})` }}
                    />
                )}
            </div>

            {/* Community Header */}
            <div className="max-w-5xl mx-auto px-4">
                <div className="relative -mt-12 md:-mt-16">
                    {/* Community Icon */}
                    <div className="flex items-end gap-4 mb-4">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white dark:bg-gray-800 border-4 border-background flex items-center justify-center overflow-hidden">
                            {communityData.icon && !communityData.icon.startsWith("http") ? (
                                // Lucide icon name or similar (not implemented fully for icons, using generic fallback)
                                <span className="text-3xl font-bold text-blue-500">
                                    {communityName[0]?.toUpperCase()}
                                </span>
                            ) : communityData.icon ? (
                                <img src={communityData.icon} alt={communityName} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-blue-500">
                                    {communityName[0]?.toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 pb-2">
                            <h1 className="text-2xl md:text-3xl font-bold mb-0.5 px-0.5">r/{communityData.name}</h1>
                            <p className="text-sm text-muted-foreground font-medium px-1">r/{communityName}</p>
                        </div>
                        <div className="pb-4">
                            <SubredditHeader communityId={communityName} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-5xl mx-auto px-4 mt-6">
                <div className="flex gap-6">
                    {/* Posts Feed */}
                    <div className="flex-1 w-full min-w-0">
                        {/* Sort Tabs */}
                        <Card className="p-2 mb-4">
                            <div className="flex gap-1 overflow-x-auto">
                                {sortOptions.map((option) => (
                                    <Button
                                        key={option.value}
                                        variant={sortBy === option.value ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setSortBy(option.value)}
                                        className={cn(
                                            "gap-2 flex-shrink-0",
                                            sortBy === option.value && "bg-secondary text-secondary-foreground"
                                        )}
                                    >
                                        <option.icon className="w-4 h-4" />
                                        {option.name}
                                    </Button>
                                ))}
                            </div>
                        </Card>

                        {/* Posts */}
                        <FeedCard postList={posts} />
                        {posts.length === 0 && (
                            <div className="text-center py-10 opacity-50">
                                <p>No posts yet. Be the first to post!</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Community Info */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <Card className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">About Community</h2>
                            </div>

                            <p className="text-sm mb-4 leading-relaxed">
                                {communityData.description}
                            </p>

                            <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm">
                                <Clock className="w-4 h-4" />
                                <span>Created {new Date(communityData.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>

                            <div className="h-px bg-border my-4" />

                            <div className="flex justify-between mb-2">
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg">{formatMembers(communityData.members)}</span>
                                    <span className="text-xs text-muted-foreground">Members</span>
                                </div>
                                <div className="flex flex-col">
                                    {/* Mock online count loosely based on member count */}
                                    <span className="font-bold text-lg">
                                        {typeof communityData.members === 'number'
                                            ? Math.max(5, Math.floor(communityData.members * 0.05))
                                            : '124'
                                        }
                                    </span>
                                    <span className="text-xs text-muted-foreground">Online</span>
                                </div>
                            </div>

                            <div className="h-px bg-border my-4" />

                            <Link href={`/submit?community=${encodeURIComponent(communityName)}`} className="w-full block">
                                <Button className="w-full rounded-full font-bold">
                                    Create Post
                                </Button>
                            </Link>
                        </Card>

                        {/* Community Rules Card */}
                        <Card className="p-4 mt-4">
                            <h2 className="font-bold text-sm mb-3">r/{communityName} Rules</h2>
                            <div className="space-y-3">
                                <div className="text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                                    <div className="font-medium mb-1">1. Be respectful</div>
                                </div>
                                <div className="text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                                    <div className="font-medium mb-1">2. No spam</div>
                                </div>
                                <div className="text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                                    <div className="font-medium mb-1">3. Stay on topic</div>
                                </div>
                            </div>
                        </Card>
                    </aside>
                </div>
            </div>
        </div>
    );
}