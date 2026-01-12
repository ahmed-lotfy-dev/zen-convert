import { contextBridge, ipcRenderer } from 'electron';
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
} from './ipc-types';

const IPC = {
  invoke: async <T, R>(channel: string, payload: T): Promise<IPCResponse<R>> => {
    const request: IPCRequest<T> = {
      id: crypto.randomUUID(),
      payload,
      timestamp: Date.now(),
    };

    const response = await ipcRenderer.invoke(channel, request);

    return response as IPCResponse<R>;
  },

  send: <T>(channel: string, payload: T): void => {
    const request: IPCRequest<T> = {
      id: crypto.randomUUID(),
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
  onNavigationChanged: (callback: (event: any, payload: any) => void) =>
    IPC.on('navigation:changed', callback),
  onWindowBoundsChanged: (callback: (event: any, payload: any) => void) =>
    IPC.on('window:bounds-changed', callback),
  onFilesProgress: (callback: (event: any, payload: any) => void) =>
    IPC.on('files:progress', callback),
};

contextBridge.exposeInMainWorld('electronAPI', api);

export type ElectronAPI = typeof api;
