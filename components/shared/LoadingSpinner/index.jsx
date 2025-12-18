// components/shared/LoadingSpinner/index.jsx
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LoadingSpinner Component
 * 
 * Simple loading spinner with customizable size.
 * Uses lucide-react Loader2 icon with animation.
 * 
 * Props:
 * - size: "sm" | "md" | "lg" - Size variant
 * - className: string - Additional CSS classes
 */
export default function LoadingSpinner({ size = "md", className }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2
      className={cn(
        sizeClasses[size],
        "animate-spin text-muted-foreground",
        className
      )}
      aria-label="Loading"
    />
  );
}