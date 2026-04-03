'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateCommunityPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', slug: '', description: '', isPrivate: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? 'Failed to create community');
      }
      const community = await res.json();
      router.push(`/c/${community.slug}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Link href="/app" className="text-gray-400 hover:text-white text-sm">← Back to dashboard</Link>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Create a Community</h1>
        <p className="text-gray-400 mb-8">Build a space for people who share your interests</p>
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 space-y-5">
          {error && <div className="p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Community Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => { setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })); }}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="My Awesome Community"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug (URL)</label>
            <input
              type="text"
              required
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="my-awesome-community"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="What is your community about?"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="private"
              checked={form.isPrivate}
              onChange={e => setForm(f => ({ ...f, isPrivate: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="private" className="text-sm text-gray-300">Make this community private</label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl font-semibold text-white transition-colors"
          >
            {loading ? 'Creating...' : 'Create Community'}
          </button>
        </form>
      </div>
    </div>
  );
}
