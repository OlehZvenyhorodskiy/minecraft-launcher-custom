import { DEFAULT_SETTINGS } from "@shared/catalog";
import type { LauncherSettings } from "@shared/types";
import { getSettingsFile } from "./paths";
import { JsonStore } from "../store/jsonStore";

const settingsStore = new JsonStore<LauncherSettings>(getSettingsFile(), DEFAULT_SETTINGS);

export async function getSettings(): Promise<LauncherSettings> {
  return { ...DEFAULT_SETTINGS, ...(await settingsStore.read()) };
}

export async function updateSettings(partial: Partial<LauncherSettings>): Promise<LauncherSettings> {
  return settingsStore.update((settings) => ({
    ...DEFAULT_SETTINGS,
    ...settings,
    ...partial
  }));
}

