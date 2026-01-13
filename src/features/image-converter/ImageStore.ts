import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SelectedFile, FileStatus } from '../../shared/types';

interface ImageState {
  images: SelectedFile[];
  isProcessing: boolean;
  outputDirectory: string | null;

  // Actions
  addImages: (files: SelectedFile[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  updateImageStatus: (id: string, status: FileStatus) => void;
  setProcessing: (processing: boolean) => void;
  setOutputDirectory: (dir: string | null) => void;
}

export const useImageStore = create<ImageState>()(
  persist(
    (set) => ({
      images: [],
      isProcessing: false,
      outputDirectory: null,

      addImages: (files) =>
        set((state) => ({
          images: [...state.images, ...files],
        })),

      removeImage: (id) =>
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        })),

      clearImages: () => set({ images: [] }),

      updateImageStatus: (id, status) =>
        set((state) => ({
          images: state.images.map((img) => (img.id === id ? { ...img, status } : img)),
        })),

      setProcessing: (processing) => set({ isProcessing: processing }),

      setOutputDirectory: (dir) => set({ outputDirectory: dir }),
    }),
    {
      name: 'image-storage',
      partialize: (state) => ({ outputDirectory: state.outputDirectory }), // Only persist outputDirectory
    }
  )
);
