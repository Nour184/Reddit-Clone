"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { X } from "lucide-react";
import Toast from "../../components/shared/Toast";


async function createCommunity({ name, description }) {
  const response = await fetch("/api/subreddits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });
  const data = await response.json();
  return data;
}

export default function CreateCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    // trap Escape to close modal
    const onKey = (e) => { if (e.key === 'Escape') router.back(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  const handleCreate = async (e) => {
    e && e.preventDefault();
    setError("");
    const trimmed = name.trim().replace(/^r\//i, "");
    if (!trimmed) {
      setError("Community name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await createCommunity({ name: trimmed, description });
      setToast({ message: "Community created successfully", variant: "success" });
      setTimeout(() => {
        router.push(`/r/${encodeURIComponent(name)}`);
      }, 1000);
    } catch (err) {
      setToast({ message: "Failed to create community", variant: "error" });
      setError(err.message || "Failed to create community");
      setIsSubmitting(false);
    }
  };

  const nameLimit = 21;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={() => router.back()} />

      {/* Toast Container */}
      {toast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[60]">
          <Toast
            message={toast.message}
            variant={toast.variant}
            duration={3000}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="relative max-w-4xl w-full bg-white dark:bg-[#0b0b0c] rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Tell us about your community</h2>
            <p className="text-sm text-muted-foreground mt-1">A name and description help people understand what your community is all about.</p>
          </div>
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-muted/30 ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6 p-6">
          {/* Form Column */}
          <div className="col-span-8">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Community name <span className="text-red-600">*</span></label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Community name" maxLength={nameLimit} />
                <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                  <div>Names cannot contain spaces; prefix <span className="font-medium">r/</span> optional.</div>
                  <div>{name.length}/{nameLimit}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description <span className="text-red-600">*</span></label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={6} />
                <div className="text-xs text-muted-foreground mt-1">A short description to explain the community.</div>
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="ghost" onClick={() => router.back()}>Back</Button>
                <Button type="submit" disabled={isSubmitting || !name.trim() || !description.trim()}>{isSubmitting ? 'Creating...' : 'Create Community'}</Button>
              </div>
            </form>
          </div>

          {/* Preview Column */}
          <div className="col-span-4">
            <div className="bg-white dark:bg-[#0f1720] border rounded-xl p-4 shadow-sm">
              <div className="text-sm text-muted-foreground mb-2">Preview</div>
              <div className="bg-gray-50 dark:bg-[#071014] rounded-lg p-4 flex flex-col gap-3">
                <div className="text-lg font-semibold">r/{name || 'communityname'}</div>
                <div className="text-xs text-muted-foreground">1 weekly visitor · 1 weekly contributor</div>
                <div className="text-sm text-muted-foreground mt-2">{description || 'Your community description'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}