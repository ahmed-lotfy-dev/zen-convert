# IPC Contracts: Core Infrastructure

**Feature**: 001-setup-core-infra | **Date**: 2026-01-12

## Overview

This specification defines the Inter-Process Communication (IPC) channels between Electron's main process and renderer process. All communication follows a request/response pattern with type-safe payloads.

## Channel Naming Convention

```
domain:action
```

- **domain**: Functional area (dialog, window, files, navigation)
- **action**: Specific operation (open, close, get, set, etc.)

## Common Types

```typescript
interface IPCRequest<T> {
  id: string; // Unique request ID for correlation
  payload: T; // Request payload
  timestamp: number; // Unix timestamp (ms)
}

interface IPCResponse<T> {
  requestId: string; // Correlates with request
  success: boolean; // true = success, false = error
  data?: T; // Response data (if success)
  error?: {
    code: string; // Error code
    message: string; // Human-readable error
    details?: any; // Additional error details
  };
  timestamp: number;
}
```

## Channel Specifications

### Dialog Operations

#### dialog:open

Opens a native file dialog for file selection.

**Direction**: Renderer → Main → Renderer

**Request Payload**:

```typescript
interface DialogOpenRequest {
  multiple: boolean; // Allow multiple file selection
  filters: FileFilter[]; // File type filters
  title: string; // Dialog title
  defaultPath?: string; // Starting directory
}

interface FileFilter {
  name: string; // Display name (e.g., "Images")
  extensions: string[]; // Extensions (e.g., ["jpg", "png"])
}
```

**Response Payload**:

```typescript
interface DialogOpenResponse {
  files: SelectedFile[]; // Selected files with metadata
  canceled: boolean; // True if user canceled dialog
}
```

**Error Codes**:

- `DIALOG_CANCELLED`: User canceled the dialog (not an error, informational)
- `DIALOG_FAILED`: Dialog failed to open
- `INVALID_FILTER`: File filter configuration is invalid

**Example**:

```typescript
// Request
{
  id: "req-001",
  payload: {
    multiple: true,
    filters: [
      { name: "Images", extensions: ["jpg", "jpeg", "png", "webp"] }
    ],
    title: "Select Images to Convert"
  },
  timestamp: 1705065600000
}

// Success Response
{
  requestId: "req-001",
  success: true,
  data: {
    files: [
      {
        id: "uuid-001",
        path: "/Users/username/Documents/image.jpg",
        name: "image.jpg",
        extension: "jpg",
        mimeType: "image/jpeg",
        size: 1024000,
        lastModified: 1705065600000,
        isSelected: true,
        status: "pending"
      }
    ],
    canceled: false
  },
  timestamp: 1705065600100
}
```

#### dialog:save

Opens a native file dialog for saving files.

**Direction**: Renderer → Main → Renderer

**Request Payload**:

```typescript
interface DialogSaveRequest {
  defaultName: string; // Suggested filename
  filters: FileFilter[]; // File type filters
  title: string; // Dialog title
  defaultPath?: string; // Starting directory
}
```

**Response Payload**:

```typescript
interface DialogSaveResponse {
  filePath?: string; // Selected file path
  canceled: boolean; // True if user canceled dialog
}
```

**Error Codes**:

- `DIALOG_CANCELLED`: User canceled the dialog
- `DIALOG_FAILED`: Dialog failed to open

---

### Window Operations

#### window:get-state

Gets the current window state.

**Direction**: Renderer → Main → Renderer

**Request Payload**:

```typescript
interface WindowGetStateRequest {
  // Empty payload
}
```

**Response Payload**:

```typescript
interface WindowGetStateResponse {
  state: WindowState;
}

interface WindowState {
  width: number;
  height: number;
  x: number | null;
  y: number | null;
  isMaximized: boolean;
  isFullscreen: boolean;
}
```

**Error Codes**: None (always succeeds)

#### window:minimize

Minimizes the window.

**Direction**: Renderer → Main → Renderer

**Request Payload**:

```typescript
interface WindowMinimizeRequest {
  // Empty payload
}
```

**Response Payload**:

