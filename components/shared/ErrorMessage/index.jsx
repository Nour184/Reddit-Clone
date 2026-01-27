// components/shared/ErrorMessage/index.jsx
import { AlertCircle } from "lucide-react";
import { cn } from "@/utils/utils";

/**
 * ErrorMessage Component
 * 
 * Displays error messages with icon and styling.
 * Used for form validation errors, API errors, etc.
 * 
 * Props:
 * - message: string - Error message to display
 * - className: string - Additional CSS classes
 * - variant: "default" | "destructive" | "warning" - Error variant
 */
export default function ErrorMessage({ message, className, variant = "default" }) {
  if (!message) return null;

  const variantClasses = {
    default: "text-destructive",
    destructive: "text-destructive bg-destructive/10 border-destructive/20",
    warning: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border text-sm",
        variantClasses[variant],
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}