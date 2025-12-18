// components/shared/Badge/index.jsx
import { cn } from "@/lib/utils";

/**
 * Badge Component
 * 
 * Displays badges/tags for categories, status, etc.
 * 
 * Props:
 * - children: ReactNode - Badge content
 * - variant: "default" | "primary" | "secondary" | "outline" | "destructive" - Badge style
 * - size: "sm" | "md" | "lg" - Badge size
 * - className: string - Additional CSS classes
 */
export default function Badge({ children, variant = "default", size = "md", className }) {
  const variantClasses = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border text-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}