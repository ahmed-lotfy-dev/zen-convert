# ZenConvert - Implementation Guide

## Phase 1: Core Infrastructure (Week 1-2)

### 1.1 Project Setup

#### Initialize Project
```bash
# Create project directory
mkdir zen-convert && cd zen-convert

# Initialize npm
npm init -y

# Install Electron and React
npm install --save electron react react-dom

# Install development dependencies
npm install --save-dev @electron-forge/cli @electron-forge/plugin-webpack webpack webpack-cli html-webpack-plugin babel-loader @babel/core @babel/preset-env @babel/preset-react
```

#### Configure Electron Forge
```bash
# Initialize Electron Forge
npx electron-forge init

# Configure webpack plugin
npx electron-forge import @electron-forge/plugin-webpack
```

#### Create Directory Structure
```bash
mkdir -p src/{main,renderer,shared}
mkdir -p src/main/{ipc,services,utils,windows}
mkdir -p src/renderer/{components,store,utils,styles}
mkdir -p src/renderer/components/{layout,conversion,queue,shared,settings}
mkdir -p src/shared/{constants,types}
mkdir -p build/{plugins,webpack}
mkdir -p resources/{icons,ffmpeg}
```

### 1.2 Main Process Setup

#### Create Main Entry Point (src/main/index.js)
```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  registerIpcHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers registration
function registerIpcHandlers() {
  const ipcHandlers = require('./ipc');
  ipcHandlers.register(ipcMain);
}
```

#### Create Preload Script (src/main/preload.js)
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, (event, ...args) => listener(...args)),
    once: (channel, listener) => ipcRenderer.once(channel, (event, ...args) => listener(...args)),
    removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener)
  },
  platform: process.platform,
  version: require('../package.json').version
});
```

### 1.3 IPC Layer Setup

#### Create IPC Router (src/main/ipc/index.js)
```javascript
const filesHandler = require('./files');
const imagesHandler = require('./images');
const videosHandler = require('./videos');
const youtubeHandler = require('./youtube');
const queueHandler = require('./queue');

function register(ipcMain) {
  filesHandler.register(ipcMain);
  imagesHandler.register(ipcMain);
  videosHandler.register(ipcMain);
  youtubeHandler.register(ipcMain);
  queueHandler.register(ipcMain);
}

module.exports = { register };
```

#### Create Files IPC Handler (src/main/ipc/files.js)
```javascript
const { dialog } = require('electron');
const path = require('path');

function register(ipcMain) {
  // Open file dialog
  ipcMain.handle('files:open-dialog', async (event, options = {}) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: options.filters || []
    });
    return result.filePaths;
  });

  // Open directory dialog
  ipcMain.handle('files:open-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    return result.filePaths[0];
  });

  // Save file dialog
  ipcMain.handle('files:save-dialog', async (event, options = {}) => {
    const result = await dialog.showSaveDialog(options);
    return result.filePath;
  });

  // Get file info
  ipcMain.handle('files:get-info', async (event, filePath) => {
    const fs = require('fs');
    const stats = fs.statSync(filePath);
    return {
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension: path.extname(filePath)
    };
  });
}

module.exports = { register };
```

### 1.4 Renderer Setup

#### Create Renderer Entry (src/renderer/index.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZenConvert</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

#### Create React Entry (src/renderer/index.jsx)
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

#### Create Root App Component (src/renderer/App.jsx)
```javascript
import React from 'react';
import { useConversionStore } from './store/conversion-store';

function App() {
  const currentTool = useConversionStore((state) => state.currentTool);
  const setCurrentTool = useConversionStore((state) => state.setCurrentTool);

  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar currentTool={currentTool} onToolChange={setCurrentTool} />
        <MainContent currentTool={currentTool} />
      </div>
    </div>
  );
}

export default App;
```

#### Create Basic Components
```javascript
// src/renderer/components/layout/Header.jsx
function Header() {
  return (
    <header className="bg-gray-900 text-white h-16 flex items-center px-6 shadow-md">
      <h1 className="text-xl font-bold">ZenConvert</h1>
    </header>
  );
}

