# ZenConvert - System Architecture

## Directory Structure

```
zen-convert/
├── .opencode/
│   └── plan/              # Planning documentation
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.js       # Entry point
│   │   ├── ipc/           # IPC handlers
│   │   │   ├── index.js   # IPC router
│   │   │   ├── files.js   # File operations
│   │   │   ├── images.js  # Image conversion
│   │   │   ├── videos.js  # Video conversion
│   │   │   ├── youtube.js # YouTube downloads
│   │   │   └── queue.js   # Queue management
│   │   ├── services/      # Core processing services
│   │   │   ├── image-converter.js
│   │   │   ├── video-converter.js
│   │   │   ├── youtube-downloader.js
│   │   │   ├── ffmpeg-manager.js
│   │   │   └── queue-manager.js
│   │   ├── utils/         # Utilities
│   │   │   ├── file-utils.js
│   │   │   ├── format-utils.js
│   │   │   └── logger.js
│   │   └── windows/       # Window management
│   │       ├── main-window.js
│   │       └── settings-window.js
│   ├── renderer/          # React frontend
│   │   ├── index.html     # Entry HTML
│   │   ├── index.jsx      # React entry
│   │   ├── App.jsx        # Root component
│   │   ├── components/    # React components
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── MainContent.jsx
│   │   │   ├── conversion/
│   │   │   │   ├── ImageConverter.jsx
│   │   │   │   ├── VideoConverter.jsx
│   │   │   │   └── YoutubeDownloader.jsx
│   │   │   ├── queue/
│   │   │   │   ├── QueueList.jsx
│   │   │   │   ├── QueueItem.jsx
│   │   │   │   └── ProgressBar.jsx
│   │   │   ├── shared/
│   │   │   │   ├── FileDropZone.jsx
│   │   │   │   ├── FormatSelector.jsx
│   │   │   │   ├── QualitySelector.jsx
│   │   │   │   └── StatusMessage.jsx
│   │   │   └── settings/
│   │   │       ├── SettingsPanel.jsx
│   │   │       └── Preferences.jsx
│   │   ├── store/         # State management (Zustand)
│   │   │   ├── index.js   # Store entry
│   │   │   ├── conversion-store.js
│   │   │   ├── queue-store.js
│   │   │   └── settings-store.js
│   │   ├── utils/         # Renderer utilities
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   └── styles/        # CSS/Tailwind
│   │       ├── globals.css
│   │       └── components.css
│   └── shared/            # Shared code between main/renderer
│       ├── constants/
│       │   ├── formats.js
│       │   ├── quality.js
│       │   └── errors.js
│       └── types/
│           ├── conversion.js
│           └── queue.js
├── build/                 # Build configuration
│   ├── webpack.main.js    # Main process webpack config
│   ├── webpack.renderer.js # Renderer process webpack config
│   └── plugins/
│       └── html-webpack-plugin.js
├── resources/            # External resources
│   ├── icons/            # App icons for all platforms
│   ├── ffmpeg/           # FFmpeg binaries (optional, can download)
│   └── default-settings.json
├── forge.config.js       # Electron Forge configuration
├── package.json
├── webpack.config.js
├── .eslintrc.js
├── .prettierrc
├── README.md
└── LICENSE

```

## Application Architecture

### Process Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Process (Node.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Window     │  │   IPC        │  │   Services   │      │
│  │  Management  │  │  Handlers    │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                │            │
│         ┌──────────────┬──────────────┬───────▼───────────┐│
│         │  Sharp (Img) │  FFmpeg (Vid)│  yt-dlp (YouTube) ││
│         └──────────────┴──────────────┴───────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │ IPC
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Renderer Process (Chromium)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React Application                        │   │
│  │  ┌─────────────┬─────────────┬─────────────────────┐ │   │
│  │  │  Components │     State   │      IPC Client    │ │   │
│  │  │  (UI Logic) │ (Zustand)   │  (Communication)   │ │   │
│  │  └─────────────┴─────────────┴─────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

#### Main Process Components

**1. Window Management**
- `main-window.js`: Main application window lifecycle
- `settings-window.js`: Settings/preferences window
- Window state persistence (position, size)

