'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Community, Post } from '@vortex/types';

interface Params { params: Promise<{ slug: string }> }

export default function CommunityPage({ params }: Params) {
  const { slug } = use(params);
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${base}/communities/${slug}`)
      .then(r => r.json())
      .then(async (c: Community) => {
        setCommunity(c);
        const feedRes = await fetch(`${base}/posts/feed/${c.id}`);
        const feedData = await feedRes.json();
        setPosts(feedData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!community || !token) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ communityId: community.id, content: postContent }),
    });
    if (res.ok) {
      const newPost = await res.json();
      setPosts(p => [newPost, ...p]);
      setPostContent('');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-gray-400">Loading...</div>;
  if (!community) return <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-gray-400">Community not found</div>;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/explore" className="text-indigo-400 hover:text-indigo-300 text-sm">← Explore</Link>
        <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white">{token ? 'Dashboard' : 'Sign in'}</Link>
      </header>
      <div className="h-40 bg-gradient-to-r from-indigo-900 to-purple-900 relative">
        {community.bannerUrl && <img src={community.bannerUrl} alt="banner" className="w-full h-full object-cover absolute inset-0" />}
      </div>
      <div className="max-w-3xl mx-auto px-6">
        <div className="-mt-8 mb-6 flex items-end gap-4">
          {community.iconUrl ? (
            <img src={community.iconUrl} alt={community.name} className="w-16 h-16 rounded-2xl border-4 border-[#0f1117] object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl border-4 border-[#0f1117] bg-indigo-700 flex items-center justify-center text-2xl font-bold">
              {community.name[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{community.name}</h1>
            {community.description && <p className="text-gray-400 text-sm">{community.description}</p>}
          </div>
        </div>
        {token && (
          <form onSubmit={handlePost} className="mb-6 bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <textarea
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder="Share something with this community..."
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none mb-3"
              rows={3}
            />
            <div className="flex justify-end">
              <button type="submit" disabled={!postContent.trim()} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl text-sm font-medium transition-colors">
                Post
              </button>
            </div>
          </form>
        )}
        <div className="space-y-4 pb-10">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No posts yet. Be the first!</div>
          ) : posts.map(post => (
            <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <p className="text-white mb-3 whitespace-pre-wrap">{post.content}</p>
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <span>❤️ {post.likesCount}</span>
                <span>💬 {post.commentsCount}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
