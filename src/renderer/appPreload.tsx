import '@misc/window/windowPreload';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main process.
   */

  // NEW: Functions for custom shortcuts
  getCustomShortcuts: () => ipcRenderer.invoke('get-custom-shortcuts'),
  setCustomShortcuts: (shortcuts: Record<string, string>) => ipcRenderer.invoke('set-custom-shortcuts', shortcuts),

  // Existing functions from the project
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // File system
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFile: (file: { content: string; filePath: string }) => ipcRenderer.invoke('save-file', file),
  openFile: (filePath: string) => ipcRenderer.invoke('open-file', filePath),
  readFolder: (folderPath: string) => ipcRenderer.invoke('read-folder', folderPath),
});

