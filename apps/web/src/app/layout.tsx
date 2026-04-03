import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vortex Social',
  description: 'Connect, collaborate, and create — the next-generation social platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0f1117] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
