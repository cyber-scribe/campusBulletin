"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import API from "@/lib/api";
import { Notice } from "@/types/notice";
import Navbar from "@/components/Navbar";
import { NOTICE_STATUS, NoticeStatus } from "@/auth/roles";
import { useAuth } from "@/contexts/AuthContext";

type UserRef = string | {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
} | null | undefined;

type CachedUser = {
  name?: string;
  email?: string;
};

type UserCache = Record<string, CachedUser>;

interface GetUserByIdResponse {
  success: boolean;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

export default function NoticeDetail() {
  const params = useParams();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { isAdmin, isStaff, user: authUser } = useAuth();
  const [userCache, setUserCache] = useState<UserCache>({});

  const authIds = useMemo(() => {
    const ids = new Set<string>();
    if (authUser?.id) {
      ids.add(authUser.id);
    }
    return ids;
  }, [authUser]);

  useEffect(() => {
    if (params?.id) {
      setLoading(true);
      API.get(`/notices/${params.id}`)
        .then((res) => {
          const noticeData = res.data.notice || null;
          
          // Check if notice is published or user has permission to view
          if (noticeData) {
            const getUserId = (value: UserRef): string => {
              if (!value) return "";
              if (typeof value === "string") return value;
              return value?._id || value?.id || "";
            };

            if (
              noticeData.status === NOTICE_STATUS.PUBLISHED || 
              isAdmin || 
              isStaff || 
              (authUser && getUserId(noticeData.createdBy) === authUser.id)
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
  }, [params?.id, isAdmin, isStaff, authUser]);

  const extractUserId = (value: UserRef): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value;
    return value._id || value.id || null;
  };

  useEffect(() => {
    if (!notice) return;

    const potentialRefs: UserRef[] = [notice.createdBy, notice.approvedBy, notice.rejectedBy];
    const idsToFetch = potentialRefs
      .map(extractUserId)
      .filter((id): id is string => {
        if (typeof id !== "string" || id.length === 0) {
          return false;
        }
        return !userCache[id];
      });

    if (idsToFetch.length === 0) return;

    const fetchUsers = async () => {
      try {
        const results = await Promise.all(
          idsToFetch.map(async (id) => {
            try {
              const response = await API.get<GetUserByIdResponse>(`/auth/user/${id}`);
              return {
                id,
                user: response.data.user,
              };
            } catch (error) {
              console.error(`Failed to fetch user ${id}:`, error);
              return null;
            }
          })
        );

        const updates: UserCache = {};
        results.forEach((entry) => {
          if (entry?.user) {
            updates[entry.id] = {
              name: entry.user.name,
              email: entry.user.email,
            };
          }
        });

        if (Object.keys(updates).length > 0) {
          setUserCache((prev) => ({ ...prev, ...updates }));
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    void fetchUsers();
  }, [notice, userCache]);

  if (loading) {
    return (
      <div>
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
          <p>Notice not found or you don&apos;t have permission to view it.</p>
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

  // Utility function to get user name from a string or object
  const getUserName = (userRef: UserRef): string => {
    if (!userRef) return "Unknown User";
    if (typeof userRef === "object") {
      const id = userRef._id || userRef.id;
      const cached = id ? userCache[id] : undefined;
      if (cached?.name || cached?.email) {
        return cached.name || cached.email || "Unknown User";
      }
      return userRef.name || userRef.email || "Unknown User";
    }

    const cached = userCache[userRef];
    if (cached?.name || cached?.email) {
      return cached.name || cached.email || "Unknown User";
    }

    if (authIds.has(userRef)) {
      return authUser?.name || authUser?.email || "You";
    }

    return userRef.length === 24 ? "Unknown User" : userRef;
  };

  return (
    <div className="min-h-screen" style={{
        background: "linear-gradient(315deg,rgba(28, 28, 31, 1),rgba(72, 66, 135, 1),rgba(23, 11, 74, 1))"
      }}>
      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white/15 my-15 border border-gray-400 shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl text-gray-300 font-bold">{notice.title}</h1>
            {notice.status && (isAdmin || isStaff || notice.status === NOTICE_STATUS.PUBLISHED) && (
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(notice.status)}`}>
                {formatStatus(notice.status)}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-300 mb-6">
            <span className={`px-2 py-1 rounded-full text-white border border-white bg-gray-700 `}>{notice.category}</span>
            <span className="mx-2">Posted on {new Date(notice.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Description */}
          <div className="bg-black/10 border border-white/10 rounded-lg p-4 text-gray-300 leading-relaxed">
            {/* <h2 className="text-lg font-semibold text-white mb-2">Description</h2> */}
            <p className="whitespace-pre-wrap">{notice.description}</p>
          </div>

          {/* Creator and approval information */}
          {(isAdmin || isStaff) && (
            <div className="pt-4 mt-6">
              {/* <h3 className="text-lg text-gray-300 font-medium mb-2">Notice Information</h3> */}
              <div className="space-y-2 text-sm">
                {notice.createdBy && (
                  <p><span className="font-medium text-gray-200">Created by:</span> {getUserName(notice.createdBy)}</p>
                )}
                {notice.status === NOTICE_STATUS.PUBLISHED && notice.approvedBy && (
                  <>
                    <p><span className="font-medium text-gray-200">Approved by:</span> {getUserName(notice.approvedBy)}</p>
                    {notice.approvedAt && (
                      <p><span className="font-medium text-gray-200">Approved on:</span> {new Date(notice.approvedAt).toLocaleString()}</p>
                    )}
                  </>
                )}
                {notice.status === NOTICE_STATUS.REJECTED && notice.rejectionReason && (
                  <p><span className="font-medium text-gray-200">Rejection reason:</span> {notice.rejectionReason}</p>
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
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 inline-flex items-center"
              >
                Attachment
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}