import { contextBridge, ipcRenderer } from 'electron';
console.log('[Preload] Script initialized');
import type {
  IPCRequest,
  IPCResponse,
  DialogOpenRequest,
  DialogOpenResponse,
  WindowGetStateRequest,
  WindowGetStateResponse,
  FilesValidateRequest,
  FilesValidateResponse,
  NavigationSetToolRequest,
  NavigationGetToolRequest,
  NavigationGetToolResponse,
  ImageGetMetadataRequest,
  ImageGetMetadataResponse,
  ImageConvertRequest,
  ImageConvertResponse,
  YouTubeGetInfoRequest,
  YouTubeGetInfoResponse,
  YouTubeDownloadRequest,
  YouTubeDownloadResponse,
} from './ipc-types';

const IPC = {
  invoke: async <T, R>(channel: string, payload: T): Promise<IPCResponse<R>> => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7);
    const request: IPCRequest<T> = {
      id,
      payload,
      timestamp: Date.now(),
    };

    const response = await ipcRenderer.invoke(channel, request);

    return response as IPCResponse<R>;
  },

  send: <T>(channel: string, payload: T): void => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7);
    const request: IPCRequest<T> = {
      id,
      payload,
      timestamp: Date.now(),
    };

    ipcRenderer.send(channel, request);
  },

  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, callback);
  },

  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
};

console.log('[Preload] Starting script execution...');

window.addEventListener('error', (event) => {
  console.error('[Preload] Runtime error caught:', event.error);
});

try {
  const api = {
    dialog: {
      open: (payload: DialogOpenRequest) =>
        IPC.invoke<DialogOpenRequest, DialogOpenResponse>('dialog:open', payload),
    },
    window: {
      getState: (payload: WindowGetStateRequest) =>
        IPC.invoke<WindowGetStateRequest, WindowGetStateResponse>('window:get-state', payload),
      minimize: () => IPC.send('window:minimize', {}),
      maximize: () => IPC.send('window:maximize', {}),
      unmaximize: () => IPC.send('window:unmaximize', {}),
    },
    files: {
      validate: (payload: FilesValidateRequest) =>
        IPC.invoke<FilesValidateRequest, FilesValidateResponse>('files:validate', payload),
    },
    navigation: {
      getTool: (payload: NavigationGetToolRequest) =>
        IPC.invoke<NavigationGetToolRequest, NavigationGetToolResponse>(
          'navigation:get-tool',
          payload
        ),
      setTool: (payload: NavigationSetToolRequest) => IPC.send('navigation:set-tool', payload),
    },
    image: {
      getMetadata: (payload: ImageGetMetadataRequest) =>
        IPC.invoke<ImageGetMetadataRequest, ImageGetMetadataResponse>('image:get-metadata', payload),
      convert: (payload: ImageConvertRequest) =>
        IPC.invoke<ImageConvertRequest, ImageConvertResponse>('image:convert', payload),
    },
    youtube: {
      getInfo: (payload: YouTubeGetInfoRequest) =>
        IPC.invoke<YouTubeGetInfoRequest, YouTubeGetInfoResponse>('youtube:get-info', payload),
      download: (payload: YouTubeDownloadRequest) =>
        IPC.invoke<YouTubeDownloadRequest, YouTubeDownloadResponse>('youtube:download', payload),
    },
    onNavigationChanged: (callback: (event: any, payload: any) => void) =>
      IPC.on('navigation:changed', callback),
    onWindowBoundsChanged: (callback: (event: any, payload: any) => void) =>
      IPC.on('window:bounds-changed', callback),
    onFilesProgress: (callback: (event: any, payload: any) => void) =>
      IPC.on('files:progress', callback),
  };

  console.log('[Preload] Exposing electronAPI to contextBridge...');
  contextBridge.exposeInMainWorld('electronAPI', api);
  
  // Direct test
  (window as any).__PRELOAD_RUN__ = true;
  
  console.log('[Preload] Bridge exposure complete.');
} catch (err) {
  console.error('[Preload] Fatal error during initialization:', err);
}

export type ElectronAPI = {
    dialog: {
      open: (payload: DialogOpenRequest) => Promise<IPCResponse<DialogOpenResponse>>
    },
    window: {
      getState: (payload: any) => Promise<IPCResponse<any>>,
      minimize: () => void,
      maximize: () => void,
      unmaximize: () => void
    },
    files: {
      validate: (payload: any) => Promise<IPCResponse<any>>
    },
    navigation: {
      getTool: (payload: any) => Promise<IPCResponse<any>>,
      setTool: (payload: any) => void
    },
    image: {
      getMetadata: (payload: any) => Promise<IPCResponse<any>>,
      convert: (payload: any) => Promise<IPCResponse<any>>
    },
    youtube: {
      getInfo: (payload: YouTubeGetInfoRequest) => Promise<IPCResponse<YouTubeGetInfoResponse>>,
      download: (payload: YouTubeDownloadRequest) => Promise<IPCResponse<YouTubeDownloadResponse>>
    }
};
