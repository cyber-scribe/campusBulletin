"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { NOTICE_STATUS, NoticeStatus } from "@/auth/roles";
import { Notice } from "@/types/notice";
import { FileText, Upload, Save, Send, AlertCircle } from "lucide-react";

const CATEGORIES = ['Academic',
  'Exam', 
  'Events', 
  'Clubs', 
  'General',
  'Sports',
  'Library',
  'Placement',] as const;

interface NoticeFormProps {
  notice?: Notice;
  onSuccess?: () => void;
}

export default function NoticeForm({ notice, onSuccess }: NoticeFormProps) {
  const router = useRouter();
  const { isAdmin, isStaff } = useAuth();
  
  console.log("NoticeForm received notice:", notice);
  console.log("Notice ID:", notice?._id);
  console.log("Notice title:", notice?.title);
  console.log("Notice category:", notice?.category);
  console.log("Notice status:", notice?.status);
  
  const [title, setTitle] = useState(notice?.title || "");
  const [description, setDescription] = useState(notice?.description || "");
  const [category, setCategory] = useState<string>(notice?.category || CATEGORIES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | undefined>(notice?.fileUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<NoticeStatus>(
    notice?.status 
      ? (notice.status as NoticeStatus) 
      : (isAdmin
          ? NOTICE_STATUS.PUBLISHED
          : isStaff
            ? NOTICE_STATUS.PENDING_APPROVAL
            : NOTICE_STATUS.DRAFT)
  );
  const [createdNoticeId, setCreatedNoticeId] = useState<string | undefined>(notice?._id);

  // Update form fields when notice prop changes
  useEffect(() => {
    if (notice) {
      console.log("Updating form fields with notice data:", notice);
      setTitle(notice.title || "");
      setDescription(notice.description || "");
      setCategory(notice.category || CATEGORIES[0]);
      setExistingFileUrl(notice.fileUrl);
      setStatus(
        notice.status 
          ? (notice.status as NoticeStatus) 
          : (isAdmin
              ? NOTICE_STATUS.PUBLISHED
              : isStaff
                ? NOTICE_STATUS.PENDING_APPROVAL
                : NOTICE_STATUS.DRAFT)
      );
      setCreatedNoticeId(notice._id);
    }
  }, [notice, isAdmin]);

  const persistNotice = async (statusToPersist: NoticeStatus) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("status", statusToPersist);

    if (file) {
      formData.append("file", file);
    }

    const targetId = notice?._id || createdNoticeId;

    if (targetId) {
      console.log("Updating notice with ID:", targetId);
      const response = await API.put(`/notices/${targetId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Update response:", response.data);
      return response.data;
    } else {
      console.log("Creating new notice");
      const response = await API.post("/notices", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Create response:", response.data);
      if (response.data?.notice?._id) {
        setCreatedNoticeId(response.data.notice._id);
      }
      return response.data;
    }
  };

  const handleSuccessNavigation = () => {
    if (onSuccess) {
      onSuccess();
      return;
    }

    if (typeof window !== 'undefined') {
      if ((window as any).refreshStaffDrafts) {
        (window as any).refreshStaffDrafts();
      }
      if ((window as any).refreshStaffPending) {
        (window as any).refreshStaffPending();
      }
    }

    if (isStaff && !isAdmin) {
      router.push("/staff/dashboard");
    } else {
      router.push("/admin/dashboard");
    }
    router.refresh();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const targetStatus = isStaff && !isAdmin ? NOTICE_STATUS.PENDING_APPROVAL : status;
      const result = await persistNotice(targetStatus);
      console.log("Notice saved successfully:", result);
      
      // Show success message based on status
      if (targetStatus === NOTICE_STATUS.DRAFT) {
        alert("Notice saved as draft successfully!");
      } else if (targetStatus === NOTICE_STATUS.PENDING_APPROVAL) {
        alert("Notice submitted for approval successfully!");
      } else if (targetStatus === NOTICE_STATUS.PUBLISHED) {
        alert("Notice published successfully!");
      }
      
      handleSuccessNavigation();
    } catch (err: any) {
      console.error("Error submitting notice:", err);
      setError(err.response?.data?.message || "Failed to submit notice");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

const submitForApproval = async (e?: React.FormEvent) => {
  if (e) {
    e.preventDefault();
  }
  setError("");

  try {
    setIsSubmitting(true);

    const targetId = notice?._id || createdNoticeId;

    if (targetId) {
      const result = await API.patch(`/notices/${targetId}/submit`);
      console.log("Notice submitted for approval:", result.data);
      setStatus(NOTICE_STATUS.PENDING_APPROVAL);
      alert("Notice submitted for approval successfully!");
      handleSuccessNavigation();
    } else {
      const result = await persistNotice(NOTICE_STATUS.PENDING_APPROVAL);
      console.log("Notice created and submitted for approval:", result);
      setStatus(NOTICE_STATUS.PENDING_APPROVAL);
      alert("Notice submitted for approval successfully!");
      handleSuccessNavigation();
    }
  } catch (err: any) {
    console.error("Error submitting for approval:", err);
    setError(err.response?.data?.message || "Failed to submit for approval");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="space-y-6">
      {/* Form Header */}
      {/* <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {notice?._id ? 'Edit Notice Details' : 'Create New Notice'}
          </h3>
          <p className="text-white/70 text-sm">
            {notice?._id ? 'Update your notice information below' : 'Fill in the details for your new notice'}
          </p>
        </div>
      </div> */}

      <form id="noticeForm" onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-white/80">
            Notice Title *
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
            placeholder="e.g., Mid-Semester Exam Schedule"
          />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-white/80">
            Description *
          </label>
          <textarea
            id="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 resize-y"
            placeholder="Provide the full notice details, including important context and next steps"
          />
        </div>

        {/* Category Field */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-white/80">
            Category *
          </label>
          <select
          required
            id="category"
            aria-label="Select category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-gray-800 text-white">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Current Attachment */}
        {notice && existingFileUrl && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/80">Current Attachment</label>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl blur-xl"></div>
              <div className="relative p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                <a
                  className="text-blue-300 hover:text-blue-200 transition-colors duration-200 flex items-center gap-2"
                  href={existingFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4" />
                  View current attachment
                </a>
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="space-y-2">
          <label htmlFor="file" className="block text-sm font-medium text-white/80">
            {notice ? "Replace Attachment (optional)" : "Attachment (Image/PDF)"}
          </label>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl blur-xl"></div>
            <div className="relative">
              <input 
                id="file"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={handleFileChange}
                className="w-full border border-white/20 rounded-xl p-3 bg-white/5 backdrop-blur-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-white/10 file:text-white hover:file:bg-white/20 file:transition-all file:duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300"
              />
              {file && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-300">
                  <Upload className="h-4 w-4" />
                  Selected: {file.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status selection for admins editing notices */}
        {notice?._id && isAdmin && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-white/80">
              Notice Status
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: NOTICE_STATUS.DRAFT, label: 'Draft', icon: Save },
                { value: NOTICE_STATUS.PENDING_APPROVAL, label: 'Pending Approval', icon: Send },
                { value: NOTICE_STATUS.PUBLISHED, label: 'Published', icon: FileText },
                { value: NOTICE_STATUS.REJECTED, label: 'Rejected', icon: AlertCircle }
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                  <input
                    type="radio"
                    className="w-4 h-4 text-purple-400 bg-white/10 border-white/30 focus:ring-purple-400/50 focus:ring-2"
                    name="status"
                    value={value}
                    checked={status === value}
                    onChange={() => setStatus(value)}
                  />
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-white/70" />
                    <span className="text-white font-medium">{label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl blur-xl"></div>
            <div className="relative p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-red-400/30">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium" role="alert">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white hover:from-purple-500/40 hover:to-pink-500/40 transition-all duration-300 font-medium border border-purple-400/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                {isStaff && !isAdmin && !notice?._id ? (
                  <>
                    <Send className="h-4 w-4" />
                    Submit for Approval
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {notice?._id ? "Update Notice" : "Create Notice"}
                  </>
                )}
              </>
            )}
          </button>
          
          {/* Submit for approval button for staff editing draft notices */}
          {notice?._id && isStaff && !isAdmin && notice.status === NOTICE_STATUS.DRAFT && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={submitForApproval}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-white hover:from-green-500/40 hover:to-emerald-500/40 transition-all duration-300 font-medium border border-green-400/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit for Approval
            </button>
          )}
        </div>
      </form>
    </div>
  );
}