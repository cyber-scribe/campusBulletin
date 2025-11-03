"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import NoticeForm from "@/components/NoticeForm";
import { ROLES } from "@/auth/roles";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default function StaffAddNoticePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/staff/dashboard");
    router.refresh();
  };

  return (
    <ProtectedRoute requiredRoles={[ROLES.STAFF]}>
      <div className="min-h-screen" style={{
        background: "linear-gradient(125deg,rgb(28, 28, 31),rgb(71, 65, 140),rgb(26, 26, 67))"
      }}>
        <main className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link 
                href="/staff/dashboard" 
                className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Create New Notice
                </h1>
                <p className="text-white/70 text-sm mt-1">Draft a new notice for admin approval</p>
              </div>
            </div>
          </header>

          {/* Form Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 rounded-2xl blur-xl"></div>
            <div className="relative rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl p-6">
              <NoticeForm onSuccess={handleSuccess} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
