"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const CATEGORIES = ["Exam", "Event", "General", "Clubs", "Academic"] as const;

export default function AddNoticePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("category", category);
      form.append("description", description);
      if (file) form.append("file", file);

      await API.post("/notices", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push("/admin/dashboard");
    } catch {
      setError("Failed to create notice. Check your token or server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add Notice</h1>
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
            placeholder="Department of CSE announces the following..."
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium">
            Attachment (Image/PDF)
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
          disabled={submitting}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save Notice"}
        </button>
      </form>
    </main>
  );
}
