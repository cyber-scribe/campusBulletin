"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import API from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await API.post("/auth/forgot-password", { email });
      setSuccessMessage(
        response.data?.message ||
          "If an account with that email exists, a password reset link has been sent."
      );
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to request password reset.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4" style={{
          background:
            "linear-gradient(125deg,rgb(28, 28, 31),rgb(103, 98, 158),rgb(26, 26, 67))",
        }}>
      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
        <div className="relative bg-white/20 border border-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-white">Forgot Password</h1>
            <p className="text-sm text-white/70">
              Enter the email associated with your account and we&apos;ll send you a reset link.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-400/10 text-red-200 px-4 py-3 text-sm" role="alert">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 text-emerald-200 px-4 py-3 text-sm" role="status">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white/80">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:border-purple-300/40"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500/80 to-indigo-500/80 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending reset link..." : "Send reset link"}
            </button>
          </form>

          <div className="text-center text-sm text-white/70 space-y-1">
            <p>
              Remembered your password?{" "}
              <Link href="/" className="font-medium text-purple-200 hover:text-purple-100">
                Go back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
