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

import VoteButtons from "../../post/VoteButtons";
import UserAvatar from "../../user/UserAvatar";
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
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isOwner =
    currentUser &&
    author?.username &&
    currentUser === author.username;

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
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex gap-3 p-4">
        <VoteButtons
          initialVotes={votes}
          initialVoteState={voteState}
          onVote={onVote}
        />

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {community && (
              <CommunityInfo
                name={community.name}
                members={community.members}
                href={community.href}
              />
            )}
            <span>·</span>
            <UserAvatar username={author?.username} size="sm" />
            <Link href={`/u/${author?.username || ""}`}>
              u/{author?.username || "unknown"}
            </Link>
            {createdAt && (
              <>
                <span>·</span>
                <TimeAgo timestamp={createdAt} />
              </>
            )}
          </div>

          <Link href={href}>
            <h3 className="text-lg font-semibold">{title}</h3>
          </Link>

          {content && <p className="text-sm">{content}</p>}

          {imageUrl && (
            <Image
              src={imageUrl}
              alt={title}
              width={800}
              height={600}
              className="rounded-lg"
              unoptimized
            />
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`${href}#comments`}>
                <MessageSquare className="w-4 h-4 mr-1" />
                {comments} comments
              </Link>
            </Button>

            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>

            <Button variant="ghost" size="sm">
              <Bookmark className="w-4 h-4 mr-1" />
              Save
            </Button>

            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}

            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
