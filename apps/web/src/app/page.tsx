import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f1117] via-[#1a1d27] to-[#0f1117] text-white px-4">
      <div className="text-center max-w-3xl">
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-900/40 border border-indigo-700/40 text-indigo-300 text-sm">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Now in beta
        </div>
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
          Vortex Social
        </h1>
        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          The next-generation platform where communities thrive. Connect, share, collaborate — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold text-lg transition-colors">
            Get Started Free
          </Link>
          <Link href="/explore" className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-semibold text-lg transition-colors">
            Explore Communities
          </Link>
        </div>
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            { icon: '💬', title: 'Real-time Chat', desc: 'Instant messaging, voice channels, and DMs.' },
            { icon: '🌐', title: 'Communities', desc: 'Create and join communities around any topic.' },
            { icon: '📝', title: 'Content Feed', desc: 'Share posts, ideas, and media with your community.' },
          ].map((f) => (
            <div key={f.title} className="p-6 bg-gray-900/60 border border-gray-800 rounded-2xl">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
