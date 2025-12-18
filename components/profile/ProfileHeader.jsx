"use client";

// components/profile/ProfileHeader.jsx
import { useState } from "react";
import { Calendar, Trophy, MessageSquare, ArrowUp, ArrowDown } from "lucide-react";
import UserAvatar from "@/components/user/UserAvatar/index.jsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Badge from "@/components/shared/Badge/index.jsx";
import { cn } from "@/lib/utils";

/**
 * ProfileHeader Component
 * 
 * Displays user profile header with:
 * - Avatar and username
 * - Karma (post and comment)
 * - Account age
 * - User stats (posts, comments)
 * - Follow/Message buttons
 * 
 * Props:
 * - username: string - Username
 * - avatar: string | null - Avatar image URL
 * - postKarma: number - Post karma
 * - commentKarma: number - Comment karma
 * - accountAge: Date | string | number - Account creation date
 * - postCount: number - Number of posts
 * - commentCount: number - Number of comments
 * - isOwnProfile: boolean - Whether this is the current user's profile
 * - isFollowing: boolean - Whether current user is following
 * - onFollow: function - Follow/unfollow handler
 * - onMessage: function - Message handler
 * - className: string - Additional CSS classes
 */
export default function ProfileHeader({
  username,
  avatar = null,
  postKarma = 0,
  commentKarma = 0,
  accountAge,
  postCount = 0,
  commentCount = 0,
  isOwnProfile = false,
  isFollowing = false,
  onFollow,
  onMessage,
  className,
}) {
  const formatAccountAge = (date) => {
    if (!date) return "Unknown";
    const accountDate = new Date(date);
    const now = new Date();
    const diffMs = now - accountDate;
    const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

    if (diffYears > 0) {
      return `${diffYears} ${diffYears === 1 ? "year" : "years"}`;
    }
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"}`;
  };

  const totalKarma = postKarma + commentKarma;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Banner */}
      <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600" />

      {/* Profile Content */}
      <div className="px-6 pb-6 -mt-16">
        {/* Avatar and Username */}
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-end gap-4">
            <div className="relative">
              <UserAvatar username={username} avatar={avatar} size="lg" className="ring-4 ring-background" />
              {isOwnProfile && (
                <Badge variant="primary" size="sm" className="absolute -bottom-1 -right-1">
                  You
                </Badge>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold">u/{username}</h1>
              {accountAge && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Redditor for {formatAccountAge(accountAge)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <div className="flex gap-2">
              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={onFollow}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
              <Button variant="outline" onClick={onMessage}>
                Message
              </Button>
            </div>
          )}
        </div>

        {/* Karma Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-medium">Total Karma</span>
            </div>
            <p className="text-xl font-bold">{totalKarma.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <ArrowUp className="w-4 h-4" />
              <span className="text-xs font-medium">Post Karma</span>
            </div>
            <p className="text-xl font-bold">{postKarma.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">Comment Karma</span>
            </div>
            <p className="text-xl font-bold">{commentKarma.toLocaleString()}</p>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">{postCount.toLocaleString()}</span>
            <span>Posts</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-foreground">{commentCount.toLocaleString()}</span>
            <span>Comments</span>
          </div>
        </div>
      </div>
    </Card>
  );
}