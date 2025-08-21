"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import API from "@/lib/api";
import { Notice } from "@/types/notice";
import Navbar from "@/components/Navbar";

export default function NoticeDetail() {
  const params = useParams();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (params?.id) {
      API.get(`/notices/${params.id}`)
        .then((res) => {
          
          setNotice(res.data.notice || null);
        })
        .catch((err) => console.error("Error fetching notice:", err));
    }
  }, [params?.id]);

  if (!notice) {
    return (
      <div>
        <Navbar />
        <main className="max-w-4xl mx-auto p-4">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold">{notice.title}</h1>
        <p className="text-gray-600">{notice.category}</p>
        <p className="mt-4">{notice.description}</p>
        {notice.fileUrl && (
          <a
            href={notice.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 mt-4 inline-block hover:underline"
          >
            View / Download File
          </a>
        )}
      </main>
    </div>
  );
}
