"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Notice } from "@/types/notice";
import { NOTICE_STATUS, NoticeStatus } from "@/auth/roles";
import API from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const NoticeApprovalQueue = () => {
  const [pendingNotices, setPendingNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      const response = await API.get<{ notices: Notice[] }>("/notices", {
        params: { status: NOTICE_STATUS.PENDING_APPROVAL }
      });
      setPendingNotices(response.data.notices);
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
      await API.patch(`/notices/${noticeId}/approve`);
      // Remove from list or refresh
      setPendingNotices(pendingNotices.filter(notice => notice._id !== noticeId));
      alert("Notice approved and published successfully.");
    } catch (err) {
      console.error("Error approving notice:", err);
      setError("Failed to approve notice. Please try again.");
    }
  };

  const handleReject = async (noticeId: string) => {
    try {
      const reason = prompt("Please provide a reason for rejection:");
      if (!reason) return; // Cancel if no reason provided
      
      await API.patch(`/notices/${noticeId}/reject`, { rejectionReason: reason });
      // Remove from list or refresh
      setPendingNotices(pendingNotices.filter(notice => notice._id !== noticeId));
      alert("Notice rejected successfully. The staff has been notified.");
    } catch (err) {
      console.error("Error rejecting notice:", err);
      setError("Failed to reject notice. Please try again.");
    }
  };

  if (!isAdmin) {
    return null; // Don't render anything if not admin
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Notices Pending Approval</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-left px-4 py-2">Created By</th>
              <th className="text-left px-4 py-2">Created On</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={5}>
                  Loading pending notices...
                </td>
              </tr>
            ) : pendingNotices.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={5}>
                  No notices pending approval.
                </td>
              </tr>
            ) : (
              pendingNotices.map((notice) => (
              <tr key={notice._id} className="border-t">
                <td className="px-4 py-2">{notice.title}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {notice.category}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {typeof notice.createdBy === 'object' ? notice.createdBy.name : 'Unknown'}
                </td>
                <td className="px-4 py-2">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 justify-end">
                    <Link
                      href={`/notice/${notice._id}`}
                      className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-xs"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleApprove(notice._id)}
                      className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(notice._id)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            )))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NoticeApprovalQueue;