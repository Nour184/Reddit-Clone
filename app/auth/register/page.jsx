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
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    generateRandomUsername();
  }, []);

  const generateRandomUsername = () => {
    const adjectives = ["Happy", "Lucky", "Sunny", "Clever", "Brave"];
    const nouns = ["Panda", "Tiger", "Eagle", "Fox", "Wolf"];
    const randomNum = Math.floor(Math.random() * 10000);

    const username = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${randomNum}`;

    setFormData((prev) => ({ ...prev, username }));
  };

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isValidPassword = (password) => password.length >= 6;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const newErrors = {};
    if (!isValidEmail(formData.email)) newErrors.email = "Invalid email";
    if (!formData.username) newErrors.username = "Username required";
    if (!isValidPassword(formData.password))
      newErrors.password = "Password must be at least 6 characters";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.username, // 🔑 mapping happens here
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ server: data.error || "Registration failed" });
        return;
      }

      router.push("/auth/login");
    } catch (err) {
      setErrors({ server: "Network error. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-4">
        <Link href="/" className="inline-flex p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </Link>
      </div>

      <div className="flex flex-col items-center flex-1 px-4 pt-4 pb-12 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-center mb-2">
          Create your username and password
        </h1>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <FloatingLabelInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            rightAction={
              <button type="button" onClick={generateRandomUsername}>
                <RefreshCw className="w-5 h-5" />
              </button>
            }
            ref={usernameRef}
            required
          />

          <FloatingLabelInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && errors.password}
            ref={passwordRef}
            required
          />

          <FloatingLabelInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors.email}
            ref={emailRef}
            required
          />

          {errors.server && (
            <p className="text-red-600 text-sm">{errors.server}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#D93A00] text-white rounded-full"
          >
            {isSubmitting ? "Creating account..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}