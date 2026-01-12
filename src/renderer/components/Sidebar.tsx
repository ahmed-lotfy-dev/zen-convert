import { Link, useLocation } from 'react-router-dom';
import { 
  Image, 
  Video, 
  Youtube, 
  Settings, 
  History, 
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Image, label: 'Image Converter', path: '/image' },
  { icon: Video, label: 'Video Converter', path: '/video' },
  { icon: Youtube, label: 'YouTube Downloader', path: '/youtube' },
  { icon: History, label: 'History', path: '/history' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div 
      className={cn(
        "h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-blue-500 truncate">ZenConvert</h1>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center p-3 rounded-lg transition-colors group",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={24} className={cn("min-w-[24px]", !isCollapsed && "mr-4")} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link
          to="/settings"
          className={cn(
            "flex items-center p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors group",
            location.pathname === '/settings' && "bg-slate-800 text-white"
          )}
        >
          <Settings size={24} className={cn("min-w-[24px]", !isCollapsed && "mr-4")} />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </Link>
      </div>
    </div>
  );
}
