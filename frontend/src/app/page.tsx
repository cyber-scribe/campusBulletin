"use client";
import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Notice } from "@/types/notice";
import NoticeCard from "@/components/NoticeCard";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    API.get("/notices")
      .then((res) => {
        // Ensure we only set an array to avoid filter errors
        if (Array.isArray(res.data.notices)) {
          setNotices(res.data.notices);
        } else {
          console.warn("Unexpected notices data:", res.data);
          setNotices([]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Safely filter notices
  const filtered = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === "" || n.category === category)
  );

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Navbar />
      <main className="max-w-6xl mx-auto p-4" style={{ backgroundColor: 'white', margin: '0 auto', maxWidth: '72rem', padding: '1rem' }}>
        <h1 className="text-2xl font-bold mb-4" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Notices</h1>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full"
            style={{ border: '1px solid #d1d5db', padding: '0.5rem', borderRadius: '0.375rem', width: '100%' }}
          />
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
            style={{ border: '1px solid #d1d5db', padding: '0.5rem', borderRadius: '0.375rem' }}
          >
            <option value="">All Categories</option>
            <option value="Exam">Exam</option>
            <option value="Event">Event</option>
            <option value="General">General</option>
          </select>
        </div>

        {/* Notices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.length > 0 ? (
            filtered.map((notice) => (
              <NoticeCard key={notice._id} notice={notice} />
            ))
          ) : (
            <p className="text-gray-500" style={{ color: '#6b7280' }}>No notices found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
