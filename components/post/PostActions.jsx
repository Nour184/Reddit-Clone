"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Loader2, X } from "lucide-react";
import { getSession } from "@/utils/session";

export default function PostActions({ post }) {
    const router = useRouter();

    // States
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form States
    const [editTitle, setEditTitle] = useState(post.title || "");
    const [editBody, setEditBody] = useState(post.content || post.body || "");

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const session = getSession();
    const currentUserEmail = session?.user?.email;

    // Check permissions
    const isAuthor = currentUserEmail && (
        (post.user_email && post.user_email.toLowerCase() === currentUserEmail.toLowerCase()) ||
        (post.author && post.author.toLowerCase() === currentUserEmail.split('@')[0].toLowerCase())
    );

    if (!mounted || !isAuthor) return null;

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) {
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/posts/${post.id || post.post_id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");

            // Redirect to community page
            const community = post.community?.name || post.community_name;
            router.push(`/r/${community}`);
            router.refresh();
        } catch (err) {
            alert("Error: " + err.message);
            setIsLoading(false);
        }
    };

    const handleEdit = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", editTitle);
            formData.append("body", editBody);

            const res = await fetch(`/api/posts/${post.id || post.post_id}`, {
                method: 'PATCH',
                body: formData
            });

            if (!res.ok) throw new Error("Failed to update");

            setIsEditing(false);
            window.location.reload();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                        setEditTitle(post.title);
                        setEditBody(post.content || post.body);
                        setIsEditing(true);
                    }}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Custom Simple Overlay for Editing */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900 border dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Edit Post</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea
                                    className="min-h-[150px]"
                                    value={editBody}
                                    onChange={(e) => setEditBody(e.target.value)}
                                />
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEdit} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
