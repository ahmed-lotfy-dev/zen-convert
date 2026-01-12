import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  main: {
    plugins: [],
    build: {
      outDir: 'dist-electron/main',
      rollupOptions: {
        external: [
          'sharp',
          'fluent-ffmpeg',
          'youtube-dl-exec',
          '@ffmpeg-installer/ffmpeg',
          '@ffprobe-installer/ffprobe'
        ],
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  },
  preload: {
    plugins: [],
    build: {
      outDir: 'dist-electron/preload',
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    plugins: [react()],
    build: {
      outDir: 'dist-electron/renderer',
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  },
});
