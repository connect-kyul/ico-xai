import { app, BrowserWindow, ipcMain, systemPreferences } from "electron";
import Store from "electron-store";
import { fileURLToPath } from "node:url";
import { defaultPermissions, type DesktopDevice, type ProviderCredential } from "@ico-xai/core";

type DesktopStore = {
  device?: DesktopDevice;
  credentials?: ProviderCredential[];
};

const store = new Store<DesktopStore>({
  name: "ico-xai-desktop"
});

const preloadPath = fileURLToPath(new URL("../preload/preload.mjs", import.meta.url));
const rendererPath = fileURLToPath(new URL("../renderer/index.html", import.meta.url));

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 920,
    minHeight: 640,
    title: "Ico-XAI Desktop",
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(rendererPath);
}

ipcMain.handle("device:get", () => {
  const existing = store.get("device");
  if (existing) {
    return existing;
  }

  const device: DesktopDevice = {
    id: crypto.randomUUID(),
    name: app.getName(),
    platform: process.platform === "darwin" ? "macos" : "windows",
    status: "awaiting_approval",
    permissions: ["screen:view"]
  };

  store.set("device", device);
  return device;
});

ipcMain.handle("permissions:request-control", async () => {
  const device = store.get("device");
  const nextDevice: DesktopDevice = {
    id: device?.id ?? crypto.randomUUID(),
    name: device?.name ?? app.getName(),
    platform: process.platform === "darwin" ? "macos" : "windows",
    status: "online",
    permissions: defaultPermissions,
    pairedAt: new Date().toISOString()
  };

  if (process.platform === "darwin") {
    systemPreferences.getMediaAccessStatus("screen");
  }

  store.set("device", nextDevice);
  return nextDevice;
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
