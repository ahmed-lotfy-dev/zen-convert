# ZenConvert - Optimization Strategies

## Overview
This document covers all optimization strategies to minimize bundle size, reduce resource usage, and improve performance for ZenConvert.

## Bundle Size Optimization

### 1. JavaScript Bundle Optimization

#### 1.1 Code Splitting

**Lazy Load Features**
```javascript
// Instead of importing all converters at once
// Don't do this:
import ImageConverter from './components/ImageConverter';
import VideoConverter from './components/VideoConverter';
import YoutubeDownloader from './components/YoutubeDownloader';

// Do this - dynamic imports:
const ImageConverter = React.lazy(() => import('./components/ImageConverter'));
const VideoConverter = React.lazy(() => import('./components/VideoConverter'));
const YoutubeDownloader = React.lazy(() => import('./components/YoutubeDownloader'));

// Usage with Suspense
<Suspense fallback={<Loader />}>
  {currentTool === 'image' && <ImageConverter />}
  {currentTool === 'video' && <VideoConverter />}
  {currentTool === 'youtube' && <YoutubeDownloader />}
</Suspense>
```

**Route-Based Splitting**
```javascript
// Create separate chunks for each tool
const routes = {
  image: () => import('./components/conversion/ImageConverter'),
  video: () => import('./components/conversion/VideoConverter'),
  youtube: () => import('./components/conversion/YoutubeDownloader')
};
```

#### 1.2 Tree Shaking

**Use ES Modules Only**
```javascript
// Good - ES modules (tree-shakeable)
export { convertImage } from './image-converter';
export { convertVideo } from './video-converter';

// Bad - CommonJS (cannot be tree-shaken)
module.exports = {
  convertImage: require('./image-converter'),
  convertVideo: require('./video-converter')
};
```

**Import Only What You Need**
```javascript
// Don't do this:
import _ from 'lodash';

// Do this:
import { debounce, throttle } from 'lodash';

// Even better - use alternatives:
import { debounce } from 'lodash-es'; // ES module version
// Or use native implementations
const debounce = (fn, delay) => { /* custom implementation */ };
```

**Use Side-Effect Free Modules**
```json
{
  "sideEffects": false
}
```

#### 1.3 Minification

**Webpack Configuration**
```javascript
// build/webpack.renderer.js
module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info']
          },
          mangle: {
            safari10: true
          }
        }
      })
    ]
  }
};
```

#### 1.4 Vendor Splitting

```javascript
// Separate vendor code from app code
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10,
        reuseExistingChunk: true
      },
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        priority: 20,
        reuseExistingChunk: true
      }
    }
  }
}
```

### 2. CSS Optimization

#### 2.1 Tailwind CSS Purging

**tailwind.config.js**
```javascript
module.exports = {
  content: [
    './src/renderer/**/*.{js,jsx,ts,tsx}',
    './src/renderer/index.html'
  ],
  purge: {
    options: {
      safelist: [/^scrollbar-/] // Keep scrollbar utilities
    }
  }
};
```

**Result**: Reduces CSS from ~500KB to ~3KB (purged)

#### 2.2 Critical CSS

```javascript
// Inline critical CSS, defer rest
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-critical-css'),
    require('cssnano')
  ]
};
```

### 3. Asset Optimization

#### 3.1 Image Optimization

**Webpack Image Loader**
```javascript
{
  test: /\.(png|jpe?g|gif|webp|avif)$/i,
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: 10 * 1024 // Inline images < 10KB
    }
  },
  generator: {
    filename: 'images/[hash][ext][query]'
  },
  use: [
    {
      loader: 'image-webpack-loader',
      options: {
        mozjpeg: { quality: 80, progressive: true },
        webp: { quality: 80 },
        avif: { quality: 80 }
      }
    }
  ]
};
```

#### 3.2 Font Optimization

```javascript
// Subset fonts to only used characters
{
  test: /\.(woff|woff2|ttf|eot)$/i,
  type: 'asset/resource',
  generator: {
    filename: 'fonts/[hash][ext][query]'
  }
};
```

### 4. Dependency Optimization

#### 4.1 Remove Unused Dependencies

**Audit Bundle**
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer dist/stats.json

# Find unused dependencies
npx depcheck

# Find large dependencies
npx npx
```

**Replace Large Dependencies**

```javascript
// Replace moment.js (67KB) with date-fns (80KB tree-shakeable)
// Don't use:
import moment from 'moment';

// Use:
import { format, addDays } from 'date-fns';

