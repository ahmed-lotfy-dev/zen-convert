# ZenConvert - Dependencies

## Core Dependencies

```json
{
  "dependencies": {
    "electron": "^32.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "immer": "^10.0.0"
  }
}
```

### electron ^32.0.0
**Purpose**: Cross-platform desktop application framework
**Usage**: Main process, renderer process, native OS integration
**Platform**: Windows, macOS, Linux
**Size Impact**: ~80MB (includes Chromium + Node.js)

### react ^18.2.0
**Purpose**: UI framework for renderer process
**Usage**: Component-based UI architecture
**Bundle Size**: ~130KB minified + gzipped
**Notes**: Use concurrent features where applicable

### react-dom ^18.2.0
**Purpose**: React DOM renderer
**Usage**: Rendering React components to DOM
**Bundle Size**: ~120KB minified + gzipped
**Notes**: Required companion to React

### zustand ^4.4.0
**Purpose**: Lightweight state management
**Usage**: Queue management, conversion state, settings
**Bundle Size**: ~2KB minified
**Advantages**: Simpler than Redux, less boilerplate, TypeScript support

### immer ^10.0.0
**Purpose**: Immutable state updates
**Usage**: Simplify state updates in Zustand
**Bundle Size**: ~15KB minified
**Notes**: Used by Zustand internally

## Image Processing Dependencies

```json
{
  "dependencies": {
    "sharp": "^0.33.0"
  }
}
```

### sharp ^0.33.0
**Purpose**: High-performance image processing
**Usage**: Image format conversion, resizing, quality adjustment
**Bundle Size**: ~10MB (includes native libvips binaries)
**Platform Support**:
- Windows: x64, ARM64
- macOS: x64, ARM64 (Apple Silicon)
- Linux: x64, ARM64

**Features**:
- Format support: JPEG, PNG, WebP, AVIF, TIFF, GIF, SVG
- Operations: resize, crop, rotate, flip, blur, sharpen
- Metadata: EXIF, ICC profile handling
- Color space: sRGB, RGB, RGBA, grayscale
- Quality: Compression level control
- Performance: Fast C++ backend with libvips

**Alternatives Considered**:
- jimp: Pure JS, slower, larger bundle
- canvas: Requires system dependencies
- gm: GraphicsMagick wrapper, less maintained

## Video Processing Dependencies

```json
{
  "dependencies": {
    "fluent-ffmpeg": "^2.1.2",
    "@ffmpeg-installer/ffmpeg": "^1.1.0",
    "@ffprobe-installer/ffprobe": "^1.4.0"
  }
}
```

### fluent-ffmpeg ^2.1.2
**Purpose**: FFmpeg wrapper for Node.js
**Usage**: Video conversion, audio extraction, format detection
**Bundle Size**: ~50KB minified
**Notes**: Does not include FFmpeg binaries (installed separately)

**Features**:
- Chainable API for FFmpeg commands
- Video codec selection (H.264, H.265, VP9, AV1)
- Audio codec selection (AAC, MP3, FLAC, Opus)
- Container format support (MP4, MKV, WebM, AVI, MOV, FLV, WMV)
- Video processing: trim, crop, resize, rotate
- Audio processing: volume, speed, channels
- Metadata handling
- Progress events for real-time updates
- Subtitle support

### @ffmpeg-installer/ffmpeg ^1.1.0
**Purpose**: Platform-specific FFmpeg binaries
**Usage**: Downloads and installs FFmpeg for current platform
**Size Impact**: ~40MB per platform (optional download)
**Platform Support**:
- Windows: x64 (ffmpeg.exe)
- macOS: x64, ARM64 (ffmpeg)
- Linux: x64 (ffmpeg)

**Features**:
- Automatic platform detection
- Path resolution for fluent-ffmpeg
- Version: FFmpeg 6.x
- Static binaries (no system dependencies)

### @ffprobe-installer/ffprobe ^1.4.0
**Purpose**: FFprobe binary for video metadata
**Usage**: Extract video information (duration, codec, resolution, etc.)
**Size Impact**: ~5MB per platform (optional download)
**Platform Support**: Same as FFmpeg

**Features**:
- Video codec detection
- Audio codec detection
- Resolution and frame rate
- Duration and bitrate
- Stream information
- Metadata extraction

## YouTube Download Dependencies

```json
{
  "dependencies": {
    "youtube-dl-exec": "^2.4.0"
  }
}
```

### youtube-dl-exec ^2.4.0
**Purpose**: yt-dlp wrapper for Node.js
**Usage**: YouTube video/audio downloads, playlist downloads
**Bundle Size**: ~20KB minified
**Notes**: Does not include yt-dlp binary (installed at runtime)

