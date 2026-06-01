import { app } from "electron";
import { join } from "node:path";

export function getUserDataDir(): string {
  return app.getPath("userData");
}

export function getAppDataDir(): string {
  return join(app.getPath("appData"), "ZonkLauncher");
}

export function getProfilesFile(): string {
  return join(getUserDataDir(), "profiles.json");
}

export function getAccountsFile(): string {
  return join(getUserDataDir(), "accounts.json");
}

export function getSettingsFile(): string {
  return join(getUserDataDir(), "settings.json");
}

export function getDefaultInstancesDir(): string {
  return join(getAppDataDir(), "instances");
}

export function getDefaultMinecraftRoot(): string {
  return join(getAppDataDir(), "minecraft");
}

export function getCacheDir(): string {
  return join(getAppDataDir(), "cache");
}

