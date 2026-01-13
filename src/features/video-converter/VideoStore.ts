import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FileStatus, VideoFile, ConversionOptions } from '../../shared/types';

interface VideoStore {
  videos: VideoFile[];
  isProcessing: boolean;
  outputDirectory: string | null;
  options: ConversionOptions;
  addVideos: (files: VideoFile[]) => void;
  removeVideo: (id: string) => void;
  clearVideos: () => void;
  updateVideoStatus: (id: string, status: FileStatus) => void;
  updateVideoSubtitle: (id: string, subtitle: Partial<VideoFile>) => void;
  setProcessing: (processing: boolean) => void;
  setOutputDirectory: (dir: string | null) => void;
  setOptions: (options: Partial<ConversionOptions>) => void;
}

export const useVideoStore = create<VideoStore>()(
  persist(
    (set) => ({
      videos: [],
      isProcessing: false,
      outputDirectory: null,
      options: {
        format: 'mp4',
        quality: null, // null = same as source
        codec: 'libx264',
        audioCodec: 'aac',
      },
      addVideos: (files) => set((state) => ({ videos: [...state.videos, ...files] })),
      removeVideo: (id) => set((state) => ({ videos: state.videos.filter((v) => v.id !== id) })),
      clearVideos: () => set({ videos: [] }),
      updateVideoStatus: (id, status) =>
        set((state) => ({
          videos: state.videos.map((v) => (v.id === id ? { ...v, status } : v)),
        })),
      updateVideoSubtitle: (id, subtitle) =>
        set((state) => ({
          videos: state.videos.map((v) => (v.id === id ? { ...v, ...subtitle } : v)),
        })),
      setProcessing: (processing) => set({ isProcessing: processing }),
      setOutputDirectory: (dir) => set({ outputDirectory: dir }),
      setOptions: (options) => set((state) => ({ options: { ...state.options, ...options } })),
    }),
    {
      name: 'video-converter-storage',
      partialize: (state) => ({
        outputDirectory: state.outputDirectory,
        options: state.options,
      }),
    }
  )
);
