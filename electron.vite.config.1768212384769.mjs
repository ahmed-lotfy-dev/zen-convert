// electron.vite.config.ts
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
var __electron_vite_injected_dirname = "D:\\ahmed\\desktop\\zen-convert";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [],
    build: {
      outDir: "dist-electron/main",
      rollupOptions: {
        external: [
          "sharp",
          "fluent-ffmpeg",
          "youtube-dl-exec",
          "@ffmpeg-installer/ffmpeg",
          "@ffprobe-installer/ffprobe"
        ]
      }
    },
    resolve: {
      alias: {
        "@": resolve(__electron_vite_injected_dirname, "src")
      }
    }
  },
  preload: {
    plugins: [],
    build: {
      outDir: "dist-electron/preload"
    },
    resolve: {
      alias: {
        "@": resolve(__electron_vite_injected_dirname, "src")
      }
    }
  },
  renderer: {
    root: resolve(__electron_vite_injected_dirname, "src/renderer"),
    plugins: [react()],
    build: {
      outDir: "dist-electron/renderer"
    },
    resolve: {
      alias: {
        "@": resolve(__electron_vite_injected_dirname, "src/renderer")
      }
    },
    server: {
      port: 5173,
      strictPort: true
    }
  }
});
export {
  electron_vite_config_default as default
};
