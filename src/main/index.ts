import { app, BrowserWindow } from 'electron';
import { resolve, join } from 'path';
import { existsSync } from 'fs';
import { createIPCHandlers } from './ipc';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Try to find the preload script in multiple possible locations
  const possiblePaths = [
    resolve(__dirname, '../preload/index.mjs'),
    resolve(__dirname, '../preload/index.js'),
    join(app.getAppPath(), 'dist-electron/preload/index.mjs'),
    join(app.getAppPath(), 'dist-electron/preload/index.js'),
  ];

  let preloadPath = '';
  for (const p of possiblePaths) {
    console.log('[Main] Checking preload path:', p);
    if (existsSync(p)) {
      preloadPath = p;
      console.log('[Main] FOUND preload script at:', p);
      break;
    }
  }

  if (!preloadPath) {
    console.error('[Main] CRITICAL: Preload script NOT FOUND in any expected location!');
    // Fallback to the first one just in case existsSync is lying (unlikely but possible in some builds)
    preloadPath = possiblePaths[0];
  }

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 900,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  console.log('[Main] BrowserWindow instance created with preload:', preloadPath);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(resolve(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createIPCHandlers(mainWindow);
}

// Disable GPU cache to fix permission issues
app.commandLine.appendSwitch('disable-gpu-cache');
app.commandLine.appendSwitch('disable-disk-cache');

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Cleanup before quit
});
