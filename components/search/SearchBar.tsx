"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock } from "lucide-react";
import { Input } from "components/ui/input";
import { fetchSearchResults, fetchCommunities, fetchProfiles } from "lib/search";
import { dummyRecentSearches } from "lib/dummyPosts";
import { cn } from "lib/utils";
import { Avatar, AvatarFallback } from "components/ui/avatar";

interface SearchResult {
    id: string;
    title: string;
    subreddit: string;
}

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

export default function SearchBar() {
    const [query, setQuery] = useState("");

    // Data States
    const [results, setResults] = useState<SearchResult[]>([]);
    const [communities, setCommunities] = useState<CommunityResult[]>([]);
    const [profiles, setProfiles] = useState<ProfileResult[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                setIsLoading(true);
                try {
                    // TODO: Parallel data fetching (replace with real API calls eventually)
                    const [postsData, communitiesData, profilesData] = await Promise.all([
                        fetchSearchResults(query),
                        fetchCommunities(query),
                        fetchProfiles(query)
                    ]);

                    setResults(postsData);
                    setCommunities(communitiesData);
                    setProfiles(profilesData);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults([]);
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
        setResults([]);
        setCommunities([]);
        setProfiles([]);
        if (document.activeElement === dropdownRef.current?.querySelector("input")) {
            setIsOpen(true);
        }
    };

    return (
        <div className="relative w-full max-w-[600px]" ref={dropdownRef}>
            <div className="relative flex items-center">
                <Search className="absolute left-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                    type="text"
                    placeholder="Search Reddit"
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className={cn(
                        "pl-10 pr-10 py-2 h-10 rounded-full bg-muted/30 border-transparent transition-all duration-200",
                        "hover:bg-background hover:border-gray-300 hover:ring-0",
                        "focus:bg-background focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
                        isOpen && "rounded-b-none rounded-t-[20px] bg-background border-b-0 border-gray-200"
                    )}
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 text-muted-foreground hover:text-foreground"
                        type="button"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border border-t-0 border-gray-200 rounded-b-[20px] shadow-lg overflow-hidden z-50">
                    <div className="py-2 max-h-[500px] overflow-y-auto custom-scrollbar">

                        {/* A. Recent Searches */}
                        {!query && (
                            <div className="pb-2">
                                {dummyRecentSearches.map((term, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 cursor-pointer text-sm"
                                        onClick={() => {
                                            setQuery(term);
                                        }}
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
                                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Communities
                                </div>
                                {communities.map((community) => (
                                    <div
                                        key={community.name}
                                        className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 cursor-pointer"
                                        onClick={() => handleSelect(`/r/${community.name.replace('r/', '')}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "w-5 h-5 rounded-full flex-shrink-0 bg-gradient-to-br",
                                                    community.color || "from-gray-400 to-gray-600"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{community.name}</span>
                                                <span className="text-xs text-muted-foreground">{community.members.toLocaleString()} members</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {query && communities.length > 0 && profiles.length > 0 && (
                            <div className="h-px bg-muted mx-4 my-1" />
                        )}

                        {/* C. Profiles */}
                        {query && profiles.length > 0 && (
                            <div className="pb-2">
                                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    Profiles
                                </div>
                                {profiles.map((profile) => (
                                    <div
                                        key={profile.username}
                                        className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 cursor-pointer"
                                        onClick={() => handleSelect(`/u/${profile.username.replace('u/', '')}`)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-8 h-8">
                                                <AvatarFallback className="bg-orange-500 text-white font-bold">
                                                    {profile.username[2].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{profile.username}</span>
                                                <span className="text-xs text-muted-foreground">{profile.karma.toLocaleString()} karma</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* D. Posts (Search Results) */}
                        {query && results.length > 0 && (
                            <>
                                {(communities.length > 0 || profiles.length > 0) && <div className="h-px bg-muted mx-4 my-1" />}
                                <div className="pb-2">
                                    <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        Posts
                                    </div>
                                    {results.map((result) => (
                                        <div
                                            key={result.id}
                                            onClick={() => handleSelect(`/post/${result.id}`)}
                                            className="px-4 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                                        >
                                            <div className="text-sm font-medium text-foreground truncate">
                                                {result.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {result.subreddit}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Loading / No Results fallback for actual search */}
                        {query && isLoading && (
                            <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                                Looking for &#34;{query}&#34;...
                            </div>
                        )}
                        {query && !isLoading && results.length === 0 && communities.length === 0 && profiles.length === 0 && (
                            <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                                No results found
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}