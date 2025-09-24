import { app, BrowserWindow, ipcMain } from 'electron';
import { createAppWindow } from './appWindow';
import fs from 'fs-extra';
import path from 'path';

/** Handle creating/removing shortcuts on Windows when installing/uninstalling. */
if (require('electron-squirrel-startup')) {
  app.quit();
}

/**
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */
app.on('ready', createAppWindow);

/**
 * Emitted when the application is activated. Various actions can
 * trigger this event, such as launching the application for the first time,
 * attempting to re-launch the application when it's already running,
 * or clicking on the application's dock or taskbar icon.
 */
app.on('activate', () => {
  /**
   * On OS X it's common to re-create a window in the app when the
   * dock icon is clicked and there are no other windows open.
   */
  if (BrowserWindow.getAllWindows().length === 0) {
    createAppWindow();
  }
});

/**
 * Emitted when all windows have been closed.
 */
app.on('window-all-closed', () => {
  /**
   * On OS X it is common for applications and their menu bar
   * to stay active until the user quits explicitly with Cmd + Q
   */
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('new-file-request', () => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.webContents.send('new-file');
  }
});

ipcMain.handle('get-archived-notebooks', async () => {
  const userDataPath = app.getPath('userData');
  const archivePath = path.join(userDataPath, 'archive');
  await fs.ensureDir(archivePath);

  const items: { [key: string]: any } = {
    root: {
      index: 'root',
      data: 'Archived',
      path: archivePath,
      children: [] as string[], // <-- FIX APPLIED HERE
      isFolder: true,
    },
  };

  try {
    const files = await fs.readdir(archivePath);
    for (const file of files) {
      const filePath = path.join(archivePath, file);
      const stats = await fs.stat(filePath);
      const isFolder = stats.isDirectory();
      const fileExt = isFolder ? '' : path.extname(filePath);
      const fileName = path.basename(filePath, fileExt);

      const item = {
        index: filePath,
        data: fileName,
        path: filePath,
        isFolder: isFolder,
        children: [] as string[], // <-- FIX APPLIED HERE
      };

      items[filePath] = item;
      (items.root.children as string[]).push(filePath);
    }
  } catch (error) {
    console.error('Error reading archive directory:', error);
  }

  return { root: items };
});

ipcMain.handle('archive-item', async (event, itemPath) => {
  const userDataPath = app.getPath('userData');
  const archivePath = path.join(userDataPath, 'archive');
  await fs.ensureDir(archivePath);

  const itemName = path.basename(itemPath);
  const newPath = path.join(archivePath, itemName);

  try {
    await fs.move(itemPath, newPath, { overwrite: true });
    return { success: true, path: newPath };
  } catch (error) {
    console.error('Failed to archive item:', error);
    return { success: false, error: error.message };
  }
});