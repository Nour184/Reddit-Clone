"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FloatingLabelInput from "components/shared/FloatingLabelInput";
import { Button } from "components/ui/button";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const username = searchParams.get("user");

    const [formData, setFormData] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // If no username in params, redirect to forgot-password
        if (!username) {
            router.push("/auth/forgot-password");
        }
    }, [username, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newErrors = {};

        // Validation
        if (!formData.newPassword) {
            newErrors.newPassword = "Password is required";
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters";
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        // Update password in localStorage
        try {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const userIndex = users.findIndex(u => u.username === username);

            if (userIndex !== -1) {
                users[userIndex].password = formData.newPassword;
                localStorage.setItem("users", JSON.stringify(users));

                // Redirect to login
                router.push("/auth/login");
            } else {
                setErrors({ form: "User not found" });
            }
        } catch (error) {
            console.error("Error updating password", error);
            setErrors({ form: "Failed to update password" });
        }

        setIsSubmitting(false);
    };

    const isValidPassword = (password) => password && password.length >= 6;

    if (!username) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header with Back Button */}
            <div className="p-4">
                <Link href="/auth/forgot-password" className="inline-flex p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
            </div>

            <div className="flex flex-col items-center flex-1 px-4 pt-4 pb-12 max-w-md mx-auto w-full">
                <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
                    Reset your password
                </h1>
                <p className="text-center text-gray-500 mb-8 text-sm leading-relaxed">
                    Enter a new password for <span className="font-semibold">{username}</span>
                </p>

                <form onSubmit={handleSubmit} className="w-full space-y-4">

                    {/* New Password Field */}
                    <FloatingLabelInput
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        error={errors.newPassword}
                        showValidIcon={isValidPassword(formData.newPassword)}
                        required
                    />

                    {/* Confirm Password Field */}
                    <FloatingLabelInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        showValidIcon={formData.confirmPassword && formData.newPassword === formData.confirmPassword}
                        required
                    />

                    {errors.form && <p className="text-red-500 text-sm text-center">{errors.form}</p>}

                    <div className="pt-8">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isValidPassword(formData.newPassword) || formData.newPassword !== formData.confirmPassword}
                            className="w-full py-3 bg-[#D93A00] hover:bg-[#C03300] text-white rounded-full font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Updating..." : "Set New Password"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}