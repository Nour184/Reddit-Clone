"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCommunity } from "@/lib/community-store";
import { Info } from "lucide-react";
import { getSession } from "@/lib/session";

export default function CreateCommunityPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Check authentication
    useEffect(() => {
        const session = getSession();
        if (!session || !session.loggedIn) {
            router.push('/auth/login');
        }
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Community name is required");
            return;
        }

        if (name.length < 3) {
            setError("Community name must be at least 3 characters");
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(name)) {
            setError("Community name can only contain letters, numbers, and underscores");
            return;
        }

        setLoading(true);

        // Simulate network delay for UX
        setTimeout(() => {
            try {
                createCommunity({
                    name,
                    description,
                    type: "public" // Enforce public
                });
                router.push(`/r/${name}`);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }, 500);
    };

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold border-b pb-4 mb-4 border-gray-200 dark:border-gray-800">
                    Create a Community
                </h1>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex gap-3 text-sm text-blue-800 dark:text-blue-200">
                    <Info className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Name cannot be changed</p>
                        <p className="opacity-90">Names cannot be changed after creation. Please choose wisely.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name */}
                <div className="space-y-2">
                    <label className="block text-lg font-medium">Name</label>
                    <p className="text-xs text-muted-foreground">
                        Community names including capitalization cannot be changed.
                    </p>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            r/
                        </span>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-8"
                            placeholder="community_name"
                            maxLength={21}
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    <p className="text-xs text-muted-foreground">
                        {21 - name.length} Characters remaining
                    </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="block text-lg font-medium">Description</label>
                    <p className="text-xs text-muted-foreground">
                        This is how new members come to understand your community.
                    </p>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell us about your community..."
                        className="min-h-[100px] resize-none"
                    />
                </div>

                {/* Footer */}
                <div className="pt-6 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        className="rounded-full"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="rounded-full px-8"
                        disabled={loading}
                    >
                        {loading ? "Creating Community..." : "Create Community"}
                    </Button>
                </div>
            </form>
        </div>
    );
}