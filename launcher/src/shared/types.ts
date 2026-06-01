export type OptimizationPreset = "pvp" | "potato" | "balanced";

export type ModLoader = "fabric";

export interface ModDescriptor {
  slug: string;
  name: string;
  required: boolean;
  category: "core" | "render" | "memory" | "network" | "compat" | "quality";
  enabledByDefault: boolean;
}

export interface ResolvedMod {
  slug: string;
  name: string;
  version: string;
  fileName: string;
  downloadUrl: string;
  sha512?: string;
  size: number;
}

export interface LauncherProfile {
  id: string;
  name: string;
  gameVersion: string;
  loader: ModLoader;
  loaderVersion?: string;
  launchVersion?: string;
  gameDir: string;
  ramMinGb: number;
  ramMaxGb: number;
  jvmArgs: string[];
  optimizationPreset: OptimizationPreset;
  shaderSupport: boolean;
  modSlugs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicAccount {
  id: string;
  username: string;
  uuid: string;
  xuid?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LauncherSettings {
  javaPath?: string;
  minecraftRoot?: string;
  closeLauncherOnGameStart: boolean;
  defaultRamMaxGb: number;
  enableVerboseLogs: boolean;
}

export interface SystemStatus {
  userDataDir: string;
  appDataDir: string;
  javaPath: string;
  totalMemoryGb: number;
  recommendedHeapGb: number;
}

export interface TaskEvent {
  scope: "auth" | "profile" | "mods" | "minecraft" | "launch" | "system";
  level: "info" | "warn" | "error" | "success";
  message: string;
  progress?: number;
}

export interface ZonkApi {
  getSystemStatus(): Promise<SystemStatus>;
  getSettings(): Promise<LauncherSettings>;
  updateSettings(settings: Partial<LauncherSettings>): Promise<LauncherSettings>;
  listProfiles(): Promise<LauncherProfile[]>;
  createOptimizedProfile(): Promise<LauncherProfile>;
  updateProfile(profile: LauncherProfile): Promise<LauncherProfile>;
  removeProfile(profileId: string): Promise<void>;
  listAccounts(): Promise<PublicAccount[]>;
  loginMicrosoft(): Promise<PublicAccount>;
  resolveDefaultMods(profileId: string): Promise<ResolvedMod[]>;
  downloadDefaultMods(profileId: string): Promise<ResolvedMod[]>;
  installProfile(profileId: string): Promise<LauncherProfile>;
  launchProfile(profileId: string): Promise<void>;
  openPath(path: string): Promise<void>;
  onTaskEvent(callback: (event: TaskEvent) => void): () => void;
}

