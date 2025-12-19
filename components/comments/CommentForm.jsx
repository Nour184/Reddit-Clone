"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { cn } from "../../lib/utils";

export default function CommentForm({
    onSubmit,
    onCancel,
    initialValue = "",
    placeholder = "What are your thoughts?",
    submitLabel = "Comment",
    loading = false,
    autoFocus = false,
    className
}) {
    const [text, setText] = useState(initialValue);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [autoFocus]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSubmit(text);
            if (!onCancel) setText(""); // Only clear if not a reply form (which usually closes on submit)
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            <div className="relative">
                <Textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={placeholder}
                    className="min-h-[100px] w-full resize-y bg-background"
                />
            </div>
            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    onClick={handleSubmit}
                    disabled={!text.trim() || loading}
                    className="rounded-full font-semibold"
                >
                    {loading ? "Posting..." : submitLabel}
                </Button>
            </div>
        </div>
    );
}