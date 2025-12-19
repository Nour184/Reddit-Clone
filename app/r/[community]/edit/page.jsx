"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import Sidebar from "../../../../components/shared/Sidebar";

export default function EditCommunityPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    // Removed missing useToast
    const communityName = params.community;

    const [description, setDescription] = useState("");
    const [photoLink, setPhotoLink] = useState("");
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/sign-in");
            return;
        }

        if (communityName && status === "authenticated") {
            fetchCommunityDetails();
        }
    }, [communityName, status, router]);

    const fetchCommunityDetails = async () => {
        try {
            const res = await fetch(`/api/subreddits/${communityName}`);
            if (!res.ok) throw new Error("Failed to fetch community");
            const data = await res.json();

            setDescription(data.description || "");
            setPhotoLink(data.community_photo_link || "");

            // Check ownership
            if (session?.user?.email === data.community_owner) {
                setIsOwner(true);
            }
        } catch (error) {
            console.error(error);
            // Replaced toast with alert
            alert("Error: Failed to load community details");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/subreddits/${communityName}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    description: description,
                    communityPhotoLink: photoLink,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to update");
            }

            alert("Success: Community settings updated!");

            router.refresh();
            router.push(`/r/${communityName}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you SURE? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/subreddits/${communityName}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to delete");
            }

            alert("Deleted: Community has been deleted.");

            router.push("/");
            router.refresh();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10">Loading...</div>;
    }

    return (
        <div className="container max-w-6xl mx-auto py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Community Settings</CardTitle>
                            <CardDescription>Manage details for r/{communityName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Description
                                    </label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe your community..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="photoLink" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Community Icon URL
                                    </label>
                                    <Input
                                        id="photoLink"
                                        placeholder="https://..."
                                        value={photoLink}
                                        onChange={(e) => setPhotoLink(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Providing a direct image link is currently supported.
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                    <Button type="submit" disabled={saving}>
                                        {saving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {isOwner && (
                        <Card className="border-red-200">
                            <CardHeader>
                                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                                <CardDescription>Irreversible actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Delete Community</p>
                                        <p className="text-sm text-muted-foreground">
                                            Once deleted, it is gone forever.
                                        </p>
                                    </div>
                                    <Button variant="destructive" onClick={handleDelete}>Delete r/{communityName}</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="hidden md:block">
                    <Sidebar />
                </div>
            </div>
        </div>
    );
}
