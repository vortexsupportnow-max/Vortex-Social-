'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import type { Message } from '@vortex/types';

interface Params { params: { channelId: string } }

export default function ChatPage({ params }: Params) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/auth/login'); return; }

    // Decode userId from JWT payload
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserId(payload.sub);
    } catch { /* ignore */ }

    // Load history
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/channel/${params.channelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []));

    // Connect socket
    const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000');
    socketRef.current = socket;
    socket.emit('joinChannel', params.channelId);
    socket.on('newMessage', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => { socket.disconnect(); };
  }, [params.channelId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || !userId) return;
    socketRef.current.emit('sendMessage', { content: input.trim(), channelId: params.channelId, authorId: userId });
    setInput('');
  };

  return (
    <div className="h-screen bg-[#0f1117] flex flex-col text-white">
      <header className="border-b border-gray-800 px-6 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-sm">←</button>
        <span className="text-sm font-semibold text-gray-200"># channel</span>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.authorId === userId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${msg.authorId === userId ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-100'}`}>
              {msg.content}
              <div className="text-xs mt-1 opacity-50">{new Date(msg.createdAt).toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="border-t border-gray-800 px-6 py-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button type="submit" disabled={!input.trim()} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-medium transition-colors">
          Send
        </button>
      </form>
    </div>
  );
}
