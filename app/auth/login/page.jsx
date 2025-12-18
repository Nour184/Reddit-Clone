"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import FloatingLabelInput from "components/shared/FloatingLabelInput";
import { Button } from "components/ui/button";
import { setSession } from "lib/session";


export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    const handleUsernameKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // prevent form submission
            passwordRef.current.focus(); // move focus to password
        }
    };


    // Username validation state
    const [usernameExists, setUsernameExists] = useState(null); // null = not checked, true = exists, false = doesn't exist

    // Ref to track debounce timeout
    const debounceTimeoutRef = useRef(null);

    // Check if username exists in localStorage
    const checkUsernameExists = (username, setError = true) => {
        if (!username || username.trim() === "") {
            setUsernameExists(null);
            return null;
        }

        try {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const exists = users.some(
                (u) => u.username.toLowerCase() === username.toLowerCase()
            );
            setUsernameExists(exists);

            // Set error if username doesn't exist
            if (!exists && setError) {
                setErrors((prev) => ({ ...prev, username: "Username not found" }));
            } else if (exists) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.username;
                    return newErrors;
                });
            }

            return exists;
        } catch (error) {
            console.error("Error checking username:", error);
            return null;
        }
    };

    // Debounced check for username
    const debouncedCheckUsername = (username) => {
        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout
        debounceTimeoutRef.current = setTimeout(() => {
            if (touched.username) {
                checkUsernameExists(username, true);
            }
        }, 400);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear form-level error when user types
        if (errors.form) {
            setErrors((prev) => ({ ...prev, form: "" }));
        }

        // Reset username validation when user types
        if (name === "username") {
            setUsernameExists(null);
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.username;
                return newErrors;
            });
            // Trigger debounced check if already touched
            if (touched.username) {
                debouncedCheckUsername(value);
            }
        }

        // Clear password error when user types
        if (name === "password" && errors.password) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.password;
                return newErrors;
            });
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        // Check username existence on blur (immediate, not debounced)
        if (name === "username" && formData.username) {
            // Clear any pending debounce
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            checkUsernameExists(formData.username, true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Clear any pending debounce to avoid interference
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Mark all fields as touched
        setTouched({ username: true, password: true });

        const newErrors = {};

        // Validation
        if (!formData.username) {
            newErrors.username = "Username is required";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        // Check credentials against localStorage
        try {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const user = users.find(
                (u) => u.username.toLowerCase() === formData.username.toLowerCase()
            );

            if (!user) {
                // Username doesn't exist
                setUsernameExists(false);
                setErrors({ username: "Username not found" });
                setIsSubmitting(false);
                return;
            }

            // Username exists
            setUsernameExists(true);

            if (user.password !== formData.password) {
                // Username exists but password is wrong
                setErrors({ password: "Password is incorrect" });
                setIsSubmitting(false);
                return;
            }

            // Login successful - store user data first
            setSession({
                username: user.username,
                loggedIn: true,
                avatar: user.avatar || "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_0.png", // Default avatar if missing
                karma: user.karma || 0
            });

            // Then redirect
            router.push("/");
        } catch (error) {
            console.error("Login failed", error);
            setErrors({ form: "Login failed. Please try again." });
            setIsSubmitting(false);
        }
    };

    // Determine if submit button should be disabled
    const isSubmitDisabled = !formData.username || !formData.password || isSubmitting;

    // Determine username field icon state
    const showUsernameValidIcon = usernameExists === true && !errors.username;
    const showUsernameInvalidIcon = usernameExists === false && touched.username;

    return (
        <div className="flex flex-col min-h-screen bg-white md:bg-gray-50 md:items-center md:justify-center">
            <div className="w-full max-w-md bg-white md:rounded-xl md:shadow-sm md:overflow-hidden min-h-screen md:min-h-0 flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <Link href="/" className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-6 h-6 text-gray-700" />
                    </Link>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 pb-8 pt-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Log In</h1>
                    <p className="text-gray-600 mb-8 text-[15px] leading-relaxed">
                        By continuing, you agree to our User Agreement and acknowledge that you understand the Privacy Policy.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username Field */}
                        <FloatingLabelInput
                            label="Username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.username && errors.username}
                            showValidIcon={showUsernameValidIcon}
                            showInvalidIcon={showUsernameInvalidIcon}
                            required
                            ref={usernameRef}
                            onKeyDown={handleUsernameKeyDown}
                        />

                        {/* Password Field - No validation icon */}
                        <FloatingLabelInput
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.password && errors.password}
                            showValidIcon={false}
                            showInvalidIcon={false}
                            required
                            ref={passwordRef}
                        //  onKeyDown={handlePasswordKeyDown}
                        />

                        {/* Form-level error */}
                        {errors.form && (
                            <p className="text-red-500 text-sm text-center">{errors.form}</p>
                        )}

                        {/* Forgot Password Link */}
                        <div className="pt-2">
                            <Link href="/auth/forgot-password" className="text-blue-600 font-medium text-sm hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitDisabled}
                                className="w-full py-3 bg-[#D93A00] hover:bg-[#C03300] text-white rounded-full font-bold text-base transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Logging in..." : "Log In"}
                            </Button>
                        </div>
                    </form>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-sm text-gray-600">
                        New to Reddit?{" "}
                        <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}