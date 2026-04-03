'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Community } from '@vortex/types';

export default function ExplorePage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities`)
      .then(r => r.json())
      .then(data => { setCommunities(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = communities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-400">Vortex Social</Link>
        <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white">Sign in</Link>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-2">Explore Communities</h1>
        <p className="text-gray-400 mb-8">Discover communities that match your interests</p>
        <input
          type="text"
          placeholder="Search communities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-8"
        />
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 animate-pulse h-36" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No communities found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <Link key={c.id} href={`/c/${c.slug}`} className="block bg-gray-900 border border-gray-800 hover:border-indigo-700 rounded-2xl p-6 transition-colors">
                {c.iconUrl ? (
                  <img src={c.iconUrl} alt={c.name} className="w-12 h-12 rounded-full mb-3 object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-700 flex items-center justify-center text-xl font-bold mb-3">
                    {c.name[0].toUpperCase()}
                  </div>
                )}
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
