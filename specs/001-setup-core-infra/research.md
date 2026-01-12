# Research: Core Infrastructure Setup

**Feature**: 001-setup-core-infra | **Date**: 2026-01-12

## Technology Stack Decisions

### Language/Version

**Decision**: Node.js 20.11 LTS, TypeScript 5.3, React 18.2

**Rationale**:

- Node.js 20.11 LTS is the current stable release with long-term support until April 2026
- TypeScript 5.3 provides latest language features and improved performance
- React 18.2 is stable with excellent ecosystem support and concurrent features ready for future use

**Alternatives considered**:

- Node.js 18 LTS (supported but closer to EOL - April 2025)
- Node.js 21 Current (less stable, not production-ready for desktop app)
- TypeScript 5.0-5.2 (older versions with fewer features)
- React 19 RC (too experimental for production infrastructure)

### Primary Dependencies

**Decision**: Electron 28, React 18.2, Vite 5, Electron Builder 24, Zustand 4, React Router 6

**Rationale**:

- **Electron 28**: Latest stable with Node 20.11 and Chromium 120, includes security patches
- **Vite 5**: Fast HMR (Hot Module Replacement) for development, excellent TypeScript support
- **Electron Builder 24**: Mature build tool with multi-platform support, auto-updater integration
- **Zustand 4**: Lightweight state management (1KB), simpler than Redux for local state
- **React Router 6**: Latest version with data loading patterns, better TypeScript support

**Additional dependencies**:

- `electron-vite`: Vite plugin for Electron, provides unified dev/build workflow
- `electron-log`: Structured logging for main and renderer processes
- `electron-store\*\*: Simple key-value store for window state persistence
- `clsx` + `tailwind-merge`: Utility class merging for styling

**Alternatives considered**:

- Webpack (slower HMR, more configuration complex)
- Redux (overkill for local UI state, larger bundle)
- Electron Forge (less mature than Electron Builder)
- MobX (steeper learning curve, not necessary for this use case)

### Testing Framework

**Decision**: Vitest for unit tests, Playwright for E2E tests, React Testing Library for component tests

**Rationale**:

- **Vitest**: Native ESM support, Jest-compatible API, faster than Jest with Vite integration
- **Playwright**: Cross-browser support (including Electron), reliable E2E testing, auto-waiting
- **React Testing Library**: Encourages testing user behavior, not implementation details

**Alternatives considered**:

- Jest (slower, requires more config, less Vite-friendly)
- Cypress (limited Electron support, different testing philosophy)
- Enzyme (deprecated, encourages implementation testing)

## Architecture Decisions

### File Permissions and Sandbox

**Decision**: Electron's default sandbox mode with specific protocol registration

**Rationale**:

- Electron 28 sandbox is enabled by default, provides security isolation
- `protocol.registerFileProtocol()` for loading local files without exposing full file system
- User files accessed only after explicit selection via file dialog (security principle II)
- File paths not stored in renderer process (prevents arbitrary file access)

**Implementation**:

- Main process handles all file system operations
- Renderer process receives only file metadata (name, size, type) via IPC
- Selected file paths stored only in main process memory, not persisted
- Temporary working directory for conversion operations with automatic cleanup

**Alternatives considered**:

- Disable sandbox (rejected: violates security principle II)
- Node integration in renderer (rejected: security risk, allows arbitrary code execution)
- Custom protocol with full paths (rejected: exposes file system structure)

### Window State Persistence

**Decision**: electron-store with platform-specific bounds calculation

**Rationale**:

- Cross-platform JSON storage (Windows: %APPDATA%, macOS: ~/Library/Application Support, Linux: ~/.config)
- Atomic writes prevent corruption
- Simple API for get/set operations
- TypeScript types included

**Implementation**:

```typescript
interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

// Restore on app ready
const store = new Store<WindowState>({
  defaults: { width: 1024, height: 768, isMaximized: false },
});
```

**Platform considerations**:

- **Windows**: Bounds may include taskbar - subtract taskbar height
- **macOS**: Bounds exclude menu bar - add menu bar height
- **Linux**: Varies by WM - use safe defaults if out of bounds

**Alternatives considered**:

- Manual JSON file I/O (more complex, error-prone)
- SQLite (overkill for simple key-value data)
- localStorage (not accessible from main process)

### File Dialog API Differences

**Decision**: Unified wrapper around Electron's `dialog.showOpenDialog()` with platform-specific options

**Rationale**:

- Electron's dialog API is cross-platform but options differ
- Create abstraction layer for consistent behavior
- Platform-specific properties when needed (e.g., macOS bundles)

**Implementation**:

```typescript
interface OpenFileDialogOptions {
  multiple: boolean;
  filters: FileFilter[];
  title: string;
}

