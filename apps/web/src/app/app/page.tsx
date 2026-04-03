'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Community } from '@vortex/types';

export default function AppDashboard() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/auth/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setCommunities(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex">
      <aside className="w-64 bg-[#1a1d27] border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <span className="text-xl font-bold text-indigo-400">Vortex Social</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link href="/app" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-900/30 text-indigo-300 font-medium text-sm">
            🏠 Home
          </Link>
          <Link href="/explore" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition-colors">
            🔍 Explore
          </Link>
          <Link href="/app/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white text-sm transition-colors">
            🔔 Notifications
          </Link>
        </nav>
        <div className="p-3 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-red-400 text-sm transition-colors">
            🚪 Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Communities</h1>
          <Link href="/app/create-community" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors">
            + New Community
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl h-32 animate-pulse" />)}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">You haven&apos;t joined any communities yet.</p>
            <Link href="/explore" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors">
              Explore Communities
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map(c => (
              <Link key={c.id} href={`/c/${c.slug}`} className="block bg-gray-900 border border-gray-800 hover:border-indigo-700 rounded-2xl p-6 transition-colors">
                <div className="w-12 h-12 rounded-full bg-indigo-700 flex items-center justify-center text-xl font-bold mb-3">
                  {c.name[0].toUpperCase()}
                </div>
                <h3 className="font-semibold text-white mb-1">{c.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">{c.description ?? 'No description'}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
