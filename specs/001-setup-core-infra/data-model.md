# Data Model: Core Infrastructure Setup

**Feature**: 001-setup-core-infra | **Date**: 2026-01-12

## Entity Definitions

### SelectedFile

Represents a file chosen by the user for potential conversion.

**Fields**:

| Name         | Type       | Required | Description                           | Validation                        |
| ------------ | ---------- | -------- | ------------------------------------- | --------------------------------- |
| id           | string     | Yes      | Unique identifier (UUID)              | Must be valid v4 UUID             |
| path         | string     | Yes      | Absolute file system path             | Must exist, accessible, non-empty |
| name         | string     | Yes      | Original filename                     | Non-empty, max 255 chars          |
| extension    | string     | Yes      | File extension (without dot)          | Lowercase, 3-5 chars              |
| mimeType     | string     | Yes      | MIME type                             | Valid MIME type format            |
| size         | number     | Yes      | File size in bytes                    | ≥ 0                               |
| lastModified | number     | Yes      | Unix timestamp (milliseconds)         | Must be valid timestamp           |
| isSelected   | boolean    | Yes      | Whether file is marked for conversion | boolean                           |
| status       | FileStatus | Yes      | Processing status                     | Enum value                        |

**Validation Rules**:

- File must exist and be readable when selected
- File size must be checked against max limits (100MB for images, 1GB for videos, 50MB for audio)
- File extension must match supported formats (see SupportedFormats)
- Path must be absolute, not relative

**State Transitions**:

```
[PENDING] → [PROCESSING] → [COMPLETED]
                    ↓
                 [FAILED]
```

**Relationships**:

- Belongs to a ConversionBatch (optional for this phase)
- Associated with a specific Tool (Image Converter, Video Converter, YouTube Downloader)

### NavigationState

Represents the currently active tool/view in the application.

**Fields**:

| Name         | Type             | Required | Description               | Validation                 |
| ------------ | ---------------- | -------- | ------------------------- | -------------------------- |
| currentTool  | ToolType         | Yes      | Currently selected tool   | Must be enum value         |
| previousTool | ToolType \| null | Yes      | Previously selected tool  | Must be enum value or null |
| timestamp    | number           | Yes      | Last navigation timestamp | Must be valid timestamp    |

**ToolType Enum**:

```typescript
enum ToolType {
  IMAGE_CONVERTER = "image-converter",
  VIDEO_CONVERTER = "video-converter",
  YOUTUBE_DOWNLOADER = "youtube-downloader",
}
```

**Validation Rules**:

