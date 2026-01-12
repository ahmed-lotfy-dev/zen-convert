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
