export interface IPCRequest<T> {
  id: string;
  payload: T;
  timestamp: number;
}

export interface IPCResponse<T> {
  requestId: string;
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
}

// Dialog operations
export interface DialogOpenRequest {
  multiple: boolean;
  filters: FileFilter[];
  title: string;
  defaultPath?: string;
}

export interface DialogOpenResponse {
  files: SelectedFile[];
  canceled: boolean;
}

// Window operations
export interface WindowGetStateRequest {}

export interface WindowGetStateResponse {
  state: WindowState;
}

export interface WindowMinimizeRequest {}

export interface WindowMaximizeRequest {}

export interface WindowUnmaximizeRequest {}

export interface WindowSetBoundsRequest {
  bounds: Partial<WindowState>;
  animate?: boolean;
}

export interface WindowSetBoundsResponse {
  success: boolean;
  actualBounds: WindowState;
}

// Files operations
export interface FilesValidateRequest {
  filePath: string;
}

export interface FilesValidateResponse {
  valid: boolean;
  file?: SelectedFile;
  error?: {
    code: string;
    message: string;
  };
}

export interface FilesGetMetadataRequest {
  filePath: string;
}

export interface FilesGetMetadataResponse {
  metadata: {
    basic: {
      name: string;
      size: number;
      extension: string;
      mimeType: string;
      lastModified: number;
      created: number;
    };
    media?: {
      width?: number;
      height?: number;
      duration?: number;
      bitrate?: number;
      format?: string;
    };
  };
}

// Navigation operations
export interface NavigationSetToolRequest {
  tool: ToolType;
}

export interface NavigationGetToolRequest {}

export interface NavigationGetToolResponse {
  tool: ToolType;
  previousTool: ToolType | null;
  timestamp: number;
}

// Image operations
export interface ImageGetMetadataRequest {
  filePath: string;
}

export interface ImageGetMetadataResponse {
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    size: number;
  };
}

export interface ImageConvertRequest {
  filePath: string;
  options: {
    format: 'png' | 'jpeg' | 'webp' | 'avif';
    quality?: number;
    outputPath?: string;
  };
}

export interface ImageConvertResponse {
  outputPath: string;
}

// YouTube operations
export interface YouTubeGetInfoRequest {
  url: string;
}

export interface YouTubeGetInfoResponse {
  info: YouTubeVideoInfo;
}

export interface YouTubeDownloadRequest {
  url: string;
  format: 'mp4' | 'mp3';
  quality?: string;
  outputPath?: string;
}

export interface YouTubeDownloadResponse {
  success: boolean;
  filePath: string;
}

export interface YouTubeVideoInfo {
  id: string;
  title: string;
  duration: number;
  thumbnail: string;
  uploader: string;
  views?: number;
  description?: string;
  formats: YouTubeFormat[];
}

export interface YouTubeFormat {
  formatId: string;
  extension: string;
  resolution?: string;
  filesize?: number;
  hasVideo: boolean;
  hasAudio: boolean;
}

// Application lifecycle
export interface AppCloseRequest {
  force?: boolean;
}

export interface AppCloseResponse {
  shouldClose: boolean;
}

// Inline types to avoid circular imports
export enum FileStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

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

export interface ProgressState {
  percentage: number;
  bytesProcessed: number;
  bytesTotal: number;
  startTime: number;
  estimatedTimeRemaining?: number;
}

export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface WindowState {
  width: number;
  height: number;
  x: number | null;
  y: number | null;
  isMaximized: boolean;
  isFullscreen: boolean;
}

export enum ToolType {
  IMAGE_CONVERTER = 'image-converter',
  VIDEO_CONVERTER = 'video-converter',
  YOUTUBE_DOWNLOADER = 'youtube-downloader',
}

export interface NavigationState {
  currentTool: ToolType;
  previousTool: ToolType | null;
  timestamp: number;
}
