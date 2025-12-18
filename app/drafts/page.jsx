"use client";

import { useSearchParams } from "next/navigation";

export default function DraftsPage() {
    const searchParams = useSearchParams();

    return (
        <div className="container max-w-4xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Drafts</h1>
            <div className="bg-card border rounded-md p-8 text-center text-muted-foreground">
                <p>You have no drafts saved.</p>
                <p className="text-sm mt-2">Drafts are saved locally on your device.</p>
            </div>
        </div>
    );
}