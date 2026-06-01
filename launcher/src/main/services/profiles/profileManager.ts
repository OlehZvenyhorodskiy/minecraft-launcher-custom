import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { DEFAULT_GAME_VERSION, DEFAULT_MODS, JVM_BASE_FLAGS } from "@shared/catalog";
import type { LauncherProfile } from "@shared/types";
import { getDefaultInstancesDir, getProfilesFile } from "../paths";
import { JsonStore } from "../../store/jsonStore";
import { getSettings } from "../settings";
import { recommendedHeapGb } from "../launch/jvmArgs";

interface ProfileFile {
  profiles: LauncherProfile[];
}

const profileStore = new JsonStore<ProfileFile>(getProfilesFile(), { profiles: [] });

export async function listProfiles(): Promise<LauncherProfile[]> {
  return (await profileStore.read()).profiles;
}

export async function getProfile(profileId: string): Promise<LauncherProfile> {
  const profile = (await listProfiles()).find((entry) => entry.id === profileId);
  if (!profile) throw new Error(`Profile not found: ${profileId}`);
  return profile;
}

export async function createOptimizedProfile(): Promise<LauncherProfile> {
  const settings = await getSettings();
  const id = randomUUID();
  const now = new Date().toISOString();
  const ramMaxGb = settings.defaultRamMaxGb || recommendedHeapGb();
  const gameDir = join(settings.minecraftRoot || getDefaultInstancesDir(), id);
  const profile: LauncherProfile = {
    id,
    name: `Zonk Optimized ${DEFAULT_GAME_VERSION}`,
    gameVersion: DEFAULT_GAME_VERSION,
    loader: "fabric",
    gameDir,
    ramMinGb: Math.min(2, ramMaxGb),
    ramMaxGb,
    jvmArgs: [...JVM_BASE_FLAGS],
    optimizationPreset: "pvp",
    shaderSupport: true,
    modSlugs: DEFAULT_MODS.filter((mod) => mod.enabledByDefault).map((mod) => mod.slug),
    createdAt: now,
    updatedAt: now
  };

  await mkdir(gameDir, { recursive: true });
  await profileStore.update((file) => ({ profiles: [...file.profiles, profile] }));
  return profile;
}

export async function updateProfile(profile: LauncherProfile): Promise<LauncherProfile> {
  const updated = { ...profile, updatedAt: new Date().toISOString() };
  await profileStore.update((file) => {
    const index = file.profiles.findIndex((entry) => entry.id === updated.id);
    if (index === -1) return { profiles: [...file.profiles, updated] };
    const profiles = [...file.profiles];
    profiles[index] = updated;
    return { profiles };
  });
  return updated;
}

export async function removeProfile(profileId: string): Promise<void> {
  await profileStore.update((file) => ({
    profiles: file.profiles.filter((profile) => profile.id !== profileId)
  }));
}

