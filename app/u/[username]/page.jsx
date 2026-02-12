"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Cake, MessageSquare, Flame } from "lucide-react";
import { Button } from "components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { getSession, removeSession } from "lib/session";
import FeedCard from "components/shared/FeedCard/index";

export default function UserProfilePage() {
    const params = useParams();
    const routerUsername = decodeURIComponent(params.username);
    const session = getSession();

    const [profile, setProfile] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [nextCursor, setNextCursor] = useState(null); // Track the cursor for FeedCard
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [error, setError] = useState(null);

    // 1. Fetch User Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoadingProfile(true);
            try {
                const response = await fetch(`/api/profile/${routerUsername}`, { cache: 'no-store' });
                if (!response.ok) throw new Error("User not found");
                const data = await response.json();
                setProfile(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setIsLoadingProfile(false);
            }
        };
        if (routerUsername) fetchProfile();
    }, [routerUsername]);

    // 2. Fetch User's Posts
    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!profile?.email) return;

            setIsLoadingPosts(true);
            try {
                // Ensure email is URI encoded for safety
                const queryEmail = encodeURIComponent(profile.email);
                const response = await fetch(`/api/posts?myPosts=true&Email=${queryEmail}`, {
                    cache: 'no-store'
                });

                if (response.ok) {
                    const data = await response.json();

                    // --- FIX: Map data here to prevent "broken" first render ---
                    const formattedPosts = (data.FeedData || []).map((p) => ({
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
                    }));

                    setUserPosts(formattedPosts);
                    setNextCursor(data.meta?.nextCursor || null); // Save cursor for infinite scroll
                }
            } catch (err) {
                console.error("Failed to fetch posts:", err);
            } finally {
                setIsLoadingPosts(false);
            }
        };

        fetchUserPosts();
    }, [profile?.email]);

    const isOwnProfile = session?.email === profile?.email;

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        });
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Delete account? This cannot be undone.")) return;
        try {
            const res = await fetch("/api/profile", { method: "DELETE" });
            if (res.ok) { removeSession(); window.location.href = "/"; }
        } catch (error) { console.error(error); }
    };

    if (isLoadingProfile) return <div className="p-10 text-center">Loading profile...</div>;
    if (error || !profile) return <div className="p-10 text-center text-muted-foreground">User not found.</div>;

    return (
        <div className="container max-w-[1200px] mx-auto py-4">
            <div className="flex gap-6">
                <div className="flex-1 w-full min-w-0">
                    <Tabs defaultValue="posts" className="w-full">
                        <div className="border-b mb-4 overflow-x-auto">
                            <TabsList className="bg-transparent h-auto p-0 w-full justify-start space-x-2">
                                {["Overview", "Posts", "Comments", "Saved"].map((tab) => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab.toLowerCase()}
                                        className="rounded-full px-4 py-2 font-bold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <TabsContent value="posts" className="mt-0">
                            {isLoadingPosts ? (
                                <div className="p-10 text-center">Loading posts...</div>
                            ) : userPosts.length > 0 ? (
                                <FeedCard
                                    postList={userPosts}
                                    myPosts={true}
                                    targetEmail={profile.email}
                                    // Make sure FeedCard accepts initialNextCursor prop to prevent duplicate Page 1 fetch
                                    initialNextCursor={nextCursor}
                                />
                            ) : (
                                <EmptyState user={profile} type="posts" />
                            )}
                        </TabsContent>

                        <TabsContent value="overview">
                            {userPosts.length > 0 ? (
                                <FeedCard
                                    postList={userPosts}
                                    myPosts={true}
                                    targetEmail={profile.email}
                                    initialNextCursor={nextCursor}
                                />
                            ) : <EmptyState user={profile} />}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Sidebar */}
                <div className="hidden lg:block w-[340px] flex-shrink-0">
                    <div className="bg-card border rounded-lg overflow-hidden sticky top-20">
                        <div className="h-24 bg-[#33a8ff] relative">
                            {isOwnProfile && <button className="absolute right-2 bottom-2 bg-black/20 hover:bg-black/30 p-2 rounded-full text-white"><Plus className="w-4 h-4" /></button>}
                        </div>
                        <div className="px-3 pb-4 relative">
                            <div className="absolute -top-24 left-4">
                                <div className="p-1.5 bg-card rounded-md inline-block">
                                    <Avatar className="w-20 h-20 rounded-md border border-border">
                                        <AvatarImage src={profile.profile_picture_link || "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png"} className="object-cover" />
                                        <AvatarFallback className="rounded-md text-2xl">{profile.username[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            {isOwnProfile && (
                                <div className="flex justify-end pt-3 gap-2">
                                    <Button variant="outline" size="sm" className="rounded-full h-8 px-3 font-bold" asChild>
                                        <Link href="/settings?tab=profile"><Plus className="w-4 h-4 mr-1" /> Add social link</Link>
                                    </Button>
                                </div>
                            )}
                            <div className="mt-8 mb-4">
                                <h1 className="text-xl font-bold truncate">{profile.username}</h1>
                                <p className="text-sm text-muted-foreground">u/{profile.username}</p>
                                {profile.about_me && <p className="text-sm mt-2">{profile.about_me}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-y-4 mb-6">
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Karma</div>
                                    <div className="text-sm font-medium flex items-center gap-1">
                                        <Flame className="w-3 h-3 text-red-500" fill="currentColor" />
                                        {profile.karma?.toLocaleString() || 0}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Cake day</div>
                                    <div className="text-sm font-medium flex items-center gap-1">
                                        <Cake className="w-3 h-3 text-blue-500" fill="currentColor" />
                                        {formatDate(profile.created_on)}
                                    </div>
                                </div>
                            </div>
                            {isOwnProfile && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Settings</span>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs bg-muted/50 rounded-full" asChild>
                                            <Link href="/settings">Edit</Link>
                                        </Button>
                                    </div>
                                    <Button variant="destructive" size="sm" className="w-full text-xs" onClick={handleDeleteAccount}>
                                        Delete Account
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ user, type = "overview" }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-background border rounded-lg text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold mb-2">u/{user.username} has not posted yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
                No {type === "overview" ? "content" : type} to show for this user.
            </p>
        </div>
    );
}