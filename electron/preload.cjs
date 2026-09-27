const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('aimxity', {
  get: () => ipcRenderer.invoke('crosshair:get'),
  update: (config) => ipcRenderer.send('crosshair:update', config),
  toggle: () => ipcRenderer.send('crosshair:toggle'),
  show: () => ipcRenderer.send('crosshair:show'),
  minimize: () => ipcRenderer.send('panel:minimize'),
  setShortcuts: (shortcuts) => ipcRenderer.invoke('shortcuts:set', shortcuts),
  onConfig: (fn) => ipcRenderer.on('crosshair:config', (_, value) => fn(value)),
  onState: (fn) => ipcRenderer.on('crosshair:state', (_, value) => fn(value)),
  onShortcutStatus: (fn) => ipcRenderer.on('shortcuts:status', (_, value) => fn(value))
});
