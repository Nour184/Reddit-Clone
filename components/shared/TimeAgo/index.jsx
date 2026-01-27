// components/shared/TimeAgo/index.jsx
import { cn } from "@/utils/utils";

/**
 * TimeAgo Component
 * 
 * Formats timestamps into human-readable relative time.
 * Shows "2h ago" for recent times, "Jan 15" for older dates.
 * 
 * Props:
 * - timestamp: Date | string | number - The timestamp to format
 * - className: string - Additional CSS classes
 */
export default function TimeAgo({ timestamp, className }) {
  const formatTimeAgo = (ts) => {
    if (!ts) return "just now";

    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Less than 1 minute
    if (diffSecs < 60) {
      return "just now";
    }

    // Less than 1 hour
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }

    // Less than 24 hours
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    // Less than 7 days
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }

    // Older than 7 days - show date
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const currentYear = now.getFullYear();

    // If same year, don't show year
    if (year === currentYear) {
      return `${month} ${day}`;
    }

    return `${month} ${day}, ${year}`;
  };

  return (
    <time className={cn("text-xs text-muted-foreground", className)} dateTime={new Date(timestamp).toISOString()}>
      {formatTimeAgo(timestamp)}
    </time>
  );
}