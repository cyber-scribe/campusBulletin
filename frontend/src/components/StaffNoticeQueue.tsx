"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Notice } from "@/types/notice";
import API from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Eye, Edit, Trash2 } from "lucide-react";

const StaffNoticeQueue = () => {
  const [pendingNotices, setPendingNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isStaff } = useAuth();

  const fetchPendingNotices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/notices");
      
      const allNotices: Notice[] = response.data.notices || [];
      
      const userNotices = allNotices.filter((notice: Notice) => {
        const isUserNotice = notice.createdBy === user?.id || 
                            (typeof notice.createdBy === 'object' && notice.createdBy?._id === user?.id) ||
                            (typeof notice.createdBy === 'object' && notice.createdBy?.id === user?.id);
        
        const isPending = notice.status === 'pending_approval';
        
        return isUserNotice && isPending;
      });
      
      setPendingNotices(userNotices);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending notices:", err);
      setError("Failed to load pending notices. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isStaff) {
      fetchPendingNotices();
    } else {
      router.push("/");
    }
  }, [isStaff, router, fetchPendingNotices]);

  const handleDelete = async (noticeId: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    
    try {
      await API.delete(`/notices/${noticeId}`);
      setPendingNotices(pendingNotices.filter(notice => notice._id !== noticeId));
      alert("Notice deleted successfully.");
    } catch (err) {
      console.error("Error deleting notice:", err);
      setError("Failed to delete notice. Please try again.");
    }
  };

  if (!isStaff) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-yellow-400/50 border-t-yellow-400 rounded-full animate-spin"></div>
        <p className="ml-3 text-white/70 font-medium">Loading pending notices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-red-400/30 shadow-2xl">
        <p className="text-red-300 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-xl"></div>
        <div className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/30 to-orange-500/30">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Notices Pending Approval</h2>
              <p className="text-white/70 text-sm mt-1">
                {pendingNotices.length} {pendingNotices.length === 1 ? 'notice' : 'notices'} awaiting admin review
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-orange-500/10 rounded-2xl blur-xl"></div>
        <div className="relative overflow-x-auto rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
          <table className="min-w-full">
            <thead className="bg-white/10 backdrop-blur-sm border-b border-white/20">
              <tr>
                <th className="text-left px-6 py-4 text-white font-bold">Title</th>
                <th className="text-left px-6 py-4 text-white font-bold">Category</th>
                <th className="text-left px-6 py-4 text-white font-bold">Submitted On</th>
                <th className="px-6 py-4 text-right text-white font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingNotices.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center" colSpan={4}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 rounded-full bg-white/10">
                        <Clock className="h-8 w-8 text-white/50" />
                      </div>
                      <div>
                        <p className="text-white/70 font-medium">No notices pending approval</p>
                        <p className="text-white/50 text-sm mt-1">All your submitted notices have been reviewed</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingNotices.map((notice) => (
                  <tr key={notice._id} className="border-t border-white/10 hover:bg-white/5 transition-colors duration-200">
                    <td className="px-6 py-4 text-white font-medium">{notice.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-200 border border-yellow-400/30">
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

export default StaffNoticeQueue;