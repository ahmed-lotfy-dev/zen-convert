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
  type: string;
  size: number;
  lastModified: number;
  status: FileStatus;
  // properties below might be needed for UI logic
  extension: string;
}

export interface VideoFile extends SelectedFile {
  duration?: number;
  resolution?: { width: number; height: number };
  videoCodec?: string;
  audioCodec?: string;
  subtitlePath?: string;
  subtitleFormat?: 'srt' | 'ass' | 'vtt';
  burnSubtitle?: boolean;
  subtitleForceStyle?: string;
}

export interface ConversionOptions {
  format: 'mp4' | 'webm' | 'mkv' | 'avi';
  quality: number;
  resolution?: { width?: number; height?: number };
  bitrate?: string;
  codec?: string;
  audioCodec?: string;
}

export interface SubtitleOptions {
  path?: string;
  format?: 'srt' | 'ass' | 'vtt';
  burnIn: boolean;
  forceStyle?: string;
}
