"use client";

import { Check } from "lucide-react";
import { cn } from "lib/utils";

/**
 * FloatingLabelInput Component
 * 
 * A styled input component with floating label animation, matching Reddit's auth design.
 * Features:
 * - Floating label that moves up when input is focused or has value
 * - Optional validation icon (green checkmark)
 * - Optional right-side action button (e.g., refresh icon)
 * - Error state support
 * - Gray background with rounded corners
 * - Focus ring animation
 * 
 * Props:
 * - label: string (required) - Label text
 * - name: string (required) - Input name
 * - type: string - Input type (default: "text")
 * - value: string (required) - Input value
 * - onChange: function (required) - Change handler
 * - onBlur: function - Blur handler
 * - error: string - Error message to display
 * - showValidIcon: boolean - Show green checkmark when true
 * - rightAction: ReactNode - Optional right-side button/icon
 * - required: boolean - Whether field is required
 * - className: string - Additional CSS classes for container
 * - placeholder: string - Placeholder text (usually same as label)
 */
export default function FloatingLabelInput({
    label,
    name,
    type = "text",
    value,
    onChange,
    onBlur,
    error,
    showValidIcon = false,
    rightAction,
    required = false,
    className,
    placeholder,
    ...props
}) {
    return (
        <div className={cn("relative", className)}>
            <div className={cn(
                "relative bg-gray-100 rounded-3xl overflow-hidden group transition-all",
                error ? "ring-2 ring-red-500" : "focus-within:ring-2 focus-within:ring-blue-500"
            )}>
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="block w-full px-4 pt-6 pb-2 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-transparent peer"
                    placeholder={placeholder || label}
                    {...props}
                />
                <label
                    htmlFor={name}
                    className="absolute text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                >
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>

                {/* Right side icons/actions */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {showValidIcon && value && (
                        <Check className="w-5 h-5 text-green-600" />
                    )}
                    {rightAction}
                </div>
            </div>

            {/* Error message */}
            {error && (
                <p className="text-red-500 text-xs mt-2 px-4 font-medium">{error}</p>
            )}
        </div>
    );
}