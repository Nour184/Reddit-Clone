"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import {
    Image as ImageIcon,
    Link as LinkIcon,
    ListOrdered,
    ChevronDown,
    Bold,
    Italic,
    Strikethrough,
    Code,
    X as XIcon,
    Video as VideoIcon,
    Plus
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

/* ===========================
   Media Upload Component
=========================== */

function MediaUpload({ mediaFiles, setMediaFiles }) {
    const inputRef = useRef(null);

    const onFileChange = (e) => {
        const files = Array.from(e.target.files || []).filter(f =>
            f.type.startsWith("image/") || f.type.startsWith("video/")
        );

        const mapped = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith("video/") ? "video" : "image"
        }));

        setMediaFiles(prev => [...prev, ...mapped]);
        inputRef.current.value = "";
    };

    const remove = (i) => {
        setMediaFiles(prev => {
            URL.revokeObjectURL(prev[i].preview);
            return prev.filter((_, idx) => idx !== i);
        });
    };

    useEffect(() => {
        return () => mediaFiles.forEach(m => URL.revokeObjectURL(m.preview));
    }, []);

    return (
        <div className="border border-dashed rounded-md p-6 text-center">
            {mediaFiles.length === 0 ? (
                <>
                    <ImageIcon className="mx-auto mb-2" />
                    <VideoIcon className="mx-auto mb-4" />
                    <Button variant="outline" onClick={() => inputRef.current.click()}>
                        Upload
                    </Button>
                </>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {mediaFiles.map((m, i) => (
                        <div key={i} className="relative">
                            {m.type === "video" ? (
                                <video src={m.preview} controls />
                            ) : (
                                <img src={m.preview} />
                            )}
                            <button onClick={() => remove(i)} className="absolute top-1 right-1">
                                <XIcon size={14} />
                            </button>
                        </div>
                    ))}
                    <button onClick={() => inputRef.current.click()}>
                        <Plus />
                    </button>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                hidden
                multiple
                accept="image/*,video/*"
                onChange={onFileChange}
            />
        </div>
    );
}

/* ===========================
   Main Page
=========================== */

export default function CreatePostPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [activeTab, setActiveTab] = useState("post");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [url, setUrl] = useState("");
    const [mediaFiles, setMediaFiles] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const { data: session, status } = useSession();

    /* ---------- Auth Guard ---------- */
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        }
    }, [status, router]);

    /* ---------- Communities (all communities from database) ---------- */
    /* ---------- Communities Search & Url Param ---------- */
    // Debounced search for communities
    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                // If query is empty, it returns default (top/all) depending on API, which is what we want for initial state
                const res = await fetch(`/api/subreddits?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    const mapped = data.map(c => ({
                        name: c.name,
                        slug: c.name.toLowerCase(),
                        icon: c.community_photo_link
                    }));
                    setCommunities(mapped);
                }
            } catch (err) {
                console.error("Failed to fetch communities:", err);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle URL param "community" to set initial selection
    useEffect(() => {
        const param = searchParams.get("community");
        if (param) {
            // We need to fetch this specific community's details to set it as selected
            // even if it's not in the initial "top" list.
            const fetchSelected = async () => {
                try {
                    const res = await fetch(`/api/subreddits/${encodeURIComponent(param)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setSelectedCommunity({
                            name: data.name,
                            slug: data.name.toLowerCase(),
                            icon: data.community_photo_link
                        });
                    }
                } catch (e) {
                    console.error("Failed to load selected community param", e);
                }
            };
            fetchSelected();
        }
    }, [searchParams]);

    /* ---------- Validation ---------- */
    const validate = () => {
        const e = {};
        if (!title.trim()) e.title = "Title is required";
        if (!selectedCommunity) e.community = "Select a community";
        if (activeTab === "link") {
            try { new URL(url); }
            catch { e.url = "Invalid URL"; }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ---------- SUBMIT ---------- */
    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("community_name", selectedCommunity.name);

            if (activeTab === "post") {
                formData.append("body", body);
            } else if (activeTab === "link") {
                formData.append("body", url); // Backend might expect link in body if not separate
            }

            if (activeTab === "image" && mediaFiles.length > 0) {
                // Backend expects a single 'media' file based on the handler
                formData.append("media", mediaFiles[0].file);
            }

            const res = await fetch("/api/posts", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to create post");
            }

            const data = await res.json();
            router.push(`/r/${selectedCommunity.name}/post/${data.post_id}`);

        } catch (err) {
            setErrors({ form: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ---------- UI ---------- */
    return (
        <div className="max-w-[740px] mx-auto p-4">
            <h1 className="text-xl font-semibold mb-4">Create Post</h1>

            {errors.form && (
                <div className="bg-red-100 text-red-600 p-2 mb-3 rounded">
                    {errors.form}
                </div>
            )}

            {/* Community */}
            <div className="relative mb-4">
                <div
                    onClick={() => {
                        setDropdownOpen(!dropdownOpen);
                        if (!dropdownOpen) {
                            setTimeout(() => document.getElementById("community-search-input")?.focus(), 0);
                        }
                    }}
                    className="border p-2 flex justify-between cursor-pointer rounded-md bg-background hover:bg-accent/50 transition-colors items-center"
                >
                    {selectedCommunity ? (
                        <span className="font-medium">r/{selectedCommunity.name}</span>
                    ) : (
                        <span className="text-muted-foreground">Select community</span>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </div>

                {dropdownOpen && (
                    <div className="absolute top-full mt-1 bg-popover border text-popover-foreground w-full z-50 rounded-md shadow-md max-h-[300px] overflow-hidden flex flex-col">
                        <div className="p-2 border-b sticky top-0 bg-popover z-10">
                            <input
                                id="community-search-input"
                                className="w-full bg-secondary/50 border-none rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                                placeholder="Search communities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                        <div className="overflow-y-auto max-h-[250px]">
                            {communities.length === 0 ? (
                                <div className="p-3 text-sm text-muted-foreground text-center">
                                    {searchQuery ? "No communities found." : "No communities available."}
                                </div>
                            ) : (
                                communities.map(c => (
                                    <div
                                        key={c.slug}
                                        onClick={() => {
                                            setSelectedCommunity(c);
                                            setDropdownOpen(false);
                                            setSearchQuery("");
                                        }}
                                        className="p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors px-3 py-2 text-sm flex items-center gap-2"
                                    >
                                        {c.icon ? (
                                            <img src={c.icon} className="w-5 h-5 rounded-full object-cover bg-muted" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {c.name[0].toUpperCase()}
                                            </div>
                                        )}
                                        <span>r/{c.name}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Title */}
            <input
                className="w-full border p-2 mb-3"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />

            {/* Tabs */}
            <div className="flex border-b mb-3">
                {["post", "image", "link"].map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`flex-1 p-2 ${activeTab === t ? "border-b-2 font-bold" : ""}`}
                    >
                        {t.toUpperCase()}
                    </button>
                ))}
            </div>

            {activeTab === "post" && (
                <Textarea value={body} onChange={e => setBody(e.target.value)} />
            )}

            {activeTab === "image" && (
                <MediaUpload mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} />
            )}

            {activeTab === "link" && (
                <Textarea value={url} onChange={e => setUrl(e.target.value)} />
            )}

            <div className="flex justify-end mt-4">
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Posting..." : "Post"}
                </Button>
            </div>
        </div>
    );
}