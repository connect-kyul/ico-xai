import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("icoXai", {
  getDevice: () => ipcRenderer.invoke("device:get"),
  requestControl: () => ipcRenderer.invoke("permissions:request-control")
});
