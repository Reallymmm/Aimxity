const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
let panel, overlay;
let config = { visible: true, shape: 'classic', color: '#b8ff42', size: 30, thickness: 3, gap: 7, opacity: 100, dot: false, outline: true };
function sendConfig() { if (overlay && !overlay.isDestroyed()) overlay.webContents.send('crosshair:config', config); }
function createOverlay() {
  const { width, height } = screen.getPrimaryDisplay().bounds;
  overlay = new BrowserWindow({ x: 0, y: 0, width, height, transparent: true, frame: false, resizable: false, movable: false, focusable: false, skipTaskbar: true, alwaysOnTop: true, hasShadow: false, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false } });
  overlay.setAlwaysOnTop(true, 'screen-saver'); overlay.setIgnoreMouseEvents(true); overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  if (app.isPackaged) overlay.loadFile(path.join(__dirname, '../dist/overlay.html')); else overlay.loadURL('http://localhost:5173/overlay.html');
  overlay.webContents.once('did-finish-load', sendConfig);
}
function createPanel() {
  panel = new BrowserWindow({ width: 1120, height: 760, minWidth: 900, minHeight: 650, title: 'Aimxity', backgroundColor: '#0a0c11', webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false } });
  if (app.isPackaged) panel.loadFile(path.join(__dirname, '../dist/index.html')); else panel.loadURL('http://localhost:5173');
}
function registerKeys() {
  const binds = { 'CommandOrControl+Shift+X': () => { config.visible = !config.visible; sendConfig(); if(panel) panel.webContents.send('crosshair:state', config.visible); }, 'CommandOrControl+Shift+H': () => { config.visible = false; sendConfig(); if(panel) panel.webContents.send('crosshair:state', false); }, 'CommandOrControl+Shift+Plus': () => { config.size = Math.min(80, config.size + 2); sendConfig(); if(panel) panel.webContents.send('crosshair:config', config); } };
  for (const [key, fn] of Object.entries(binds)) globalShortcut.register(key, fn);
}
app.whenReady().then(() => { createOverlay(); createPanel(); registerKeys(); });
app.on('will-quit', () => globalShortcut.unregisterAll());
ipcMain.handle('crosshair:get', () => config);
ipcMain.on('crosshair:update', (_, next) => { config = { ...config, ...next }; sendConfig(); });
ipcMain.on('crosshair:toggle', () => { config.visible = !config.visible; sendConfig(); if(panel) panel.webContents.send('crosshair:state', config.visible); });
ipcMain.on('crosshair:show', () => { config.visible = true; sendConfig(); });
ipcMain.on('panel:minimize', () => panel?.minimize());
