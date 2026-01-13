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
