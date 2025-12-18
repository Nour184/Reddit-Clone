"use client";

// components/shared/Navbar/index.jsx
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import SearchBar from "components/search/SearchBar";
import { getSession, removeSession } from "lib/session";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { Search, Home, MessageSquare, Bell, Plus, ChevronDown, LogIn, User, FileText, Settings, LogOut, Moon, Sun, Image as ImageIcon } from "lucide-react";
import { cn } from "lib/utils";

// Mock user (replace with real auth later)


/**
 * UserMenu Component
 * 
 * Dropdown menu for authenticated users showing profile options.
 */
function UserMenu({ user }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    removeSession();
    router.push("/");
    router.refresh();
  };

  const toggleTheme = (e) => {
    e.preventDefault();
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.karma} karma</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/u/${user.username}`} className="w-full cursor-pointer flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>View Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/avatar" className="w-full cursor-pointer flex items-center">
              <ImageIcon className="mr-2 h-4 w-4" />
              <span>Edit Avatar</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/drafts" className="w-full cursor-pointer flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              <span>Drafts</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleTheme} className="cursor-pointer">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                {mounted && theme === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />}
                <span>Dark Mode</span>
              </div>
              {mounted && (
                <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-orange-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-4' : ''}`} />
                </div>
              )}
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="w-full cursor-pointer flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 hover:text-red-500 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isEditAvatarOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsEditAvatarOpen(false)}>
          <div
            className="bg-background w-full max-w-md p-6 rounded-lg shadow-xl border relative animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Edit Avatar</h2>
            <div className="aspect-square w-32 border-4 border-background shadow-sm mx-auto bg-muted rounded-full flex items-center justify-center mb-6 overflow-hidden">
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Choose a simple, playful avatar to represent you.
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditAvatarOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsEditAvatarOpen(false)}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Navbar Component
 * 
 * Main navigation bar with:
 * - Logo and branding
 * - Home dropdown menu
 * - Search bar
 * - Action buttons (messages, notifications, create post)
 * - User menu or login button
 * 
 * Sticky header that stays at top on scroll.
 */

// CSS variables for light mode (from globals.css)
const lightModeVariables = {
  "--background": "oklch(1 0 0)",
  "--foreground": "oklch(0.145 0 0)",
  "--card": "oklch(1 0 0)",
  "--card-foreground": "oklch(0.145 0 0)",
  "--popover": "oklch(1 0 0)",
  "--popover-foreground": "oklch(0.145 0 0)",
  "--primary": "oklch(0.205 0 0)",
  "--primary-foreground": "oklch(0.985 0 0)",
  "--secondary": "oklch(0.97 0 0)",
  "--secondary-foreground": "oklch(0.205 0 0)",
  "--muted": "oklch(0.97 0 0)",
  "--muted-foreground": "oklch(0.556 0 0)",
  "--accent": "oklch(0.97 0 0)",
  "--accent-foreground": "oklch(0.205 0 0)",
  "--destructive": "oklch(0.577 0.245 27.325)",
  "--border": "oklch(0.922 0 0)",
  "--input": "oklch(0.922 0 0)",
  "--ring": "oklch(0.708 0 0)"
};

export default function Navbar({ user }) {
  const [currentUser, setCurrentUser] = useState(user);
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  useEffect(() => {
    // Check for active session on mount
    const sessionUser = getSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }

    // Listen for session updates (login/logout)
    const handleSessionUpdate = () => {
      const updatedSession = getSession();
      setCurrentUser(updatedSession);
    };

    window.addEventListener("session-updated", handleSessionUpdate);
    return () => window.removeEventListener("session-updated", handleSessionUpdate);
  }, []);

  // Sync with prop if provided (server-side auth in future)
  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur",
        isAuthPage
          ? "bg-white border-gray-200"
          : "bg-background/95 supports-[backdrop-filter]:bg-background/60"
      )}
      style={isAuthPage ? lightModeVariables : undefined}
    >
      <div className="flex h-14 items-center px-4 sm:px-6 gap-4 sm:gap-6 max-w-screen-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Go to homepage"
          >
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              R
            </div>
            <span className="font-bold text-xl hidden sm:block">reddit</span>
          </Link>
        </div>



        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <SearchBar />
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted/10 transition-colors hidden sm:flex"
            aria-label="Messages"
            asChild
          >
            <Link href="/messages">
              <MessageSquare className="w-6 h-6" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted/10 transition-colors hidden sm:flex"
            aria-label="Notifications"
            asChild
          >
            <Link href="/notifications">
              <Bell className="w-6 h-6" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted/10 transition-colors"
            aria-label="Create Post"
            asChild
          >
            <Link href="/submit">
              <Plus className="w-6 h-6" />
            </Link>
          </Button>

          {/* User Menu or Log In */}
          {currentUser ? (
            <UserMenu user={currentUser} />
          ) : (
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link href="/auth/login">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Log In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}