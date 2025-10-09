"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Notice } from "@/types/notice";
import { NOTICE_STATUS } from "@/auth/roles";
import API from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Edit, Trash2, Eye, Send, FileText } from "lucide-react";

const StaffDraftQueue = () => {
  const [draftNotices, setDraftNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isStaff } = useAuth();

  const fetchDraftNotices = async () => {
    try {
      setLoading(true);
      const response = await API.get("/notices");
      
      console.log("API Response:", response.data);
      console.log("Current user:", user);
      
      // Get all notices from response
      const allNotices = response.data.notices || [];
      console.log("All notices:", allNotices);
      
      // Filter notices to only show drafts created by the current user
      const userNotices = allNotices.filter(notice => {
        console.log("=== FILTERING DRAFT NOTICE ===");
        console.log("Notice:", notice);
        console.log("Notice ID:", notice._id);
        console.log("Notice title:", notice.title);
        console.log("Notice createdBy:", notice.createdBy);
        console.log("Notice status:", notice.status);
        console.log("Current user ID:", user?.id);
        
        // Check if this notice belongs to current user and is a draft
        const isUserNotice = notice.createdBy === user?.id || 
                            (typeof notice.createdBy === 'object' && notice.createdBy?._id === user?.id) ||
                            (typeof notice.createdBy === 'object' && notice.createdBy?.id === user?.id);
        
        const isDraft = notice.status === 'draft' || notice.status === 'DRAFT';
        
        console.log("Is user notice:", isUserNotice);
        console.log("Is draft:", isDraft);
        console.log("Final result:", isUserNotice && isDraft);
        console.log("=== END FILTERING ===");
        
        return isUserNotice && isDraft;
      });
      
      console.log("Filtered user draft notices:", userNotices);
      setDraftNotices(userNotices);
      setError(null);
    } catch (err) {
      console.error("Error fetching draft notices:", err);
      setError("Failed to load draft notices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not staff
    if (!isStaff) {
      router.push("/");
      return;
    }

    fetchDraftNotices();
  }, [isStaff, router]);

  const handleDelete = async (noticeId: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    
    try {
      await API.delete(`/notices/${noticeId}`);
      // Remove from list
      setDraftNotices(draftNotices.filter(notice => notice._id !== noticeId));
      alert("Draft deleted successfully.");
    } catch (err) {
      console.error("Error deleting draft:", err);
      setError("Failed to delete draft. Please try again.");
    }
  };

  const handleSubmitForApproval = async (noticeId: string) => {
    try {
      console.log("Submitting notice for approval:", noticeId);
      const response = await API.patch(`/notices/${noticeId}/submit`);
      console.log("Submit response:", response.data);
      
      // Remove from draft list
      setDraftNotices(draftNotices.filter(notice => notice._id !== noticeId));
      
      // Refresh both draft and pending lists
      await fetchDraftNotices();
      if ((window as any).refreshStaffPending) {
        (window as any).refreshStaffPending();
      }
      
      alert("Notice submitted for approval successfully.");
    } catch (err) {
      console.error("Error submitting notice for approval:", err);
      setError("Failed to submit notice for approval. Please try again.");
    }
  };

  if (!isStaff) {
    return null; // Don't render anything if not staff
  }

  if (error) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur-xl"></div>
        <div className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-red-400/30 shadow-2xl">
          <p className="text-red-300 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
        <div className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">My Draft Notices</h2>
              <p className="text-white/70 text-sm mt-1">
                {draftNotices.length} {draftNotices.length === 1 ? 'draft' : 'drafts'} ready for editing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 rounded-2xl blur-xl"></div>
        <div className="relative overflow-x-auto rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
          <table className="min-w-full">
            <thead className="bg-white/10 backdrop-blur-sm border-b border-white/20">
              <tr>
                <th className="text-left px-6 py-4 text-white font-bold">Title</th>
                <th className="text-left px-6 py-4 text-white font-bold">Category</th>
                <th className="text-left px-6 py-4 text-white font-bold">Created On</th>
                <th className="px-6 py-4 text-right text-white font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-8" colSpan={4}>
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-purple-400/50 border-t-purple-400 rounded-full animate-spin"></div>
                      <p className="ml-3 text-white/70 font-medium">Loading draft notices...</p>
                    </div>
                  </td>
                </tr>
              ) : draftNotices.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center" colSpan={4}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-full bg-white/10">
                        <FileText className="h-8 w-8 text-white/50" />
                      </div>
                      <div>
                        <p className="text-white/70 font-medium">No draft notices found</p>
                        <p className="text-white/50 text-sm mt-1">Create your first notice to get started</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                draftNotices.map((notice) => (
                  <tr key={notice._id} className="border-t border-white/10 hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 text-white font-medium">{notice.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-400/30">
                        {notice.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/notice/${notice._id}`}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-white hover:from-blue-500/40 hover:to-indigo-500/40 transition-all duration-300 text-sm font-medium border border-blue-400/30 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                        <Link
                          href={`/staff/edit/${notice._id}`}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-white hover:from-yellow-500/40 hover:to-orange-500/40 transition-all duration-300 text-sm font-medium border border-yellow-400/30 flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-500/30 to-red-600/30 text-white hover:from-red-500/40 hover:to-red-600/40 transition-all duration-300 text-sm font-medium border border-red-400/30 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                        <button
                          onClick={() => handleSubmitForApproval(notice._id)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-white hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 text-sm font-medium border border-green-400/30 flex items-center gap-1"
                        >
                          <Send className="h-3 w-3" />
                          Submit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDraftQueue;