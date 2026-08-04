import { BrowserWindow, ipcMain, shell } from "electron";
import type { TaskEvent } from "@shared/types";
import { getAppDataDir, getUserDataDir } from "./services/paths";
import { getSettings, updateSettings } from "./services/settings";
import { listProfiles, createOptimizedProfile, updateProfile, removeProfile, getProfile } from "./services/profiles/profileManager";
import { listAccounts, loginMicrosoft } from "./services/auth/microsoft";
import { resolveDefaultMods, downloadDefaultMods } from "./services/mods/modrinth";
import { installProfileRuntime } from "./services/minecraft/installer";
import { launchProfile } from "./services/launch/gameLauncher";
import { resolveJavaPath } from "./services/java/javaLocator";
import { recommendedHeapGb, totalMemoryGb } from "./services/launch/jvmArgs";

function emitTask(window: BrowserWindow, event: TaskEvent): void {
  window.webContents.send("task:event", event);
}

export function setupIpc(window: BrowserWindow): void {
  const emit = (event: TaskEvent): void => emitTask(window, event);

  ipcMain.handle("system:status", async () => ({
    userDataDir: getUserDataDir(),
    appDataDir: getAppDataDir(),
    javaPath: await resolveJavaPath(),
    totalMemoryGb: totalMemoryGb(),
    recommendedHeapGb: recommendedHeapGb()
  }));

  ipcMain.handle("settings:get", () => getSettings());
  ipcMain.handle("settings:update", (_event, settings) => updateSettings(settings));

  ipcMain.handle("profiles:list", () => listProfiles());
  ipcMain.handle("profiles:createOptimized", () => createOptimizedProfile());
  ipcMain.handle("profiles:update", (_event, profile) => updateProfile(profile));
  ipcMain.handle("profiles:remove", (_event, profileId) => removeProfile(profileId));

  ipcMain.handle("accounts:list", () => listAccounts());
  ipcMain.handle("accounts:loginMicrosoft", () => loginMicrosoft(emit));

  ipcMain.handle("mods:resolveDefault", async (_event, profileId) => resolveDefaultMods(await getProfile(profileId)));
  ipcMain.handle("mods:downloadDefault", async (_event, profileId) => downloadDefaultMods(await getProfile(profileId), emit));

  ipcMain.handle("minecraft:installProfile", (_event, profileId) => installProfileRuntime(profileId, emit));
  ipcMain.handle("minecraft:launchProfile", (_event, profileId) => launchProfile(profileId, emit));
  ipcMain.handle("shell:openPath", (_event, path) => shell.openPath(path));
}