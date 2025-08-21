import Link from "next/link";
import { Notice } from "@/types/notice";

interface Props {
  notice: Notice;
}

export default function NoticeCard({ notice }: Props) {
  return (
    <div className="border rounded-md p-4 shadow-sm bg-white" style={{ border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', backgroundColor: 'white' }}>
      <h2 className="text-lg font-semibold" style={{ fontSize: '1.125rem', fontWeight: '600' }}>{notice.title}</h2>
      <p className="text-sm text-gray-600" style={{ fontSize: '0.875rem', color: '#4b5563' }}>{notice.category}</p>
      <p className="mt-2 text-gray-700 line-clamp-2" style={{ marginTop: '0.5rem', color: '#374151' }}>{notice.description}</p>
      <Link
        href={`/notice/${notice._id}`}
        className="text-blue-600 hover:underline mt-2 inline-block"
        style={{ color: '#2563eb', textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}
      >
        Read More
      </Link>
    </div>
  );
}
