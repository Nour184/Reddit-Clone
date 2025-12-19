"use client";

// components/shared/Navbar/index.jsx
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import SearchBar from "components/search/SearchBar";
import { Button } from "components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { MessageSquare, Bell, Plus, LogIn, User, FileText, Settings, LogOut, Moon, Sun, Image as ImageIcon } from "lucide-react";
import { cn } from "lib/utils";

/**
 * UserMenu Component
 */
function UserMenu({ user }) {
  const { theme, setTheme } = useTheme();
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
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
            {/* Online Status Dot */}
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-background rounded-full" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.karma || 0} karma</p>
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
 */
export default function Navbar({ user }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  // Use session user if available, otherwise fallback to prop (if any)
  const displayUser = session?.user ? {
    username: session.user.name,
    avatar: session.user.image,
    karma: 0 // Default karma
  } : user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative flex h-14 items-center px-4 w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 mr-4 z-20">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Go to homepage"
          >
            {/* Text Logo with adjusted font - Snoo moved to SearchBar */}
            <span className="font-bold text-2xl tracking-tighter hidden lg:block" style={{ fontFamily: 'VAG Rounded, sans-serif' }}>reddit</span>
          </Link>
        </div>

        {/* Search Bar - Absolutely Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4 hidden md:block z-10">
          <SearchBar />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto z-20">
          {/* Only show these if logged in usually, but screenshot shows them */}
          {displayUser ? (
            <>
              {/* Chat */}
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <MessageSquare className="w-5 h-5" />
              </Button>

              {/* Create Button */}
              <Button variant="ghost" className="hidden sm:flex items-center gap-2 font-medium hover:bg-muted" asChild>
                <Link href="/submit">
                  <Plus className="w-5 h-5" />
                  <span>Create</span>
                </Link>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
              </Button>

              {/* User Menu */}
              <UserMenu user={displayUser} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
