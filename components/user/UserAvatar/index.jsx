// components/shared/UserAvatar/index.jsx
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar";
import { cn } from "lib/utils";

/**
 * UserAvatar Component
 * 
 * Displays user avatar with fallback to initials.
 * Supports different sizes and optional border styling.
 * 
 * Props:
 * - username: string - Username for fallback initials
 * - avatar: string | null - Avatar image URL
 * - size: "sm" | "md" | "lg" - Size variant
 * - className: string - Additional CSS classes
 */
export default function UserAvatar({ username, avatar = null, size = "md", className }) {
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={avatar || undefined} alt={username || "User"} />
      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-semibold">
        {getInitials(username || "User")}
      </AvatarFallback>
    </Avatar>
  );
}