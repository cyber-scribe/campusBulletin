"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import API from '@/lib/api';
import { Notice } from '@/types/notice';
import {LogOut} from "lucide-react";

export default function StudentDashboard() {
  const { user, isStudent, logout } = useAuth();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (!isStudent) {
      router.push('/');
      return;
    }
    loadNotices();
  }, [isStudent, router]);

  const loadNotices = async () => {
    try {
      const res = await API.get("/notices");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.notices || res.data?.data || [];
      
      // Filter to show only published notices
      const publishedNotices = data.filter((notice: Notice) => 
        notice.status === 'published'
      );
      
      setNotices(publishedNotices);
    } catch (error) {
      console.error('Failed to load notices:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isStudent) return null;

  const filteredNotices = notices.filter(notice =>
    notice.title.toLowerCase().includes(q.toLowerCase()) &&
    (category === "" || notice.category === category)
  );

  return (
    <div className="min-h-screen" style={{
      background: "linear-gradient(125deg,rgb(28, 28, 31),rgb(71, 65, 140),rgb(26, 26, 67))"
    }}>
      <div className="max-w-6xl mx-auto p-4">
        <header className="flex items-center justify-between mb-4 opacity-80">
          <div className="flex items-center gap-3">
            <Link href="/profile" aria-label="Profile">
              <img
                src={user?.avatarUrl || "https://via.placeholder.com/40"}
                alt="profile"
                className="w-10 h-10 rounded-full border border-white/30"
              />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Welcome, {user?.name}!</h1>
              <div className="inline-block m-1 px-3 py-1 text-sm font-medium rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white text-white border border-white/20">
                Student
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => logout()}
              className="px-2 py-1 flex items-center gap-1 text-bold border border-white/20 rounded-lg text-white/90 hover:bg-white/30 text-md cursor-pointer transition-all duration-300"
            >
              <span className="text-md p-1">Logout</span>
              <LogOut className=" text-red-500 h-4 w-4"/>
            </button>
          </div>
        </header>

        {/* Search and Filter */}
        <section className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="search"
            placeholder="Search notices..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border border-white/20 rounded-lg p-3 w-full bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-400/30 focus:border-purple-400/30 transition-all duration-300 text-sm"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            title="Filter by category"
            className="border border-white/20 rounded-lg p-2 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-400/30 focus:border-purple-400/30 transition-all duration-300 text-sm"
          >
            <option value="" className="bg-gray-800 text-white">All Categories</option>
            <option value="Academic" className="bg-gray-800 text-white">Academic</option>
            <option value="Exam" className="bg-gray-800 text-white">Exam</option>
            <option value="Event" className="bg-gray-800 text-white">Event</option>
            <option value="Events" className="bg-gray-800 text-white">Events</option>
            <option value="Clubs" className="bg-gray-800 text-white">Clubs</option>
            <option value="General" className="bg-gray-800 text-white">General</option>
            <option value="Sports" className="bg-gray-800 text-white">Sports</option>
            <option value="Library" className="bg-gray-800 text-white">Library</option>
            <option value="Placement" className="bg-gray-800 text-white">Placement</option>
          </select>
        </section>

        {/* NOTICES - Main Focus */}
        <div className="relative">
          {/* Spotlight Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 rounded-md blur-xl"></div>
          
          <div className="relative overflow-x-auto rounded-xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl ring-1 ring-purple-400/20">
            {/* Table Header with Enhanced Focus */}
            {/* <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b-2 border-white/30 px-6 py-4">
              <h2 className="text-2xl font-bold text-white text-center tracking-wide">📢 Campus Notices</h2>
            </div> */}
            
            <table className="min-w-full">
              <thead className="bg-white/10 backdrop-blur-sm border-b border-white/20">
                <tr>
                  <th className="text-left px-6 py-4 text-white font-bold text-base">Title</th>
                  <th className="text-left px-6 py-4 text-white font-bold text-base">Category</th>
                  <th className="text-left px-6 py-4 text-white font-bold text-base">Date</th>
                  <th className="px-6 py-4 text-right text-white font-bold text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-6 py-8" colSpan={4}>
                      <div className="flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-purple-400/50 border-t-purple-400 rounded-full animate-spin"></div>
                        <p className="ml-3 text-white/70 font-medium">Loading notices...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredNotices.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-center text-white/70" colSpan={4}>
                      No notices found.
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((notice) => (
                    <tr key={notice._id} className="border-t border-white/10 hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 text-white font-medium">{notice.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 border border-purple-400/50">
                          {notice.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/80">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end">
                          {notice.fileUrl && (
                            <a
                              href={notice.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-white hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 text-xs font-medium border border-green-400/40"
                            >
                              View
                            </a>
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
      </div>
    </div>
  );
}