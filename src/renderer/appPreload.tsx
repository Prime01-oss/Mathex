import '@misc/window/windowPreload';
import { contextBridge, ipcRenderer } from 'electron';

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

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    getArchivedNotebooks: () => ipcRenderer.invoke('get-archived-notebooks'),
    archiveItem: (itemPath: string) => ipcRenderer.invoke('archive-item', itemPath),
    restoreArchivedNotebook: (itemPath: string) => ipcRenderer.invoke('restore-archived-notebook', itemPath),
    deleteArchivedNotebook: (itemPath: string) => ipcRenderer.invoke('delete-archived-notebook', itemPath),
    // Add other functions you want to expose here
});