```typescript
interface WindowMinimizeResponse {
  success: boolean;
}
```

**Error Codes**: None

#### window:maximize

Maximizes the window.

**Direction**: Renderer → Main → Renderer

**Request Payload**:

```typescript
interface WindowMaximizeRequest {
  // Empty payload
}
```

**Response Payload**:

```typescript
interface WindowMaximizeResponse {
  success: boolean;
}
```

**Error Codes**: None

#### window:unmaximize

Restores the window from maximized state.

**Direction**: Renderer → Main → Renderer

**Request Payload**:

```typescript
interface WindowUnmaximizeRequest {
  // Empty payload
}
```

**Response Payload**:

```typescript
interface WindowUnmaximizeResponse {
  success: boolean;
}
```

**Error Codes**: None

#### window:set-bounds

Sets window bounds programmatically.

**Direction**: Renderer → Main → Renderer

**Request Payload**:

```typescript
interface WindowSetBoundsRequest {
  bounds: Partial<WindowState>;
  animate?: boolean; // Animate the transition (default: false)
}
```

**Response Payload**:

```typescript
interface WindowSetBoundsResponse {
  success: boolean;
  actualBounds: WindowState; // Bounds actually applied (may differ)
}
```

**Error Codes**:

- `INVALID_BOUNDS`: Bounds are invalid (negative, too small, etc.)

---

### Files Operations

#### files:validate

Validates a file without adding it to the selection.

**Direction**: Renderer → Main → Renderer

**Request Payload**:

```typescript
interface FilesValidateRequest {
  filePath: string; // Absolute file path
}
```

**Response Payload**:

```typescript
interface FilesValidateResponse {
  valid: boolean;
  file?: SelectedFile; // File metadata if valid
  error?: {
    code: string;
    message: string;
  };
}
```

**Error Codes**:

- `FILE_NOT_FOUND`: File does not exist
- `FILE_NOT_READABLE`: File cannot be read (permissions, in use)
- `UNSUPPORTED_FORMAT`: File format not supported
- `FILE_TOO_LARGE`: File exceeds size limit

#### files:get-metadata

Extracts metadata from a file (async operation).

**Direction**: Renderer → Main → Renderer

**Request Payload**:

```typescript
interface FilesGetMetadataRequest {
  filePath: string; // Absolute file path
}
```

**Response Payload**:

```typescript
interface FilesGetMetadataResponse {
  metadata: FileMetadata;
}

interface FileMetadata {
  basic: {
    name: string;
    size: number;
    extension: string;
    mimeType: string;
    lastModified: number;
    created: number;
  };
  media?: {
    width?: number; // For images/videos
    height?: number; // For images/videos
    duration?: number; // For videos/audio (seconds)
    bitrate?: number; // For videos/audio (kbps)
    format?: string; // Codec/format info
  };
}
```

**Error Codes**:

- `FILE_NOT_FOUND`: File does not exist
- `METADATA_EXTRACTION_FAILED`: Could not extract metadata
- `UNSUPPORTED_FORMAT`: Format not recognized

---

### Navigation Operations

#### navigation:set-tool

Sets the currently active tool.

**Direction**: Renderer → Main (async, no response required)

**Request Payload**:

```typescript
interface NavigationSetToolRequest {
  tool: ToolType;
}

type ToolType = "image-converter" | "video-converter" | "youtube-downloader";
```

**Response**: None (fire-and-forget for persistence)

**Side Effects**:

- Updates electron-store with new navigation state
- Triggers renderer process update via event

#### navigation:get-tool

Gets the currently active tool.

**Direction**: Renderer → Main → Renderer

**Request Payload**:

```typescript
interface NavigationGetToolRequest {
  // Empty payload
}
```

**Response Payload**:

```typescript
interface NavigationGetToolResponse {
  tool: ToolType;
  previousTool: ToolType | null;
  timestamp: number;
}
```

**Error Codes**: None

---

### Application Lifecycle

#### app:ready

Sent by main process when application is ready.

**Direction**: Main → Renderer (event)

**Event Payload**:

```typescript
interface AppReadyEvent {
  version: string; // App version
  platform: string; // 'darwin', 'win32', 'linux'
  initialWindowState: WindowState;
  initialNavigationState: NavigationState;
}
```

