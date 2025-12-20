"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { ChevronRight, Eye } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Switch } from "../../components/ui/switch";
import { getSession } from "../../lib/session";
import { cn } from "../../lib/utils";

/**
 * Reusable Row Component for consistency
 */
function SettingsRow({ label, description, rightElement, onClick, destructive }) {
    return (
        <div
            className={cn(
                "flex items-center justify-between py-4 px-2 -mx-2 rounded-lg transition-colors",
                onClick && "hover:bg-muted/40 cursor-pointer"
            )}
            onClick={onClick}
        >
            <div className="flex flex-col gap-1 pr-4">
                <span className={cn("text-sm font-medium", destructive && "text-red-600")}>{label}</span>
                {description && <span className="text-xs text-muted-foreground">{description}</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {rightElement}
                {onClick && !rightElement && <ChevronRight className="w-4 h-4" />}
            </div>
        </div>
    );
}

function SectionHeader({ title }) {
    return <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 mt-8 border-b pb-2">{title}</h3>;
}

function SettingsContent() {
    const session = getSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    // Use session email or empty string if not logged in (though it should redirect usually)
    const [email] = useState(session?.email || "");

    const activeTab = searchParams.get("tab") || "account";

    const handleTabChange = (value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.push(`/settings?${params.toString()}`);
    };

    // Toggles State
    const [toggles, setToggles] = useState({
        twoFactor: false,
        mature: false,
        follow: true,
        oldReddit: true,
        search: true,
        showMature: false,
        blurMature: true,
        recommendations: true,
        webPush: false,
    });

    const toggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-transparent h-auto p-0 space-x-6 w-full justify-start border-b border-border mb-6 flex-wrap">
                    {["Account", "Profile", "Privacy", "Preferences", "Notifications", "Email"].map(tab => (
                        <TabsTrigger
                            key={tab}
                            value={tab.toLowerCase()}
                            className="rounded-none border-b-2 border-transparent px-0 py-2 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none font-semibold text-muted-foreground data-[state=active]:text-foreground transition-none hover:text-foreground"
                        >
                            {tab}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* ACCOUNT TAB */}
                <TabsContent value="account" className="space-y-1">
                    <SectionHeader title="General" />
                    <SettingsRow
                        label="Email address"
                        rightElement={<span>{email}</span>}
                        onClick={() => { }}
                    />

                    <SectionHeader title="Security" />
                    <SettingsRow
                        label="Two-factor authentication"
                        rightElement={<Switch checked={toggles.twoFactor} onCheckedChange={() => toggle('twoFactor')} />}
                    />
                </TabsContent>

                {/* PROFILE TAB */}
                <TabsContent value="profile" className="space-y-1">
                    <SectionHeader title="General" />

                    <SettingsRow
                        label="Avatar"
                        description="Edit your avatar or upload an image"
                        onClick={() => router.push("/avatar")}
                        rightElement={<ChevronRight className="w-4 h-4" />}
                    />

                    <SettingsRow
                        label="Mark as mature (18+)"
                        description="Label your profile as Not Safe for Work (NSFW) and ensure it's inaccessible to people under 18"
                        rightElement={<Switch checked={toggles.mature} onCheckedChange={() => toggle('mature')} />}
                    />

                    <SectionHeader title="Curate your profile" />
                    <div className="text-sm text-muted-foreground mb-4">Manage what content shows on your profile.</div>
                    <SettingsRow
                        label="Content and activity"
                        description="Posts, comments, and communities you're active in"
                        rightElement={<span className="text-primary font-semibold flex items-center cursor-pointer">Show all <ChevronRight className="w-4 h-4 ml-1" /></span>}
                    />
                </TabsContent>

                {/* PRIVACY TAB */}
                <TabsContent value="privacy" className="space-y-1">
                    <SectionHeader title="Social interactions" />
                    <SettingsRow
                        label="Allow people to follow you"
                        description="Let people follow you to see your profile posts in their home feed"
                        rightElement={<Switch checked={toggles.follow} onCheckedChange={() => toggle('follow')} />}
                    />
                    <SettingsRow
                        label="Who can send you chat requests"
                        rightElement={<span className="flex items-center">Everyone <ChevronRight className="w-4 h-4 ml-2" /></span>}
                        onClick={() => { }}
                    />
                    <SettingsRow
                        label="Blocked accounts"
                        onClick={() => { }}
                        rightElement={<ChevronRight className="w-4 h-4" />}
                    />

                    <SectionHeader title="Discoverability" />
                    <SettingsRow
                        label="List your profile on old.reddit.com/users"
                        description="List your profile on old.reddit.com/users and allow posts to your profile to appear in r/all"
                        rightElement={<Switch checked={toggles.oldReddit} onCheckedChange={() => toggle('oldReddit')} />}
                    />
                    <SettingsRow
                        label="Show up in search results"
                        description="Allow search engines like Google to link to your profile in their search results"
                        rightElement={<Switch checked={toggles.search} onCheckedChange={() => toggle('search')} />}
                    />
                </TabsContent>

                {/* PREFERENCES TAB */}
                <TabsContent value="preferences" className="space-y-1">
                    <SectionHeader title="Language" />
                    <SettingsRow
                        label="Display language"
                        rightElement={<span className="flex items-center">English (US) <ChevronRight className="w-4 h-4 ml-2" /></span>}
                        onClick={() => { }}
                    />
                    <SettingsRow
                        label="Content languages"
                        onClick={() => { }}
                        rightElement={<ChevronRight className="w-4 h-4" />}
                    />

                    <SectionHeader title="Content" />
                    <SettingsRow
                        label="Show mature content (I'm over 18)"
                        description="See Not Safe for Work mature and adult content in your feeds and search results"
                        rightElement={<Switch checked={toggles.showMature} onCheckedChange={() => toggle('showMature')} />}
                    />
                    <SettingsRow
                        label="Blur mature (18+) images and media"
                        rightElement={<Switch checked={toggles.blurMature} onCheckedChange={() => toggle('blurMature')} />}
                    />
                    <SettingsRow
                        label="Show recommendations in home feed"
                        rightElement={<Switch checked={toggles.recommendations} onCheckedChange={() => toggle('recommendations')} />}
                    />
                    <SettingsRow
                        label="Muted communities"
                        onClick={() => { }}
                        rightElement={<ChevronRight className="w-4 h-4" />}
                    />
                </TabsContent>

                {/* NOTIFICATIONS TAB */}
                <TabsContent value="notifications" className="space-y-1">
                    <SectionHeader title="General" />
                    <SettingsRow
                        label="Community notifications"
                        onClick={() => { }}
                        rightElement={<ChevronRight className="w-4 h-4" />}
                    />
                    <SettingsRow
                        label="Web push notifications"
                        rightElement={<Switch checked={toggles.webPush} onCheckedChange={() => toggle('webPush')} />}
                    />

                    <SectionHeader title="Messages" />
                    <SettingsRow
                        label="Chat messages"
                        rightElement={<span className="flex items-center">All on <ChevronRight className="w-4 h-4 ml-2" /></span>}
                        onClick={() => { }}
                    />
                    <SettingsRow
                        label="Chat requests"
                        rightElement={<span className="flex items-center">All on <ChevronRight className="w-4 h-4 ml-2" /></span>}
                        onClick={() => { }}
                    />
                    <SettingsRow
                        label="Mark all as read"
                        description="Mark all chat conversations as read"
                        rightElement={<Button variant="secondary" size="sm" className="rounded-full px-4">Mark as read</Button>}
                    />

                    <SectionHeader title="Activity" />
                    <SettingsRow
                        label="Mentions of u/username"
                        rightElement={<span className="flex items-center">All on <ChevronRight className="w-4 h-4 ml-2" /></span>}
                        onClick={() => { }}
                    />
                    <SettingsRow
                        label="Comments on your posts"
                        rightElement={<span className="flex items-center">All on <ChevronRight className="w-4 h-4 ml-2" /></span>}
                        onClick={() => { }}
                    />
                    <SettingsRow
                        label="Upvotes on your posts"
                        rightElement={<span className="flex items-center">All on <ChevronRight className="w-4 h-4 ml-2" /></span>}
                        onClick={() => { }}
                    />
                    <SettingsRow
                        label="Upvotes on your comments"
                        rightElement={<span className="flex items-center">All on <ChevronRight className="w-4 h-4 ml-2" /></span>}
                        onClick={() => { }}
                    />
                </TabsContent>

                {/* EMAIL TAB (Placeholder based on available info) */}
                <TabsContent value="email" className="py-10 text-center text-muted-foreground">
                    <div className="max-w-md mx-auto space-y-4">
                        <h3 className="font-semibold text-foreground">Manage Emails</h3>
                        <p>Control which emails you receive from Reddit.</p>
                        <SettingsRow
                            label="Unsubscribe from all emails"
                            rightElement={<Switch />}
                        />
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="container mx-auto py-8"><p>Loading...</p></div>}>
            <SettingsContent />
        </Suspense>
    );
}