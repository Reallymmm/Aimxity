const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
let panel, overlay, settingsFile;
const defaults = { visible:true, shape:'classic', color:'#b8ff42', size:30, length:30, thickness:3, gap:7, opacity:100, offsetX:0, offsetY:0, dot:false, outline:true };
let config = { ...defaults };
let shortcuts = { toggle:'Control+Alt+X', hide:'Control+Alt+H', larger:'Control+Alt+Up', smaller:'Control+Alt+Down' };
function persist() { if (!settingsFile) return; try { fs.writeFileSync(settingsFile, JSON.stringify({config,shortcuts},null,2)); } catch (e) { console.error('Could not save Aimxity settings:',e); } }
function sendConfig() { if (overlay && !overlay.isDestroyed()) overlay.webContents.send('crosshair:config', config); }
function sendState() { if (panel && !panel.isDestroyed()) panel.webContents.send('crosshair:state', config.visible); }
function setVisible(value) { config.visible = value; persist(); sendConfig(); sendState(); }
function registerShortcuts(next = shortcuts) {
  globalShortcut.unregisterAll();
  shortcuts = { ...shortcuts, ...next };
  const actions = {
    toggle: () => setVisible(!config.visible),
    hide: () => setVisible(false),
    larger: () => { config.size += 1; persist(); sendConfig(); if(panel&&!panel.isDestroyed()) panel.webContents.send('crosshair:config',config); },
    smaller: () => { config.size = Math.max(1, config.size - 1); persist(); sendConfig(); if(panel&&!panel.isDestroyed()) panel.webContents.send('crosshair:config',config); }
  };
  const results = {};
  for (const [action, accelerator] of Object.entries(shortcuts)) {
    try { results[action] = globalShortcut.register(accelerator, actions[action]); }
    catch (e) { results[action] = false; console.error(`Could not register shortcut ${accelerator}:`,e); }
  }
  persist();
  if(panel&&!panel.isDestroyed()) panel.webContents.send('shortcuts:status',results);
  return results;
}
function createOverlay() {
  const { width, height } = screen.getPrimaryDisplay().bounds;
  overlay = new BrowserWindow({ x:0,y:0,width,height,transparent:true,frame:false,resizable:false,movable:false,focusable:false,skipTaskbar:true,alwaysOnTop:true,hasShadow:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false} });
  overlay.setAlwaysOnTop(true,'screen-saver'); overlay.setIgnoreMouseEvents(true); overlay.setVisibleOnAllWorkspaces(true,{visibleOnFullScreen:true});
  if(app.isPackaged) overlay.loadFile(path.join(__dirname,'../dist/overlay.html')); else overlay.loadURL('http://localhost:5173/overlay.html');
  overlay.webContents.once('did-finish-load',sendConfig);
}
function createPanel() {
  panel = new BrowserWindow({width:1120,height:760,minWidth:900,minHeight:650,title:'Aimxity — игровой прицел',backgroundColor:'#0a0c11',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false}});
  if(app.isPackaged) panel.loadFile(path.join(__dirname,'../dist/index.html')); else panel.loadURL('http://localhost:5173');
  panel.on('closed',()=>{ if(overlay&&!overlay.isDestroyed()) overlay.destroy(); app.quit(); });
}
app.whenReady().then(()=>{
  settingsFile=path.join(app.getPath('userData'),'settings.json');
  try { const saved=JSON.parse(fs.readFileSync(settingsFile,'utf8')); config={...defaults,...saved.config}; shortcuts={...shortcuts,...saved.shortcuts}; } catch {}
  createOverlay(); createPanel(); registerShortcuts();
});
app.on('will-quit',()=>globalShortcut.unregisterAll());
ipcMain.handle('crosshair:get',()=>({config,shortcuts}));
ipcMain.on('crosshair:update',(_,next)=>{config={...config,...next};persist();sendConfig();});
ipcMain.on('crosshair:toggle',()=>setVisible(!config.visible));
ipcMain.on('crosshair:show',()=>setVisible(true));
ipcMain.handle('shortcuts:set',(_,next)=>{
  const old={...shortcuts};const results=registerShortcuts(next);
  const failed=Object.entries(results).filter(([,ok])=>!ok);
  if(failed.length){registerShortcuts(old);return {ok:false,results};}
  return {ok:true,results};
});
ipcMain.on('panel:minimize',()=>panel?.minimize());
