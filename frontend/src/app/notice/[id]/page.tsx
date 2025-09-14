"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "@/lib/api";
import { Notice } from "@/types/notice";
import Navbar from "@/components/Navbar";
import { NOTICE_STATUS, NoticeStatus } from "@/auth/roles";
import { useAuth } from "@/contexts/AuthContext";

export default function NoticeDetail() {
  const params = useParams();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { isAdmin, isStaff, user } = useAuth();

  useEffect(() => {
    if (params?.id) {
      setLoading(true);
      API.get(`/notices/${params.id}`)
        .then((res) => {
          const noticeData = res.data.notice || null;
          
          // Check if notice is published or user has permission to view
          if (noticeData) {
            if (
              noticeData.status === NOTICE_STATUS.PUBLISHED || 
              isAdmin || 
              isStaff || 
              (user && noticeData.createdBy && noticeData.createdBy._id === user.id)
            ) {
              setNotice(noticeData);
            } else {
              // Not published and user doesn't have permission
              console.warn("Notice not published or insufficient permissions");
              setNotice(null);
            }
          }
        })
        .catch((err) => console.error("Error fetching notice:", err))
        .finally(() => setLoading(false));
    }
  }, [params?.id, isAdmin, isStaff, user]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">
          <p>Loading...</p>
        </main>
      </div>
    );
  }
  
  if (!notice) {
    return (
      <div>
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">
          <p>Notice not found or you don't have permission to view it.</p>
        </main>
      </div>
    );
  }

  // Get status badge color
  const getStatusBadgeColor = (status: NoticeStatus): string => {
    switch (status) {
      case NOTICE_STATUS.DRAFT:
        return "bg-gray-200 text-gray-800";
      case NOTICE_STATUS.PENDING_APPROVAL:
        return "bg-yellow-200 text-yellow-800";
      case NOTICE_STATUS.PUBLISHED:
        return "bg-green-200 text-green-800";
      case NOTICE_STATUS.REJECTED:
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Format status display text
  const formatStatus = (status: NoticeStatus): string => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).replace('_', ' ');
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{notice.title}</h1>
            {notice.status && (isAdmin || isStaff || notice.status === NOTICE_STATUS.PUBLISHED) && (
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(notice.status)}`}>
                {formatStatus(notice.status)}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-6">
            <span className="mr-4">{notice.category}</span>
            <span>Posted on {new Date(notice.createdAt).toLocaleDateString()}</span>
          </div>
          

          
          {/* Creator and approval information */}
          {(isAdmin || isStaff) && (
            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-medium mb-2">Notice Information</h3>
              <div className="space-y-2 text-sm">
                {notice.createdBy && (
                  <p><span className="font-medium">Created by:</span> {notice.createdBy.name || notice.createdBy.email}</p>
                )}
                {notice.status === NOTICE_STATUS.PUBLISHED && notice.approvedBy && (
                  <>
                    <p><span className="font-medium">Approved by:</span> {notice.approvedBy.name || notice.approvedBy.email}</p>
                    {notice.approvedAt && (
                      <p><span className="font-medium">Approved on:</span> {new Date(notice.approvedAt).toLocaleString()}</p>
                    )}
                  </>
                )}
                {notice.status === NOTICE_STATUS.REJECTED && notice.rejectionReason && (
                  <p><span className="font-medium">Rejection reason:</span> {notice.rejectionReason}</p>
                )}
              </div>
            </div>
          )}
          
          {/* File attachment */}
          {notice.fileUrl && (
            <div className="mt-6">
              <a
                href={notice.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Attachment
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
