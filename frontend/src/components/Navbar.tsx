"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {LogOut} from "lucide-react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="bg-blue-600 text-white p-4"
      style={{ backgroundColor: "#2563eb", color: "white", padding: "1rem" }}
    >
      <div
        className="max-w-6xl mx-auto flex justify-between items-center"
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          className="font-bold text-lg"
          style={{ fontWeight: "bold", fontSize: "1.125rem" }}
        >
          CampusBulletin
        </Link>

        <div className="space-x-4" style={{ display: "flex", gap: "1rem", position: "relative" }}>
          {isAuthenticated ? (
            <div className="relative">
              <button
                aria-label="User menu"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2"
              >
                <img
                  src={(user as any)?.avatarUrl || "https://via.placeholder.com/32"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border"
                />
                <span className="hidden sm:inline">{user?.name || "Profile"}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow">
                  <Link href="/profile" className="block px-3 py-2 hover:bg-gray-100">Profile</Link>
                  <button
                    onClick={() => { setOpen(false); logout(); }}
                    className="w-full flex justify-between text-left px-3 py-2 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5"/><span className="text-bold">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/admin/login">Admin Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
