"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  ExternalLink,
  Trash2,
} from "lucide-react";

import AISummarizeButton from "../../post/AISummarizeButton";
import VoteButtons from "../../post/VoteButtons";
import TimeAgo from "../../shared/TimeAgo";
import CommunityInfo from "../../subreddit/Sidebar/CommunityInfo";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { cn } from "../../../lib/utils";

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
  onDelete,
  href = "#",
  className,
}) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data?.username) setCurrentUser(data.username);
      } catch { }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isOwner =
    currentUser &&
    author?.username &&
    currentUser === author.username;

  const formatCount = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count;
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) return alert("Failed to delete post");
      onDelete?.();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden border-border bg-card hover:bg-accent/5 transition-colors cursor-pointer",
      className
    )}>
      <div className="p-3 flex flex-col gap-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            {community && (
              <CommunityInfo
                name={community.name}
                members={community.members}
                href={`/r/${community.name}`}
                className="text-foreground font-semibold hover:underline"
              />
            )}
            {createdAt && (
              <>
                <span>·</span>
                <TimeAgo timestamp={createdAt} />
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-secondary">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <Link href={href}>
          <h3 className="text-[20px] font-bold leading-7 mb-1">{title}</h3>
        </Link>

        {/* Content / Image */}
        <div className="space-y-3">
          {content && <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{content}</p>}

          {imageUrl && (
            <div className="relative w-full rounded-xl overflow-hidden bg-muted/20 border border-border">
              <Image
                src={imageUrl}
                alt={title}
                width={800}
                height={600}
                className="w-full object-contain max-h-[512px]"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {/* Votes */}
          <VoteButtons
            initialVotes={votes}
            initialVoteState={voteState}
            onVote={onVote}
            horizontal={true}
          />

          {/* Comments Pill */}
          <Button variant="secondary" size="sm" className="rounded-full h-9 bg-secondary/50 hover:bg-secondary/80 gap-2 border-none" asChild>
            <Link href={`${href}#comments`}>
              <MessageSquare className="w-5 h-5" />
              <span className="font-bold text-xs">{formatCount(comments)}</span>
            </Link>
          </Button>

          {/* AI Summarize Pill */}
          <AISummarizeButton
            postId={id}
            title={title}
            content={content}
            className="m-0"
          />

          {isOwner && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full h-9 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-500 gap-2"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-xs font-bold">Delete</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