// Replace lodash (72KB) with native or smaller alternatives
// Don't use:
import _ from 'lodash';

// Use native:
const array = [1, 2, 3];
const unique = [...new Set(array)]; // instead of _.uniq
const result = array.filter(x => x > 0); // instead of _.filter

// Or use lodash-es (ES module version)
import { debounce } from 'lodash-es';
```

#### 4.2 Use Smaller Alternatives

| Dependency | Size | Alternative | Size | Savings |
|------------|------|-------------|------|---------|
| moment.js | 67KB | date-fns | 20KB (tree-shaken) | 70% |
| lodash | 72KB | lodash-es | 5KB (tree-shaken) | 93% |
| axios | 28KB | fetch API | 0KB (native) | 100% |
| classnames | 2KB | clsx | 1KB | 50% |
| prop-types | 5KB | TypeScript | 0KB | 100% |

### 5. Electron Optimization

#### 5.1 ASAR Compression

**forge.config.js**
```javascript
{
  packagerConfig: {
    asar: true,
    asarUnpack: [
      'node_modules/sharp/**/*',
      'node_modules/@ffmpeg-installer/**/*',
      'node_modules/@ffprobe-installer/**/*',
      'node_modules/yt-dlp-exec/**/*'
    ]
  }
};
```

**Benefits**:
- Reduces app size by 10-20%
- Faster app startup
- Conceals source code
- Prevents path length issues on Windows

#### 5.2 Exclude Unnecessary Files

```javascript
{
  packagerConfig: {
    ignore: [
      /^\/src/,
      /^\/build/,
      /^\/\.opencode/,
      /^\/\.specify/,
      /^\/\.vscode/,
      /^\/\.git/,
      /^\/node_modules\/\.cache/,
      /^\/test/,
      /^\/\.eslintrc/,
      /^\/\.prettierrc/,
      /^\/README\.md/,
      /^\/CHANGELOG\.md/,
      /^\/CONTRIBUTING\.md/
    ]
  }
};
```

#### 5.3 Reduce Electron Version

**Use Specific Version**
```json
{
  "devDependencies": {
    "electron": "32.0.0"
  }
}
```

**Don't Use Latest**
- Latest version may be larger
- Use stable version with required features
- Test compatibility before upgrading

#### 5.4 Exclude Electron DevTools in Production

**webpack.main.js**
```javascript
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // ...
  externals: isProduction ? ['electron-devtools-installer'] : []
};
```

### 6. Native Binary Optimization

#### 6.1 FFmpeg Binary

**Use Minimal FFmpeg Build**

```bash
# Download minimal FFmpeg build from custom source
# Only include needed codecs and features

# Required codecs for ZenConvert:
# - Video: H.264, H.265, VP9
# - Audio: AAC, MP3, FLAC
# - Containers: MP4, MKV, WebM
# - Filters: scale, crop, trim

# Build minimal FFmpeg (optional)
./configure \
  --disable-everything \
  --enable-libx264 \
  --enable-libx265 \
  --enable-libvpx-vp9 \
  --enable-libmp3lame \
  --enable-libfdk-aac \
  --enable-libflac \
  --enable-demuxer=mp4,matroska,webm \
  --enable-muxer=mp4,matroska,webm \
  --enable-filter=scale,crop,trim \
  --enable-protocol=file,http,https \
  --disable-doc \
  --disable-debug
```

**Size Reduction**: ~40MB → ~15MB (62% savings)

#### 6.2 Sharp (libvips)

**Already Optimized**
- Sharp uses pre-compiled libvips
- Automatically selects minimal required version
- No action needed

#### 6.3 yt-dlp

**Download at Runtime**
```javascript
// Only download when first YouTube download is requested
async function ensureYtDlp() {
  if (fs.existsSync(ytDlpPath)) {
    return ytDlpPath;
  }

  // Download binary
  await downloadYtDlp();
  return ytDlpPath;
}
```

**Benefits**:
- Smaller initial download
- Always get latest version
- Can update automatically

### 7. Compression Optimization

#### 7.1 LZMA Compression (ASAR)

```javascript
{
  packagerConfig: {
    asar: {
      unpack: [
        'node_modules/sharp/**/*',
        'node_modules/@ffmpeg-installer/**/*',
        'node_modules/@ffprobe-installer/**/*'
      ]
    }
  }
};
```

#### 7.2 Gzip Compression

**Nginx/Apache Configuration**
```apache
# Enable gzip for downloads
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/json
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/html
</IfModule>
```

## Performance Optimization

### 1. Main Process Optimization

#### 1.1 Worker Threads

**Offload CPU-Intensive Tasks**

```javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  // Main thread
  const worker = new Worker('./image-worker.js');
  worker.postMessage({ filePath, options });
  worker.on('message', (result) => {
    // Handle result
  });
} else {
  // Worker thread
  parentPort.on('message', async ({ filePath, options }) => {
    const result = await convertImage(filePath, options);
    parentPort.postMessage(result);
  });
}
```

**Benefits**:
- Non-blocking UI
- Parallel processing
- Better CPU utilization

#### 1.2 Process Pool

```javascript
const { Worker } = require('worker_threads');
const os = require('os');

