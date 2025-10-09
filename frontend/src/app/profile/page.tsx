"use client";

import { useState } from "react";
import API from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Camera,
  User,
  Mail,
  Lock,
  Save,
  Upload,
} from "lucide-react";

export default function ProfilePage() {
  const { user, checkAuth, isStudent, isStaff, isAdmin } = useAuth();

  // Common fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Student-only
  const [branch, setBranch] = useState(user?.branch || "");
  const [year, setYear] = useState(user?.year || "");

  // Staff-only
  const [department, setDepartment] = useState(user?.department || "");
  const [designation, setDesignation] = useState(user?.designation || "");

  // Admin-only
  const [adminDesignation, setAdminDesignation] = useState(user?.designation || "");

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // UI State
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload: Record<string, string> = { name, email };

      if (isStudent) {
        payload.branch = branch;
        payload.year = year;
      } else if (isStaff) {
        payload.department = department;
        payload.designation = designation;
      } else if (isAdmin) {
        payload.designation = adminDesignation;
      }

      await API.put("/auth/me", payload);
      await checkAuth();
      setMessage("Profile updated successfully");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setMessage(e.message);
      } else {
        setMessage("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async () => {
    setChanging(true);
    setMessage(null);
    try {
      await API.put("/auth/me/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Password changed successfully");
    } catch (e: unknown) {
      if (e instanceof Error) {
        setMessage(e.message);
      } else {
        setMessage("Failed to change password");
      }
    } finally {
      setChanging(false);
    }
  };

  const onUploadAvatar = async () => {
    if (!avatarFile) return;
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("avatar", avatarFile);
      await API.post("/auth/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await checkAuth();
      setMessage("Avatar updated");
      setAvatarPreview(URL.createObjectURL(avatarFile));
    } catch (e: unknown) {
      if (e instanceof Error) {
        setMessage(e.message);
      } else {
        setMessage("Failed to upload avatar");
      }
    } finally {
      setUploading(false);
    }
  };

  const getDashboardLink = () => {
    if (isAdmin) return "/admin/dashboard";
    if (isStaff) return "/staff/dashboard";
    if (isStudent) return "/student/dashboard";
    return "/";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{
        background: "linear-gradient(125deg,rgb(28, 28, 31),rgb(71, 65, 140),rgb(26, 26, 67))"
      }}>
        <main className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href={getDashboardLink()}
                className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Your Profile
                </h1>
                <p className="text-white/70 text-sm mt-1">Manage your account settings and preferences</p>
              </div>
            </div>
          </header>

          {/* Status Message */}
          {message && (
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-xl"></div>
              <div className="relative p-4 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-green-400/30 shadow-2xl">
                <p className="text-green-300 font-medium">{message}</p>
              </div>
            </div>
          )}

          {/* Avatar Section */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
            <div className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Profile Picture</h2>
                  <p className="text-white/70 text-sm mt-1">Upload and manage your profile avatar</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={avatarPreview || user?.avatarUrl || "https://via.placeholder.com/120"}
                    alt="Profile Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0] || null;
                      setAvatarFile(file);
                      setAvatarPreview(file ? URL.createObjectURL(file) : null);
                    }}
                    className="block w-full text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 file:transition-all file:duration-300"
                    aria-label="Upload profile picture"
                  />
                  <button
                    onClick={onUploadAvatar}
                    disabled={!avatarFile || uploading}
                    className="mt-3 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white hover:from-purple-500/40 hover:to-pink-500/40 transition-all duration-300 font-medium border border-purple-400/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Avatar"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl blur-xl"></div>
            <div className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500/30 to-indigo-500/30">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Profile Information</h2>
                  <p className="text-white/70 text-sm mt-1">Update your personal details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Student Fields */}
                {isStudent && (
                  <>
                    <div>
                      <label htmlFor="branch" className="block text-sm font-medium text-white/80 mb-2">
                        Branch
                      </label>
                      <input
                        id="branch"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-white/80 mb-2">
                        Year
                      </label>
                      <input
                        id="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                        placeholder="e.g., 3rd Year"
                      />
                    </div>
                  </>
                )}

                {/* Staff Fields */}
                {isStaff && (
                  <>
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-white/80 mb-2">
                        Department
                      </label>
                      <input
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div>
                      <label htmlFor="designation" className="block text-sm font-medium text-white/80 mb-2">
                        Designation
                      </label>
                      <input
                        id="designation"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                        placeholder="e.g., Assistant Professor"
                      />
                    </div>
                  </>
                )}

                {/* Admin Fields */}
                {isAdmin && (
                  <div>
                    <label htmlFor="adminDesignation" className="block text-sm font-medium text-white/80 mb-2">
                      Designation
                    </label>
                    <input
                      id="adminDesignation"
                      value={adminDesignation}
                      onChange={(e) => setAdminDesignation(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
                      placeholder="e.g., System Administrator"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={onSaveProfile}
                disabled={saving}
                className="mt-6 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-white hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 font-medium border border-green-400/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur-xl"></div>
            <div className="relative p-6 rounded-2xl bg-white/15 backdrop-blur-2xl border-2 border-white/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-red-500/30 to-orange-500/30">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Change Password</h2>
                  <p className="text-white/70 text-sm mt-1">Update your account password</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-white/80 mb-2">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:bg-gray-300 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 pr-12"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    className="absolute right-3 top-10 text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {showCurrent ? <EyeOff className="h-5 w-5 text-black" /> : <Eye className="h-5 w-5 text-black" />}
                  </button>
                </div>
                <div className="relative">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-white/80 mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 pr-12"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    className="absolute right-3 top-10 text-white/70 hover:text-white transition-colors duration-200"
                  >
                    {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={onChangePassword}
                disabled={changing || !currentPassword || !newPassword}
                className="mt-6 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/30 to-orange-500/30 text-white hover:from-red-500/40 hover:to-orange-500/40 transition-all duration-300 font-medium border border-red-400/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Lock className="h-4 w-4" />
                {changing ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