// Platform defaults
const platformDefaults = {
  darwin: { properties: ["openFile", "multiSelections"] as const },
  win32: { properties: ["openFile", "multiSelections"] as const },
  linux: { properties: ["openFile", "multiSelections"] as const },
};
```

**Platform differences handled**:

- **macOS**: Default directory is Documents, supports package selection
- **Windows**: Last used directory persisted, file extensions auto-appended
- **Linux**: No default directory, relies on desktop environment settings

**Alternatives considered**:

- Separate implementations per platform (code duplication)
- Web File API (limited functionality, not suitable for desktop)

### Plugin Architecture

**Decision**: Registry pattern with TypeScript module augmentation

**Rationale**:

- Plugins register converters at startup via dynamic import
- Type-safe interface declarations for plugin extensions
- No core changes needed for new formats (Constitution IV)
- Supports hot-reloading in development

**Implementation**:

```typescript
interface ConverterPlugin {
  name: string;
  version: string;
  supportedFormats: string[];
  convert(input: Buffer, options: ConversionOptions): Promise<Buffer>;
}

// Plugin registry
const converterRegistry = new Map<string, ConverterPlugin>();

// Plugin registration
export function registerConverter(plugin: ConverterPlugin) {
  converterRegistry.set(plugin.name, plugin);
}
```

**Alternatives considered**:

- Dependency injection container (overengineered for this use case)
- Microservices architecture (violates single-process Electron model)
- External process for conversions (adds complexity, security concerns)

### Core Format Support

**Decision**: JPEG, PNG, WebP (images), MP4, AVI (videos), MP3, WAV (audio)

**Rationale**:

- **Images**: JPEG (ubiquitous, ~95% web usage), PNG (lossless, transparent), WebP (modern, efficient)
- **Videos**: MP4 (most common container, hardware acceleration), AVI (legacy support)
- **Audio**: MP3 (universal compatibility), WAV (lossless, uncompressed)

**Future extensibility**:

- Plugin architecture allows adding formats without core changes
- Format detection via magic bytes + file extension
- Conversion graph: any source → intermediate → target format

**Alternatives considered**:

- Support all formats from day one (not feasible, violates incremental delivery)
- Only WebP for images (breaks compatibility with older tools)
- No video support initially (violates spec requirements)

### Accessibility Standards

**Decision**: WCAG 2.1 Level AA compliance

**Rationale**:

- Industry standard for accessible web content
- Required for government/enterprise use cases
- Electron uses Chromium, which has excellent a11y APIs
- Legal compliance in many jurisdictions

**Key requirements**:

- Keyboard navigation (Tab, Enter, Escape, arrow keys)
- Screen reader support (ARIA labels, roles, live regions)
- Color contrast ratio ≥ 4.5:1 for normal text
- Focus indicators visible on all interactive elements
- Semantic HTML structure (nav, main, button, input)
- Alt text for images, captions for videos

**Implementation tools**:

- `@axe-core/react`: Automated accessibility testing in components
- `react-aria`: Accessible UI components
- Manual testing with screen readers (NVDA, VoiceOver, ORCA)

**Alternatives considered**:

- WCAG 2.0 Level A (insufficient, excludes many users)
- WCAG 2.1 AAA (too strict, impractical for all use cases)
- No a11y (violates inclusive design principle)

### Progress Indicators

**Decision**: Dual indicator with percentage + estimated time remaining

**Rationale**:

- Percentage provides precise progress
- Time remaining gives context and prevents user frustration
- Dual approach handles both short (<1s) and long (>5m) operations

**Implementation**:

```typescript
interface ProgressState {
  percentage: number; // 0-100
  bytesProcessed: number; // Current position
  bytesTotal: number; // Total size
  startTime: number; // Timestamp
  estimatedTimeRemaining?: number; // Milliseconds
}
```

**Visual design**:

- Linear progress bar with percentage label
- "X of Y files processed" for batch operations
- "About X minutes remaining" for long conversions
- Animated spinner for indeterminate operations

**Alternatives considered**:

- Only percentage (no time context)
- Only spinner (no progress info)
- Circular progress (less space-efficient, harder to read)

## Performance Benchmarks

### Electron App Launch Time

**Decision**: <3 seconds cold start on modern hardware

**Rationale**:

- Spec requirement SC-001
- Competitive with similar tools (ffmpeg GUIs: 2-4s)
- User expectation for desktop apps

**Optimization strategies**:

1. **Lazy load renderer bundles**: Load tool-specific code on navigation
2. **Code splitting**: Separate main, preload, renderer processes
3. **Tree shaking**: Remove unused dependencies via Vite
4. **Async initialization**: Non-blocking UI rendering
5. **Asset compression**: Minify and gzip JS/CSS

**Measurement approach**:

- Measure from `app.on('ready')` to first render
- Average of 5 cold starts (cache cleared)
- Test on: i5-8250U/8GB RAM, M1/8GB RAM, Ryzen 5 3600/16GB RAM

**Alternatives considered**:

- <2s (difficult without major tradeoffs)
- <5s (too slow, poor UX)

## Security Decisions

### Error Logging Strategy

**Decision**: Structured logging with redaction of sensitive paths

**Rationale**:

- Debug capability without exposing user data (Constitution II)
- Logs sent to separate file (not console, not sent externally)
- Redaction prevents accidental data leaks

**Implementation**:

```typescript
const logger = electronLogger;
logger.transports.file.level = "info";
logger.transports.file.format =
  "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";