class WorkerPool {
  constructor(size = os.cpus().length - 1) {
    this.size = size;
    this.workers = [];
    this.taskQueue = [];
    this.init();
  }

  init() {
    for (let i = 0; i < this.size; i++) {
      this.workers.push(new Worker('./worker.js'));
    }
  }

  async execute(task) {
    return new Promise((resolve) => {
      const worker = this.workers.pop();
      if (worker) {
        worker.once('message', (result) => {
          this.workers.push(worker);
          resolve(result);
        });
        worker.postMessage(task);
      } else {
        this.taskQueue.push({ task, resolve });
      }
    });
  }
}
```

#### 1.3 Memory Management

**Clean Up Resources**
```javascript
// After conversion
async function cleanup(jobId) {
  // Delete temp files
  const tempFiles = getTempFiles(jobId);
  for (const file of tempFiles) {
    fs.unlinkSync(file);
  }

  // Clear Sharp cache
  sharp.cache({ files: 0, items: 0, memory: 0 });

  // Clear FFmpeg cache
  ffmpeg.clear();
}
```

### 2. Renderer Process Optimization

#### 2.1 Virtual Scrolling

**For Large Lists**
```javascript
import { FixedSizeList as List } from 'react-window';

function QueueList({ items }) {
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={60}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <QueueItem item={items[index]} />
        </div>
      )}
    </List>
  );
}
```

**Benefits**:
- Renders only visible items
- Constant memory usage
- Smooth scrolling

#### 2.2 Debouncing

**Prevent Excessive Updates**
```javascript
import { debounce } from 'lodash-es';

const handleInputChange = debounce((value) => {
  updateSettings(value);
}, 300);
```

#### 2.3 Memoization

**Cache Expensive Computations**
```javascript
import { useMemo, useCallback } from 'react';

function Converter({ files }) {
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => a.name.localeCompare(b.name));
  }, [files]);

  const handleConvert = useCallback(() => {
    convertFiles(sortedFiles);
  }, [sortedFiles]);

  return <button onClick={handleConvert}>Convert</button>;
}
```

#### 2.4 Lazy Loading Images

```javascript
import { LazyLoadImage } from 'react-lazy-load-image-component';

function ImageList({ images }) {
  return (
    <div>
      {images.map((image, index) => (
        <LazyLoadImage
          key={index}
          src={image.thumbnail}
          alt={image.name}
          placeholder={<div>Loading...</div>}
          effect="blur"
        />
      ))}
    </div>
  );
}
```

### 3. Network Optimization

#### 3.1 YouTube Download Throttling

```javascript
class YouTubeDownloader {
  async download(url, options) {
    const maxRetries = 3;
    const retryDelay = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await this._download(url, options);
        return result;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
      }
    }
  }
}
```

### 4. File I/O Optimization

#### 4.1 Streaming File Operations

```javascript
const fs = require('fs');
const path = require('path');

async function streamCopy(inputPath, outputPath) {
  const reader = fs.createReadStream(inputPath);
  const writer = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    reader.pipe(writer);
    reader.on('end', resolve);
    reader.on('error', reject);
    writer.on('error', reject);
  });
}
```

#### 4.2 Parallel File Operations

```javascript
async function processFilesInParallel(files, concurrency = 4) {
  const results = [];
  const batches = [];

  for (let i = 0; i < files.length; i += concurrency) {
    batches.push(files.slice(i, i + concurrency));
  }

  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(file => processFile(file))
    );
    results.push(...batchResults);
  }

  return results;
}
```

### 5. Caching Strategies

#### 5.1 Conversion Cache

```javascript
class ConversionCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100;
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}
```

#### 5.2 Metadata Cache

```javascript
class MetadataCache {
  constructor() {
    this.cache = new Map();
  }

