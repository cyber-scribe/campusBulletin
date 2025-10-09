"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import NoticeApprovalQueue from "@/components/NoticeApprovalQueue";
import { ROLES } from "@/auth/roles";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle } from "lucide-react";

export default function ApprovalDashboard() {
  const { isAuthenticated, isLoading, isAdmin, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    // Only admins can access this page
    if (!isLoading && isAuthenticated && !hasRole(ROLES.ADMIN)) {
      router.push("/admin/dashboard");
    }
  }, [isLoading, isAuthenticated, isAdmin, hasRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: "linear-gradient(125deg,rgb(28, 28, 31),rgb(71, 65, 140),rgb(26, 26, 67))"
      }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-400/50 border-t-purple-400 rounded-full animate-spin"></div>
          <p className="text-white/70 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(125deg,rgb(28, 28, 31),rgb(71, 65, 140),rgb(26, 26, 67))"
    }}>
      <main className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/dashboard" 
              className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Notices Awaiting Review
              </h1>
              <p className="text-white/70 text-sm mt-1">Review and approve pending notices from staff members</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-white border border-blue-400/30">
              Admin Only
            </div>
          </div>
        </header>

        {/* Queue Container */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 rounded-2xl"> <NoticeApprovalQueue /></div>
        </div>
      </main>
    </div>
  );
}