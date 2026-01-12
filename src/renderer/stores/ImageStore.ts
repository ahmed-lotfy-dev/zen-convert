import { create } from 'zustand';
import { SelectedFile, FileStatus } from '../../preload/ipc-types';

interface ImageState {
  images: SelectedFile[];
  isProcessing: boolean;
  
  // Actions
  addImages: (files: SelectedFile[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
  updateImageStatus: (id: string, status: FileStatus) => void;
  setProcessing: (processing: boolean) => void;
}

export const useImageStore = create<ImageState>((set) => ({
  images: [],
  isProcessing: false,

  addImages: (files) => set((state) => ({ 
    images: [...state.images, ...files] 
  })),

  removeImage: (id) => set((state) => ({ 
    images: state.images.filter(img => img.id !== id) 
  })),

  clearImages: () => set({ images: [] }),

  updateImageStatus: (id, status) => set((state) => ({
    images: state.images.map(img => 
      img.id === id ? { ...img, status } : img
    )
  })),

  setProcessing: (processing) => set({ isProcessing: processing }),
}));
