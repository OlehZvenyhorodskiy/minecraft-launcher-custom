import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildIrisProperties, buildOptionsTxt, buildSodiumOptions, buildZonkOptimizerConfig } from "@shared/presets";
import type { LauncherProfile } from "@shared/types";

export async function writePerformanceFiles(profile: LauncherProfile): Promise<void> {
  const configDir = join(profile.gameDir, "config");
  await mkdir(configDir, { recursive: true });
  await writeFile(join(profile.gameDir, "options.txt"), buildOptionsTxt(profile.optimizationPreset), "utf8");
  await writeFile(join(configDir, "sodium-options.json"), buildSodiumOptions(profile.optimizationPreset), "utf8");
  await writeFile(join(configDir, "iris.properties"), buildIrisProperties(profile.optimizationPreset), "utf8");
  await writeFile(join(configDir, "zonk-optimizer.json"), buildZonkOptimizerConfig(profile.optimizationPreset), "utf8");
}

