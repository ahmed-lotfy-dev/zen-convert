import { useVideoStore } from './VideoStore';
import {
  Play,
  Trash2,
  Settings2,
  FileVideo,
  Video as VideoIcon,
  FolderOpen,
  FileText,
  Type,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../shared/lib/utils';
import { invoke } from '@tauri-apps/api/core';
import { open, ask, message } from '@tauri-apps/plugin-dialog';
import { FileStatus } from '../../shared/types';
import { VideoFile } from '../../shared/types';

export default function VideoConverter() {
  const {
    videos,
    addVideos,
    removeVideo,
    clearVideos,
    updateVideoStatus,
    isProcessing,
    setProcessing,
    outputDirectory,
    setOutputDirectory,
    options,
    setOptions,
  } = useVideoStore();

  const [showResolution, setShowResolution] = useState(false);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bitrate, setBitrate] = useState<string>('');

  const handleSelectFiles = async () => {
    try {
      const selected = await open({
        title: 'Select Videos',
        multiple: true,
        filters: [
          {
            name: 'Videos',
            extensions: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'flv', 'wmv'],
          },
        ],
      });

      if (selected) {
        const files = Array.isArray(selected) ? selected : [selected];
        const newVideos = await Promise.all(
          files.map(async (path) => {
            const name = path.split(/[/\\]/).pop() || 'unknown';
            const ext = name.split('.').pop() || '';

            // Get video info from backend
            let videoInfo = {};
            try {
              const info = await invoke('get_video_info', { filePath: path });
              if (typeof info === 'object' && info !== null) {
                videoInfo = info;
              }
            } catch (err) {
              console.error('Failed to get video info:', err);
            }

            return {
              id: crypto.randomUUID(),
              path,
              name,
              size: 0,
              type: 'video/' + ext,
              lastModified: Date.now(),
              status: FileStatus.PENDING,
              extension: '.' + ext,
              ...(videoInfo as any),
            };
          })
        );
        addVideos(newVideos as VideoFile[]);
      }
    } catch (err) {
      console.error('Select files error:', err);
    }
  };

  const handleSelectSubtitle = async (videoId: string) => {
    try {
      const selected = await open({
        title: 'Select Subtitle File',
        multiple: false,
        filters: [
          {
            name: 'Subtitles',
            extensions: ['srt', 'ass', 'ssa', 'vtt', 'sub'],
          },
        ],
      });

      if (selected && typeof selected === 'string') {
        const ext = selected.split('.').pop()?.toLowerCase() as 'srt' | 'ass' | 'vtt';
        useVideoStore.getState().updateVideoSubtitle(videoId, {
          subtitlePath: selected,
          subtitleFormat: ext,
        });
      }
    } catch (err) {
      console.error('Select subtitle error:', err);
    }
  };

  const handleConvertAll = async () => {
    if (videos.length === 0 || isProcessing) return;

    let targetDir = outputDirectory;

    if (!targetDir) {
      const useSource = await ask(
        'Do you want to save output files to the same folder as the source videos?',
        {
          title: 'Output Directory',
          kind: 'info',
          okLabel: 'Yes, Same Folder',
          cancelLabel: 'No, Choose Folder',
        }
      );

      if (!useSource) {
        try {
          const selected = await open({
            directory: true,
            multiple: false,
            title: 'Select Output Directory',
          });
          if (selected && typeof selected === 'string') {
            targetDir = selected;
            setOutputDirectory(targetDir);
          } else {
            return;
          }
        } catch (err) {
          console.error('Directory selection failed', err);
          return;
        }
      }
    }

    setProcessing(true);

    for (const video of videos) {
      updateVideoStatus(video.id, FileStatus.PROCESSING);

      try {
        const response: any = await invoke('convert_video', {
          filePath: video.path,
          options: {
            format: options.format,
            quality: options.quality,
            outputDirectory: targetDir,
            resolution: showResolution
              ? {
                  width: width ? parseInt(width) : undefined,
                  height: height ? parseInt(height) : undefined,
                }
              : undefined,
            bitrate: bitrate || undefined,
            codec: options.codec,
            audioCodec: options.audioCodec,
            subtitle: video.subtitlePath
              ? {
                  path: video.subtitlePath,
                  format: video.subtitleFormat || 'srt',
                  burnIn: video.burnSubtitle || false,
                  forceStyle: video.subtitleForceStyle || undefined,
                }
              : undefined,
          },
        });

        if (response.success) {
          updateVideoStatus(video.id, FileStatus.COMPLETED);
        } else {
          updateVideoStatus(video.id, FileStatus.FAILED);
        }
      } catch (error) {
        console.error('Conversion error:', error);
        updateVideoStatus(video.id, FileStatus.FAILED);
      }
    }

    await message('Batch conversion completed.', {
      title: 'Process Finished',
      kind: 'info',
    });
    setProcessing(false);
  };

  const completedCount = videos.filter(
    (v) => v.status === FileStatus.COMPLETED || v.status === FileStatus.FAILED
  ).length;
  const progress = videos.length > 0 ? (completedCount / videos.length) * 100 : 0;

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/10 border border-purple-600/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">
            Module 02
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">
            Video <span className="text-purple-400 italic">Converter</span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg max-w-md font-medium leading-relaxed">
            Professional video transcoding with subtitle support.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {videos.length > 0 && (
            <button
              onClick={clearVideos}
              className="group flex items-center gap-2 px-6 py-4 rounded-2xl text-slate-500 hover:text-rose-400 transition-all duration-300 hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10"
              disabled={isProcessing}
            >
              <Trash2 size={18} className="transition-transform group-hover:scale-110" />
              <span className="font-bold text-xs tracking-widest uppercase text-slate-400 group-hover:text-rose-400">
                Clear All
              </span>
            </button>
          )}
          <button
            onClick={handleSelectFiles}
            className="group relative px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-xs tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-purple-500/10 flex items-center gap-3 overflow-hidden uppercase"
            disabled={isProcessing}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <FileVideo size={18} className="text-purple-600" />
            Import Videos
          </button>
        </div>
      </header>

      {videos.length === 0 ? (
        <div
          onClick={handleSelectFiles}
          className="group relative border-2 border-dashed border-white/5 rounded-[48px] p-32 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700 cursor-pointer overflow-hidden box-border"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-purple-500)_0%,_transparent_70%)] opacity-0 group-hover:opacity-5 transition-opacity duration-1000" />

          <div className="w-28 h-28 glass rounded-[40px] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl shadow-black/50">
            <FileVideo size={48} className="text-purple-400" />
          </div>

          <h2 className="text-4xl font-black tracking-tighter text-white mb-4">
            Start your process
          </h2>
          <p className="text-slate-500 text-xl font-medium mb-12">
            Drop videos here or{' '}
            <span className="text-purple-400 font-bold underline underline-offset-8">
              browse filesystem
            </span>
          </p>

          <div className="flex items-center gap-4 opacity-40 group-hover:opacity-100 transition-opacity duration-700">
            {['MP4', 'WEBM', 'MKV', 'AVI', 'MOV'].map((ext) => (
              <span
                key={ext}
                className="text-[10px] font-black tracking-widest px-4 py-2 border border-white/10 rounded-xl bg-white/5"
              >
                {ext}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in slide-in-from-bottom-5 duration-700">
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-card rounded-[32px] overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="font-black text-sm tracking-widest uppercase text-slate-500">
                  Queue List • {videos.length} Items
                </h3>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-white/5">
                    {videos.map((video) => (
                      <tr
                        key={video.id}
                        className="group/row group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-slate-500 group-hover:text-purple-400 transition-colors">
                              <VideoIcon size={24} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white tracking-tight truncate max-w-md">
                                {video.name}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                                  {video.extension.replace('.', '')} SRC
                                </span>
                                {video.resolution && (
                                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                                    {video.resolution.width}x{video.resolution.height}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {video.subtitlePath ? (
                            <div className="flex items-center gap-2">
                              <Type size={14} className="text-emerald-400" />
                              <span className="text-[10px] font-bold uppercase tracking-tighter text-emerald-400">
                                {video.burnSubtitle ? 'Hard' : 'Soft'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">
                              No Sub
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <StatusBadge status={video.status} />
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleSelectSubtitle(video.id)}
                              className="p-3 text-slate-600 hover:text-purple-500 transition-all duration-300 hover:bg-purple-500/10 rounded-xl group/btn opacity-0 group-hover/row:opacity-100"
                              disabled={isProcessing}
                              title="Add Subtitle"
                            >
                              <FileText
                                size={18}
                                className="transition-transform group-hover/btn:scale-110"
                              />
                            </button>
                            <button
                              onClick={() => removeVideo(video.id)}
                              className="p-3 text-slate-600 hover:text-rose-500 transition-all duration-300 hover:bg-rose-500/10 rounded-xl group/btn opacity-0 group-hover/row:opacity-100"
                              disabled={isProcessing}
                            >
                              <Trash2
                                size={18}
                                className="transition-transform group-hover/btn:scale-110"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="glass-card rounded-[32px] p-8 space-y-8 sticky top-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                  <Settings2 size={20} />
                </div>
                <h3 className="text-xl font-black tracking-tight">Parameters</h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Destination
                  </label>
                  <button
                    onClick={async () => {
                      const selected = await open({
                        directory: true,
                        multiple: false,
                        title: 'Select Output Directory',
                      });
                      if (selected) setOutputDirectory(selected as string);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] rounded-xl transition-all group/folder"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover/folder:scale-110 transition-transform">
                      <FolderOpen size={16} />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                        Save to
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {outputDirectory || 'Same as Source'}
                      </div>
                    </div>
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Output Format
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['mp4', 'webm', 'mkv', 'avi'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setOptions({ format: f as any })}
                        className={cn(
                          'px-2 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all duration-300 border',
                          options.format === f
                            ? 'bg-white text-slate-950 border-white shadow-lg shadow-white/5'
                            : 'bg-white/[0.03] text-slate-500 border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                        )}
                        disabled={isProcessing}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                      Quality (CRF)
                    </label>
                    <span className="text-lg font-black text-white tabular-nums">
                      {options.quality}
                    </span>
                  </div>
                  <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="absolute h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${((51 - options.quality) / 50) * 100}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="51"
                      value={options.quality}
                      onChange={(e) => setOptions({ quality: parseInt(e.target.value) })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isProcessing}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-slate-700 tracking-tighter uppercase">
                    <span>High Quality</span>
                    <span>Smaller Size</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setShowResolution(!showResolution)}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-300 border',
                      showResolution
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white/[0.03] text-slate-500 border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                    )}
                    disabled={isProcessing}
                  >
                    <Settings2 size={16} />
                    {showResolution ? 'Resize Enabled' : 'Enable Resize'}
                  </button>

                  {showResolution && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            Width (px)
                          </label>
                          <input
                            type="number"
                            placeholder="Auto"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-slate-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            Height (px)
                          </label>
                          <input
                            type="number"
                            placeholder="Auto"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-slate-700"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                          Bitrate (e.g., 5M)
                        </label>
                        <input
                          type="text"
                          placeholder="Auto"
                          value={bitrate}
                          onChange={(e) => setBitrate(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-slate-700"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 space-y-4">
                {isProcessing && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={handleConvertAll}
                  className={cn(
                    'w-full py-5 rounded-[20px] font-black text-sm tracking-widest uppercase transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl overflow-hidden group',
                    isProcessing
                      ? 'bg-slate-900 border border-white/5 text-slate-600 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/40 hover:scale-[1.02] active:scale-95'
                  )}
                  disabled={isProcessing || videos.length === 0}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      <Play size={20} className="fill-current" />
                      CONVERT VIDEOS
                    </>
                  )}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: FileStatus }) {
  switch (status) {
    case FileStatus.PENDING:
      return (
        <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-slate-500 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02]">
          Pending
        </span>
      );
    case FileStatus.PROCESSING:
      return (
        <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-purple-400 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
          Processing
        </span>
      );
    case FileStatus.COMPLETED:
      return (
        <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5">
          Success
        </span>
      );
    case FileStatus.FAILED:
      return (
        <span className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/5">
          Critical
        </span>
      );
    default:
      return null;
  }
}
