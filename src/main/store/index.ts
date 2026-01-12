import Store from 'electron-store';
import type { WindowState, NavigationState } from '../types';
import { ToolType } from '../types';

interface StoreSchema {
  windowState: WindowState;
  navigationState: NavigationState;
  appSettings: {
    theme: string;
    language: string;
    lastUsedDirectory: string;
  };
}

const store = new Store<StoreSchema>({
  defaults: {
    windowState: {
      width: 1024,
      height: 768,
      x: null,
      y: null,
      isMaximized: false,
      isFullscreen: false,
    },
    navigationState: {
      currentTool: ToolType.IMAGE_CONVERTER,
      previousTool: null,
      timestamp: Date.now(),
    },
    appSettings: {
      theme: 'light',
      language: 'en',
      lastUsedDirectory: '',
    },
  },
});

export default store;
