"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import API from "@/lib/api";
import { Notice } from "@/types/notice";
import { useRouter } from "next/navigation";

const CATEGORIES = ["Exam", "Event", "General", "Clubs", "Academic"] as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

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
      router.push("/admin/login");
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
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch {
      alert("Failed to delete. Please try again.");
    }
  };

  const filtered = (Array.isArray(notices) ? notices : []).filter(
    (n) =>
      n.title?.toLowerCase().includes(q.toLowerCase()) &&
      (category === "" || n.category === category)
  );

  return (
    <main className="max-w-6xl mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">CampusBulletin</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-2 rounded border text-sm hover:bg-gray-50"
          >
            Public View
          </Link>
          <Link
            href="/admin/add"
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            + Add Notice
          </Link>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/admin/login");
            }}
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Filters */}
      <section className="flex gap-3 mb-4">
        <input
          type="search"
          placeholder="Search by title..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Total Notices</div>
          <div className="text-2xl font-semibold">{notices.length}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">This Category</div>
          <div className="text-2xl font-semibold">{filtered.length}</div>
        </div>
        <div className="p-4 rounded border bg-white">
          <div className="text-sm text-gray-500">Categories</div>
          <div className="text-2xl font-semibold">
            {new Set(notices.map((n) => n.category)).size}
          </div>
        </div>
      </section>

      {/* Table */}
      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Category</th>
              <th className="text-left px-4 py-2">Date</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6" colSpan={4}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6" colSpan={4}>
                  No notices found.
                </td>
              </tr>
            ) : (
              filtered.map((n) => (
                <tr key={n._id} className="border-t">
                  <td className="px-4 py-2">{n.title}</td>
                  <td className="px-4 py-2">{n.category}</td>
                  <td className="px-4 py-2">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/edit/${n._id}`}
                        className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDelete(n._id)}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
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
    </main>
  );
}
