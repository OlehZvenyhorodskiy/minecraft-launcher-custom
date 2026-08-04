import { contextBridge, ipcRenderer } from "electron";
import type { LauncherProfile, LauncherSettings, TaskEvent, ZonkApi } from "@shared/types";

const api: ZonkApi = {
  getSystemStatus: () => ipcRenderer.invoke("system:status"),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  updateSettings: (settings: Partial<LauncherSettings>) => ipcRenderer.invoke("settings:update", settings),
  listProfiles: () => ipcRenderer.invoke("profiles:list"),
  createOptimizedProfile: () => ipcRenderer.invoke("profiles:createOptimized"),
  updateProfile: (profile: LauncherProfile) => ipcRenderer.invoke("profiles:update", profile),
  removeProfile: (profileId: string) => ipcRenderer.invoke("profiles:remove", profileId),
  listAccounts: () => ipcRenderer.invoke("accounts:list"),
  loginMicrosoft: () => ipcRenderer.invoke("accounts:loginMicrosoft"),
  resolveDefaultMods: (profileId: string) => ipcRenderer.invoke("mods:resolveDefault", profileId),
  downloadDefaultMods: (profileId: string) => ipcRenderer.invoke("mods:downloadDefault", profileId),
  installProfile: (profileId: string) => ipcRenderer.invoke("minecraft:installProfile", profileId),
  launchProfile: (profileId: string) => ipcRenderer.invoke("minecraft:launchProfile", profileId),
  openPath: (path: string) => ipcRenderer.invoke("shell:openPath", path),
  onTaskEvent: (callback: (event: TaskEvent) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: TaskEvent): void => callback(payload);
    ipcRenderer.on("task:event", listener);
    return () => ipcRenderer.removeListener("task:event", listener);
  }
};

contextBridge.exposeInMainWorld("zonk", api);