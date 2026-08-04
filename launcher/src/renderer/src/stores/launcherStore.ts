import { create } from "zustand";
import type { LauncherProfile, LauncherSettings, PublicAccount, ResolvedMod, SystemStatus, TaskEvent } from "@shared/types";

export type PageKey = "home" | "profiles" | "mods" | "settings" | "logs";

interface LauncherState {
  page: PageKey;
  profiles: LauncherProfile[];
  accounts: PublicAccount[];
  resolvedMods: ResolvedMod[];
  settings?: LauncherSettings;
  system?: SystemStatus;
  selectedProfileId?: string;
  busy: boolean;
  logs: TaskEvent[];
  setPage: (page: PageKey) => void;
  load: () => Promise<void>;
  pushTask: (event: TaskEvent) => void;
  createProfile: () => Promise<void>;
  login: () => Promise<void>;
  resolveMods: () => Promise<void>;
  downloadMods: () => Promise<void>;
  installProfile: () => Promise<void>;
  launchProfile: () => Promise<void>;
  saveSettings: (settings: Partial<LauncherSettings>) => Promise<void>;
  saveProfile: (profile: LauncherProfile) => Promise<void>;
  selectProfile: (profileId: string) => void;
}

function selectedProfile(state: LauncherState): LauncherProfile {
  const profile = state.profiles.find((entry) => entry.id === state.selectedProfileId) ?? state.profiles[0];
  if (!profile) throw new Error("Create a profile first.");
  return profile;
}

async function withBusy(set: (partial: Partial<LauncherState>) => void, task: () => Promise<void>): Promise<void> {
  set({ busy: true });
  try {
    await task();
  } finally {
    set({ busy: false });
  }
}

export const useLauncherStore = create<LauncherState>((set, get) => ({
  page: "home",
  profiles: [],
  accounts: [],
  resolvedMods: [],
  busy: false,
  logs: [],
  setPage: (page) => set({ page }),
  pushTask: (event) => set((state) => ({ logs: [event, ...state.logs].slice(0, 120) })),
  selectProfile: (selectedProfileId) => set({ selectedProfileId }),
  load: async () => {
    const [profiles, accounts, settings, system] = await Promise.all([
      window.zonk.listProfiles(),
      window.zonk.listAccounts(),
      window.zonk.getSettings(),
      window.zonk.getSystemStatus()
    ]);
    set((state) => ({
      profiles,
      accounts,
      settings,
      system,
      selectedProfileId: state.selectedProfileId ?? profiles[0]?.id
    }));
  },
  createProfile: async () =>
    withBusy(set, async () => {
      const profile = await window.zonk.createOptimizedProfile();
      set((state) => ({ profiles: [...state.profiles, profile], selectedProfileId: profile.id }));
    }),
  login: async () =>
    withBusy(set, async () => {
      const account = await window.zonk.loginMicrosoft();
      set((state) => ({ accounts: [account, ...state.accounts.filter((entry) => entry.id !== account.id)] }));
    }),
  resolveMods: async () =>
    withBusy(set, async () => {
      const profile = selectedProfile(get());
      const resolvedMods = await window.zonk.resolveDefaultMods(profile.id);
      set({ resolvedMods });
    }),
  downloadMods: async () =>
    withBusy(set, async () => {
      const profile = selectedProfile(get());
      const resolvedMods = await window.zonk.downloadDefaultMods(profile.id);
      set({ resolvedMods });
    }),
  installProfile: async () =>
    withBusy(set, async () => {
      const profile = selectedProfile(get());
      const updated = await window.zonk.installProfile(profile.id);
      set((state) => ({
        profiles: state.profiles.map((entry) => (entry.id === updated.id ? updated : entry)),
        selectedProfileId: updated.id
      }));
    }),
  launchProfile: async () =>
    withBusy(set, async () => {
      const profile = selectedProfile(get());
      await window.zonk.launchProfile(profile.id);
    }),
  saveSettings: async (partial) =>
    withBusy(set, async () => {
      const settings = await window.zonk.updateSettings(partial);
      const system = await window.zonk.getSystemStatus();
      set({ settings, system });
    }),
  saveProfile: async (profile) =>
    withBusy(set, async () => {
      const updated = await window.zonk.updateProfile(profile);
      set((state) => ({
        profiles: state.profiles.map((entry) => (entry.id === updated.id ? updated : entry))
      }));
    })
}));