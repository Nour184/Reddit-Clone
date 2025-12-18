// components/shared/PostSkeleton/index.jsx
import { cn } from "@/lib/utils";

/**
 * PostSkeleton Component
 * 
 * Loading skeleton for PostCard component.
 * Matches the structure of PostCard for smooth loading transitions.
 * 
 * Props:
 * - className: string - Additional CSS classes
 */
export default function PostSkeleton({ className }) {
  return (
    <div className={cn("border rounded-lg bg-card p-4 animate-pulse", className)}>
      <div className="flex gap-3">
        {/* Vote buttons skeleton */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 bg-muted rounded" />
          <div className="w-4 h-4 bg-muted rounded" />
          <div className="w-6 h-6 bg-muted rounded" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>

          {/* Title skeleton */}
          <div className="h-6 bg-muted rounded w-full" />

          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>

          {/* Image/Preview skeleton (optional) */}
          <div className="h-48 bg-muted rounded-lg" />

          {/* Footer skeleton */}
          <div className="flex items-center gap-4 pt-2">
            <div className="h-4 bg-muted rounded w-20" />
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}