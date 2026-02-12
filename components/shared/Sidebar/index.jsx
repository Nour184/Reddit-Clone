"use client";

// components/shared/Sidebar/index.jsx
import Link from "next/link";
import { Button } from "components/ui/button";
import { Home, TrendingUp, Plus, ChevronUp, ChevronDown, Shield } from "lucide-react";
import { cn } from "lib/utils";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// Initial popular communities (fallback if API fails)
const DEFAULT_POPULAR = [
  { name: "programming", members: "2.1m", color: "from-red-500 to-pink-500" },
  { name: "webdev", members: "1.8m", color: "from-blue-500 to-cyan-500" },
  { name: "reactjs", members: "980k", color: "from-cyan-500 to-blue-600" },
];

/**
 * Sidebar Component
 * 
 * Displays navigation and list of communities.
 * - Logged Out: Shows popular communities.
 * - Logged In: Shows user's joined communities and owned communities.
 */
export default function Sidebar() {
  const { data: session, status } = useSession();
  const [isExpanded, setIsExpanded] = useState(true);
  const [communities, setCommunities] = useState([]); // Displayed list
  const [showAll, setShowAll] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (status === "authenticated" && session?.user) {
          try {
            const [joinedRes, ownedRes] = await Promise.all([
              fetch("/api/me/memberships"),
              fetch("/api/me/owned/communities")
            ]);

            let allComms = [];
            const seen = new Set();

            if (joinedRes.ok) {
              const joined = await joinedRes.json();
              joined.forEach(j => {
                const name = j.community_name;
                if (!seen.has(name)) {
                  seen.add(name);
                  allComms.push({
                    name: name,
                    color: "from-blue-500 to-indigo-500",
                    type: 'joined'
                  });
                }
              });
            }

            if (ownedRes.ok) {
              const owned = await ownedRes.json();
              owned.forEach(c => {
                if (!seen.has(c.name)) {
                  seen.add(c.name);
                  allComms.push({
                    name: c.name,
                    color: c.theme_color || "from-green-500 to-emerald-600",
                    type: 'owned'
                  });
                }
              });
            }
            setCommunities(allComms);
          } catch (e) {
            console.error("Error fetching user communities", e);
          }
        } else if (status === "unauthenticated") {
          // Fetch Popular/All Communities
          const res = await fetch("/api/subreddits?limit=10");
          if (res.ok) {
            const data = await res.json();
            const formatted = data.map(c => ({
              name: c.name,
              color: c.theme_color || "from-gray-400 to-gray-600"
            }));
            setCommunities(formatted);
          } else {
            setCommunities(DEFAULT_POPULAR);
          }
        }
      } catch (error) {
        console.error("Sidebar fetch error:", error);
        if (status === "unauthenticated") setCommunities(DEFAULT_POPULAR);
      }
    };

    if (mounted) fetchData();

    // Listen for community updates (e.g. join/leave action)
    const handleCommunityUpdate = (e) => {
      // Simple re-fetch or invalidation approach
      fetchData();
    };

    window.addEventListener('community-updated', handleCommunityUpdate);
    return () => window.removeEventListener('community-updated', handleCommunityUpdate);

  }, [status, session, mounted]);

  const communitiesToShow = showAll ? communities : communities.slice(0, 5);

  return (
    <aside className="hidden lg:block w-[270px] fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto bg-background border-r border-border pt-4 pb-4 z-40">

      {/* Home Section */}
      <div className="px-3 mb-2">
        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors group"
          >
            <Home className="w-[20px] h-[20px] text-foreground" strokeWidth={1.5} />
            <span className="text-[14px] font-medium text-foreground">Home</span>
          </Link>
          <Link
            href="/popular"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors group"
          >
            <TrendingUp className="w-[20px] h-[20px] text-foreground" strokeWidth={1.5} />
            <span className="text-[14px] font-medium text-foreground">Popular</span>
          </Link>
        </div>
        <div className="my-3 h-px bg-border mx-3" />
      </div>

      {/* Topics / Communities */}
      <div className="px-3 mb-4">
        <div
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent rounded-md mb-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>{status === "authenticated" ? "YOUR COMMUNITIES" : "COMMUNITIES"}</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
        </div>

        {isExpanded && (
          <div className="space-y-0.5 mt-1">
            {/* Create Actions */}
            {status === "authenticated" && (
              <div className="px-1 pb-2 space-y-1">
                <Link href="/create-community">
                  <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-accent px-2 text-foreground h-9 font-normal">
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Create Community</span>
                  </Button>
                </Link>
              </div>
            )}

            {mounted && communitiesToShow.map((c) => (
              <Link
                key={c.name}
                href={`/r/${c.name}`}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors group"
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full flex-shrink-0 bg-gradient-to-br",
                    c.color || "from-gray-400 to-gray-600"
                  )}
                />
                <span className="text-[14px] font-medium text-foreground truncate">r/{c.name}</span>
              </Link>
            ))}

            {communities.length === 0 && mounted && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {status === "authenticated" ? "No communities joined" : "Loading..."}
              </div>
            )}

            {communities.length > 5 && (
              <Button
                variant="ghost"
                className="w-full justify-start text-[14px] h-9 px-3 font-normal hover:bg-accent mt-1"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "See less" : "See more"}
              </Button>
            )}
          </div>
        )}
        <div className="my-3 h-px bg-border mx-3" />
      </div>


      {/* Resources / Footer */}
      <div className="px-3">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          RESOURCES
        </div>
        <div className="space-y-0.5">
          {[
            { name: "About Reddit", href: "/about" },
            { name: "Terms", href: "/terms" },
            { name: "Content Policy", href: "/agreement" },
            { name: "Privacy Policy", href: "/privacy" },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block px-3 py-2 rounded-md hover:bg-accent transition-colors text-[14px] text-foreground"
            >
              {link.name}
            </Link>
          ))}

        </div>
        <div className="px-3 py-4 text-xs text-muted-foreground">
          Reddit Clone © 2025. All rights reserved.
        </div>
      </div>
    </aside>
  );
}