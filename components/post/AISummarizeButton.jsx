"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AISummarizeButton({ title, content, className }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSummarize = async () => {
        if (summary && isExpanded) {
            // If already showing summary, just toggle it
            setIsExpanded(false);
            return;
        }

        if (summary) {
            // If we have a cached summary, just show it
            setIsExpanded(true);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Calling AI summarization API with:', { title, content });

            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            console.log('API Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'Failed to generate summary');
            }

            const data = await response.json();
            console.log('Summary received:', data);
            setSummary(data.summary);
            setIsExpanded(true);
        } catch (err) {
            console.error('Summarization error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("space-y-3", className)}>
            <Button
                onClick={handleSummarize}
                disabled={loading}
                variant={isExpanded ? "secondary" : "outline"}
                className={cn(
                    "gap-2 transition-all",
                    isExpanded && "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Summary...
                    </>
                ) : (
                    <>
                        <Sparkles className={cn(
                            "w-4 h-4",
                            isExpanded && "text-purple-600 dark:text-purple-400"
                        )} />
                        {isExpanded ? "Hide Summary" : "Summarize with AI"}
                    </>
                )}
            </Button>

            {error && (
                <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                        <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-900 dark:text-red-100">Failed to generate summary</p>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                        </div>
                    </div>
                </Card>
            )}

            {isExpanded && summary && (
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                                AI Summary
                                <span className="text-xs font-normal text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">
                                    Beta
                                </span>
                            </h3>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                                    {summary}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}