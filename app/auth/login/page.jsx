"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import FloatingLabelInput from "components/shared/FloatingLabelInput";
import { Button } from "components/ui/button";
import { signIn } from "next-auth/react";
import { setSession } from "lib/session";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const handleEmailKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            passwordRef.current.focus();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors.form) setErrors((prev) => ({ ...prev, form: "" }));
        if (errors[name]) setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTouched({ email: true, password: true });

        const newErrors = {};
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            // Use NextAuth signIn function
            const result = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result.error) {
                setErrors({ form: result.error });
                setIsSubmitting(false);
                return;
            }

            // Optional: store session data locally
            setSession({
                username: formData.email,
                loggedIn: true,
            });

            router.push("/"); // redirect on success
        } catch (error) {
            console.error("Login failed", error);
            setErrors({ form: "Unable to connect to server" });
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled = !formData.email || !formData.password || isSubmitting;

    return (
        <div className="flex flex-col min-h-screen bg-white md:bg-gray-50 md:items-center md:justify-center">
            <div className="w-full max-w-md bg-white md:rounded-xl md:shadow-sm md:overflow-hidden min-h-screen md:min-h-0 flex flex-col">
                <div className="flex items-center justify-between p-4">
                    <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </Link>
                    <Link href="/" className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-6 h-6 text-gray-700" />
                    </Link>
                </div>

                <div className="flex-1 px-6 pb-8 pt-2">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Log In</h1>
                    <p className="text-gray-600 mb-8 text-[15px] leading-relaxed">
                        By continuing, you agree to our User Agreement and acknowledge that you understand the Privacy Policy.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FloatingLabelInput
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.email && errors.email}
                            required
                            ref={emailRef}
                            onKeyDown={handleEmailKeyDown}
                        />

                        <FloatingLabelInput
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.password && errors.password}
                            required
                            ref={passwordRef}
                        />

                        {errors.form && (
                            <p className="text-red-500 text-sm text-center">{errors.form}</p>
                        )}

                        <div className="pt-2">
                            <Link href="/auth/forgot-password" className="text-blue-600 font-medium text-sm hover:underline">
                                Forgot password?
                            </Link>
                        </div>

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