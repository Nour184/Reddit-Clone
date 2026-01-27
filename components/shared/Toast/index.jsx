"use client";

// components/shared/Toast/index.jsx
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/utils";
import { useEffect, useState } from "react";

/**
 * Toast Component
 * 
 * Toast notification component for displaying temporary messages.
 * Supports different variants: success, error, info, warning.
 * 
 * Props:
 * - message: string - Toast message
 * - variant: "success" | "error" | "info" | "warning" - Toast type
 * - duration: number - Auto-dismiss duration in ms (0 = no auto-dismiss)
 * - onClose: function - Callback when toast is closed
 * - className: string - Additional CSS classes
 */
export default function Toast({
  message,
  variant = "info",
  duration = 3000,
  onClose,
  className,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300); // Wait for animation
  };

  if (!isVisible) return null;

  const variantConfig = {
    success: {
      icon: CheckCircle2,
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-200",
      iconColor: "text-green-600",
    },
    error: {
      icon: AlertCircle,
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      iconColor: "text-red-600",
    },
    info: {
      icon: Info,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-800 dark:text-blue-200",
      iconColor: "text-blue-600",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
      text: "text-orange-800 dark:text-orange-200",
      iconColor: "text-orange-600",
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border shadow-lg",
        config.bg,
        config.border,
        "animate-in slide-in-from-top-5 fade-in-0",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", config.iconColor)} />
      <p className={cn("flex-1 text-sm font-medium", config.text)}>{message}</p>
      <button
        onClick={handleClose}
        className={cn(
          "flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
          config.text
        )}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}