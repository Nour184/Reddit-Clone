"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import FloatingLabelInput from "components/shared/FloatingLabelInput";
import { Button } from "components/ui/button";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(null); // null, true, false

    const passwordRef = useRef(null);
    const usernameRef = useRef(null);
    const emailRef = useRef(null);



    const handleUsernameKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            passwordRef.current.focus();
        }
    };


    const handlePasswordKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            emailRef.current.focus();
        }
    };

    const handleEmailKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            // Trigger form submit
            document.getElementById("registerForm").requestSubmit();
        }
    };


    // Generate a random username on mount
    useEffect(() => {
        generateRandomUsername();
    }, []);

    const generateRandomUsername = () => {
        const adjectives = ["Happy", "Lucky", "Sunny", "Clever", "Brave", "Calm", "Eager"];
        const nouns = ["Panda", "Tiger", "Eagle", "Dolphin", "Fox", "Wolf", "Bear"];
        const randomNum = Math.floor(Math.random() * 10000);
        const newUsername = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${randomNum}`;

        setFormData(prev => ({ ...prev, username: newUsername }));
        validateUsername(newUsername);
    };

    const validateUsername = (username) => {
        if (!username) {
            setIsUsernameAvailable(null);
            return;
        }
        try {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
            setIsUsernameAvailable(!exists);
        } catch (e) {
            setIsUsernameAvailable(true); // Default to available if storage fails
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "username") {
            validateUsername(value);
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const isValidPassword = (password) => password && password.length >= 6;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Final validation
        const newErrors = {};
        if (!formData.email || !isValidEmail(formData.email)) newErrors.email = "Invalid email";
        if (!formData.username || !isUsernameAvailable) newErrors.username = "Invalid username";
        if (!formData.password || !isValidPassword(formData.password)) newErrors.password = "Invalid password";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            const newUser = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                createdAt: new Date().toISOString(),
            };
            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));
            router.push("/auth/login");
        } catch (error) {
            console.error("Registration failed", error);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Header with Back Button */}
            <div className="p-4">
                <Link href="/" className="inline-flex p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
            </div>

            <div className="flex flex-col items-center flex-1 px-4 pt-4 pb-12 max-w-md mx-auto w-full">
                <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
                    Create your username and password
                </h1>
                <p className="text-center text-gray-500 mb-8 text-sm leading-relaxed">
                    Reddit is anonymous, so your username is what you&apos;ll go by here. Choose wisely—because once you get a name, you can&apos;t change it.
                </p>

                <form id="registerForm" onSubmit={handleSubmit} className="w-full space-y-4">


                    {/* Username Field */}
                    <FloatingLabelInput
                        label="Username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!isUsernameAvailable && formData.username ? "Username taken" : ""}
                        showValidIcon={isUsernameAvailable && formData.username}
                        rightAction={
                            <button
                                type="button"
                                onClick={generateRandomUsername}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <RefreshCw className="w-5 h-5 text-gray-600" />
                            </button>
                        }
                        required
                        ref={usernameRef}
                        onKeyDown={handleUsernameKeyDown}
                    />
                    {isUsernameAvailable && formData.username && (
                        <p className="text-green-600 text-xs -mt-2 px-4 font-medium">
                            Nice! Username available
                        </p>
                    )}

                    {/* Password Field */}
                    <FloatingLabelInput
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.password && !isValidPassword(formData.password) ? "Password must be at least 6 characters" : ""}
                        showValidIcon={isValidPassword(formData.password)}
                        required
                        ref={passwordRef}
                        onKeyDown={handlePasswordKeyDown}
                    />

                    {/* Email Field */}
                    <FloatingLabelInput
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && !isValidEmail(formData.email) ? "Invalid email" : ""}
                        showValidIcon={isValidEmail(formData.email)}
                        required
                        ref={emailRef}
                        onKeyDown={handleEmailKeyDown}
                    />

                    <div className="pt-8">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isUsernameAvailable || !isValidPassword(formData.password) || !isValidEmail(formData.email)}
                            className="w-full py-3 bg-[#D93A00] hover:bg-[#C03300] text-white rounded-full font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Continue
                        </Button>
                    </div>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                    Already a redditor?{" "}
                    <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
}