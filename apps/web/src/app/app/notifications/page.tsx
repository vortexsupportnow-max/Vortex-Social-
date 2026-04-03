'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Notification } from '@vortex/types';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/auth/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setNotifications(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const markAllRead = async () => {
    const token = localStorage.getItem('accessToken');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token ?? ''}` },
    });
    setNotifications(n => n.map(x => ({ ...x, read: true })));
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/app" className="text-indigo-400 hover:text-indigo-300 text-sm">← Dashboard</Link>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllRead} className="text-sm text-gray-400 hover:text-white">Mark all read</button>
        )}
      </header>
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Notifications</h1>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-gray-900 rounded-2xl h-16 animate-pulse" />)}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No notifications yet</div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className={`p-4 rounded-2xl border ${n.read ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-indigo-900/20 border-indigo-800/50 text-white'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{n.type}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
