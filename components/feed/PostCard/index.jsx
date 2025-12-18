"use client";

// components/shared/PostCard/index.jsx
import Link from "next/link";
import Image from "next/image";
import { MessageSquare, Share2, Bookmark, MoreHorizontal, ExternalLink } from "lucide-react";
import VoteButtons from "@/components/post/VoteButtons/index.jsx";
import UserAvatar from "@/components/user/UserAvatar/index.jsx";
import TimeAgo from "@/components/shared/TimeAgo/index.jsx";
import CommunityInfo from "@/components/subreddit/Sidebar/CommunityInfo/index.jsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function PostCard({
  id,
  title,
  content,
  imageUrl,
  linkUrl,
  linkPreview,
  author,
  community,
  votes = 0,
  voteState = null,
  comments = 0,
  createdAt,
  onVote,
  href = "#",
  className,
}) {
  const hasImage = !!imageUrl;
  const hasLink = !!linkUrl;
  const hasContent = !!content;

  return (
    <Card className={cn("overflow-hidden hover:border-primary/20 transition-colors", className)}>
      <div className="flex gap-3 p-4">
        {/* Vote Buttons */}
        <div className="flex-shrink-0">
          <VoteButtons
            initialVotes={votes}
            initialVoteState={voteState}
            onVote={onVote}
            compact={false}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header: Community & Author */}
          <div className="flex items-center gap-2 flex-wrap">
            {community && (
              <CommunityInfo
                name={community.name}
                members={community.members}
                href={community.href}
              />
            )}
            <span className="text-xs text-muted-foreground">·</span>
            <div className="flex items-center gap-2">
              <UserAvatar
                username={author?.username}
                avatar={author?.avatar}
                size="sm"
              />
              <Link
                href={`/u/${author?.username || ""}`}
                className="text-xs font-medium hover:underline"
              >
                u/{author?.username || "unknown"}
              </Link>
            </div>
            {createdAt && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <TimeAgo timestamp={createdAt} />
              </>
            )}
          </div>

          {/* Title */}
          <Link href={href}>
            <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Content */}
          {hasContent && (
            <p className="text-sm text-foreground/90 line-clamp-4 whitespace-pre-wrap">
              {content}
            </p>
          )}

          {/* Image */}
          {hasImage && (
            <div className="relative w-full rounded-lg overflow-hidden bg-muted">
              <Image
                src={imageUrl}
                alt={title}
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Link Preview */}
          {hasLink && linkPreview && (
            <Link
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
            >
              <div className="flex">
                {linkPreview.image && (
                  <div className="relative w-32 h-24 flex-shrink-0 bg-muted">
                    <Image
                      src={linkPreview.image}
                      alt={linkPreview.title || title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {linkPreview.domain || new URL(linkUrl).hostname}
                    </span>
                  </div>
                  <p className="text-sm font-medium line-clamp-1 mb-1">
                    {linkPreview.title || title}
                  </p>
                  {linkPreview.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {linkPreview.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={`${href}#comments`}>
                <MessageSquare className="w-4 h-4 mr-1.5" />
                {comments} {comments === 1 ? "comment" : "comments"}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Share post"
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Save post"
            >
              <Bookmark className="w-4 h-4 mr-1.5" />
              Save
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}