// Redact sensitive information
const sanitizeMessage = (msg: string): string => {
  return msg
    .replace(/\/Users\/[^/]+/g, "/Users/[REDACTED]")
    .replace(/C:\\Users\\[^\\]+/g, "C:\\Users\\[REDACTED]")
    .replace(/\/home\/[^/]+/g, "/home/[REDACTED]");
};
```

**Logging scope**:

- Application lifecycle events (start, quit, crash)
- File operations (selection, conversion success/failure)
- IPC communication errors (request/response failures)
- Window state changes
- Plugin load/unload events

**Alternatives considered**:

- Full file paths (security risk)
- No logging (impossible to debug issues)
- Send to cloud service (violates privacy, requires consent)

### License Review Process

**Decision**: Automated check via `license-checker` + manual review for unusual licenses

**Rationale**:

- Constitution requires open-source with permissive licenses
- Automated check prevents accidental non-permissive deps
- Manual review catches edge cases

**Implementation**:

```json
{
  "scripts": {
    "check-licenses": "license-checker --production --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD'"
  }
}
```

**Allowed licenses**:

- MIT (permissive, minimal requirements)
- Apache 2.0 (permissive, patent clause)
- BSD 2-Clause/3-Clause (permissive)
- ISC (functionally equivalent to MIT)
- 0BSD (MIT-compatible)
- CC0 (public domain)

**Rejected licenses**:

- GPL (viral, requires code disclosure)
- AGPL (viral, more restrictive than GPL)
- MPL (weak copyleft)
- Proprietary (violates open-source requirement)

**Alternatives considered**:

- Manual review only (error-prone, not scalable)
- Allow all OSI-approved (includes copyleft licenses)
- No license checking (security risk, violates constitution)

## CI/CD Configuration

### Build and Test Pipeline

**Decision**: GitHub Actions with matrix builds for all platforms

**Rationale**:

- Free for public repositories
- Excellent Electron ecosystem support
- Parallel builds for Windows, macOS, Linux
- Automated artifact signing (Windows/macOS)

**Implementation**:

```yaml
strategy:
  matrix:
    os: [windows-latest, macos-latest, ubuntu-latest]

steps:
  - name: Install dependencies
    run: npm ci
  - name: Lint
    run: npm run lint
  - name: Unit tests
    run: npm run test:unit
  - name: Build
    run: npm run build
  - name: E2E tests
    run: npm run test:e2e
  - name: Package
    run: npm run package
```

**Tools**:

- `electron-builder`: Cross-platform packaging
- `electron-notarize`: macOS code signing
- `electron-winstaller`: NSIS installer for Windows
- `actions/upload-artifact`: Store build artifacts

**Testing stages**:

1. **Lint**: ESLint + TypeScript compiler
2. **Unit tests**: Vitest (main + renderer processes)
3. **Integration tests**: IPC communication tests
4. **E2E tests**: Playwright with Electron
5. **Build verification**: Smoke test packaged app

**Alternatives considered**:

- CircleCI (less generous free tier)
- GitLab CI (requires GitLab hosting)
- Manual builds (error-prone, not scalable)

## Documentation

### Quickstart Guide

**Decision**: Markdown with code examples, organized by user persona

**Rationale**:

- Easy to version control
- Renders nicely on GitHub
- Supports code syntax highlighting
- Can generate static site via Docusaurus if needed

**Sections**:

1. Prerequisites (Node.js 20+, OS-specific deps)
2. Installation steps (git clone, npm install)
3. Development mode (npm run dev)
4. Testing (npm run test)
5. Building (npm run build)
6. Common issues and troubleshooting

**Alternatives considered**:

- README only (insufficient for complex setup)
- Wiki (harder to maintain)
- External docs site (overkill for single feature)

## Summary

All 11 NEEDS CLARIFICATION items resolved:

1. ✅ Electron app launch benchmark: <3s with optimization strategies
2. ✅ File permissions: Sandbox mode + file protocol + IPC-only file access
3. ✅ Error logging: Structured logging with path redaction
4. ✅ Window state persistence: electron-store with platform-specific bounds
5. ✅ File dialog: Unified wrapper around Electron's dialog API
6. ✅ Plugin architecture: Registry pattern with TypeScript module augmentation
7. ✅ Core formats: JPEG/PNG/WebP (images), MP4/AVI (videos), MP3/WAV (audio)
8. ✅ Accessibility: WCAG 2.1 Level AA with keyboard nav + screen reader support
9. ✅ Progress indicators: Dual indicator (percentage + estimated time)
10. ✅ License review: Automated check for permissive licenses only
11. ✅ CI/CD: GitHub Actions with matrix builds for all platforms
