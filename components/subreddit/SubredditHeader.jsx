// SubredditHeader.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../shared/Button";
import { isJoined, joinCommunity, leaveCommunity } from "lib/community-store";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "components/ui/dropdown-menu";

export default function SubredditHeader({ communityId }) {
    const [isJoinedState, setIsJoinedState] = useState(false);
    const [NotificationON, setIsNotificationON] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        // initialize join state from persisted store
        try {
            const joined = isJoined(communityId);
            setIsJoinedState(joined);
        } catch (e) {
            // ignore on server or errors
        }
    }, [communityId]);

    const handleClick = () => {
        console.log("create post clicked");
        router.push(`/submit?community=${communityId}`);
    };

    return (
        <div className="flex gap-2">
            {isJoinedState ? (
                <Button onClick={() => {
                    // leave and persist
                    leaveCommunity(communityId);
                    setIsJoinedState(false);
                }}>Joined</Button>
            ) : (
                <Button onClick={() => {
                    // join and persist
                    joinCommunity(communityId);
                    setIsJoinedState(true);
                }}>Join</Button>
            )}

            {isJoined && (
                <Button onClick={() => setIsNotificationON(!NotificationON)}>
                    Notification {NotificationON ? "ON" : "OFF"}
                </Button>
            )}

          <Button onClick={handleClick}>Create Post</Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>…</Button>
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