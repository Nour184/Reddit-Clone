"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Image as ImageIcon,
    Link as LinkIcon,
    ListOrdered,
    Type,
    ChevronDown,
    Search,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    X as XIcon,
    Video as VideoIcon,
    Plus
} from "lucide-react";
import Link from 'next/link';
import { getSession } from "@/lib/session";
import { getAllCommunities, getJoinedCommunities } from "@/lib/community-store";

// --- Helpers ---

// Placeholder for future backend integration
const submitPost = async (formData) => {
    // In the future, this would be: 
    // const response = await fetch('/api/posts', { method: 'POST', body: formData });
    // if (!response.ok) throw new Error('Failed to create post');
    // return await response.json();

    console.log("Mock API Submit with FormData:", formData);
    // Simulating network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    throw new Error("Backend not implemented");
};

// --- Components ---

function MediaUpload({ mediaFiles, setMediaFiles }) {
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).filter(file =>
                file.type.startsWith('image/') || file.type.startsWith('video/')
            );

            const newMedia = newFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file), // Create object URL for preview
                type: file.type.startsWith('video/') ? 'video' : 'image'
            }));

            setMediaFiles(prev => [...prev, ...newMedia]);
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeMedia = (index) => {
        setMediaFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview); // Cleanup
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            mediaFiles.forEach(media => URL.revokeObjectURL(media.preview));
        };
    }, []);

    return (
        <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-md min-h-[280px] flex flex-col items-center justify-center p-8 text-center relative">
            {mediaFiles.length === 0 ? (
                <>
                    <div className="text-blue-500 mb-2">
                        <ImageIcon className="w-8 h-8 mx-auto inline-block mr-2" />
                        <VideoIcon className="w-8 h-8 mx-auto inline-block" />
                    </div>
                    <p className="text-sm font-medium mb-4">Drag and drop images or videos or</p>
                </>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-4">
                    {mediaFiles.map((media, idx) => (
                        <div key={idx} className="relative group rounded-md overflow-hidden aspect-square bg-gray-100 dark:bg-gray-800 border dark:border-gray-700">
                            {media.type === 'video' ? (
                                <video src={media.preview} className="w-full h-full object-cover" controls />
                            ) : (
                                <img src={media.preview} alt="preview" className="w-full h-full object-cover" />
                            )}
                            <button
                                onClick={() => removeMedia(idx)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/75 transition-colors"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-2">Add more</span>
                    </button>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
            />

            {mediaFiles.length === 0 && (
                <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Upload
                </Button>
            )}
        </div>
    );
}

function ToolbarButton({ icon, onClick }) {
    return (
        <button onClick={onClick} className="p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors" tabIndex={-1}>
            {icon}
        </button>
    )
}

function TabButton({ active, onClick, icon, label, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
           flex items-center justify-center gap-2 flex-1 py-4 font-bold text-md border-b-2 transition-colors
           ${active
                    ? "border-blue-500 text-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                    : "border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}
           ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

// --- Main Page Component ---

export default function CreatePostPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState("post");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [url, setUrl] = useState("");
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);

    // Form State
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

    // Check authentication
    useEffect(() => {
        const session = getSession();
        if (!session || !session.loggedIn) {
            router.push('/auth/login');
        }
    }, [router]);

    // Load communities and handle pre-selection
    const [communities, setCommunities] = useState([]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const all = getAllCommunities();
        // Since the select expects "communities" to have an id or similar, 
        // and we want mainly joined + popular maybe?
        // Let's just list all available for now, prioritizing joined.

        // Let's format them
        const formatted = all.map((c, idx) => ({
            id: idx + 1, // temporary ID
            name: "r/" + c.name,
            icon: c.icon || "default" // fallback
        }));
        setCommunities(formatted);

        // Handle URL param 'community'
        const communityParam = searchParams.get('community');
        if (communityParam) {
            // normalized check:
            const normalize = s => s.toLowerCase().replace(/^r\//, '');
            const target = normalize(communityParam);
            const match = formatted.find(c => normalize(c.name) === target);

            if (match) {
                setSelectedCommunity(match);
            }
        }
    }, [searchParams]);

    // Restore draft on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('post_draft');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                if (parsed.title) setTitle(parsed.title);
                if (parsed.body) setBody(parsed.body);
                if (parsed.url) setUrl(parsed.url);
                if (parsed.activeTab) setActiveTab(parsed.activeTab);
                if (parsed.selectedCommunity) setSelectedCommunity(parsed.selectedCommunity);
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
        setHasLoadedDraft(true);
    }, []);

    // Autosave draft
    useEffect(() => {
        if (!hasLoadedDraft) return;

        // Exclude media, isSubmitting, errors from draft
        const draft = {
            title,
            body,
            url,
            activeTab,
            selectedCommunity
        };

        const timeoutId = setTimeout(() => {
            localStorage.setItem('post_draft', JSON.stringify(draft));
        }, 1000); // Debounce 1s

        return () => clearTimeout(timeoutId);
    }, [title, body, url, activeTab, selectedCommunity, hasLoadedDraft]);

    const validate = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = "Title is required";
        if (!selectedCommunity) newErrors.community = "Please select a community";

        if (activeTab === 'link') {
            if (!url.trim()) {
                newErrors.url = "URL is required";
            } else {
                try {
                    new URL(url);
                } catch (_) {
                    newErrors.url = "Please enter a valid URL";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePost = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            // 1. Prepare FormData
            const formData = new FormData();
            formData.append('title', title);
            formData.append('type', activeTab);
            // communityId might be strict number or string depending on backend
            // We use name now as identifier mainly
            formData.append('communityId', selectedCommunity?.name || '');

            if (activeTab === 'post') formData.append('body', body);
            if (activeTab === 'link') formData.append('url', url);

            if (activeTab === 'image') {
                mediaFiles.forEach((fileObj, index) => {
                    formData.append(`media_${index}`, fileObj.file);
                });
            }

            // 2. Mock API Submit (commented out implementation in helper)
            // await submitPost(formData);
            // For now, we expect this to fail or be skipped, so we handle the "Backend not implemented" case
            // or we just skip calling it if we are purely local.
            // The requirement says: "The helper should currently throw 'Backend not implemented'".
            // But we need the fallback to run. So we catch the error.

            try {
                await submitPost(formData);
            } catch (apiError) {
                console.warn("Backend unavailable, falling back to local storage:", apiError.message);
            }

            // 3. LocalStorage Fallback
            const newPost = {
                id: Date.now(),
                title,
                community: selectedCommunity,
                type: activeTab,
                // For 'post' type we store body, for 'link' we store url
                content: activeTab === 'post' ? body : url,
                // For media, we can't easily store files in LS. Storing mock previews or base64 (too heavy).
                // Storing structure with empty media for now or object URLs (which will expire, but ok for session demo).
                media: activeTab === 'image' ? mediaFiles.map(f => ({ type: f.type, preview: f.preview })) : [],
                createdAt: new Date().toISOString(),
                author: getSession()?.username || "Anonymous",
                upvotes: 0,
                comments: 0
            };

            const existingPosts = JSON.parse(localStorage.getItem('posts') || '[]');
            localStorage.setItem('posts', JSON.stringify([newPost, ...existingPosts]));

            // Clear draft
            localStorage.removeItem('post_draft');

            // Feedback & Reset
            alert('Post created successfully! (saved to localStorage)');

            // Reset form
            setTitle("");
            setBody("");
            setUrl("");
            setMediaFiles([]);
            setActiveTab("post");
            // Don't reset community? Usually sticky. Let's keep it.

        } catch (err) {
            console.error("Critical error in submission:", err);
            setErrors({ form: "Something went wrong. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[740px] mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create post</h1>
                <Link href="/drafts">
                    <button className="text-sm font-bold text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1 rounded-full text-transform: uppercase tracking-wider">
                        Drafts
                    </button>
                </Link>
            </div>

            {/* Error Banner */}
            {errors.form && (
                <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm font-medium">
                    {errors.form}
                </div>
            )}

            {/* Community Selector */}
            <div className="relative mb-6">
                <div
                    className={`w-full sm:w-[300px] bg-white dark:bg-[#1A1A1B] border rounded-md flex items-center justify-between px-3 py-2 cursor-pointer hover:border-gray-400
             ${errors.community ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                    onClick={() => setIsCommunityDropdownOpen(!isCommunityDropdownOpen)}
                >
                    <div className="flex items-center gap-2">
                        {selectedCommunity ? (
                            <>
                                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">r/</div>
                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{selectedCommunity.name}</span>
                            </>
                        ) : (
                            <>
                                <div className="w-6 h-6 rounded-full bg-gray-200 border-dashed border border-gray-400"></div>
                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">Select a community</span>
                            </>
                        )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
                {errors.community && <p className="text-xs text-red-500 mt-1">{errors.community}</p>}

                {/* Dropdown */}
                {isCommunityDropdownOpen && (
                    <div className="absolute top-full left-0 w-[300px] mt-1 bg-white dark:bg-[#1A1A1B] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-2">Communities</span>
                        </div>
                        {communities.map((comm) => (
                            <div
                                key={comm.id}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2"
                                onClick={() => {
                                    setSelectedCommunity(comm);
                                    setIsCommunityDropdownOpen(false);
                                }}
                            >
                                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">r/</div>
                                <span className="text-sm text-gray-700 dark:text-gray-200">{comm.name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Post Section */}
            <div className="bg-white dark:bg-[#1A1A1B] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <TabButton
                        active={activeTab === 'post'}
                        onClick={() => setActiveTab('post')}
                        icon={<ListOrdered className="w-5 h-5" />}
                        label="Post"
                    />
                    <TabButton
                        active={activeTab === 'image'}
                        onClick={() => setActiveTab('image')}
                        icon={<ImageIcon className="w-5 h-5" />}
                        label="Images & Video"
                    />
                    <TabButton
                        active={activeTab === 'link'}
                        onClick={() => setActiveTab('link')}
                        icon={<LinkIcon className="w-5 h-5" />}
                        label="Link"
                    />
                    <TabButton
                        active={activeTab === 'poll'}
                        onClick={() => setActiveTab('poll')}
                        icon={<ListOrdered className="w-5 h-5" />}
                        label="Poll"
                        disabled // Keeping simpler for now
                    />
                </div>

                <div className="p-4">
                    {/* Title Input */}
                    <div className="mb-4 relative">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title*"
                            className={`w-full text-lg p-2 pr-12 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 bg-transparent
                 ${errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                            maxLength={300}
                        />
                        <span className="absolute right-3 top-3 text-xs text-gray-400 font-medium">{title.length}/300</span>
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                    </div>

                    {/* Body / Content Area */}
                    {activeTab === 'post' && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden min-h-[200px] flex flex-col">
                            {/* Toolbar */}
                            <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-[#1A1A1B] border-b border-gray-200 dark:border-gray-700 flex-wrap">
                                <ToolbarButton onClick={() => setBody(body + "**bold**")} icon={<Bold className="w-4 h-4" />} />
                                <ToolbarButton onClick={() => setBody(body + "*italic*")} icon={<Italic className="w-4 h-4" />} />
                                <ToolbarButton onClick={() => setBody(body + "[link](url)")} icon={<LinkIcon className="w-4 h-4" />} />
                                <ToolbarButton onClick={() => setBody(body + "~~strikethrough~~")} icon={<Strikethrough className="w-4 h-4" />} />
                                <ToolbarButton onClick={() => setBody(body + "`code`")} icon={<Code className="w-4 h-4" />} />
                                <ToolbarButton onClick={() => setBody(body + "\n> quote")} icon={<Type className="w-4 h-4" />} />
                            </div>
                            <Textarea
                                className="flex-1 w-full p-3 border-none resize-none focus-visible:ring-0 text-base min-h-[180px]"
                                placeholder="Body text (optional)"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        </div>
                    )}

                    {activeTab === 'image' && (
                        <MediaUpload mediaFiles={mediaFiles} setMediaFiles={setMediaFiles} />
                    )}

                    {activeTab === 'link' && (
                        <div>
                            <Textarea
                                className={`w-full min-h-[100px] resize-none ${errors.url ? 'border-red-500' : ''}`}
                                placeholder="Url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                            {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url}</p>}
                        </div>
                    )}



                    <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                        <Button
                            variant="ghost"
                            className="rounded-full font-bold text-gray-500"
                            onClick={() => alert("Draft saved!")}
                        >
                            Save Draft
                        </Button>
                        <Button
                            onClick={handlePost}
                            disabled={isSubmitting || (!title && !selectedCommunity)}
                            className="rounded-full font-bold bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed px-6"
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </Button>
                    </div>

                </div>
            </div>

            {/* Removed "Posting to Reddit" footer as requested */}

        </div>
    );
}