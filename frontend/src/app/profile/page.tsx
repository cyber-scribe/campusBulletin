"use client";

import { useState } from "react";
import API from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, User, Mail, Hash, Building, BookOpen, Calendar, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [studentId, setStudentId] = useState((user as any)?.studentId || "");
  const [department, setDepartment] = useState((user as any)?.department || "");
  const [branch, setBranch] = useState((user as any)?.branch || "");
  const [year, setYear] = useState((user as any)?.year || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changing, setChanging] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await API.put("/auth/me", { name, email, studentId, department, branch, year });
      await checkAuth();
      setMessage("Profile updated");
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Failed to update profile");
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
      setMessage("Password changed");
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Failed to change password");
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
      const res = await API.post("/auth/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await checkAuth();
      setMessage("Avatar updated");
      setAvatarPreview(res.data?.avatarUrl || null);
    } catch (e: any) {
      setMessage(e?.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{
        background: "linear-gradient(125deg,rgb(28, 28, 31),rgb(71, 65, 140),rgb(26, 26, 67))"
      }}>

        {/* Header with Back Navigation */}
        <header className="flex items-center justify-between gap-4 mb-2 pt-4 opacity-90">
            <Link 
              href="/student/dashboard" 
              className="flex items-center gap-2 px-3 py-2 mx-12 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <div className="flex-1 mx-20">
              <h1 className="text-3xl font-bold text-white tracking-tight">✨ Your Profile</h1>
              <p className="text-white/70 text-sm mt-1">Manage your account settings and information</p>
            </div>
          </header>

        <div className="max-w-4xl mx-auto p-6">

          {/* Message Display */}
          {message && (
            <div className="mb-6 p-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 text-white shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Profile Picture Section */}
          <section className="mb-8">
            <div className="bg-white/15 backdrop-blur-2xl rounded-3xl border-2 border-white/30 shadow-2xl p-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={avatarPreview || user?.avatarUrl || "https://via.placeholder.com/120"}
                    alt="Profile Avatar"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white/50 shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2">Profile Picture</h2>
                  <p className="text-white/70 mb-4 text-sm">Upload a new avatar to personalize your profile</p>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      title="Upload profile picture"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setAvatarFile(file);
                        setAvatarPreview(file ? URL.createObjectURL(file) : null);
                      }}
                      className="block w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/20 file:text-white file:font-medium hover:file:bg-white/30 file:transition-all file:duration-300"
                    />
                    <button 
                      onClick={onUploadAvatar} 
                      disabled={!avatarFile || uploading} 
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white hover:from-purple-500/40 hover:to-pink-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium border border-purple-400/30"
                    >
                      {uploading ? "Uploading..." : "Upload Avatar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Profile Information Section */}
          <section className="mb-8">
            <div className="bg-white/15 backdrop-blur-2xl rounded-3xl border-2 border-white/30 shadow-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl border border-purple-400/30">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Profile Information</h2>
                  <p className="text-white/70 text-sm">Update your personal and academic details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/80 font-medium text-sm">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input 
                    className="w-full border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300" 
                    placeholder="Enter your full name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/80 font-medium text-sm">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input 
                    className="w-full border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/80 font-medium text-sm">
                    <Hash className="w-4 h-4" />
                    Student ID
                  </label>
                  <input 
                    className="w-full border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300" 
                    placeholder="Enter your student ID" 
                    value={studentId} 
                    onChange={(e) => setStudentId(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/80 font-medium text-sm">
                    <Building className="w-4 h-4" />
                    Department
                  </label>
                  <input 
                    className="w-full border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300" 
                    placeholder="Enter your department" 
                    value={department} 
                    onChange={(e) => setDepartment(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/80 font-medium text-sm">
                    <BookOpen className="w-4 h-4" />
                    Branch
                  </label>
                  <input 
                    className="w-full border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300" 
                    placeholder="Enter your branch" 
                    value={branch} 
                    onChange={(e) => setBranch(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white/80 font-medium text-sm">
                    <Calendar className="w-4 h-4" />
                    Academic Year
                  </label>
                  <input 
                    className="w-full border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300" 
                    placeholder="Enter your year" 
                    value={year} 
                    onChange={(e) => setYear(e.target.value)} 
                  />
                </div>
              </div>
              
              <button 
                onClick={onSaveProfile} 
                disabled={saving} 
                className="mt-8 w-full px-6 py-4 rounded-xl bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white hover:from-purple-500/50 hover:to-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg border border-purple-400/40 shadow-xl"
              >
                {saving ? "Saving Changes..." : "💾 Save Profile"}
              </button>
            </div>
          </section>

          {/* Change Password Section */}
          <section className="mb-8">
            <div className="bg-white/15 backdrop-blur-2xl rounded-3xl border-2 border-white/30 shadow-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-orange-500/30 to-red-500/30 rounded-2xl border border-orange-400/30">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Security Settings</h2>
                  <p className="text-white/70 text-sm">Update your password to keep your account secure</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-white/80 font-medium text-sm">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      className="w-full border border-white/20 rounded-xl p-3 pr-12 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-300"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                    >
                      {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-white/80 font-medium text-sm">New Password</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      className="w-full border border-white/20 rounded-xl p-3 pr-12 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 transition-all duration-300"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                    >
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onChangePassword} 
                disabled={changing || !currentPassword || !newPassword} 
                className="mt-8 w-full px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500/40 to-red-500/40 text-white hover:from-orange-500/50 hover:to-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg border border-orange-400/40 shadow-xl"
              >
                {changing ? "Updating Password..." : "🔒 Update Password"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}


