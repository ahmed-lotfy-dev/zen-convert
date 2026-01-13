import Sidebar from './Sidebar';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-transparent text-slate-100 selection:bg-indigo-500/30">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="flex-1 overflow-y-auto p-12 relative z-10">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-700">{children}</div>
        </div>
      </main>
    </div>
  );
}
