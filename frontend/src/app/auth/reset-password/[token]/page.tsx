"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/lib/api";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!token || typeof token !== "string") {
      setError("Reset token is missing or invalid.");
      return;
    }

    if (!password.trim() || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await API.post("/auth/reset-password", {
        token,
        password,
      });

      setSuccessMessage(response.data?.message || "Password has been reset successfully.");

      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to reset password. Please try again.";
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
        <div className="relative bg-white/10 border border-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-white">Reset Password</h1>
            <p className="text-sm text-white/70">Enter and confirm your new password to regain access to your account.</p>
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
              <label htmlFor="password" className="block text-sm font-medium text-white/80">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:border-purple-300/40"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.31 18.31 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.3 18.3 0 0 1-3.22 4.18M14.12 9.88A3 3 0 1 1 9.88 14.12M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-white/80">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:border-purple-300/40"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.31 18.31 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.3 18.3 0 0 1-3.22 4.18M14.12 9.88A3 3 0 1 1 9.88 14.12M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500/80 to-indigo-500/80 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Resetting password..." : "Reset password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
