"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import API from "@/lib/api";
import { Notice } from "@/types/notice";

const CATEGORIES = ["Exam", "Event", "General", "Clubs", "Academic"] as const;

export default function EditNoticePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await API.get<Notice>(`/notices/${id}`);
        const n = res.data;
        setTitle(n.title);
        setCategory(n.category);
        setDescription(n.description);
        setExistingFileUrl(n.fileUrl);
      } catch {
        setError("Failed to load notice.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchNotice();
  }, [id]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("category", category);
      form.append("description", description);
      if (file) form.append("file", file); // optional new file

      await API.put(`/notices/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/admin/dashboard");
    } catch {
      setError("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto p-4">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Notice</h1>
        <button
          onClick={() => history.back()}
          className="px-3 py-2 rounded border hover:bg-gray-50"
        >
          Back
        </button>
      </header>

      <form onSubmit={onSubmit} className="bg-white p-6 rounded border space-y-4">
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

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full border rounded p-2 min-h-[140px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Current Attachment</label>
          {existingFileUrl ? (
            <a
              className="text-blue-600 hover:underline"
              href={existingFileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View current file
            </a>
          ) : (
            <p className="text-gray-500 text-sm">No file attached.</p>
          )}
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium">
            Replace Attachment (optional)
          </label>
          <input
            id="file"
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Updating..." : "Update Notice"}
        </button>
      </form>
    </main>
  );
}