#### app:close

Sent by renderer process to request app close.

**Direction**: Renderer → Main

**Request Payload**:

```typescript
interface AppCloseRequest {
  force?: boolean; // Skip confirmation dialog
}
```

**Response Payload**:

```typescript
interface AppCloseResponse {
  shouldClose: boolean; // Whether to proceed with close
}
```

**Error Codes**: None

---

## Event Channels (Main → Renderer)

### navigation:changed

Emitted when navigation state changes.

**Event Payload**:

```typescript
interface NavigationChangedEvent {
  tool: ToolType;
  previousTool: ToolType | null;
  timestamp: number;
}
```

### window:bounds-changed

Emitted when window bounds change.

**Event Payload**:

```typescript
interface WindowBoundsChangedEvent {
  bounds: WindowState;
  changeType:
    | "resize"
    | "move"
    | "maximize"
    | "unmaximize"
    | "fullscreen"
    | "unfullscreen";
}
```

### files:progress

Emitted during long file operations.

**Event Payload**:

```typescript
interface FilesProgressEvent {
  fileId: string; // UUID of file
  operation: "reading" | "writing" | "converting";
  progress: ProgressState;
}

interface ProgressState {
  percentage: number;
  bytesProcessed: number;
  bytesTotal: number;
  startTime: number;
  estimatedTimeRemaining?: number;
}
```

## Security Considerations

### File Path Sanitization

- All file paths are validated before being sent to renderer process
- Absolute paths are required (no relative paths)
- Parent directory references (`../`) are rejected
- Windows UNC paths are allowed but validated

### Request Validation

- All requests are validated against TypeScript schemas
- Maximum payload size: 10MB
- Request rate limiting: 100 requests/second per channel
- Request timeout: 30 seconds (configurable per channel)

### Error Handling

- Error messages never include absolute file paths
- Stack traces are stripped from renderer responses
- Sensitive system paths are redacted from logs

## Performance Requirements

### Response Time Targets

| Channel             | Target | Measurement                       |
| ------------------- | ------ | --------------------------------- |
| dialog:open         | <1s    | From request to dialog opening    |
| window:get-state    | <50ms  | Round-trip time                   |
| files:validate      | <100ms | File existence + basic validation |
| navigation:set-tool | <10ms  | Persist to store                  |
| navigation:get-tool | <50ms  | Read from store                   |

### Concurrency

- Multiple file validations can run in parallel
- Dialog operations are serialized (only one at a time)
- Window operations are synchronous in main process

## Error Recovery

### Retriable Errors

| Error Code                 | Retry Strategy                     | Max Attempts |
| -------------------------- | ---------------------------------- | ------------ |
| FILE_NOT_READABLE          | Exponential backoff: 1s, 2s, 4s    | 3            |
| METADATA_EXTRACTION_FAILED | Exponential backoff: 500ms, 1s, 2s | 3            |
| STORE_WRITE_FAILED         | Immediate retry                    | 1            |

### Non-Retriable Errors

| Error Code         | User Action                                  |
| ------------------ | -------------------------------------------- |
| FILE_NOT_FOUND     | Prompt user to reselect file                 |
| UNSUPPORTED_FORMAT | Display error with list of supported formats |
| FILE_TOO_LARGE     | Display error with max size limit            |
| INVALID_BOUNDS     | Use default window bounds                    |

## Testing Requirements

### Contract Tests

- Verify all channels match TypeScript interfaces
- Validate request/response schemas
- Test error handling for all error codes

### Integration Tests

- Test request/response flow for all channels
- Test event propagation for all events
- Test timeout and error recovery

### Load Tests

- Test 100 concurrent file validations
- Test rapid window state changes (100/second)
- Test 1000 navigation changes

## Versioning

**Current Version**: 1.0.0

**Breaking Changes**:

- Change channel name (e.g., `dialog:open` → `files:open`)
- Change request/response payload structure
- Remove a channel entirely

**Non-Breaking Changes**:

- Add optional fields to existing payloads
- Add new channels
- Add new error codes