**2. IPC Handlers**
- Router for all IPC messages
- Request validation and sanitization
- Error handling and response formatting

**3. Services**
- `image-converter.js`: Sharp-based image conversion
- `video-converter.js`: FFmpeg-based video conversion
- `youtube-downloader.js`: yt-dlp integration
- `ffmpeg-manager.js`: FFmpeg binary management
- `queue-manager.js`: Job queue and scheduling

**4. Utilities**
- File operations (read, write, delete)
- Format detection and validation
- Logging and error reporting

#### Renderer Process Components

**1. Layout Components**
- Header: App title, theme toggle, settings button
- Sidebar: Navigation between tools
- MainContent: Dynamic content area

**2. Conversion Components**
- ImageConverter: Drag-drop, format selection, quality settings
- VideoConverter: Format selection, codec options, audio extraction
- YoutubeDownloader: URL input, format/quality selection

**3. Queue Components**
- QueueList: Display queued, processing, completed items
- QueueItem: Individual item with controls (pause, cancel, retry)
- ProgressBar: Visual progress indication

**4. Shared Components**
- FileDropZone: Reusable drag-drop area
- FormatSelector: Dropdown with format options
- QualitySelector: Slider/presets for quality
- StatusMessage: Success/error/warning notifications

**5. State Management**
- `conversion-store.js`: Current conversion state
- `queue-store.js`: Queue items and status
- `settings-store.js`: User preferences

## Data Flow

### Image Conversion Flow

```
User Action (Renderer)
    │
    ├─> Drop file / Select file
    │
    ├─> Select output format
    │
    ├─> Set quality/compression
    │
    ├─> Click "Convert"
    │
    ├─> IPC Message: 'image:convert' (with file path, options)
    │
    ▼
Main Process
    │
    ├─> IPC Handler validates request
    │
    ├─> Adds to queue
    │
    ├─> ImageConverterService:
    │       ├─> Reads file with Sharp
    │       ├─> Converts to target format
    │       ├─> Applies quality settings
    │       └─> Writes output file
    │
    ├─> Updates queue status
    │
    ├─> IPC Events: 'conversion:progress', 'conversion:complete'
    │
    ▼
Renderer (UI Updates)
    │
    ├─> Update progress bar
    │
    ├─> Show completion status
    │
    └─> Offer to open file location
```

### Video Conversion Flow

```
User Action (Renderer)
    │
    ├─> Drop video file
    │
    ├─> Select output format (MP4, AVI, etc.)
    │
    ├─> Choose codec (H.264, H.265, etc.)
    │
    ├─> Set quality/resolution
    │
    ├─> Click "Convert"
    │
    ├─> IPC Message: 'video:convert' (with file path, options)
    │
    ▼
Main Process
    │
    ├─> IPC Handler validates request
    │
    ├─> FFMpegManager ensures FFmpeg binary available
    │
    ├─> Adds to queue
    │
    ├─> VideoConverterService:
    │       ├─> Uses fluent-ffmpeg
    │       ├─> Parses input file
    │       ├─> Converts with selected codec
    │       ├─> Applies quality settings
    │       ├─> Streams progress updates
    │       └─> Writes output file
    │
    ├─> Updates queue status
    │
    ├─> IPC Events: 'conversion:progress', 'conversion:complete'
    │
    ▼
Renderer (UI Updates)
    │
    ├─> Update progress bar (percentage, ETA)
    │
    ├─> Show completion status
    │
    └─> Offer to open file location
```

### YouTube Download Flow

```
User Action (Renderer)
    │
    ├─> Paste YouTube URL
    │
    ├─> Click "Get Info" (optional)
    │
    ├─> IPC: 'youtube:get-info' → Returns video info
    │
    ├─> Select format (video/audio)
    │
    ├─> Select quality
    │
    ├─> Click "Download"
    │
    ├─> IPC: 'youtube:download' (with URL, options)
    │
    ▼
Main Process
    │
    ├─> IPC Handler validates URL
    │
    ├─> YouTubeDownloaderService:
    │       ├─> Uses yt-dlp via youtube-dl-exec
    │       ├─> Downloads to temp location
    │       ├─> Streams download progress
    │       └─> Moves to final location
    │
    ├─> Optional: Auto-convert after download
    │
    ├─> Updates queue status
    │
    ├─> IPC Events: 'download:progress', 'download:complete'
    │
    ▼
Renderer (UI Updates)
    │
    ├─> Update progress bar (download speed, ETA)
    │
    ├─> Show completion status
    │
    └─> Offer to open file location
```

