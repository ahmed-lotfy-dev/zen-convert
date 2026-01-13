import { Image as ImageIcon, Video, Youtube, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../shared/lib/utils';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="space-y-24 py-16 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />

      <div className="space-y-12">
        <header className="space-y-6 pt-10 md:pt-20">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-4 duration-1000">
              Internal Version 1.0.4
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.9] flex flex-col">
              <span>
                Zen<span className="text-indigo-500 italic">Convert</span>
              </span>
              <span className="text-slate-500">Universal Engine</span>
            </h1>
          </div>

          <p className="max-w-xl text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
            High-performance media conversion suite.
            <span className="text-slate-200"> Zero cloud latency, 100% private.</span>
            Optimized for professional workflows.
          </p>
        </header>

        <div className="flex items-center justify-center gap-6 pt-6">
          <button
            onClick={() => navigate('/image')}
            className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-xs tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-white/10 uppercase"
          >
            Start Converting
          </button>
          <button className="px-10 py-5 glass text-white rounded-2xl font-black text-xs tracking-widest hover:bg-white/10 transition-all border border-white/10 uppercase">
            View Source
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <ToolCard
          title="Image Studio"
          description="High-fidelity compression and multi-format output logic."
          icon={<ImageIcon size={32} />}
          color="indigo"
          link="/image"
        />
        <ToolCard
          title="Video Forge"
          description="Cinema-grade processing and rapid audio extraction."
          icon={<Video size={32} />}
          color="rose"
          link="/video"
        />
        <ToolCard
          title="YouTube Flow"
          description="Seamless 4K asset retrieval and playlist automation."
          icon={<Youtube size={32} />}
          color="amber"
          link="/youtube"
        />
      </div>

      <footer className="pt-20 border-t border-white/5 flex flex-col items-center gap-8">
        <div className="flex gap-12 text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">
          <span>Powered by Sharp</span>
          <span>FFmpeg Core</span>
          <span>YTDL Engine</span>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({ title, description, icon, color, link }: any) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(link)}
      className="group relative bg-white/[0.02] border border-white/5 p-10 rounded-[40px] hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      <div
        className={cn(
          'w-20 h-20 glass rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl shadow-black/50',
          color === 'indigo'
            ? 'text-indigo-400'
            : color === 'rose'
              ? 'text-rose-400'
              : 'text-amber-400'
        )}
      >
        {icon}
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-black tracking-tight text-white">{title}</h3>
          <ChevronRight
            size={20}
            className="text-slate-600 group-hover:translate-x-1 group-hover:text-white transition-all"
          />
        </div>
        <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>

      {/* Visual Accent */}
      <div
        className={`absolute -bottom-10 -right-10 w-32 h-32 bg-${color}-500/10 blur-[60px] rounded-full group-hover:bg-${color}-500/20 transition-all`}
      />
    </div>
  );
}
