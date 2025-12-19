"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react"; // Re-added
import SubredditHeader from "../../../components/subreddit/SubredditHeader";
import FeedCard from "../../../components/shared/FeedCard/index";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Flame, TrendingUp, Clock, ArrowUpDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import Link from 'next/link';

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
    const { data: session } = useSession(); // Get session
    // Decode URI component because params.community might have encoded characters if routed wildly
    const communityName = decodeURIComponent(params.community);

    const [sortBy, setSortBy] = useState("best");
    const [posts, setPosts] = useState([]);
    const [communityData, setCommunityData] = useState(null);
    const [notFound, setNotFound] = useState(false);

    // Admin Tools State
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [adminMsg, setAdminMsg] = useState("");
    const [admins, setAdmins] = useState([]);

    const isOwner = session?.user?.email === communityData?.community_owner;

    const fetchAdmins = async () => {
        try {
            const res = await fetch(`/api/subreddits/${communityName}/admins`);
            if (res.ok) {
                const data = await res.json();
                setAdmins(data);
            }
        } catch (error) {
            console.error("Error fetching admins:", error);
        }
    };

    useEffect(() => {
        if (isOwner) {
            fetchAdmins();
        }
    }, [communityName]);

    const isAdmin = admins.some(a => a.user_email === session?.user?.email);
    const isOwnerVerified = session?.user?.email === communityData?.community_owner;

    const isModOrOwner = isOwner || isAdmin;


    const handleAddAdmin = async () => {
        if (!newAdminEmail) return;
        try {
            const res = await fetch(`/api/subreddits/${communityName}/admins`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userEmail: newAdminEmail })
            });
            const data = await res.json();
            if (res.ok) {
                setAdminMsg("Admin added!");
                setNewAdminEmail("");
                fetchAdmins(); // Refresh list
            } else {
                setAdminMsg(data.error || "Failed to add admin");
            }
        } catch (error) {
            console.error("Error adding admin:", error);
            setAdminMsg("Error adding admin");
        }
    };

    const handleRemoveAdmin = async (email) => {
        try {
            const res = await fetch(`/api/subreddits/${communityName}/admins`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userEmail: email })
            });
            if (res.ok) {
                fetchAdmins(); // Refresh list
            } else {
                console.error("Failed to remove admin");
            }
        } catch (error) {
            console.error("Error removing admin:", error);
        }
    };

    // Load Community Data
    const loadCommunityData = async () => {
        try {
            const response = await fetch(`/api/subreddits/${communityName}`);
            const membersResponse = await fetch(`/api/subreddits/${communityName}/members`);
            const membersCount = membersResponse.ok ? await membersResponse.json() : 0;
            console.log('Members count:', membersCount);

            if (response.ok) {
                const data = await response.json();
                console.log('Loaded community:', data);

                // Map API data to component state
                setCommunityData({
                    ...data,
                    icon: data.community_photo_link,
                    createdAt: data.created_on,
                    members: membersCount,
                    banner: data.banner_link || null,
                    color: data.theme_color || "from-blue-500 to-blue-600"
                });

                setNotFound(false);
            } else {
                console.error("Community not found:", communityName);
                setNotFound(true);
            }
        } catch (error) {
            console.error("Error loading community:", error);
            setNotFound(true);
        }
    };

    useEffect(() => {
        loadCommunityData();
    }, [communityName]);


    // Load Posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`/api/posts?communityName=${communityName}`);
                if (response.ok) {
                    const data = await response.json();

                    // Map API posts to component format
                    const mappedPosts = (data.FeedData || []).map(post => ({
                        id: post.post_id,
                        title: post.title,
                        content: post.body,
                        author: {
                            username: post.username || "Unknown",
                            avatar: post.profile_picture_link
                        },
                        community: {
                            name: post.community_name,
                            href: `/r/${post.community_name}`
                        },
                        votes: post.upvotes || 0,
                        comments: post.comment_count || 0,
                        createdAt: post.created_on,
                        href: `/r/${post.community_name}/post/${post.post_id}`,
                        type: post.type || 'text',
                        media: post.media
                    }));

                    setPosts(mappedPosts);
                } else {
                    console.error("Failed to load posts");
                }
            } catch (error) {
                console.error("Error loading posts:", error);
            }
        };

        if (communityName) {
            fetchPosts();
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
                            <SubredditHeader communityId={communityName} owner={communityData?.community_owner} />
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
                        <FeedCard postList={posts} communityName={communityName} />
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
                                    <span className="font-bold text-sm">
                                        Guess how many
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

                        {/* Mod Tools for Owner/Admin */}
                        {isModOrOwner && (
                            <Card className="p-4 mt-4">
                                <h2 className="font-bold text-sm mb-3">Mod Tools</h2>
                                <Link href={`/r/${communityName}/edit`}>
                                    <Button className="w-full mb-4" variant="outline">
                                        Edit Community
                                    </Button>
                                </Link>

                                {/* Manage Admins - Owner Only */}
                                {isOwner && (
                                    <div className="border-t pt-4">
                                        <h2 className="font-bold text-sm mb-3">Manage Admins</h2>
                                        <div className="space-y-2">
                                            <div className="text-xs text-muted-foreground mb-1">Add a new admin</div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    placeholder="User Email"
                                                    value={newAdminEmail}
                                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                                <Button size="sm" onClick={handleAddAdmin}>Add</Button>
                                            </div>
                                            {adminMsg && <p className="text-xs text-blue-500 mt-1">{adminMsg}</p>}
                                        </div>

                                        <div className="mt-4">
                                            <div className="text-xs text-muted-foreground mb-2 font-semibold">Current Admins</div>
                                            <div className="space-y-2">
                                                {admins.length === 0 && <p className="text-xs text-muted-foreground italic">No admins yet.</p>}
                                                {admins.map((admin) => (
                                                    <div key={admin.user_email} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded-md">
                                                        <span className="truncate max-w-[150px]" title={admin.user_email}>{admin.user_email}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleRemoveAdmin(admin.user_email)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}

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