// SubredditHeader.jsx
"use client";

import { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "../shared/Button";
import { isJoined, joinCommunity, leaveCommunity } from "lib/community-store";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "components/ui/dropdown-menu";

export default function SubredditHeader({ communityId, owner }) {
    const { data: session } = useSession();
    const [isJoined, setIsJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Placeholder states for future features
    const [NotificationON, setIsNotificationON] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (!session?.user) {
            setIsLoading(false);
            return;
        }

        const checkJoinStatus = async () => {
            try {
                const response = await fetch(`/api/subreddits/${communityId}/members?check=true`);
                if (response.ok) {
                    const data = await response.json();
                    setIsJoined(data.isJoined);
                }
            } catch (error) {
                console.error("Error checking join status", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkJoinStatus();
    }, [communityId, session]);

    const handleJoin = async () => {
        if (!session) {
            router.push("/auth/login");
            return;
        }

        try {
            setIsJoined(true); // Optimistic update
            const response = await fetch(`/api/subreddits/${communityId}/members`, {
                method: "POST"
            });

            if (!response.ok) {
                setIsJoined(false); // Revert
                throw new Error("Failed to join");
            } else {
                window.dispatchEvent(new CustomEvent('community-updated', { detail: communityId }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLeave = async () => {
        if (!session) return;

        try {
            setIsJoined(false); // Optimistic update
            const response = await fetch(`/api/subreddits/${communityId}/members`, {
                method: "DELETE"
            });

            if (!response.ok) {
                setIsJoined(true); // Revert
                throw new Error("Failed to leave");
            } else {
                window.dispatchEvent(new CustomEvent('community-updated', { detail: communityId }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreatePost = () => {
        router.push(`/submit?community=${communityId}`);
    };

    if (isLoading) return null; // Or a skeleton

    const isOwner = session?.user?.email === owner;

    return (
        <div className="flex gap-2">
            {!isOwner && (
                isJoined ? (
                    <Button onClick={handleLeave} variant="outline" className="w-24">Joined</Button>
                ) : (
                    <Button onClick={handleJoin} className="w-24">Join</Button>
                )
            )}

            {isJoined && (
                <Button onClick={() => setIsNotificationON(!NotificationON)} variant="ghost">
                    Notification {NotificationON ? "ON" : "OFF"}
                </Button>
            )}

            <Button onClick={handleCreatePost}>Create Post</Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost">…</Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent sideOffset={4} className="min-w-[10rem]">
                    <DropdownMenuItem onClick={() => console.log("Add to Custom")}>
                        Add to Custom
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setIsFavorite(prev => !prev)}>
                        {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setIsMuted(prev => !prev)}>
                        {isMuted ? "Unmute" : "Mute"}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}