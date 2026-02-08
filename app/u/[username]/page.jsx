"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Settings, Share2, Plus, MoreHorizontal, Cake, MessageSquare, Award, Flame } from "lucide-react";
import { Button } from "components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { getSession, removeSession } from "lib/session";
import FeedCard from "components/shared/FeedCard/index";

export default function UserProfilePage() {
    const params = useParams();
    // Decode URI component because params.username might be "Ramy%40gmail.com" while session is "Ramy@gmail.com"
    const routerUsername = decodeURIComponent(params.username);
    const session = getSession();

    // In a real app, fetch user data by username. Here we mock or use session if matches.
    const isOwnProfile = session?.username === routerUsername;

    const user = isOwnProfile ? session : {
        username: routerUsername,
        karma: 1234,
        avatar: "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png",
        created: "Oct 24, 2023"
    };

    const [userPosts, setUserPosts] = useState([]);

    // Posts fetching is now handled by FeedCard with myPosts prop
    useEffect(() => {
        // We still check localStorage for old posts if any, but FeedCard handles the live ones
        setUserPosts([]);
    }, [routerUsername]);

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch("/api/profile", {
                method: "DELETE",
            });

            if (res.ok) {
                // Clear session and redirect hard to home
                removeSession(); // Ensure session is gone
                window.location.href = "/";
            } else {
                alert("Failed to delete account. Please try again.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="container max-w-[1200px] mx-auto py-4">
            <div className="flex gap-6">

                {/* Main Content Feed */}
                <div className="flex-1 w-full min-w-0">

                    {/* Header (Simplified for Mobile/Desktop Hybrid) */}
                    <div className="hidden md:flex items-end gap-4 mb-4">
                        {/* Avatar is in Sidebar on desktop, but let's put a header here too like new reddit */}
                    </div>

                    {/* Tabs Navigation */}
                    <Tabs defaultValue="overview" className="w-full">
                        <div className="border-b mb-4 overflow-x-auto">
                            <TabsList className="bg-transparent h-auto p-0 w-full justify-start space-x-2">
                                {["Overview", "Posts", "Comments", "Saved", "Hidden", "Upvoted", "Downvoted", "Awards received", "Awards given"].map((tab) => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab.toLowerCase().split(" ")[0]}
                                        className="rounded-full px-4 py-2 font-bold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-foreground transition-all whitespace-nowrap"
                                    >
                                        {tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <TabsContent value="overview">
                            {isOwnProfile ? <FeedCard postList={userPosts} myPosts={true} /> : <EmptyState user={user} />}
                        </TabsContent>
                        <TabsContent value="posts">
                            {isOwnProfile ? <FeedCard postList={userPosts} myPosts={true} /> : <EmptyState user={user} type="posts" />}
                        </TabsContent>
                        <TabsContent value="comments"><EmptyState user={user} type="comments" /></TabsContent>
                    </Tabs>
                </div>

                {/* Right Sidebar - Profile Card */}
                <div className="hidden lg:block w-[340px] flex-shrink-0">
                    <div className="bg-card border rounded-lg overflow-hidden sticky top-20">
                        {/* Blue Banner */}
                        <div className="h-24 bg-[#33a8ff] relative">
                            {/* Add Image Button (Mock) */}
                            {isOwnProfile && <button className="absolute right-2 bottom-2 bg-black/20 hover:bg-black/30 p-2 rounded-full text-white"><Plus className="w-4 h-4" /></button>}
                        </div>

                        {/* Content */}
                        <div className="px-3 pb-4 relative">
                            {/* Avatar */}
                            <div className="absolute -top-24 left-4">
                                <div className="p-1.5 bg-card rounded-md inline-block">
                                    <Avatar className="w-20 h-20 rounded-md border border-border">
                                        <AvatarImage src={user.avatar} className="object-cover" />
                                        <AvatarFallback className="rounded-md text-2xl">{user.username[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>

                            {/* Actions Top Right */}
                            {isOwnProfile && (
                                <div className="flex justify-end pt-3 gap-2">
                                    <Button variant="outline" size="sm" className="rounded-full h-8 px-3 gap-2 font-bold" asChild>
                                        <Link href="/settings?tab=profile">
                                            <Plus className="w-4 h-4" />
                                            Add social link
                                        </Link>
                                    </Button>
                                </div>
                            )}

                            {/* User Info */}
                            <div className="mt-8 mb-4">
                                <h1 className="text-xl font-bold truncate">{user.username}</h1>
                                <p className="text-sm text-muted-foreground">u/{user.username}</p>
                            </div>

                            {/* Action Button */}
                            <div className="mb-6">
                                {!isOwnProfile && (
                                    <Button className="w-full rounded-full font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" asChild>
                                        <span>Follow</span>
                                    </Button>
                                )}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-y-4 mb-6">
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Karma</div>
                                    <div className="text-sm font-medium flex items-center gap-1">
                                        <Flame className="w-3 h-3 text-red-500" fill="currentColor" />
                                        {user.karma?.toLocaleString() || 1}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase">Cake day</div>
                                    <div className="text-sm font-medium flex items-center gap-1">
                                        <Cake className="w-3 h-3 text-blue-500" fill="currentColor" />
                                        {user.created || "Jan 1, 2000"}
                                    </div>
                                </div>
                            </div>

                            {/* Achievements (Mock) */}
                            <div className="mb-6">
                                <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Achievements</div>
                                <div className="flex gap-2">
                                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/80" title="Newcomer">
                                        <Award className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            {/* Settings Link */}
                            {isOwnProfile && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">Profile</div>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs bg-muted/50 rounded-full hover:bg-muted" asChild>
                                            <Link href="/settings?tab=profile">Edit</Link>
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">Curate your profile</div>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs bg-muted/50 rounded-full hover:bg-muted" asChild>
                                            <Link href="/settings?tab=profile">Update</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* More Options */}
                            {isOwnProfile && (
                                <div className="flex justify-end mt-4">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="text-xs"
                                        onClick={handleDeleteAccount}
                                    >
                                        Delete
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
            <div className="bg-muted/30 p-4 rounded-full mb-4">
                <MessageSquare className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-bold mb-2">u/{user.username} hasn't posted yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                {type === "overview" ? "This user hasn't posted or commented yet." : `There are no ${type} in this account.`}
            </p>
            {/* If own profile, prompt to engage */}
        </div>
    );
}