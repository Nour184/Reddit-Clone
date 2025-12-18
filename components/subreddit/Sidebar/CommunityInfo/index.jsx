// components/shared/CommunityInfo/index.jsx
import Link from "next/link";
import { cn } from "lib/utils";

/**
 * CommunityInfo Component
 * 
 * Displays community badge with name and member count.
 * Format: "r/webdev · 1.8m members"
 * 
 * Props:
 * - name: string - Community name (without r/)
 * - members: number | string - Member count (number or formatted string like "1.8m")
 * - href: string - Link to community page
 * - className: string - Additional CSS classes
 */
export default function CommunityInfo({ name, members, href, className }) {
  const formatMembers = (count) => {
    if (!count && count !== 0) return "0";
    if (typeof count === "string") return count;

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}m`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const content = (
    <span className={cn("text-xs font-medium text-muted-foreground hover:text-foreground transition-colors", className)}>
      r/{name} · {formatMembers(members)} members
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block" aria-label={`Visit r/${name} community`}>
        {content}
      </Link>
    );
  }

  return content;
}


