import { useLocation, useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Video, Youtube, Settings, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-16 md:w-20 lg:w-24 h-full bg-slate-950/40 border-r border-white/5 flex flex-col items-center py-8 gap-10 relative z-50">
      <div
        onClick={() => navigate('/')}
        className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 cursor-pointer hover:scale-110 active:scale-95 transition-all group"
      >
        <div className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-lg group-hover:rotate-45 transition-transform duration-500" />
      </div>

      <nav className="flex-1 flex flex-col gap-6 md:gap-8">
        <NavItem
          icon={<Home size={20} />}
          active={location.pathname === '/'}
          onClick={() => navigate('/')}
          label="Home"
        />
        <NavItem
          icon={<ImageIcon size={20} />}
          active={location.pathname === '/image'}
          onClick={() => navigate('/image')}
          label="Images"
        />
        <NavItem
          icon={<Video size={20} />}
          active={location.pathname === '/video'}
          onClick={() => navigate('/video')}
          label="Videos"
        />
        <NavItem
          icon={<Youtube size={20} />}
          active={location.pathname === '/youtube'}
          onClick={() => navigate('/youtube')}
          label="YouTube"
        />
      </nav>

      <div className="flex flex-col gap-6">
        <NavItem
          icon={<Settings size={20} />}
          active={location.pathname === '/settings'}
          onClick={() => navigate('/settings')}
          label="Settings"
        />
      </div>
    </aside>
  );
}

function NavItem({ icon, active, onClick, label }: any) {
  return (
    <div className="group relative flex items-center justify-center">
      <button
        onClick={onClick}
        className={cn(
          'w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all duration-300',
          active
            ? 'bg-white text-slate-950 shadow-xl shadow-white/5'
            : 'text-slate-500 hover:text-white hover:bg-white/5'
        )}
      >
        {icon}
      </button>
      <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-2xl">
        {label}
      </span>
    </div>
  );
}
