"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { getSession, setSession } from "@/lib/session";
import { useRouter } from "next/navigation";

// Simplified Toast for this context if not fully set up
const showToast = (message) => {
    // Basic fallback user feedback
    const div = document.createElement("div");
    div.className = "fixed bottom-5 right-5 bg-foreground text-background px-4 py-2 rounded-md shadow-lg z-50 animate-in slide-in-from-bottom-5";
    div.innerText = message;
    document.body.appendChild(div);
    setTimeout(() => document.body.removeChild(div), 3000);
};




// --- Avatar Data ---
const AVATARS = {
    default: [
        "/avatars/avatar_default_0.svg",
        "/avatars/avatar_default_1.svg",
        "/avatars/avatar_default_2.svg",
        "/avatars/avatar_default_3.svg",
    ],
    fun: [
        "/avatars/avatar_fun_1.svg",
        "/avatars/avatar_fun_2.svg",
        "/avatars/avatar_fun_3.svg",
    ],
    seasonal: [
        "/avatars/avatar_seasonal_1.svg",
        "/avatars/avatar_seasonal_2.svg",
    ]
};

export default function AvatarEditorPage() {
    const router = useRouter();
    const session = getSession();
    const [selectedAvatar, setSelectedAvatar] = useState(session?.avatar || AVATARS.default[0]);
    const [isSaving, setIsSaving] = useState(false);

    // If not logged in, redirect
    if (typeof window !== 'undefined' && !session) {
        router.push("/auth/login");
        return null;
    }

    const handleSave = () => {
        setIsSaving(true);
        // Simulate network delay
        setTimeout(() => {
            const updatedSession = { ...session, avatar: selectedAvatar };
            setSession(updatedSession);
            showToast("Avatar saved successfully!");
            setIsSaving(false);
            // Optionally redirect back or stay
        }, 500);
    };

    return (
        <div className="container max-w-6xl mx-auto py-6 px-4 flex flex-col md:flex-row gap-8 h-[calc(100vh-80px)]">

            {/* Left Panel - Preview */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
                <div className="bg-gradient-to-b from-blue-500/20 to-transparent p-6 rounded-xl border border-border flex flex-col items-center justify-center min-h-[400px] sticky top-20">
                    <div className="relative w-64 h-64 mb-6">
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-background shadow-2xl bg-white">
                            <img src={selectedAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-1">{session?.username || "You"}</h2>
                        <p className="text-muted-foreground">Lookin' good!</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        className="w-full bg-[#D93A00] hover:bg-[#C03300] text-white rounded-full font-bold h-12 text-lg"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? "Saving..." : "Save Avatar"}
                    </Button>
                </div>
            </div>

            {/* Right Panel - Selection */}
            <div className="w-full md:w-2/3 bg-card border rounded-xl overflow-hidden flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold">Edit Avatar</h1>
                    <p className="text-muted-foreground">Customize your appearance on Reddit.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <Tabs defaultValue="default" className="w-full">
                        <TabsList className="flex gap-2 mb-6 flex-wrap">
                            <TabsTrigger value="default" className="px-4 py-2 rounded-full border text-sm transition-colors">Default</TabsTrigger>
                            <TabsTrigger value="fun" className="px-4 py-2 rounded-full border text-sm transition-colors">Fun & Wacky</TabsTrigger>
                            <TabsTrigger value="seasonal" className="px-4 py-2 rounded-full border text-sm transition-colors">Seasonal</TabsTrigger>
                        </TabsList>

                        <TabsContent value="default" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {AVATARS.default.map((src, i) => (
                                <AvatarCard
                                    key={i}
                                    src={src}
                                    isSelected={selectedAvatar === src}
                                    onClick={() => setSelectedAvatar(src)}
                                />
                            ))}
                        </TabsContent>
                        <TabsContent value="fun" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {AVATARS.fun.map((src, i) => (
                                <AvatarCard
                                    key={i}
                                    src={src}
                                    isSelected={selectedAvatar === src}
                                    onClick={() => setSelectedAvatar(src)}
                                />
                            ))}
                        </TabsContent>
                        <TabsContent value="seasonal" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {AVATARS.seasonal.map((src, i) => (
                                <AvatarCard
                                    key={i}
                                    src={src}
                                    isSelected={selectedAvatar === src}
                                    onClick={() => setSelectedAvatar(src)}
                                />
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

function AvatarCard({ src, isSelected, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`
                cursor-pointer rounded-xl bg-muted/30 p-4 flex items-center justify-center aspect-square relative transition-all hover:bg-muted/60
                ${isSelected ? "ring-2 ring-orange-500 ring-offset-2 bg-muted/50" : "border border-transparent"}
            `}
        >
            <img src={src} alt="Avatar Option" className="w-full h-full object-contain" />
            {isSelected && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1 shadow-sm">
                    <Check className="w-3 h-3" />
                </div>
            )}
        </div>
    );
}