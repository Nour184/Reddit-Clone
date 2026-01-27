"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { X, Clock } from "lucide-react";
import { fetchCommunities, fetchProfiles } from "@/utils/search";
import { cn } from "@/utils/utils";
import { Avatar, AvatarFallback } from "components/ui/avatar";

// Types


interface CommunityResult {
    name: string;
    members: number;
    icon: string | null;
    color?: string;
}

interface ProfileResult {
    username: string;
    karma: number;
    avatar: string | null;
}

const dummyRecentSearches: string[] = [];

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const params = useParams();
    const currentCommunity = typeof params?.community === 'string' ? decodeURIComponent(params.community) : null;

    // Data States

    const [communities, setCommunities] = useState<CommunityResult[]>([]);
    const [profiles, setProfiles] = useState<ProfileResult[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                setIsLoading(true);
                try {
                    const [communitiesData, profilesData] = await Promise.all([
                        fetchCommunities(query),
                        fetchProfiles(query)
                    ]);
                    setCommunities(communitiesData);
                    setProfiles(profilesData);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setCommunities([]);
                setProfiles([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (path: string) => {
        router.push(path);
        setIsOpen(false);
        setQuery("");
    };

    const handleClear = () => {
        setQuery("");
        setCommunities([]);
        setProfiles([]);
    };

    const handleClearCommunity = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push('/');
    };

    return (
        <div className={cn("relative w-full max-w-[600px]", isOpen && "z-50")} ref={dropdownRef}>

            {/* CSS for the Glow Animation */}
            <style jsx global>{`
                @keyframes reddit-glow {
                    0% {
                        box-shadow: 0 0 0px rgba(255, 69, 0, 0);
                    }
                    50% {
                        box-shadow: 0 0 15px rgba(255, 69, 0, 0.4);
                        border-color: #FF4500;
                    }
                    100% {
                        box-shadow: 0 0 0px rgba(255, 69, 0, 0);
                    }
                }
                .animate-glow {
                    animation: reddit-glow 3s ease-in-out infinite;
                }
                /* Hide scrollbar for dropdown */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--muted);
                    border-radius: 4px;
                }
            `}</style>

            <div className={cn(
                "relative flex items-center w-full h-11 transition-all duration-300 z-20",
                // When open, the dropdown below handles the border and background
                !isOpen ? "bg-muted rounded-full border border-border" : "bg-transparent border-transparent"
            )}>

                {/* Search Icon / Logo */}
                <div className="pl-3.5 pr-1 flex items-center justify-center pointer-events-none">
                    <img src="/favicon.ico" alt="Reddit" className="w-6 h-6 object-contain" />
                </div>

                {/* Community Pill (if active) */}
                {currentCommunity && !isOpen && (
                    <div className="flex items-center bg-popover text-foreground rounded-full px-2 py-0.5 text-sm mr-2 animate-in fade-in zoom-in duration-200">
                        <span className="truncate max-w-[100px] font-medium">r/{currentCommunity}</span>
                        <button
                            type="button"
                            className="ml-1 hover:text-primary rounded-full p-0.5"
                            onClick={handleClearCommunity}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* Input Field */}
                <input
                    type="text"
                    placeholder={currentCommunity && !isOpen ? "" : "Find anything"}
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm h-full w-full py-2 pr-10 text-center"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />

                {/* Clear Button */}
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-4 text-muted-foreground hover:text-foreground"
                        type="button"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown Results - Unifies the container and border when open */}
            {isOpen && (
                <div className={cn(
                    "absolute top-0 left-0 right-0 bg-popover border border-border rounded-[20px] shadow-2xl z-10 pt-11 animate-in fade-in duration-200",
                    "animate-glow border-[#FF4500]"
                )}>
                    <div className="py-2 max-h-[450px] overflow-y-auto custom-scrollbar text-foreground rounded-b-[20px]">

                        {/* A. Recent Searches */}
                        {!query && (
                            <div className="pb-2">
                                {dummyRecentSearches.map((term, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted cursor-pointer text-sm transition-colors"
                                        onClick={() => setQuery(term)}
                                    >
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-foreground">{term}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* B. Communities */}
                        {query && communities.length > 0 && (
                            <div className="pb-2">
                                <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Communities
                                </div>
                                {communities.map((community) => (
                                    <div
                                        key={community.name}
                                        className="flex items-center justify-between px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                                        onClick={() => handleSelect(`/r/${community.name.replace('r/', '')}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex-shrink-0 bg-gradient-to-br",
                                                community.color || "from-blue-500 to-purple-500"
                                            )} />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">{community.name}</span>
                                                <span className="text-xs text-muted-foreground">{community.members.toLocaleString()} members</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {query && communities.length > 0 && profiles.length > 0 && (
                            <div className="h-px bg-border mx-4 my-1" />
                        )}

                        {/* C. Profiles */}
                        {query && profiles.length > 0 && (
                            <div className="pb-2">
                                <div className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    People
                                </div>
                                {profiles.map((profile) => (
                                    <div
                                        key={profile.username}
                                        className="flex items-center justify-between px-4 py-2 hover:bg-muted cursor-pointer transition-colors"
                                        onClick={() => handleSelect(`/u/${profile.username.replace('u/', '')}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-6 h-6">
                                                <AvatarFallback className="bg-[#FF4500] text-white text-xs font-bold">
                                                    {profile.username.replace('u/', '').charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-foreground">{profile.username}</span>
                                                <span className="text-xs text-muted-foreground">{profile.karma.toLocaleString()} karma</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}



                        {/* Loading / Empty States */}
                        {query && isLoading && (
                            <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                                Searching Reddit...
                            </div>
                        )}
                        {query && !isLoading && communities.length === 0 && profiles.length === 0 && (
                            <div className="px-4 py-4 text-center text-sm text-muted-foreground">
                                No results found for "{query}"
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

