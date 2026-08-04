import { app } from "electron";
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { Version } from "@xmcl/core";
import { getLoaderArtifactListFor, getVersionList, install, installDependencies, installFabric } from "@xmcl/installer";
import type { LauncherProfile, TaskEvent } from "@shared/types";
import { DEFAULT_FABRIC_LOADER } from "@shared/catalog";
import { downloadDefaultMods } from "../mods/modrinth";
import { getProfile, updateProfile } from "../profiles/profileManager";
import { writePerformanceFiles } from "./performanceFiles";

function fabricLaunchVersion(gameVersion: string, loaderVersion: string): string {
  return `fabric-loader-${loaderVersion}-${gameVersion}`;
}

async function copyBundledOptimizer(profile: LauncherProfile): Promise<boolean> {
  const candidateDirs = [
    join(app.getAppPath(), "resources", "bundled-mods"),
    join(process.cwd(), "resources", "bundled-mods"),
    join(process.resourcesPath ?? "", "bundled-mods")
  ];

  for (const dir of candidateDirs) {
    try {
      const files = await readdir(dir);
      const jar = files.find((file) => file.startsWith("zonk-optimizer-") && file.endsWith(".jar") && !file.includes("sources"));
      if (!jar) continue;
      const modsDir = join(profile.gameDir, "mods");
      await mkdir(modsDir, { recursive: true });
      await copyFile(join(dir, jar), join(modsDir, jar));
      return true;
    } catch {
      // Try the next development/packaged resource location.
    }
  }

  return false;
}

export async function installProfileRuntime(
  profileId: string,
  emit?: (event: TaskEvent) => void
): Promise<LauncherProfile> {
  const profile = await getProfile(profileId);
  await mkdir(profile.gameDir, { recursive: true });

  emit?.({ scope: "minecraft", level: "info", message: `Installing Minecraft ${profile.gameVersion}`, progress: 0.1 });
  const versionList = await getVersionList();
  const mcVersion = versionList.versions.find((version) => version.id === profile.gameVersion);
  if (!mcVersion) throw new Error(`Minecraft version ${profile.gameVersion} was not found in the official manifest.`);

  await install(mcVersion, profile.gameDir);

  emit?.({ scope: "minecraft", level: "info", message: "Installing Fabric Loader", progress: 0.35 });
  const fabricVersions = await getLoaderArtifactListFor(profile.gameVersion);
  const fabric = fabricVersions.find((entry) => entry.loader.stable) ?? fabricVersions[0];

  if (!fabric) throw new Error(`Fabric Loader for ${profile.gameVersion} was not found.`);
  const loaderVersion = fabric.loader.version ?? profile.loaderVersion ?? DEFAULT_FABRIC_LOADER;
  const launchVersion = await installFabric({
    minecraft: profile.gameDir,
    minecraftVersion: profile.gameVersion,
    version: loaderVersion,
    side: "client"
  });
  const resolvedVersion = await Version.parse(profile.gameDir, launchVersion);

  emit?.({ scope: "minecraft", level: "info", message: "Installing libraries and assets", progress: 0.55 });
  await installDependencies(resolvedVersion);

  emit?.({ scope: "minecraft", level: "info", message: "Writing performance presets", progress: 0.72 });
  await writePerformanceFiles(profile);

  emit?.({ scope: "mods", level: "info", message: "Resolving and downloading mods", progress: 0.78 });
  await downloadDefaultMods(profile, emit);
  const optimizerBundled = await copyBundledOptimizer(profile);
  emit?.({
    scope: "mods",
    level: optimizerBundled ? "success" : "warn",
    message: optimizerBundled ? "Bundled ZonkOptimizer copied" : "Bundled ZonkOptimizer jar was not found"
  });

  const updated = await updateProfile({
    ...profile,
    loaderVersion,
    launchVersion
  });

  emit?.({ scope: "minecraft", level: "success", message: "Profile installed", progress: 1 });
  return updated;
}

export const __testing = {
  fabricLaunchVersion
};