// src/renderer/components/layout/Sidebar.jsx
function Sidebar({ currentTool, onToolChange }) {
  const tools = [
    { id: 'image', label: 'Image Converter', icon: '🖼️' },
    { id: 'video', label: 'Video Converter', icon: '🎬' },
    { id: 'youtube', label: 'YouTube Downloader', icon: '📺' }
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <nav>
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`w-full text-left px-4 py-3 rounded mb-2 transition ${
              currentTool === tool.id ? 'bg-blue-600' : 'hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// src/renderer/components/layout/MainContent.jsx
function MainContent({ currentTool }) {
  return (
    <main className="flex-1 bg-gray-100 p-8 overflow-auto">
      {currentTool === 'image' && <ImageConverter />}
      {currentTool === 'video' && <VideoConverter />}
      {currentTool === 'youtube' && <YoutubeDownloader />}
    </main>
  );
}
```

### 1.5 State Management

#### Create Conversion Store (src/renderer/store/conversion-store.js)
```javascript
import { create } from 'zustand';

export const useConversionStore = create((set) => ({
  currentTool: 'image',
  selectedFiles: [],
  outputSettings: {
    format: '',
    quality: 'high',
    outputPath: ''
  },
  isProcessing: false,
  currentJobId: null,

  setCurrentTool: (tool) => set({ currentTool: tool }),
  addFiles: (files) => set((state) => ({
    selectedFiles: [...state.selectedFiles, ...files]
  })),
  removeFile: (index) => set((state) => ({
    selectedFiles: state.selectedFiles.filter((_, i) => i !== index)
  })),
  updateSettings: (settings) => set({ outputSettings: settings }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setCurrentJob: (jobId) => set({ currentJobId: jobId }),
  reset: () => set({
    selectedFiles: [],
    outputSettings: {
      format: '',
      quality: 'high',
      outputPath: ''
    },
    isProcessing: false,
    currentJobId: null
  })
}));
```

## Phase 2: Image Conversion (Week 3)

### 2.1 Install Sharp

```bash
npm install --save sharp
npm install --save-dev @electron-forge/plugin-auto-unpack-natives
```

### 2.2 Create Image Conversion Service

#### src/main/services/image-converter.js
```javascript
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class ImageConverter {
  constructor() {
    this.supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'tiff', 'bmp', 'heic', 'avif'];
  }

  async convert(filePath, options) {
    const jobId = uuidv4();
    const outputPath = options.outputPath || this.generateOutputPath(filePath, options.format);

    try {
      // Read image
      let image = sharp(filePath);
      const metadata = await image.metadata();

      // Apply transformations
      if (options.width || options.height) {
        image = image.resize(options.width, options.height, {
          fit: options.fit || 'inside',
          withoutEnlargement: true
        });
      }

      // Set format and quality
      const formatOptions = this.getFormatOptions(options);
      image = image.toFormat(options.format, formatOptions);

      // Convert
      await image.toFile(outputPath);

      return {
        jobId,
        success: true,
        outputPath,
        originalSize: metadata.size,
        outputSize: fs.statSync(outputPath).size,
        format: options.format
      };
    } catch (error) {
      return {
        jobId,
        success: false,
        error: error.message
      };
    }
  }

  getFormatOptions(options) {
    const quality = this.getQualityValue(options.quality);
    const formatOptions = { quality };

    // Format-specific options
    switch (options.format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        return { ...formatOptions, mozjpeg: true };
      case 'png':
        return { ...formatOptions, compressionLevel: 9 };
      case 'webp':
        return { ...formatOptions, effort: 6 };
      case 'avif':
        return { ...formatOptions, effort: 4 };
      default:
        return formatOptions;
    }
  }

  getQualityValue(quality) {
    const qualityMap = {
      low: 50,
      medium: 70,
      high: 85,
      maximum: 95
    };
    return qualityMap[quality] || 85;
  }

  generateOutputPath(inputPath, format) {
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, path.extname(inputPath));
    return path.join(dir, `${name}_converted.${format}`);
  }

  async getMetadata(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      return metadata;
    } catch (error) {
      throw new Error(`Failed to read image metadata: ${error.message}`);
    }
  }
}

module.exports = new ImageConverter();
```

### 2.3 Create Images IPC Handler

#### src/main/ipc/images.js
```javascript
const imageConverter = require('../services/image-converter');
const fileUtils = require('../utils/file-utils');

function register(ipcMain) {
  // Convert image
  ipcMain.handle('images:convert', async (event, { filePath, options }) => {
    try {
      const result = await imageConverter.convert(filePath, options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Batch convert images
  ipcMain.handle('images:convert-batch', async (event, { filePaths, options }) => {
    const results = [];
    for (const filePath of filePaths) {
      const result = await imageConverter.convert(filePath, options);
      results.push(result);
      event.reply('images:progress', { filePath, result });
    }
    return results;
  });

  // Get image metadata
  ipcMain.handle('images:get-metadata', async (event, filePath) => {
    try {
      const metadata = await imageConverter.getMetadata(filePath);
      return { success: true, metadata };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get supported formats
  ipcMain.handle('images:get-supported-formats', async () => {
    return imageConverter.supportedFormats;
  });
}

module.exports = { register };
```

### 2.4 Create Image Converter Component

#### src/renderer/components/conversion/ImageConverter.jsx
```javascript
import React, { useState } from 'react';
import { useConversionStore } from '../../store/conversion-store';
import FileDropZone from '../shared/FileDropZone';
import FormatSelector from '../shared/FormatSelector';
import QualitySelector from '../shared/QualitySelector';

function ImageConverter() {
  const [outputFormat, setOutputFormat] = useState('png');
  const [quality, setQuality] = useState('high');
  const [conversionResults, setConversionResults] = useState([]);

  const selectedFiles = useConversionStore((state) => state.selectedFiles);
  const addFiles = useConversionStore((state) => state.addFiles);
  const removeFile = useConversionStore((state) => state.removeFile);
  const isProcessing = useConversionStore((state) => state.isProcessing);
  const setProcessing = useConversionStore((state) => state.setProcessing);

  const handleFilesSelected = (files) => {
    addFiles(files);
  };

  const handleConvert = async () => {
    setProcessing(true);
    const results = [];

    for (const file of selectedFiles) {
      const result = await window.electron.ipcRenderer.invoke('images:convert', {
        filePath: file.path,
        options: {
          format: outputFormat,
          quality
        }
      });
      results.push(result);
    }

    setConversionResults(results);
    setProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Image Converter</h2>

      <FileDropZone onFilesSelected={handleFilesSelected} accept="image/*" />

      {selectedFiles.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 mb-4">
            <FormatSelector
              type="image"
              value={outputFormat}
              onChange={setOutputFormat}
            />
            <QualitySelector
              value={quality}
              onChange={setQuality}
            />
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Selected Files</h3>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b">
                <span>{file.name}</span>
                <button onClick={() => removeFile(index)}>✕</button>
              </div>
            ))}
          </div>

          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isProcessing ? 'Converting...' : 'Convert'}
          </button>
        </div>
      )}

      {conversionResults.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Conversion Results</h3>
          {conversionResults.map((result, index) => (
            <div key={index} className={result.success ? 'text-green-600' : 'text-red-600'}>
              {result.success ? `✓ Converted to ${result.outputPath}` : `✗ ${result.error}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageConverter;
```

## Phase 3: Video Conversion (Week 4-5)

### 3.1 Install FFmpeg Dependencies

```bash
npm install --save fluent-ffmpeg
npm install --save @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe
```

### 3.2 Create FFmpeg Manager

#### src/main/services/ffmpeg-manager.js
```javascript
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FFmpegManager {
  constructor() {
    this.setFFmpegPath();
    this.setFFprobePath();
  }

  setFFmpegPath() {
    ffmpeg.setFfmpegPath(ffmpegPath);
  }

  setFFprobePath() {
    ffmpeg.setFfprobePath(ffprobePath);
  }

  async getVideoInfo(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) reject(err);
        else resolve(metadata);
      });
    });
  }

  convertVideo(inputPath, outputPath, options) {
    return new Promise((resolve, reject) => {
      const jobId = uuidv4();
      let command = ffmpeg(inputPath);

      // Video codec
      if (options.videoCodec) {
        command = command.videoCodec(options.videoCodec);
      }

      // Audio codec
      if (options.audioCodec) {
        command = command.audioCodec(options.audioCodec);
      }

      // Resolution
      if (options.width || options.height) {
        command = command.size(`${options.width || '?'}x${options.height || '?'}`);
      }

      // Quality/CRF
      if (options.crf) {
        command = command.outputOptions(['-crf', options.crf]);
      }

      // Preset
      if (options.preset) {
        command = command.outputOptions(['-preset', options.preset]);
      }

      // Audio only
      if (options.audioOnly) {
        command = command.noVideo();
      }

      // Progress callback
      command.on('progress', (progress) => {
        // Emit progress event
        if (options.onProgress) {
          options.onProgress({
            jobId,
            percent: progress.percent || 0,
            time: progress.timemark,
            speed: Math.floor(progress.currentKbps || 0)
          });
        }
      });

      // Error handler
      command.on('error', (err) => {
        reject({
          jobId,
          success: false,
          error: err.message
        });
      });

      // Success handler
      command.on('end', () => {
        resolve({
          jobId,
          success: true,
          outputPath
        });
      });

      // Start conversion
      command.save(outputPath);
    });
  }

  extractAudio(inputPath, outputPath, options = {}) {
    return this.convertVideo(inputPath, outputPath, {
      audioCodec: options.audioCodec || 'libmp3lame',
      audioOnly: true,
      onProgress: options.onProgress
    });
  }
}

