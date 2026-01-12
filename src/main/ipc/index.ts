import { ipcMain, BrowserWindow, dialog } from 'electron';
import type { 
  IPCRequest, 
  IPCResponse, 
  DialogOpenRequest, 
  DialogOpenResponse,
  SelectedFile,
} from '../../preload/ipc-types';
import { FileStatus } from '../../preload/ipc-types';
import path from 'path';
import { randomUUID } from 'node:crypto';
import { ImageConverter } from '../converters/ImageConverter';
import { YouTubeService } from '../services/YouTubeService';

export function createIPCHandlers(mainWindow: BrowserWindow) {
  const imageConverter = new ImageConverter();
  const youtubeService = new YouTubeService();

  // Helper to create response
  const createResponse = <T>(requestId: string, data: T): IPCResponse<T> => ({
    requestId,
    success: true,
    data,
    timestamp: Date.now(),
  });

  const createRelayError = (requestId: string, code: string, message: string): IPCResponse<any> => ({
    requestId,
    success: false,
    error: { code, message },
    timestamp: Date.now(),
  });

  // Dialog handlers
  ipcMain.handle('dialog:open', async (_, request: IPCRequest<DialogOpenRequest>): Promise<IPCResponse<DialogOpenResponse>> => {
    console.log('[IPC] dialog:open request received', request);
    try {
      const { payload, id } = request;
      console.log('[IPC] Showing open dialog with payload:', payload);
      const result = await dialog.showOpenDialog(mainWindow, {
        title: payload.title,
        defaultPath: payload.defaultPath,
        properties: payload.multiple ? ['openFile', 'multiSelections'] : ['openFile'],
        filters: payload.filters,
      });

      const selectedFiles: SelectedFile[] = result.filePaths.map(filePath => ({
        id: randomUUID(),
        path: filePath,
        name: path.basename(filePath),
        extension: path.extname(filePath),
        mimeType: '', // To be filled by validator later
        size: 0,      // To be filled by validator later
        lastModified: Date.now(),
        isSelected: true,
        status: FileStatus.PENDING,
      }));

      return createResponse(id, {
        files: selectedFiles,
        canceled: result.canceled,
      });
    } catch (error) {
      return createRelayError(request.id, 'DIALOG_ERROR', error instanceof Error ? error.message : 'Unknown error');
    }
  });

  // Window handlers
  ipcMain.handle('window:get-state', async (_, request: IPCRequest<any>) => {
    const bounds = mainWindow.getBounds();
    return createResponse(request.id, {
      state: {
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        isMaximized: mainWindow.isMaximized(),
        isFullscreen: mainWindow.isFullScreen(),
      },
    });
  });

  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow?.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow?.close();
  });

  // Files handlers
  ipcMain.handle('files:validate', async (_, request: IPCRequest<any>) => {
    return createResponse(request.id, { valid: true });
  });

  // Navigation handlers
  ipcMain.handle('navigation:get-tool', async (_, request: IPCRequest<any>) => {
    return createResponse(request.id, {
      tool: 'image-converter',
      previousTool: null,
      timestamp: Date.now(),
    });
  });

  // Image handlers
  ipcMain.handle('image:get-metadata', async (_, request: IPCRequest<any>) => {
    try {
      const metadata = await imageConverter.getMetadata(request.payload.filePath);
      return createResponse(request.id, { metadata });
    } catch (error) {
      return createRelayError(request.id, 'METADATA_ERROR', error instanceof Error ? error.message : 'Unknown error');
    }
  });

  ipcMain.handle('image:convert', async (_, request: IPCRequest<any>) => {
    try {
      const outputPath = await imageConverter.convert(request.payload.filePath, request.payload.options);
      return createResponse(request.id, { outputPath });
    } catch (error) {
      return createRelayError(request.id, 'CONVERSION_ERROR', error instanceof Error ? error.message : 'Unknown error');
    }
  });

  // YouTube handlers
  ipcMain.handle('youtube:get-info', async (_, request: IPCRequest<any>) => {
    try {
      const info = await youtubeService.getInfo(request.payload.url);
      return createResponse(request.id, { info });
    } catch (error) {
      return createRelayError(request.id, 'YOUTUBE_INFO_ERROR', error instanceof Error ? error.message : 'Unknown error');
    }
  });

  ipcMain.handle('youtube:download', async (_, request: IPCRequest<any>) => {
    try {
      const filePath = await youtubeService.download(request.payload.url, request.payload.format, request.payload.outputPath);
      return createResponse(request.id, { filePath });
    } catch (error) {
      return createRelayError(request.id, 'YOUTUBE_DOWNLOAD_ERROR', error instanceof Error ? error.message : 'Unknown error');
    }
  });
}
