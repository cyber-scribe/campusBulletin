"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4" style={{ backgroundColor: '#2563eb', color: 'white', padding: '1rem' }}>
      <div className="max-w-6xl mx-auto flex justify-between items-center" style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" className="font-bold text-lg" style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>
          CampusBulletin
        </Link>
        <div className="space-x-4" style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/">Home</Link>
          <Link href="/admin/login">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
