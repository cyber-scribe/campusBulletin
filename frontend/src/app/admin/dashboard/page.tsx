"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API from "@/lib/api";
import { Notice } from "@/types/notice";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { NOTICE_STATUS, NoticeStatus } from "@/auth/roles";
import {LogOut, Plus, Clock, FileText, Users, BarChart3} from "lucide-react";

const CATEGORIES = ['Academic',
  'Exam', 
  'Events', 
  'Clubs', 
  'General',
  'Sports',
  'Library',
  'Placement',] as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const { logout, isAdmin, isStaff, user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<NoticeStatus | "">("");

  const load = async () => {
    try {
      const res = await API.get("/notices");
      /**
       * Some backends send:
       * { notices: [...] } or { data: [...] }
       * Ensure we grab the correct property and default to []
       */
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.notices || res.data?.data || [];

      setNotices(data);
    } catch (error) {
      console.error(error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDelete = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    try {
      await API.delete(`/notices/${id}`);
      await load(); // Reload notices after deletion
    } catch {
      alert("Failed to delete. Please try again.");
    }
  };

  const filtered = (Array.isArray(notices) ? notices : []).filter(
    (n) =>
      n.title?.toLowerCase().includes(q.toLowerCase()) &&
      (category === "" || n.category === category) &&
      (status === "" || n.status === status)
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{
      background: "linear-gradient(125deg,rgb(28, 28, 31),rgb(71, 65, 140),rgb(26, 26, 67))"}}>
        <main className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/profile" aria-label="Profile">
                <img
                  src={user?.avatarUrl || "https://via.placeholder.com/40"}
                  alt="profile"
                  className="w-10 h-10 rounded-full border-2 border-white/30 hover:border-purple-400/50 transition-all duration-300"
                />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-400/30">
                    {isAdmin ? 'Administrator' : 'Staff Member'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(isAdmin || isStaff) && (
                <Link
                  href="/admin/add"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-white hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 font-medium border border-green-400/30 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Notice
                </Link>
              )}
              
              {isAdmin && (
                <Link
                  href="/admin/approval"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-white hover:from-blue-500/40 hover:to-indigo-500/40 transition-all duration-300 font-medium border border-blue-400/30 flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Approval Queue
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                }}
                className="px-4 py-2 flex items-center gap-2 border border-white/20 rounded-xl text-white/90 hover:bg-white/10 font-medium cursor-pointer transition-all duration-300"
              >
                <span>Logout</span>
                <LogOut className="h-4 w-4 text-red-400"/>
              </button>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
              <div className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70 font-medium mb-1">Total Notices</div>
                    <div className="text-3xl font-bold text-white">{notices.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl"></div>
              <div className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70 font-medium mb-1">Filtered Results</div>
                    <div className="text-3xl font-bold text-white">{filtered.length}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/30 to-indigo-500/30">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl"></div>
              <div className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white/70 font-medium mb-1">Categories</div>
                    <div className="text-3xl font-bold text-white">
                      {new Set(notices.map((n) => n.category)).size}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/30 to-emerald-500/30">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Filters */}
          <section className="flex flex-col md:flex-row gap-4 mb-8">
            <input
              type="search"
              placeholder="Search by title..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
            />
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 min-w-[160px]"
            >
              <option value="" className="bg-gray-800 text-white">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-gray-800 text-white">
                  {c}
                </option>
              ))}
            </select>
            {/* <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => setStatus(e.target.value as NoticeStatus | "")}
              className="border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 min-w-[160px]"
            >
              <option value="" className="bg-gray-800 text-white">All Statuses</option>
              {Object.values(NOTICE_STATUS).map((s) => (
                <option key={s} value={s} className="bg-gray-800 text-white">
                  {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select> */}
          </section>

          {/* Table */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 rounded-2xl blur-xl"></div>
            <div className="relative overflow-x-auto rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
              <table className="min-w-full">
                <thead className="bg-white/10 backdrop-blur-sm border-b border-white/20">
                  <tr>
                    <th className="text-left px-6 py-4 text-white font-bold">Title</th>
                    <th className="text-left px-6 py-4 text-white font-bold">Category</th>
                    <th className="text-left px-6 py-4 text-white font-bold">Status</th>
                    <th className="text-left px-6 py-4 text-white font-bold">Date</th>
                    <th className="px-6 py-4 text-right text-white font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="px-6 py-8" colSpan={5}>
                        <div className="flex justify-center items-center">
                          <div className="w-8 h-8 border-4 border-purple-400/50 border-t-purple-400 rounded-full animate-spin"></div>
                          <p className="ml-3 text-white/70 font-medium">Loading notices...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8 text-center text-white/70" colSpan={5}>
                        No notices found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((n) => (
                      <tr key={n._id} className="border-t border-white/10 hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4 text-white font-medium">{n.title}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-400/30">
                            {n.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(n.status)}`}>
                            {n.status?.charAt(0).toUpperCase() + n.status?.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/80">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            {/* View button for all notices */}
                            <Link
                              href={`/notice/${n._id}`}
                              className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-white hover:from-blue-500/40 hover:to-indigo-500/40 transition-all duration-300 text-sm font-medium border border-blue-400/30"
                            >
                              View
                            </Link>
                            
                            {/* Staff can only edit their own draft notices or view others */}
                            {(isAdmin ||
                              (isStaff && n.status === NOTICE_STATUS.DRAFT && ((typeof n.createdBy === 'string' ? n.createdBy : (n.createdBy as { id?: string; _id?: string }).id ?? (n.createdBy as { id?: string; _id?: string })._id) === user?.id))) && (
                              <Link
                                href={`/admin/edit/${n._id}`}
                                className="px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-white hover:from-yellow-500/40 hover:to-orange-500/40 transition-all duration-300 text-sm font-medium border border-yellow-400/30"
                              >
                                Edit
                              </Link>
                            )}
                            
                            {/* Staff can submit draft notices for approval */}
                            {isStaff && !isAdmin && n.status === NOTICE_STATUS.DRAFT && 
                             ((typeof n.createdBy === 'string' ? n.createdBy : (n.createdBy as { id?: string; _id?: string }).id ?? (n.createdBy as { id?: string; _id?: string })._id) === user?.id) && (
                              <button
                                onClick={async () => {
                                  try {
                                    await API.patch(`/notices/${n._id}/submit`);
                                    await load(); // Reload notices after submission
                                  } catch {
                                    alert("Failed to submit notice for approval");
                                  }
                                }}
                                className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-white hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 text-sm font-medium border border-green-400/30"
                              >
                                Submit
                              </button>
                            )}
                            
                            {/* Admin can approve pending notices */}
                            {isAdmin && n.status === NOTICE_STATUS.PENDING_APPROVAL && (
                              <button
                                onClick={async () => {
                                  try {
                                    await API.patch(`/notices/${n._id}/approve`);
                                    await load(); // Reload notices after approval
                                  } catch {
                                    alert("Failed to approve notice");
                                  }
                                }}
                                className="px-3 py-1 rounded-lg bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-white hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 text-sm font-medium border border-green-400/30"
                              >
                                Approve
                              </button>
                            )}
                            
                            {/* Admin can reject pending notices */}
                            {isAdmin && n.status === NOTICE_STATUS.PENDING_APPROVAL && (
                              <button
                                onClick={async () => {
                                  const reason = prompt("Please provide a reason for rejection:");
                                  if (reason) {
                                    try {
                                      await API.patch(`/notices/${n._id}/reject`, { reason });
                                      await load(); // Reload notices after rejection
                                    } catch (error) {
                                      console.error(error);
                                      alert("Failed to reject notice");
                                    }
                                  }
                                }}
                                className="px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500/30 to-red-500/30 text-white hover:from-orange-500/40 hover:to-red-500/40 transition-all duration-300 text-sm font-medium border border-orange-400/30"
                              >
                                Reject
                              </button>
                            )}
                            
                            {/* Only admins can delete notices */}
                            {isAdmin && (
                              <button
                                onClick={() => onDelete(n._id)}
                                className="px-3 py-1 rounded-lg bg-gradient-to-r from-red-500/30 to-red-600/30 text-white hover:from-red-500/40 hover:to-red-600/40 transition-all duration-300 text-sm font-medium border border-red-400/30"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Helper function to get badge color based on notice status
function getStatusBadgeColor(status: NoticeStatus): string {
  switch (status) {
    case NOTICE_STATUS.DRAFT:
      return "bg-gradient-to-r from-gray-500/30 to-gray-600/30 text-gray-200 border border-gray-400/30";
    case NOTICE_STATUS.PENDING_APPROVAL:
      return "bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-200 border border-yellow-400/30";
    case NOTICE_STATUS.PUBLISHED:
      return "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-200 border border-green-400/30";
    case NOTICE_STATUS.REJECTED:
      return "bg-gradient-to-r from-red-500/30 to-red-600/30 text-red-200 border border-red-400/30";
    default:
      return "bg-gradient-to-r from-gray-500/30 to-gray-600/30 text-gray-200 border border-gray-400/30";
  }
}
