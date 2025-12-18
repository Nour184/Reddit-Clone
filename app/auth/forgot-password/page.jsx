"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X, Check } from "lucide-react";
import FloatingLabelInput from "@/components/shared/FloatingLabelInput";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [touched, setTouched] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!identifier) return;

        setIsSubmitting(true);

        // Check if user exists in localStorage
        try {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const user = users.find(u =>
                u.username.toLowerCase() === identifier.toLowerCase() ||
                u.email.toLowerCase() === identifier.toLowerCase()
            );

            if (user) {
                // Redirect to reset password page with username
                router.push(`/auth/reset-password?user=${encodeURIComponent(user.username)}`);
            } else {
                // For security, show success even if user not found
                setTimeout(() => {
                    setIsSent(true);
                    setIsSubmitting(false);
                }, 1500);
            }
        } catch (error) {
            console.error("Error checking user", error);
            setIsSubmitting(false);
        }
    };

    const handleBlur = () => {
        setTouched(true);
    };

    if (isSent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-sm p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                    <p className="text-gray-600 mb-8">
                        We&apos;ve sent a password reset link to <span className="font-semibold">{identifier}</span>
                    </p>
                    <Button
                        asChild
                        className="w-full py-3 bg-[#D93A00] hover:bg-[#C03300] text-white rounded-full font-bold transition-colors"
                    >
                        <Link href="/auth/login">
                            Return to Login
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white md:bg-gray-50 md:items-center md:justify-center">
            <div className="w-full max-w-md bg-white md:rounded-xl md:shadow-sm md:overflow-hidden min-h-screen md:min-h-0 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <Link href="/auth/login" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <Link href="/" className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-6 h-6 text-gray-700" />
                    </Link>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 pb-8 pt-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Reset your password</h1>
                    <p className="text-gray-600 mb-8 text-[15px] leading-relaxed">
                        Enter your email address or username
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <FloatingLabelInput
                            label="Email or username"
                            name="identifier"
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            onBlur={handleBlur}
                            error={touched && !identifier ? "Please enter your email or username" : ""}
                            showValidIcon={identifier}
                            required
                        />

                        <div className="pt-2">
                            <Link href="#" className="text-blue-600 font-medium text-sm hover:underline">
                                Need help?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={!identifier || isSubmitting}
                            className="w-full py-3 bg-[#D93A00] hover:bg-[#C03300] text-white rounded-full font-bold text-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-4"
                        >
                            {isSubmitting ? "Sending..." : "Reset password"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}