**Features**:
- YouTube video download (with quality selection)
- YouTube audio download (MP3, AAC, FLAC, etc.)
- Playlist download (batch processing)
- Format selection (MP4, WebM, MKV, etc.)
- Quality options (360p to 4K)
- Subtitle download
- Metadata extraction (title, description, thumbnail)
- Download progress tracking
- Speed and ETA reporting
- Proxy support (optional)
- Cookie support (for age-restricted content)

**Platform Support**:
- Downloads yt-dlp binary at first run
- Cross-platform (Windows, macOS, Linux)
- Auto-updates yt-dlp binary

## UI Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18"
  }
}
```

### tailwindcss ^3.4.0
**Purpose**: Utility-first CSS framework
**Usage**: Styling UI components
**Bundle Size**: ~3KB (purged) or ~500KB (full) - will purged in production
**Build Time**: Adds ~2-5 seconds to build process

**Features**:
- Rapid UI development
- Responsive design utilities
- Dark mode support
- Custom theme configuration
- Purge unused styles in production

**Alternatives Considered**:
- CSS-in-JS (styled-components, emotion): Larger bundle, slower runtime
- Bootstrap: Larger bundle, less flexible
- Plain CSS: More verbose, harder to maintain

### @headlessui/react ^1.7.17
**Purpose**: Accessible UI component library
**Usage**: Dropdowns, modals, dialogs, tabs
**Bundle Size**: ~30KB minified (tree-shakeable)
**Features**:
- Fully accessible components
- Keyboard navigation
- Screen reader support
- Unstyled components (styled with Tailwind)
- React hooks for complex interactions

### @heroicons/react ^2.0.18
**Purpose**: Icon set for React
**Usage**: UI icons (play, pause, download, settings, etc.)
**Bundle Size**: ~15KB (only used icons)
**Features**:
- SVG icons optimized for React
- Outline and solid variants
- Common icon set
- MIT licensed

**Alternatives Considered**:
- react-icons: Larger bundle, more icons
- lucide-react: Similar size, more modern
- Material-UI Icons: Larger bundle

## Build & Packaging Dependencies

```json
{
  "devDependencies": {
    "@electron-forge/cli": "^6.3.0",
    "@electron-forge/maker-deb": "^6.3.0",
    "@electron-forge/maker-rpm": "^6.3.0",
    "@electron-forge/maker-squirrel": "^6.3.0",
    "@electron-forge/maker-zip": "^6.3.0",
    "@electron-forge/plugin-auto-unpack-natives": "^6.3.0",
    "@electron-forge/plugin-webpack": "^6.3.0",
    "electron-builder": "^24.6.0",
    "@electron/asar": "^3.2.0"
  }
}
```

### @electron-forge/cli ^6.3.0
**Purpose**: Electron build and packaging tool
**Usage**: Build and distribute application
**Bundle Size**: Development dependency only
**Notes**: Official Electron tool

### @electron-forge/maker-* ^6.3.0
**Purpose**: Platform-specific installers
**Usage**: Create installers for different platforms
**Package Types**:
- **maker-squirrel**: Windows NSIS installer
- **maker-zip**: Windows/macOS/Linux portable archive
- **maker-deb**: Linux Debian package
- **maker-rpm**: Linux RPM package

### @electron-forge/plugin-webpack ^6.3.0
**Purpose**: Webpack integration for Electron Forge
**Usage**: Bundle and optimize code
**Features**:
- Main process webpack configuration
- Renderer process webpack configuration
- Hot module replacement (HMR) for development
- Code splitting
- Tree shaking
- Minification

### @electron-forge/plugin-auto-unpack-natives ^6.3.0
**Purpose**: Auto-unpack native modules
**Usage**: Unpack native modules (Sharp, FFmpeg) from ASAR
**Features**:
- Automatically unpack native modules
- Improve performance for native dependencies
- Required for Sharp and FFmpeg

### electron-builder ^24.6.0
**Purpose**: Alternative packaging tool (optional)
**Usage**: Create installers with advanced options
**Bundle Size**: Development dependency only
**Notes**: Used if Electron Forge doesn't meet requirements

### @electron/asar ^3.2.0
**Purpose**: ASAR archive creation
**Usage**: Package source code into ASAR format
**Bundle Size**: Development dependency only
**Features**:
- Create ASAR archives
- Integrity checking
- LZMA compression

## Development Dependencies

```json
{
  "devDependencies": {
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0",
    "webpack-merge": "^5.10.0",
    "html-webpack-plugin": "^5.6.0",
    "css-loader": "^6.8.0",
    "style-loader": "^3.3.0",
    "postcss": "^8.4.0",
    "postcss-loader": "^7.3.0",
    "autoprefixer": "^10.4.0",
    "babel-loader": "^9.1.0",
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/preset-react": "^7.22.0",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.1.1",
    "@electron-forge/plugin-webpack": "^6.3.0"
  }
}
```

### webpack ^5.89.0
**Purpose**: Module bundler
**Usage**: Bundle JavaScript, CSS, assets
**Bundle Size**: Development dependency only
**Features**:
- Code splitting
- Tree shaking
- Minification
- Hot module replacement
- Dev server

### webpack-cli ^5.1.0
**Purpose**: Webpack CLI
**Usage**: Run Webpack from command line

### webpack-merge ^5.10.0
**Purpose**: Merge webpack configurations
**Usage**: Combine base and platform-specific configs

### html-webpack-plugin ^5.6.0
**Purpose**: Generate HTML files
**Usage**: Create index.html for renderer process

### css-loader ^6.8.0
**Purpose**: Load CSS files
**Usage**: Import CSS in JavaScript

### style-loader ^6.8.0
**Purpose**: Inject CSS into DOM
**Usage**: Load CSS styles in renderer

### postcss ^8.4.0
**Purpose**: CSS post-processor
**Usage**: Transform CSS (for Tailwind)

### postcss-loader ^7.3.0
**Purpose**: PostCSS loader for Webpack
**Usage**: Apply PostCSS transformations

### autoprefixer ^10.4.0
**Purpose**: Add vendor prefixes
**Usage**: Cross-browser CSS compatibility

### babel-loader ^9.1.0
**Purpose**: Babel loader for Webpack
**Usage**: Transpile JSX and ES6+

### @babel/core ^7.23.0
**Purpose**: Babel core
**Usage**: JavaScript transpilation

### @babel/preset-env ^7.23.0
**Purpose**: Babel preset for modern JavaScript
**Usage**: Transpile to ES5 for compatibility

### @babel/preset-react ^7.22.0
**Purpose**: Babel preset for React
**Usage**: Transpile JSX

### eslint ^8.55.0
**Purpose**: JavaScript linter
**Usage**: Code quality and consistency
**Bundle Size**: Development dependency only

### eslint-plugin-react ^7.33.0
**Purpose**: React linting rules
**Usage**: Enforce React best practices

### eslint-plugin-react-hooks ^4.6.0
**Purpose**: React Hooks linting rules
**Usage**: Enforce Hooks rules

### prettier ^3.1.1
**Purpose**: Code formatter
**Usage**: Consistent code formatting
**Bundle Size**: Development dependency only

## Optional Dependencies (Future Features)

```json
{
  "dependencies": {
    "electron-store": "^8.1.0",
    "electron-updater": "^6.1.0",
    "electron-is-dev": "^2.0.0"
  }
}
```

### electron-store ^8.1.0
**Purpose**: Persistent data storage
**Usage**: Store user settings, preferences, history
**Bundle Size**: ~5KB minified
**Notes**: Simple key-value store, file-based

### electron-updater ^6.1.0
**Purpose**: Auto-updater
**Usage**: Update application automatically
**Bundle Size**: ~20KB minified
**Notes**: Requires update server (GitHub Releases, etc.)

### electron-is-dev ^2.0.0
**Purpose**: Detect development mode
**Usage**: Conditional logic for dev/prod
**Bundle Size**: ~1KB minified

## Utilities Dependencies

```json
{
  "dependencies": {
    "file-type": "^18.7.0",
    "mime-types": "^2.1.35",
    "path": "^0.12.7",
    "uuid": "^9.0.0",
    "date-fns": "^2.30.0"
  }
}
```

### file-type ^18.7.0
**Purpose**: Detect file type from buffer
**Usage**: Format detection for images and videos
**Bundle Size**: ~60KB minified
**Features**:
- Detect file type from magic numbers
- Support for 200+ file formats
- MIME type detection
- Extension detection

### mime-types ^2.1.35
**Purpose**: MIME type lookup
**Usage**: Get MIME types for file extensions
**Bundle Size**: ~15KB minified

### path ^0.12.7
**Purpose**: Path utilities (Node.js built-in)
**Usage**: File path manipulation
**Bundle Size**: Built-in (0KB)

### uuid ^9.0.0
**Purpose**: Generate UUIDs
**Usage**: Unique job IDs, request tracking
**Bundle Size**: ~5KB minified

### date-fns ^2.30.0
**Purpose**: Date manipulation
**Usage**: Format dates, calculate durations, ETAs
**Bundle Size**: ~80KB minified (tree-shakeable)
**Notes**: Use only imported functions

## Testing Dependencies (Future)

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "electron-mocha": "^12.0.0",
    "spectron": "^19.0.0"
  }
}
```

