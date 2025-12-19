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
import { getSession } from "lib/session";

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    /* ---------- Auth Guard ---------- */
    useEffect(() => {
        const session = getSession();
        if (!session?.loggedIn) router.push("/auth/login");
    }, []);

    /* ---------- Communities (all communities from database) ---------- */
    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const res = await fetch("/api/subreddits");
                if (!res.ok) {
                    // If error, leave communities empty
                    setCommunities([]);
                    return;
                }
                const data = await res.json();
                // API returns communities with `name` field
                const allCommunities = data.map((r) => ({
                    name: r.name,
                    slug: r.name.toLowerCase(),
                }));
                setCommunities(allCommunities);

                const param = searchParams.get("community");
                if (param) {
                    const found = allCommunities.find(c => c.slug === param.toLowerCase());
                    if (found) setSelectedCommunity(found);
                }
            } catch (err) {
                console.error("Failed to fetch communities:", err);
                setCommunities([]);
            }
        };
        fetchCommunities();
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
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="border p-2 flex justify-between cursor-pointer"
                >
                    {selectedCommunity ? selectedCommunity.name : "Select community"}
                    <ChevronDown />
                </div>

                {dropdownOpen && (
                    <div className="absolute bg-white border w-full z-10">
                        {communities.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                                No communities available. Create one first!
                            </div>
                        ) : (
                            communities.map(c => (
                                <div
                                    key={c.slug}
                                    onClick={() => {
                                        setSelectedCommunity(c);
                                        setDropdownOpen(false);
                                    }}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                >
                                    r/{c.name}
                                </div>
                            ))
                        )}
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