module.exports = new FFmpegManager();
```

### 3.3 Create Video Conversion Service

#### src/main/services/video-converter.js
```javascript
const ffmpegManager = require('./ffmpeg-manager');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class VideoConverter {
  constructor() {
    this.supportedFormats = {
      video: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'],
      audio: ['mp3', 'aac', 'flac', 'wav', 'm4a', 'ogg']
    };
  }

  async convert(filePath, options) {
    const jobId = uuidv4();
    const outputPath = options.outputPath || this.generateOutputPath(filePath, options.format);

    try {
      const result = await ffmpegManager.convertVideo(filePath, outputPath, options);
      return result;
    } catch (error) {
      return {
        jobId,
        success: false,
        error: error.message
      };
    }
  }

  async extractAudio(filePath, options) {
    const jobId = uuidv4();
    const outputPath = options.outputPath || this.generateOutputPath(filePath, options.format);

    try {
      const result = await ffmpegManager.extractAudio(filePath, outputPath, options);
      return result;
    } catch (error) {
      return {
        jobId,
        success: false,
        error: error.message
      };
    }
  }

  async getMetadata(filePath) {
    try {
      const metadata = await ffmpegManager.getVideoInfo(filePath);
      return {
        success: true,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateOutputPath(inputPath, format) {
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, path.extname(inputPath));
    return path.join(dir, `${name}_converted.${format}`);
  }
}

module.exports = new VideoConverter();
```

### 3.4 Create Videos IPC Handler

#### src/main/ipc/videos.js
```javascript
const videoConverter = require('../services/video-converter');

function register(ipcMain) {
  // Convert video
  ipcMain.handle('videos:convert', async (event, { filePath, options }) => {
    try {
      const result = await videoConverter.convert(filePath, options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Extract audio from video
  ipcMain.handle('videos:extract-audio', async (event, { filePath, options }) => {
    try {
      const result = await videoConverter.extractAudio(filePath, options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get video metadata
  ipcMain.handle('videos:get-metadata', async (event, filePath) => {
    try {
      const result = await videoConverter.getMetadata(filePath);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get supported formats
  ipcMain.handle('videos:get-supported-formats', async () => {
    return videoConverter.supportedFormats;
  });
}

module.exports = { register };
```

## Phase 4: YouTube Downloads (Week 6)

### 4.1 Install YouTube Downloader

```bash
npm install --save youtube-dl-exec
```

### 4.2 Create YouTube Downloader Service

#### src/main/services/youtube-downloader.js
```javascript
const youtubeDl = require('youtube-dl-exec');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

class YouTubeDownloader {
  constructor() {
    this.downloadDir = path.join(require('os').homedir(), 'Downloads', 'ZenConvert');
    this.ensureDownloadDir();
  }

  ensureDownloadDir() {
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }
  }

  async getInfo(url) {
    try {
      const info = await youtubeDl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCallHome: true,
        noCheckCertificate: true
      });
      return {
        success: true,
        info
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async download(url, options) {
    const jobId = uuidv4();
    const outputPath = options.outputPath || path.join(this.downloadDir, '%(title)s.%(ext)s');

    try {
      const result = await youtubeDl.exec(url, {
        output: outputPath,
        format: options.format || 'bestvideo+bestaudio/best',
        mergeOutputFormat: options.mergeFormat || 'mp4',
        extractAudio: options.audioOnly || false,
        audioFormat: options.audioFormat || 'mp3',
        audioQuality: options.audioQuality || '0',
        o: options.outputPath,
        progress: true
      }, {
        cwd: this.downloadDir
      });

      return {
        jobId,
        success: true,
        outputPath
      };
    } catch (error) {
      return {
        jobId,
        success: false,
        error: error.message
      };
    }
  }

  async downloadPlaylist(url, options) {
    const jobId = uuidv4();
    const results = [];

    try {
      const info = await this.getInfo(url);
      if (!info.success) {
        return info;
      }

      const entries = info.info.entries || [];
      for (const entry of entries) {
        const result = await this.download(entry.url, options);
        results.push(result);
      }

      return {
        jobId,
        success: true,
        results
      };
    } catch (error) {
      return {
        jobId,
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new YouTubeDownloader();
```

### 4.3 Create YouTube IPC Handler

#### src/main/ipc/youtube.js
```javascript
const youtubeDownloader = require('../services/youtube-downloader');

function register(ipcMain) {
  // Get video info
  ipcMain.handle('youtube:get-info', async (event, url) => {
    try {
      const result = await youtubeDownloader.getInfo(url);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Download video
  ipcMain.handle('youtube:download', async (event, { url, options }) => {
    try {
      const result = await youtubeDownloader.download(url, options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Download playlist
  ipcMain.handle('youtube:download-playlist', async (event, { url, options }) => {
    try {
      const result = await youtubeDownloader.downloadPlaylist(url, options);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

module.exports = { register };
```

## Phase 5: Queue Management (Week 7)

### 5.1 Create Queue Store

#### src/renderer/store/queue-store.js
```javascript
import { create } from 'zustand';

export const useQueueStore = create((set) => ({
  queue: [],
  history: [],
  maxConcurrent: 2,

  addToQueue: (job) => set((state) => ({
    queue: [...state.queue, job]
  })),

  updateJobStatus: (jobId, status, progress) => set((state) => ({
    queue: state.queue.map(job =>
      job.id === jobId ? { ...job, status, progress } : job
    )
  })),

  removeFromQueue: (jobId) => set((state) => ({
    queue: state.queue.filter(job => job.id !== jobId)
  })),

  moveToHistory: (jobId) => set((state) => {
    const job = state.queue.find(job => job.id === jobId);
    return {
      queue: state.queue.filter(job => job.id !== jobId),
      history: job ? [job, ...state.history] : state.history
    };
  }),

  clearCompleted: () => set((state) => ({
    queue: state.queue.filter(job => job.status !== 'completed')
  })),

  clearHistory: () => set({ history: [] })
}));
```

### 5.2 Create Queue Manager Service

#### src/main/services/queue-manager.js
```javascript
const { v4: uuidv4 } = require('uuid');

class QueueManager {
  constructor() {
    this.queue = [];
    this.maxConcurrent = 2;
    this.activeJobs = 0;
  }

  addJob(job) {
    const queueItem = {
      id: job.id || uuidv4(),
      type: job.type,
      input: job.input,
      options: job.options,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      error: null
    };
    this.queue.push(queueItem);
    this.processQueue();
    return queueItem;
  }

  async processQueue() {
    while (this.activeJobs < this.maxConcurrent) {
      const nextJob = this.queue.find(job => job.status === 'queued');
      if (!nextJob) break;

      this.activeJobs++;
      nextJob.status = 'processing';
      nextJob.startedAt = new Date();

      try {
        await this.executeJob(nextJob);
        nextJob.status = 'completed';
        nextJob.completedAt = new Date();
      } catch (error) {
        nextJob.status = 'failed';
        nextJob.error = error.message;
      }

      this.activeJobs--;
    }
  }

  async executeJob(job) {
    // Execute based on job type
    switch (job.type) {
      case 'image':
        return await this.executeImageJob(job);
      case 'video':
        return await this.executeVideoJob(job);
      case 'youtube':
        return await this.executeYouTubeJob(job);
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  }

  async executeImageJob(job) {
    const imageConverter = require('./image-converter');
    const result = await imageConverter.convert(job.input, job.options);
    return result;
  }

  async executeVideoJob(job) {
    const videoConverter = require('./video-converter');
    const result = await videoConverter.convert(job.input, job.options);
    return result;
  }

  async executeYouTubeJob(job) {
    const youtubeDownloader = require('./youtube-downloader');
    const result = await youtubeDownloader.download(job.input, job.options);
    return result;
  }

  getQueue() {
    return this.queue;
  }

  getJob(jobId) {
    return this.queue.find(job => job.id === jobId);
  }

  cancelJob(jobId) {
    const job = this.getJob(jobId);
    if (job && job.status === 'queued') {
      job.status = 'cancelled';
      return true;
    }
    return false;
  }

  clearCompleted() {
    this.queue = this.queue.filter(job => job.status !== 'completed');
  }
}

module.exports = new QueueManager();
```

## Phase 6: Optimization & Packaging (Week 8)

### 6.1 Configure Webpack Optimization

#### build/webpack.renderer.js
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

### 6.2 Configure Electron Forge

#### forge.config.js
```javascript
module.exports = {
  packagerConfig: {
    name: 'ZenConvert',
    icon: 'resources/icons/icon',
    asar: true,
    asarUnpack: [
      'node_modules/sharp/**/*',
      'node_modules/@ffmpeg-installer/**/*',
      'node_modules/@ffprobe-installer/**/*'
    ],
    ignore: [
      /^\/src/,
      /^\/build/,
      /^\/\.opencode/,
      /^\/\.specify/,
      /^\/\.vscode/,
      /^\/\.git/
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'ZenConvert',
        setupIcon: 'resources/icons/icon.ico'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './build/webpack.main.js',
        renderer: {
          config: './build/webpack.renderer.js',
          entryPoints: [
            {
              html: './src/renderer/index.html',
              js: './src/renderer/index.jsx',
              name: 'main_window'
            }
          ]
        }
      }
    },
    {
      name: '@electron-forge/plugin-auto-unpack-natives'
    }
  ]
};
```

### 6.3 Build Commands

```bash
# Development
npm start

# Build for all platforms
npm run package

# Create installers
npm run make

# Build for specific platform
npm run package -- --platform=win32 --arch=x64
npm run package -- --platform=darwin --arch=x64
npm run package -- --platform=linux --arch=x64
```

## Testing Commands

```bash
# Run development server
npm start

# Run linter
npm run lint

# Run formatter
npm run format

# Build application
npm run build

# Package for distribution
npm run package
```

## Next Steps

After completing all phases:
1. Test thoroughly on all platforms
2. Gather user feedback
3. Fix bugs and optimize performance
4. Prepare for launch
5. Set up distribution channels
6. Create documentation
7. Launch beta version
8. Collect feedback
9. Release stable version