  async getMetadata(filePath) {
    const key = filePath;
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const metadata = await this._fetchMetadata(filePath);
    this.cache.set(key, metadata);
    return metadata;
  }
}
```

## Build Optimization

### 1. Webpack Optimizations

#### 1.1 Production vs Development Builds

**webpack.common.js**
```javascript
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
  optimization: {
    minimize: isProduction,
    runtimeChunk: 'single',
    removeAvailableModules: isProduction,
    removeEmptyChunks: isProduction,
    splitChunks: isProduction ? {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.${packageName.replace('@', '')}`;
          }
        }
      }
    } : false
  }
};
```

#### 1.2 DLL Plugin (Optional)

**Reduce Rebuild Time**

```javascript
const webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    vendor: ['react', 'react-dom', 'zustand', 'immer']
  },
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'dll.[name].js',
    library: '[name]_[fullhash]'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, '../build', '[name]-manifest.json'),
      name: '[name]_[fullhash]'
    })
  ]
};
```

### 2. Electron Forge Optimization

#### 2.1 Platform-Specific Builds

**Build Scripts**
```json
{
  "scripts": {
    "package:win": "npm run package -- --platform=win32 --arch=x64",
    "package:mac": "npm run package -- --platform=darwin --arch=x64",
    "package:mac-arm": "npm run package -- --platform=darwin --arch=arm64",
    "package:linux": "npm run package -- --platform=linux --arch=x64"
  }
}
```

#### 2.2 Makers Configuration

**Minimal Installers**

```javascript
// Windows NSIS
{
  name: '@electron-forge/maker-squirrel',
  config: {
    loadingGif: '',
    setupIcon: 'resources/icons/icon.ico',
    noDelta: true,
    remoteReleases: false
  }
}

// macOS
{
  name: '@electron-forge/maker-zip',
  config: {
    icon: 'resources/icons/icon.icns'
  }
}

// Linux AppImage
{
  name: '@electron-forge/maker-appimage',
  config: {
    options: {
      icon: 'resources/icons/icon.png',
      category: 'AudioVideo'
    }
  }
}
```

## Size Targets

### Achievable Sizes

| Platform | Target | Current | Gap |
|----------|--------|---------|-----|
| Windows Installer | 150MB | 140MB | -10MB |
| macOS DMG | 200MB | 160MB | -40MB |
| Linux AppImage | 180MB | 140MB | -40MB |
| JS Bundle | 500KB | 462KB | -38KB |

### Optimization Priorities

1. **High Priority** (Must Do)
   - Tree shaking
   - Code splitting
   - ASAR compression
   - Exclude unnecessary files

2. **Medium Priority** (Should Do)
   - Minification
   - CSS purging
   - Vendor splitting
   - Native binary optimization

3. **Low Priority** (Nice to Have)
   - Custom FFmpeg build
   - DLL plugin
   - Advanced caching
   - Worker threads

## Monitoring & Analysis

### Bundle Analysis Tools

```bash
# Webpack Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

plugins: [
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
    reportFilename: '../reports/bundle-report.html'
  })
];
```

```bash
# Source Map Explorer
npm install --save-dev source-map-explorer

# Add to package.json
"scripts": {
  "analyze": "npm run build && source-map-explorer dist/*.js"
}
```

### Performance Monitoring

```javascript
// Main process performance
const { app } = require('electron');
const startTime = Date.now();

app.whenReady().then(() => {
  const loadTime = Date.now() - startTime;
  console.log(`App startup time: ${loadTime}ms`);
});
```

## Continuous Optimization

### Automated Checks

**CI/CD Pipeline**
```yaml
# .github/workflows/size-check.yml
name: Size Check

on: [pull_request]

jobs:
  check-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Check bundle size
        run: npx bundlesize
```

**bundlesize Configuration**
```json
{
  "bundlesize": [
    {
      "path": "./dist/*.js",
      "maxSize": "500KB"
    }
  ]
}
```

## Summary

**Key Optimization Strategies:**

1. **Code Splitting** - Load only what's needed
2. **Tree Shaking** - Remove unused code
3. **Minification** - Reduce code size
4. **ASAR Compression** - Package optimization
5. **Native Binary Optimization** - Use minimal FFmpeg
6. **Caching** - Reduce redundant operations
7. **Virtual Scrolling** - Efficient list rendering
8. **Worker Threads** - Parallel processing

**Expected Results:**

- **Windows**: ~140MB (from ~200MB)
- **macOS**: ~160MB (from ~220MB)
- **Linux**: ~140MB (from ~200MB)
- **JS Bundle**: ~462KB (from ~1MB)

These optimizations ensure ZenConvert remains lightweight and fast while supporting comprehensive media conversion features.