### Queue Management Flow

```
Queue Operations
    │
    ├─> Add Item
    │   ├─> Validate input
    │   ├─> Assign ID
    │   ├─> Set status: 'queued'
    │   └─> Store in queue array
    │
    ├─> Process Queue
    │   ├─> Get next item(s) based on concurrency limit
    │   ├─> Set status: 'processing'
    │   ├─> Execute conversion/download
    │   ├─> Stream progress updates
    │   └─> On complete: 'completed' or 'failed'
    │
    ├─> Pause Item
    │   ├─> Stop processing
    │   ├─> Set status: 'paused'
    │   └─> Can resume
    │
    ├─> Cancel Item
    │   ├─> Stop processing
    │   ├─> Clean up temp files
    │   ├─> Set status: 'cancelled'
    │   └─> Remove from queue
    │
    ├─> Retry Item
    │   ├─> Reset status: 'queued'
    │   └─> Reposition in queue
    │
    └─> Clear Completed
        ├─> Remove all 'completed' items
        └─> Keep queue intact
```

## IPC Communication Pattern

### Request/Response Pattern

```javascript
// Renderer (Client)
const result = await window.electron.ipcRenderer.invoke(
  'image:convert',
  {
    filePath: '/path/to/image.jpg',
    outputPath: '/path/to/output.png',
    options: {
      quality: 85,
      format: 'png'
    }
  }
);

// Main Process (Server)
ipcMain.handle('image:convert', async (event, { filePath, outputPath, options }) => {
  try {
    const result = await imageConverter.convert(filePath, outputPath, options);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

### Event Streaming Pattern

```javascript
// Main Process (Emitter)
ipcMain.on('video:convert', async (event, { filePath, options }) => {
  const jobId = generateId();
  
  // Stream progress
  ffmpeg(filePath)
    .on('progress', (progress) => {
      event.reply('conversion:progress', {
        jobId,
        percent: progress.percent,
        eta: progress.eta
      });
    })
    .on('end', () => {
      event.reply('conversion:complete', { jobId, status: 'completed' });
    });

  queue.addItem({ jobId, filePath, options });
});

// Renderer (Listener)
window.electron.ipcRenderer.on('conversion:progress', (event, { jobId, percent, eta }) => {
  // Update UI
  updateProgress(jobId, percent, eta);
});

window.electron.ipcRenderer.on('conversion:complete', (event, { jobId, status }) => {
  // Show completion
  showComplete(jobId, status);
});
```

## State Management (Zustand)

### Store Structure

```javascript
// conversion-store.js
export const useConversionStore = create((set) => ({
  // State
  currentTool: 'image', // 'image' | 'video' | 'youtube'
  selectedFiles: [],
  outputSettings: {
    format: '',
    quality: 'high',
    outputPath: ''
  },
  isProcessing: false,
  currentJobId: null,

  // Actions
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
    outputSettings: defaultSettings,
    isProcessing: false,
    currentJobId: null
  })
}));

