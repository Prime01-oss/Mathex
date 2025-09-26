import '@misc/window/windowPreload';
// ✅ 1. Import IpcRendererEvent to fix the TypeScript errors
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

console.log('[ERWT] : Preload execution started');

// Get versions
window.addEventListener('DOMContentLoaded', () => {
  const { env } = process;
  const versions: Record<string, unknown> = {};

  // ERWT Package version
  versions['erwt'] = env['npm_package_version'];
  versions['license'] = env['npm_package_license'];

  // Process versions
  for (const type of ['chrome', 'node', 'electron']) {
    versions[type] = process.versions[type].replace('+', '');
  }
  // Dependencies versions
  for (const type of ['react']) {
    const v = env['npm_package_dependencies_' + type];
    if (v) versions[type] = v.replace('^', '');
  }
  // DevDependencies versions
  for (const type of ['webpack', 'typescript']) {
    const v = env['npm_package_devDependencies_' + type];
    if (v) versions[type] = v.replace('^', '');
  }
});

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('api', {
    getNotebooks: () => ipcRenderer.invoke('get-notebooks'),

    // ✅ 2. This function is now correctly typed, which fixes the crash
    receive: (channel: string, func: (...args: any[]) => void) => {
        const validChannels = ['gotNotebooks'];
        if (validChannels.includes(channel)) {
            // The parameters 'event' and 'args' now have explicit types
            const subscription = (event: IpcRendererEvent, ...args: any[]) => func(...args);
            ipcRenderer.on(channel, subscription);

            // This now correctly returns the cleanup function
            return () => {
                ipcRenderer.removeListener(channel, subscription);
            };
        }
    },
    
    // ✅ 3. Ensured the function name matches what the frontend calls
    archiveNotebooks: (itemPaths: string[]) => ipcRenderer.invoke('archive-notebooks', itemPaths),
    
    // --- Other existing functions ---
    getArchivedNotebooks: () => ipcRenderer.invoke('get-archived-notebooks'),
    restoreArchivedNotebooks: (itemPaths: string[]) => ipcRenderer.invoke('restore-archived-notebooks'),
    deleteArchivedNotebooks: (itemPaths: string[]) => ipcRenderer.invoke('delete-archived-notebooks'),
});