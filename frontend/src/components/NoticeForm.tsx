"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { NOTICE_STATUS, NoticeStatus } from "@/auth/roles";
import { Notice } from "@/types/notice";

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
  const [category, setCategory] = useState<string>(notice?.category || CATEGORIES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | undefined>(notice?.fileUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<NoticeStatus>(
    notice?.status 
      ? (notice.status as NoticeStatus) 
      : (isAdmin ? NOTICE_STATUS.PUBLISHED : NOTICE_STATUS.DRAFT)
  );

  // Update form fields when notice prop changes
  useEffect(() => {
    if (notice) {
      console.log("Updating form fields with notice data:", notice);
      setTitle(notice.title || "");
      setCategory(notice.category || CATEGORIES[0]);
      setExistingFileUrl(notice.fileUrl);
      setStatus(
        notice.status 
          ? (notice.status as NoticeStatus) 
          : (isAdmin ? NOTICE_STATUS.PUBLISHED : NOTICE_STATUS.DRAFT)
      );
    }
  }, [notice, isAdmin]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("status", status);
      
      // Only append file if a new file is selected
      if (file) {
        formData.append("file", file);
      }

      if (notice?._id) {
        // Update existing notice
        console.log("Updating notice with ID:", notice._id);
        const response = await API.put(`/notices/${notice._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Update response:", response.data);
      } else {
        // Create new notice
        console.log("Creating new notice");
        const response = await API.post("/notices", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Create response:", response.data);
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
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

  const submitForApproval = async () => {
    if (notice?._id) {
      try {
        setIsSubmitting(true);
        await API.patch(`/notices/${notice._id}/submit`);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/admin/dashboard");
          router.refresh();
        }
      } catch (err: any) {
        console.error("Error submitting for approval:", err);
        setError(err.response?.data?.message || "Failed to submit for approval");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // For new notices, just change the status and submit the form
      setStatus(NOTICE_STATUS.PENDING_APPROVAL);
      setTimeout(() => document.getElementById("noticeForm")?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      ), 0);
    }
  };

  return (
    <form id="noticeForm" onSubmit={handleSubmit} className="bg-white p-6 rounded border space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border rounded p-2"
          placeholder="Mid-Sem Exam Schedule"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          aria-label="Select category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full border rounded p-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>



      {notice && existingFileUrl && (
        <div>
          <label className="block text-sm font-medium">Current Attachment</label>
          <a
            className="text-blue-600 hover:underline"
            href={existingFileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            View current file
          </a>
        </div>
      )}

      <div>
        <label htmlFor="file" className="block text-sm font-medium">
          {notice ? "Replace Attachment (optional)" : "Attachment (Image/PDF)"}
        </label>
        <input
          id="file"
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={handleFileChange}
          className="mt-1 w-full"
        />
      </div>

      {/* Status selection for new notices (not for editing) */}
      {!notice?._id && isStaff && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Submission Type
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="status"
                value={NOTICE_STATUS.DRAFT}
                checked={status === NOTICE_STATUS.DRAFT}
                onChange={() => setStatus(NOTICE_STATUS.DRAFT)}
              />
              <span className="ml-2">Save as Draft</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="status"
                value={NOTICE_STATUS.PENDING_APPROVAL}
                checked={status === NOTICE_STATUS.PENDING_APPROVAL}
                onChange={() => setStatus(NOTICE_STATUS.PENDING_APPROVAL)}
              />
              <span className="ml-2">Submit for Approval</span>
            </label>
          </div>
        </div>
      )}

      {/* Status selection for admins editing notices */}
      {notice?._id && isAdmin && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Notice Status
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="status"
                value={NOTICE_STATUS.DRAFT}
                checked={status === NOTICE_STATUS.DRAFT}
                onChange={() => setStatus(NOTICE_STATUS.DRAFT)}
              />
              <span className="ml-2">Draft</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="status"
                value={NOTICE_STATUS.PENDING_APPROVAL}
                checked={status === NOTICE_STATUS.PENDING_APPROVAL}
                onChange={() => setStatus(NOTICE_STATUS.PENDING_APPROVAL)}
              />
              <span className="ml-2">Pending Approval</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="status"
                value={NOTICE_STATUS.PUBLISHED}
                checked={status === NOTICE_STATUS.PUBLISHED}
                onChange={() => setStatus(NOTICE_STATUS.PUBLISHED)}
              />
              <span className="ml-2">Published</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="status"
                value={NOTICE_STATUS.REJECTED}
                checked={status === NOTICE_STATUS.REJECTED}
                onChange={() => setStatus(NOTICE_STATUS.REJECTED)}
              />
              <span className="ml-2">Rejected</span>
            </label>
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="flex space-x-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : notice?._id ? "Update Notice" : "Create Notice"}
        </button>
        
        {/* Submit for approval button for staff editing draft notices */}
        {notice?._id && isStaff && !isAdmin && notice.status === NOTICE_STATUS.DRAFT && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={submitForApproval}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            Submit for Approval
          </button>
        )}
      </div>
    </form>
  );
}