// queue-store.js
export const useQueueStore = create((set) => ({
  queue: [], // Array of job objects
  history: [], // Completed jobs

  // Actions
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
  moveToHistory: (jobId) => set((state) => ({
    queue: state.queue.filter(job => job.id !== jobId),
    history: [state.queue.find(job => job.id === jobId), ...state.history]
  })),
  clearCompleted: () => set((state) => ({
    queue: state.queue.filter(job => job.status !== 'completed')
  })),
  clearHistory: () => set({ history: [] })
}));
```

## Error Handling Strategy

### Error Categories

1. **User Input Errors**
   - Invalid file format
   - Corrupted files
   - Invalid URL
   - Insufficient disk space

2. **Processing Errors**
   - Conversion failures
   - FFmpeg/Sharp errors
   - Timeout errors
   - Out of memory errors

3. **System Errors**
   - Missing dependencies
   - Permission errors
   - Network errors (YouTube)
   - FFmpeg binary download failures

### Error Handling Flow

```javascript
// Main Process
try {
  const result = await convertFile(filePath, options);
  event.reply('conversion:success', { result });
} catch (error) {
  // Categorize error
  const errorType = categorizeError(error);
  
  // Log error
  logger.error('Conversion failed', { filePath, error: error.message });
  
  // Send user-friendly message
  const userMessage = getUserFriendlyMessage(errorType, error);
  
  event.reply('conversion:error', {
    jobId,
    error: userMessage,
    type: errorType,
    canRetry: errorType !== 'invalid_input'
  });
}

// Renderer
window.electron.ipcRenderer.on('conversion:error', (event, { error, type, canRetry }) => {
  showErrorMessage(error, type);
  if (canRetry) {
    showRetryButton();
  }
});
```

## Performance Optimization

### Main Process Optimizations

1. **Worker Threads**: Offload CPU-intensive conversions
2. **Concurrency Limits**: Limit simultaneous conversions
3. **Memory Management**: Clean up temp files, free resources
4. **Caching**: Cache converted files when possible
5. **Streaming**: Stream progress updates efficiently

### Renderer Process Optimizations

1. **Virtual Scrolling**: For large queue lists
2. **Debouncing**: Debounce input events
3. **Lazy Loading**: Load components on demand
4. **Code Splitting**: Split code by route/feature
5. **Memoization**: Memoize expensive computations

### Build Optimizations

1. **Tree Shaking**: Remove unused code
2. **Minification**: Minimize JavaScript/CSS
3. **Compression**: Gzip/LZMA compression
4. **ASAR**: Package source code efficiently
5. **External Dependencies**: Exclude FFmpeg binaries, download separately

## Security Considerations

1. **Input Validation**: Sanitize all file paths and URLs
2. **Command Injection**: Prevent shell injection in FFmpeg/yt-dlp
3. **Path Traversal**: Validate file paths don't escape working directory
4. **Resource Limits**: Prevent denial-of-service via large files
5. **Secure IPC**: Validate and sanitize IPC messages
6. **File Permissions**: Respect user file permissions
7. **No Remote Code**: No remote code execution
8. **Auto-Update Security**: Verify update signatures

## Testing Strategy

### Unit Tests
- Services (image converter, video converter, etc.)
- Utilities (file utils, format utils)
- IPC handlers (with mocks)
- State management (Zustand stores)

### Integration Tests
- End-to-end conversion flows
- IPC communication
- Queue management
- Error handling

### E2E Tests
- User workflows (convert image, convert video, download YouTube)
- UI interactions (drag-drop, button clicks, form submissions)
- Cross-platform testing (Windows, macOS, Linux)

### Performance Tests
- Large file conversions
- Batch processing
- Memory usage monitoring
- CPU usage optimization

## Deployment Strategy

### Build Process
1. Development build: `npm run dev`
2. Production build: `npm run build`
3. Package for platforms: `npm run package:win`, `npm run package:mac`, `npm run package:linux`
4. Generate installers: `npm run make`

### Distribution Channels
1. GitHub Releases (primary)
2. Website download page
3. Alternative platforms (Softonic, FileHippo, etc.)
4. Package managers (Homebrew, Snap, Chocolatey - future)

### Update Strategy
1. Auto-updater (electron-updater)
2. Check for updates on startup (optional)
3. Notify users of new versions
4. Silent updates for minor versions

## Monitoring & Analytics (Optional - User Consent)

### Telemetry (Opt-in Only)
- App version and platform
- Feature usage statistics
- Error reports
- Performance metrics

### Privacy Compliance
- Clear opt-in dialog
- Easy to disable
- No personal data
- GDPR compliant if targeting EU

### Implementation
- Use privacy-focused analytics (e.g., Plausible, PostHog)
- Store minimal data
- Regular data cleanup
- Transparent privacy policy