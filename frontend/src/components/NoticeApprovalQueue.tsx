"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Notice } from "@/types/notice";
import { NOTICE_STATUS, NoticeStatus } from "@/auth/roles";
import API from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, XCircle, Eye, User, Clock } from "lucide-react";

const NoticeApprovalQueue = () => {
  const [pendingNotices, setPendingNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<NoticeStatus | "">("");
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      router.push("/");
      return;
    }

    fetchPendingNotices();
  }, [isAdmin, router]);

  const fetchPendingNotices = async () => {
    try {
      setLoading(true);
      const response = await API.get("/notices");
      
      console.log("Admin Approval Queue - API Response:", response.data);
      
      // Get all notices from response
      const allNotices = response.data.notices || [];
      console.log("All notices:", allNotices);
      
      // Filter to show ALL pending notices from ANY user (admin sees everything)
      const pendingNotices = allNotices.filter(notice => {
        const isPending = notice.status === 'pending_approval' || 
                         notice.status === 'PENDING_APPROVAL' ||
                         notice.status === 'pending';
        
        console.log("Notice:", notice.title, "Status:", notice.status, "Is Pending:", isPending);
        return isPending;
      });
      
      console.log("All pending notices for admin:", pendingNotices);
      setPendingNotices(pendingNotices);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending notices:", err);
      setError("Failed to load pending notices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (noticeId: string) => {
    try {
      console.log("Approving notice:", noticeId);
      const response = await API.patch(`/notices/${noticeId}/approve`);
      console.log("Approve response:", response.data);
      
      // Remove from list and refresh
      setPendingNotices(pendingNotices.filter(notice => notice._id !== noticeId));
      alert("Notice approved and published successfully.");
      
      // Refresh the list to ensure consistency
      await fetchPendingNotices();
    } catch (err) {
      console.error("Error approving notice:", err);
      setError("Failed to approve notice. Please try again.");
    }
  };

  const handleReject = async (noticeId: string) => {
    try {
      const reason = prompt("Please provide a reason for rejection:");
      if (!reason) return; // Cancel if no reason provided
      
      console.log("Rejecting notice:", noticeId, "Reason:", reason);
      const response = await API.patch(`/notices/${noticeId}/reject`, { rejectionReason: reason });
      console.log("Reject response:", response.data);
      
      // Remove from list and refresh
      setPendingNotices(pendingNotices.filter(notice => notice._id !== noticeId));
      alert("Notice rejected successfully. The staff has been notified.");
      
      // Refresh the list to ensure consistency
      await fetchPendingNotices();
    } catch (err) {
      console.error("Error rejecting notice:", err);
      setError("Failed to reject notice. Please try again.");
    }
  };

  if (!isAdmin) {
    return null; // Don't render anything if not admin
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
      {/* Header with Stats and Filter in same line */}
      <div className="flex items-center justify-between gap-6">
        {/* Stats Card */}
        <div className="flex items-center justify-between gap-3 border border-white/50 rounded-2xl p-6 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 flex-1">
          <div>
            <h2 className="text-sm font-bold text-white/70 font-medium tracking-tight">Total Submissions</h2>
            <p className="text-white text-3xl font-bold">
              {pendingNotices.length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/30 to-indigo-500/30">
            <Clock className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 rounded-2xl blur-xl">
        </div> 
        <div className="relative overflow-x-auto rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
          <table className="min-w-full">
            <thead className="bg-white/10 backdrop-blur-sm border-b border-white/20">
              <tr>
                <th className="text-left px-6 py-4 text-white font-bold">Title</th>
                <th className="text-left px-6 py-4 text-white font-bold">Category</th>
                <th className="text-left px-6 py-4 text-white font-bold">Created By</th>
                <th className="text-left px-6 py-4 text-white font-bold">Submitted On</th>
                <th className="px-6 py-4 text-right text-white font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-8" colSpan={5}>
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-blue-400/50 border-t-blue-400 rounded-full animate-spin"></div>
                      <p className="ml-3 text-white/70 font-medium">Loading pending notices...</p>
                    </div>
                  </td>
                </tr>
              ) : pendingNotices.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center" colSpan={5}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-full bg-white/10">
                        <Clock className="h-8 w-8 text-white/50" />
                      </div>
                      <div>
                        <p className="text-white/70 font-medium">No notices pending approval</p>
                        <p className="text-white/50 text-sm mt-1">All submitted notices have been reviewed</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingNotices.map((notice) => (
                  <tr key={notice._id} className="border-t border-white/10 hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 text-white font-medium">{notice.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-200 border border-blue-400/30">
                        {notice.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-white/50" />
                        <span className="text-white/80">
                          {typeof notice.createdBy === 'object' && notice.createdBy?.name 
                            ? notice.createdBy.name 
                            : 'Unknown Staff'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/notice/${notice._id}`}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white hover:from-purple-500/40 hover:to-pink-500/40 transition-all duration-300 text-sm font-medium border border-purple-400/30 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Link>
                        <button
                          onClick={() => handleApprove(notice._id)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-white hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 text-sm font-medium border border-green-400/30 flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(notice._id)}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-500/30 to-red-600/30 text-white hover:from-red-500/40 hover:to-red-600/40 transition-all duration-300 text-sm font-medium border border-red-400/30 flex items-center gap-1"
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
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

export default NoticeApprovalQueue;