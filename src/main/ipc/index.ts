import { ipcMain, BrowserWindow, dialog } from 'electron';

export function createIPCHandlers(mainWindow: BrowserWindow) {
  // Dialog handlers
  ipcMain.handle('dialog:open', async (_, options?: Electron.OpenDialogOptions) => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        ...options,
      });

      return {
        success: true,
        data: { 
          files: result.filePaths, 
          canceled: result.canceled 
        },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DIALOG_ERROR',
          message: error instanceof Error ? error.message : 'Unknown dialog error',
        },
        timestamp: Date.now(),
      };
    }
  });

  // Window handlers
  ipcMain.handle('window:get-state', async () => {
    const bounds = mainWindow.getBounds();
    return {
      success: true,
      data: {
        state: {
          width: bounds.width,
          height: bounds.height,
          x: bounds.x,
          y: bounds.y,
          isMaximized: mainWindow.isMaximized(),
          isFullscreen: mainWindow.isFullScreen(),
        },
      },
      timestamp: Date.now(),
    };
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

  ipcMain.on('window:unmaximize', () => {
    mainWindow?.unmaximize();
  });

  ipcMain.on('window:close', () => {
    mainWindow?.close();
  });

  // Files handlers (Placeholders for now, to be expanded)
  ipcMain.handle('files:validate', async (_, filePaths: string[]) => {
    return {
      success: true,
      data: { valid: filePaths.length > 0 },
      timestamp: Date.now(),
    };
  });

  // Navigation handlers (Can be handled purely in state/router)
  ipcMain.handle('navigation:get-tool', async () => {
    return {
      success: true,
      data: {
        tool: 'image-converter',
        previousTool: null,
      },
      timestamp: Date.now(),
    };
  });

  ipcMain.on('navigation:set-tool', () => {
    // Logic for tool switching can be handled in renderer
  });
}
