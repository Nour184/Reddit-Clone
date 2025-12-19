"use client";

// components/shared/Sidebar/index.jsx
import Link from "next/link";
import { Button } from "components/ui/button";
import { Home, TrendingUp, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "lib/utils";
import { useState, useEffect } from "react";
import { getSession } from "lib/session";

// Initial popular communities (fallback)
const DEFAULT_POPULAR = [
  { name: "programming", members: "2.1m", color: "from-red-500 to-pink-500" },
  { name: "webdev", members: "1.8m", color: "from-blue-500 to-cyan-500" },
  { name: "reactjs", members: "980k", color: "from-cyan-500 to-blue-600" },
  { name: "nextjs", members: "450k", color: "from-gray-700 to-black" },
  { name: "typescript", members: "620k", color: "from-blue-600 to-blue-800" },
  { name: "javascript", members: "3.2m", color: "from-yellow-400 to-yellow-600" },
];

/**
 * Sidebar Component
 * 
 * Re-styled to match Reddit's left sidebar design.
 */
export default function Sidebar() {
  /* 
   * Session Logic:
   * If user is logged in, hide this public sidebar (as requested "empty for now").
   * In a real app, this might show user-specific nav items.
   */
  /* 
   * Session Logic:
   * If user is logged in, hide this public sidebar (as requested "empty for now").
   * In a real app, this might show user-specific nav items.
   */
  const [currentUser, setCurrentUser] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sessionUser = getSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }

    // Fetch all communities from database
    const fetchAllCommunities = async () => {
      try {
        const res = await fetch('/api/subreddits');
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map(c => ({
            name: c.name,
            members: '0', // We can fetch member count separately if needed
            color: "from-blue-400 to-purple-500" // Default gradient
          }));
          setAllCommunities(formatted);
        } else {
          setAllCommunities(DEFAULT_POPULAR);
        }
      } catch (err) {
        console.error('Failed to fetch communities:', err);
        setAllCommunities(DEFAULT_POPULAR);
      }
    };

    // Fetch joined communities from database
    const fetchJoinedCommunities = async () => {
      if (!sessionUser) {
        setJoinedCommunities([]);
        return;
      }

      try {
        const res = await fetch('/api/me/memberships');
        if (res.ok) {
          const data = await res.json();
          const formatted = data.map(membership => ({
            name: membership.community_name,
            members: '0',
            color: "from-blue-400 to-purple-500"
          }));
          setJoinedCommunities(formatted);
        } else {
          setJoinedCommunities([]);
        }
      } catch (err) {
        console.error('Failed to fetch joined communities:', err);
        setJoinedCommunities([]);
      }
    };

    fetchAllCommunities();
    fetchJoinedCommunities();

    // Listen for session updates
    const handleSessionUpdate = () => {
      const updated = getSession();
      setCurrentUser(updated);

      // Re-fetch communities when session changes
      fetchAllCommunities();
      fetchJoinedCommunities();
    };

    window.addEventListener("session-updated", handleSessionUpdate);

    return () => window.removeEventListener("session-updated", handleSessionUpdate);
  }, []);

  // Determine which list to show
  // If logged in, show joined communities? OR show popular + joined?
  // Requirement: "display list of joined communities somewhere (side bar)"
  // The original code uses `popularCommunities`.

  const displayCommunities = currentUser
    ? (joinedCommunities.length > 0 ? joinedCommunities : DEFAULT_POPULAR)
    : (allCommunities.length > 0 ? allCommunities : DEFAULT_POPULAR);

  // Filter for display if not showing all
  const communitiesToShow = showAll ? displayCommunities : displayCommunities.slice(0, 5);

  return (
    <aside className="hidden lg:block w-[270px] fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto bg-background border-r border-border pt-4 pb-4">
      {/* Logged In Indicator */}
      {currentUser && (
        <div className="mx-3 mb-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold text-center border border-blue-100">
          You are seeing the logged in version
        </div>
      )}
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

        </div>
        <div className="my-3 h-px bg-border mx-3" />
      </div>

      {/* Topics / Communities */}
      <div className="px-3 mb-4">
        <div
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent rounded-md mb-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>COMMUNITIES</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-180")} />
        </div>

        {isExpanded && (
          <div className="space-y-0.5 mt-1">
            {/* Create Post & Community Buttons - only show when logged in */}
            {currentUser && (
              <div className="px-1 pb-2 space-y-1">
                <Link href="/submit">
                  <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-accent px-2 text-foreground h-9 font-normal">
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Create Post</span>
                  </Button>
                </Link>
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

            {displayCommunities.length > 5 && (
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
            { name: "About Reddit", href: "/about" }, // Keep standard links even if 404 for now, or just valid ones
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