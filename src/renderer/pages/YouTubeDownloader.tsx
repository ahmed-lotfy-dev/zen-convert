import { useState } from 'react';
import { 
  Youtube, 
  Download, 
  Link as LinkIcon, 
  FileVideo,
  Music,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function YouTubeDownloader() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [format, setFormat] = useState<'mp4' | 'mp3'>('mp4');

  const handleFetch = async () => {
    if (!url) return;
    
    if (!(window as any).electronAPI?.youtube) {
      alert('YouTube API not found in bridge. Please restart the app.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[YouTubeDownloader] handleFetch starting for URL:', url);
      const response = await (window as any).electronAPI.youtube.getInfo({ url });
      console.log('[YouTubeDownloader] handleFetch response:', response);
      
      if (response.success) {
        setVideoInfo(response.data.info);
      } else {
        console.error('Fetch error:', response.error);
        alert(`Failed to fetch video info: ${response.error.message} (${response.error.code})`);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      alert(`Critical error in renderer: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url) return;
    setIsDownloading(true);
    try {
      const response = await (window as any).electronAPI.youtube.download({ url, format });
      if (response.success) {
        alert(`Download started! Saved to: ${response.data.filePath}`);
      } else {
        alert('Download failed.');
      }
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest">
            Module 03
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">
            YouTube <span className="text-red-500 italic">Engine</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-md font-medium leading-relaxed">
            Direct high-speed media extraction from YouTube. Local & private.
          </p>
        </div>
      </header>
      
      <div className="bg-white/[0.02] border border-white/5 rounded-[40px] p-10 backdrop-blur-3xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          <div className="flex-1 relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-400 transition-colors">
              <LinkIcon size={20} />
            </div>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube Video URL here..." 
              className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all border-white/5 focus:border-red-500/40 text-white font-medium placeholder:text-slate-600"
            />
          </div>
          <button 
            onClick={handleFetch}
            disabled={isLoading || !url}
            className="px-10 py-5 bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-xs tracking-widest transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 uppercase active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Youtube size={18} />
            )}
            Fetch Asset
          </button>
        </div>
      </div>

      {videoInfo && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in slide-in-from-bottom-5 duration-700">
          <div className="lg:col-span-8">
            <div className="glass-card rounded-[32px] overflow-hidden group">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={videoInfo.thumbnail} 
                  alt={videoInfo.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                   <h2 className="text-2xl font-black text-white leading-tight mb-2">{videoInfo.title}</h2>
                   <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
                      <span>{videoInfo.uploader}</span>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span>{Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</span>
                   </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                 <div className="flex items-center gap-2 text-slate-400">
                    <Info size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Description</span>
                 </div>
                 <p className="text-slate-500 text-xs leading-relaxed max-h-24 overflow-y-auto font-medium">
                    {videoInfo.description || "No description available."}
                 </p>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="glass-card rounded-[32px] p-6 space-y-6">
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => setFormat('mp4')}
                        className={cn(
                            "flex-1 p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4",
                            format === 'mp4' 
                                ? "bg-white text-slate-950 border-white shadow-xl shadow-white/10" 
                                : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                        )}
                    >
                        <FileVideo size={20} />
                        <span className="font-black text-[10px] tracking-widest uppercase text-left">Video (MP4)</span>
                    </button>
                    <button 
                        onClick={() => setFormat('mp3')}
                        className={cn(
                            "flex-1 p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4",
                            format === 'mp3' 
                                ? "bg-white text-slate-950 border-white shadow-xl shadow-white/10" 
                                : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                        )}
                    >
                        <Music size={20} />
                        <span className="font-black text-[10px] tracking-widest uppercase text-left">Audio (MP3)</span>
                    </button>
                </div>

                <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-red-600/30 uppercase disabled:opacity-50"
                >
                    {isDownloading ? (
                         <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                         </>
                    ) : (
                        <>
                            <Download size={18} />
                            Start Extraction
                        </>
                    )}
                </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
