"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/lib/api";
import { Notice } from "@/types/notice";
import ProtectedRoute from "@/components/ProtectedRoute";
import NoticeForm from "@/components/NoticeForm";
import { ROLES } from "@/auth/roles";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ArrowLeft, Edit, AlertCircle } from "lucide-react";

export default function StaffEditNoticePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await API.get<Notice>(`/notices/${id}`);
        const noticeData = res.data;
        // Check if createdBy is an object before accessing properties
        const createdById = typeof noticeData.createdBy === 'object' && noticeData.createdBy !== null
          ? noticeData.createdBy.id
          : noticeData.createdBy;

         // Check if user owns this notice
        if (createdById === user?.id) {
          setNotice(noticeData);
        } else {
          setError("You can only edit your own notices.");
        }
      } catch {
        setError("Failed to load notice.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchNotice();
  }, [id, user]);

  const handleSuccess = () => {
    router.push("/staff/dashboard");
    router.refresh();
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={[ROLES.STAFF]}>
        <div className="min-h-screen flex items-center justify-center" style={{
          background: "linear-gradient(125deg,rgb(28, 28, 31),rgb(71, 65, 140),rgb(26, 26, 67))"
        }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-400/50 border-t-purple-400 rounded-full animate-spin"></div>
            <p className="text-white/70 font-medium">Loading notice...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !notice) {
    return (
      <ProtectedRoute requiredRoles={[ROLES.STAFF]}>
        <div className="min-h-screen" style={{
          background: "linear-gradient(125deg,rgb(28, 28, 31),rgb(71, 65, 140),rgb(26, 26, 67))"
        }}>
          <main className="max-w-4xl mx-auto p-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur-xl"></div>
              <div className="relative rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-red-400/30 shadow-2xl p-6">
                <div className="flex items-center gap-3 text-red-300">
                  <AlertCircle className="h-6 w-6" />
                  <p className="text-lg font-medium">{error || "Notice not found"}</p>
                </div>
                <Link 
                  href="/staff/dashboard"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

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
                  <Edit className="h-6 w-6" />
                  Edit Notice
                </h1>
                <p className="text-white/70 text-sm mt-1">Modify your draft notice details</p>
              </div>
            </div>
          </header>

          {/* Form Container */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 rounded-2xl blur-xl"></div>
            <div className="relative rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl p-6">
              <NoticeForm notice={notice} onSuccess={handleSuccess} />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
