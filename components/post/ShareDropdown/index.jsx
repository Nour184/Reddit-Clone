"use client";

// components/shared/ShareDropdown/index.jsx
import { Share2, Link as LinkIcon, Twitter, Facebook, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * ShareDropdown Component
 * 
 * Dropdown menu for sharing content with various options.
 * Supports copy link, social media sharing, etc.
 * 
 * Props:
 * - url: string - URL to share
 * - title: string - Title of content to share
 * - variant: "ghost" | "outline" | "default" - Button variant
 * - size: "sm" | "md" | "lg" | "icon" - Button size
 * - className: string - Additional CSS classes
 */
export default function ShareDropdown({
  url = typeof window !== "undefined" ? window.location.href : "",
  title = "",
  variant = "ghost",
  size = "sm",
  className,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOptions = [
    {
      label: "Copy Link",
      icon: copied ? Check : Copy,
      onClick: handleCopyLink,
      className: copied ? "text-green-600" : "",
    },
    {
      label: "Twitter",
      icon: Twitter,
      onClick: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          "_blank"
        );
      },
    },
    {
      label: "Facebook",
      icon: Facebook,
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("text-muted-foreground hover:text-foreground", className)}
          aria-label="Share"
        >
          <Share2 className="w-4 h-4 mr-1.5" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Share</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {shareOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.label}
              onClick={option.onClick}
              className={cn("cursor-pointer", option.className)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}