- Navigation must be sequential (can't skip tools in history)
- Tool state must persist when switching away and back
- Navigation must be idempotent (switching to same tool is no-op)

**State Management**:

- Stored in Zustand store for reactive UI updates
- Persisted to electron-store on navigation changes
- Restored on application launch

### WindowState

Represents the application window's current dimensions and position on screen.

**Fields**:

| Name         | Type           | Required | Description                  | Validation             | Default |
| ------------ | -------------- | -------- | ---------------------------- | ---------------------- | ------- |
| width        | number         | Yes      | Window width in pixels       | ≥ 900 (per FR-001)     | 1024    |
| height       | number         | Yes      | Window height in pixels      | ≥ 600 (per FR-001)     | 768     |
| x            | number \| null | Yes      | X position from left edge    | Can be null (centered) | null    |
| y            | number \| null | Yes      | Y position from top edge     | Can be null (centered) | null    |
| isMaximized  | boolean        | Yes      | Whether window is maximized  | boolean                | false   |
| isFullscreen | boolean        | Yes      | Whether window is fullscreen | boolean                | false   |

**Validation Rules**:

- Minimum size: 900x600 (per FR-001)
- Window must be fully visible on screen (bounds checking)
- Position must be saved before maximize/fullscreen toggle
- Restore to previous size/position when un-maximizing

**Platform Considerations**:

- **Windows**: Bounds include taskbar area (subtract ~48px)
- **macOS**: Bounds exclude menu bar (add ~22px)
- **Linux**: Varies by window manager (use safe defaults)

**Persistence Strategy**:

- Save on resize, move, maximize, fullscreen events
- Restore on app.ready()
- Validate bounds on restore (if off-screen, center window)

## Enums and Constants

### FileStatus

```typescript
enum FileStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}
```

### SupportedFormats

**Images**: `['jpg', 'jpeg', 'png', 'webp']`
**Videos**: `['mp4', 'avi', 'mov', 'mkv']`
**Audio**: `['mp3', 'wav', 'ogg', 'flac']`

### FileSizeLimits

```typescript
const MAX_FILE_SIZE = {
  IMAGE: 100 * 1024 * 1024, // 100 MB
  VIDEO: 1024 * 1024 * 1024, // 1 GB
  AUDIO: 50 * 1024 * 1024, // 50 MB
  YOUTUBE: 1024 * 1024 * 1024, // 1 GB
};
```

### ConversionOptions

```typescript
interface ConversionOptions {
  outputFormat: string; // Target format
  quality?: number; // 1-100 (optional)
  width?: number; // Target width (optional)
  height?: number; // Target height (optional)
  preserveMetadata?: boolean; // Keep EXIF/ID3 tags (default: false)
}
```

## Data Flow

### File Selection Flow

```
User clicks "Select Files"
  ↓
Renderer process sends IPC: "dialog:open" with filters
  ↓
Main process opens Electron dialog
  ↓
User selects file(s)
  ↓
Main process validates files (exists, readable, supported format)
  ↓
Main process creates SelectedFile objects with metadata
  ↓
Main process sends IPC: "files:selected" with SelectedFile[]
  ↓
Renderer process updates Zustand store
  ↓
UI renders file list
```

### Navigation Flow

```
User clicks sidebar item
  ↓
Renderer process updates NavigationState via Zustand
  ↓
Zustand persists to electron-store
  ↓
Router renders new component based on currentTool
  ↓
Component mounts with fresh state
```

### Window State Flow

```
Window resized/moved/maximized
  ↓
Main process captures new bounds
  ↓
Main process writes to electron-store (atomic)
  ↓
App quit
  ↓
On next launch: app reads bounds from electron-store
  ↓
app.on('ready'): window.setBounds(bounds)
```

## Error Handling

### Validation Errors

| Error Code         | Description                      | User Action                     |
| ------------------ | -------------------------------- | ------------------------------- |
| FILE_NOT_FOUND     | Selected file does not exist     | Re-select file                  |
| FILE_TOO_LARGE     | File exceeds size limit          | Choose smaller file             |
| UNSUPPORTED_FORMAT | File format not supported        | Choose supported format         |
| FILE_NOT_READABLE  | Permission denied or file in use | Close file or grant permissions |

### Persistence Errors

| Error Code         | Description                     | Recovery                             |
| ------------------ | ------------------------------- | ------------------------------------ |
| STORE_WRITE_FAILED | Cannot write to electron-store  | Log error, continue in-memory only   |
| STORE_READ_FAILED  | Cannot read from electron-store | Use default window state             |
| STORE_CORRUPTED    | Store file is corrupted         | Delete store, recreate with defaults |

## Storage Schema

### electron-store Schema

```json
{
  "windowState": {
    "width": 1024,
    "height": 768,
    "x": 100,
    "y": 100,
    "isMaximized": false,
    "isFullscreen": false
  },
  "navigationState": {
    "currentTool": "image-converter",
    "previousTool": null,
    "timestamp": 1705065600000
  },
  "appSettings": {
    "theme": "light",
    "language": "en",
    "lastUsedDirectory": "/Users/username/Downloads"
  }
}
```

### In-Memory State (Renderer Process)

```typescript
interface AppState {
  files: SelectedFile[];
  navigation: NavigationState;
  ui: {
    isLoading: boolean;
    error: string | null;
    progress: ProgressState | null;
  };
}
```

## Type Definitions

```typescript
// SelectedFile
export interface SelectedFile {
  id: string;
  path: string;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
  lastModified: number;
  isSelected: boolean;
  status: FileStatus;
}

// NavigationState
export interface NavigationState {
  currentTool: ToolType;
  previousTool: ToolType | null;
  timestamp: number;
}

// WindowState
export interface WindowState {
  width: number;
  height: number;
  x: number | null;
  y: number | null;
  isMaximized: boolean;
  isFullscreen: boolean;
}

// FileStatus
export enum FileStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

// ToolType
export enum ToolType {
  IMAGE_CONVERTER = "image-converter",
  VIDEO_CONVERTER = "video-converter",
  YOUTUBE_DOWNLOADER = "youtube-downloader",
}

// ConversionOptions
export interface ConversionOptions {
  outputFormat: string;
  quality?: number;
  width?: number;
  height?: number;
  preserveMetadata?: boolean;
}

// ProgressState
export interface ProgressState {
  percentage: number;
  bytesProcessed: number;
  bytesTotal: number;
  startTime: number;
  estimatedTimeRemaining?: number;
}

// FileFilter (for Electron dialog)
export interface FileFilter {
  name: string;
  extensions: string[];
}
```

## Migration Strategy

### Phase 1 → Phase 2

**Phase 1 data**: Window state, navigation state, file selection
**Phase 2 additions**: Conversion batches, conversion options, results

**Migration approach**:

1. Add new fields to electron-store schema
2. Add version number to store schema
3. On app startup: if version < 2, migrate old data structure
4. Backward compatibility: Phase 1 data should work with Phase 2 code

### Example Migration

```typescript
interface StoreV1 {
  windowState: WindowState;
  navigationState: NavigationState;
}

interface StoreV2 {
  version: number;
  windowState: WindowState;
  navigationState: NavigationState;
  conversionHistory: ConversionBatch[];
}

function migrateV1toV2(v1: StoreV1): StoreV2 {
  return {
    version: 2,
    windowState: v1.windowState,
    navigationState: v1.navigationState,
    conversionHistory: [],
  };
}
```

## Constraints and Guarantees

### Data Integrity

- All file paths are validated before storage
- Window bounds are validated against screen dimensions
- Navigation state is never invalid (always has currentTool)
- File status transitions are controlled (user cannot directly set status)

### Performance

- Window state writes are debounced (100ms) to avoid excessive disk I/O
- File metadata extraction is asynchronous and cached
- Navigation state updates are synchronous (no I/O)
- File list rendering is virtualized for >100 files

### Security

- File paths never exposed to renderer process (only metadata)
- Window state stored in user's config directory (not accessible by other users)
- No sensitive data logged (paths are redacted)
- File operations require explicit user consent per selection

## Testing Requirements

### Unit Tests

- SelectedFile validation logic
- WindowState bounds checking
- NavigationState transitions
- FileStatus enum validation

### Integration Tests

- File selection IPC flow (renderer ↔ main)
- Window state persistence across app restarts
- Navigation state restoration
- electron-store read/write operations

### E2E Tests

- User can select file and see in UI
- User can switch tools and state persists
- Window remembers size/position after restart
- User can remove files from list