### jest ^29.7.0
**Purpose**: JavaScript testing framework
**Usage**: Unit tests, integration tests
**Bundle Size**: Development dependency only

### @testing-library/react ^14.1.0
**Purpose**: React testing utilities
**Usage**: Test React components
**Bundle Size**: Development dependency only

### electron-mocha ^12.0.0
**Purpose**: Test Electron main process
**Usage**: Main process unit tests
**Bundle Size**: Development dependency only

## Complete package.json

```json
{
  "name": "zen-convert",
  "version": "1.0.0",
  "description": "Desktop media conversion tool - images, videos, YouTube downloads",
  "main": ".webpack/main/index.js",
  "author": "ZenConvert Team",
  "license": "MIT",
  "scripts": {
    "start": "electron-forge start",
    "package": "electron-forge package",
    "make": "electron-forge make",
    "build": "electron-forge build",
    "lint": "eslint src/**/*.{js,jsx}",
    "format": "prettier --write src/**/*.{js,jsx,css,json}"
  },
  "dependencies": {
    "electron": "^32.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "immer": "^10.0.0",
    "sharp": "^0.33.0",
    "fluent-ffmpeg": "^2.1.2",
    "@ffmpeg-installer/ffmpeg": "^1.1.0",
    "@ffprobe-installer/ffprobe": "^1.4.0",
    "youtube-dl-exec": "^2.4.0",
    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.17",
    "@heroicons/react": "^2.0.18",
    "file-type": "^18.7.0",
    "mime-types": "^2.1.35",
    "uuid": "^9.0.0",
    "date-fns": "^2.30.0",
    "electron-store": "^8.1.0",
    "electron-updater": "^6.1.0"
  },
  "devDependencies": {
    "@electron-forge/cli": "^6.3.0",
    "@electron-forge/maker-deb": "^6.3.0",
    "@electron-forge/maker-rpm": "^6.3.0",
    "@electron-forge/maker-squirrel": "^6.3.0",
    "@electron-forge/maker-zip": "^6.3.0",
    "@electron-forge/plugin-auto-unpack-natives": "^6.3.0",
    "@electron-forge/plugin-webpack": "^6.3.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0",
    "webpack-merge": "^5.10.0",
    "html-webpack-plugin": "^5.6.0",
    "css-loader": "^6.8.0",
    "style-loader": "^3.3.0",
    "postcss": "^8.4.0",
    "postcss-loader": "^7.3.0",
    "autoprefixer": "^10.4.0",
    "babel-loader": "^9.1.0",
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "@babel/preset-react": "^7.22.0",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.1.1"
  },
  "config": {
    "forge": "./forge.config.js"
  }
}
```

