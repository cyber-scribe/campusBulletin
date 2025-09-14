"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Notice } from "@/types/notice";
import { NOTICE_STATUS, NoticeStatus } from "@/auth/roles";
import API from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const StaffDraftQueue = () => {
  const [draftNotices, setDraftNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isStaff } = useAuth();

  useEffect(() => {
    // Redirect if not staff
    if (!isStaff) {
      router.push("/");
      return;
    }

    fetchDraftNotices();
  }, [isStaff, router]);

  const fetchDraftNotices = async () => {
    try {
      setLoading(true);
      const response = await API.get<{ notices: Notice[] }>("/notices", {
        params: { status: NOTICE_STATUS.DRAFT }
      });
      
      // Filter notices to only show those created by the current user
      const userNotices = response.data.notices.filter(
        notice => typeof notice.createdBy === 'object' && notice.createdBy._id === user?._id
      );
      
      setDraftNotices(userNotices);
      setError(null);
    } catch (err) {
      console.error("Error fetching draft notices:", err);
      setError("Failed to load draft notices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
      await API.patch(`/notices/${noticeId}/submit`);
      // Remove from draft list
      setDraftNotices(draftNotices.filter(notice => notice._id !== noticeId));
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
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Your Draft Notices</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-left px-4 py-2">Created On</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={4}>
                  Loading draft notices...
                </td>
              </tr>
            ) : draftNotices.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={4}>
                  You have no draft notices.
                </td>
              </tr>
            ) : (
              draftNotices.map((notice) => (
              <tr key={notice._id} className="border-t">
                <td className="px-4 py-2">{notice.title}</td>
                <td className="px-4 py-2">
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {notice.category}
                  </span>
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
                    <Link
                      href={`/staff/edit/${notice._id}`}
                      className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(notice._id)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleSubmitForApproval(notice._id)}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 text-xs"
                    >
                      Submit for Approval
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

export default StaffDraftQueue;