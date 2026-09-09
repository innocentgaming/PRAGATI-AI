import type { Metadata } from 'next';
import './globals.css';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta' });

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
    <html lang="en" className={`light ${inter.variable} ${plusJakarta.variable}`}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="bg-surface text-on-surface font-body-md text-body-md flex flex-col min-h-screen selection:bg-secondary-fixed">
        <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(11,28,48,0.04)]">
          <div className="h-16 px-screen-edge-mobile flex items-center justify-between gap-unit-sm">
            <div className="flex items-center gap-unit-sm min-w-0">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-on-secondary font-headline-md text-headline-md shadow-sm shrink-0">
                P
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-unit-xs">
                  <span className="font-headline-sm text-headline-sm text-text-primary tracking-tight truncate">PRAGATI-AI</span>
                  <span className="px-unit-xs py-unit-2xs rounded-full bg-surface-container text-secondary font-label-sm text-label-sm uppercase tracking-wider shrink-0">
                    MoSPI IPMD
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-text-tertiary truncate uppercase tracking-widest">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-unit-xs shrink-0">
              <button aria-label="Notifications" className="relative w-11 h-11 flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-risk-critical ring-2 ring-surface"></span>
              </button>
              <div className="flex items-center gap-unit-xs pl-unit-xs">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex flex-col relative w-full pt-16 pb-20 bg-surface min-h-screen px-screen-edge-mobile">
          {children}
        </main>
        
        <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(11,28,48,0.06)]" data-active-classes="text-secondary font-semibold">
          <div className="flex justify-between items-center h-16 px-unit-xs">
            <Link href="/dashboard" className="flex-1 flex flex-col items-center justify-center gap-unit-2xs h-12 transition-colors text-secondary font-semibold">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="font-label-sm text-label-sm">Dashboard</span>
            </Link>
            <Link href="/projects" className="flex-1 flex flex-col items-center justify-center gap-unit-2xs h-12 text-text-secondary hover:text-text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
              <span className="font-label-sm text-label-sm">Projects</span>
            </Link>
            <Link href="/risk" className="flex-1 flex flex-col items-center justify-center gap-unit-2xs h-12 text-text-secondary hover:text-text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">radar</span>
              <span className="font-label-sm text-label-sm">Risk Radar</span>
            </Link>
            <Link href="/alerts" className="flex-1 flex flex-col items-center justify-center gap-unit-2xs h-12 text-text-secondary hover:text-text-primary transition-colors">
              <div className="relative">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-risk-critical"></span>
              </div>
              <span className="font-label-sm text-label-sm">Alerts</span>
            </Link>
            <Link href="/map" className="flex-1 flex flex-col items-center justify-center gap-unit-2xs h-12 text-text-secondary hover:text-text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">explore</span>
              <span className="font-label-sm text-label-sm">Map</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}