## Dependency Size Breakdown

### Core Bundle (excluding native binaries)
- Electron (Chromium + Node.js): ~80MB
- React + React DOM: ~250KB
- Zustand + Immer: ~17KB
- UI Components (Headless UI + Heroicons): ~45KB
- Utilities: ~150KB
- **Total JS Bundle: ~462KB minified + gzipped**

### Native Binaries (platform-specific)
- Sharp (libvips): ~10MB
- FFmpeg: ~40MB
- FFprobe: ~5MB
- **Total Native Binaries: ~55MB per platform**

### Final Package Sizes (approximate)
- **Windows Installer**: ~80MB (Electron) + ~55MB (binaries) + ~5MB (app) = ~140MB
- **macOS DMG**: ~100MB (Electron) + ~55MB (binaries) + ~5MB (app) = ~160MB
- **Linux AppImage**: ~80MB (Electron) + ~55MB (binaries) + ~5MB (app) = ~140MB

## Optimization Opportunities

### Reduce Electron Size
- Use electron-rebuild (not applicable, already minimal)
- Consider Tauri in future (not now per user preference)

### Reduce Native Binary Size
- Only include FFmpeg binaries for required codecs
- Strip unnecessary FFmpeg features
- Use precompiled minimal FFmpeg builds

### Reduce JS Bundle Size
- Code splitting by feature (lazy load converters)
- Tree shaking unused code
- Minimize dependencies
- Use smaller alternatives where possible

### Lazy Load Binaries
- Download FFmpeg on first use (not recommended for UX)
- Use platform-specific builds (already doing this)

## Dependency Updates

### Update Strategy
- Update Electron quarterly (follow stable releases)
- Update dependencies monthly (security patches)
- Test thoroughly before major version updates
- Check for breaking changes before updating

### Security Updates
- Monitor GitHub Security Advisories
- Use `npm audit` regularly
- Update dependencies with vulnerabilities immediately
- Test security updates thoroughly

### Pinning Strategy
- Pin exact versions for production builds
- Use caret (^) for development
- Update pinned versions in release branches only