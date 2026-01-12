export interface WindowState {
  width: number;
  height: number;
  x: number | null;
  y: number | null;
  isMaximized: boolean;
  isFullscreen: boolean;
}

export interface NavigationState {
  currentTool: ToolType;
  previousTool: ToolType | null;
  timestamp: number;
}

export enum ToolType {
  IMAGE_CONVERTER = 'image-converter',
  VIDEO_CONVERTER = 'video-converter',
  YOUTUBE_DOWNLOADER = 'youtube-downloader',
}
