import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'PRAGATI-AI | Predictive Risk Analytics & Government Infrastructure Intelligence',
  description: 'Ministry of Statistics and Programme Implementation (MoSPI) — Central Sector Infrastructure Project Monitoring Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-5 lg:p-7 max-w-7xl mx-auto w-full overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
