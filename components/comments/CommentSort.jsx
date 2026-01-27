"use client";

import { Button } from "../ui/button";
import { cn } from "../../utils/utils";

export default function CommentSort({ sortBy, onSortChange, className }) {
    const sortOptions = [
        { value: "best", label: "Best" },
        { value: "top", label: "Top" },
        { value: "new", label: "New" },
        { value: "controversial", label: "Controversial" },
    ];

    return (
        <div className={cn("flex items-center gap-2 pb-2 border-b mb-4", className)}>
            <span className="text-sm text-muted-foreground font-medium">Sort by:</span>
            <div className="flex gap-1">
                {sortOptions.map((option) => (
                    <Button
                        key={option.value}
                        variant={sortBy === option.value ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                            "h-8 text-xs font-medium rounded-full",
                            sortBy === option.value && "bg-secondary text-secondary-foreground"
                        )}
                        onClick={() => onSortChange(option.value)}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}