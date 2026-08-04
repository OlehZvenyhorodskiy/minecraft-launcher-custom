import { totalmem } from "node:os";
import { JVM_BASE_FLAGS } from "@shared/catalog";
import type { LauncherProfile } from "@shared/types";

export function totalMemoryGb(): number {
  return Math.round(totalmem() / 1024 / 1024 / 1024);
}

export function recommendedHeapGb(totalGb = totalMemoryGb()): number {
  if (totalGb <= 8) return 4;
  if (totalGb <= 16) return 10;
  if (totalGb <= 32) return 16;
  return 20;
}

export function buildJvmArgs(profile: LauncherProfile): string[] {
  const min = Math.max(1, Math.min(profile.ramMinGb, profile.ramMaxGb));
  const max = Math.max(min, profile.ramMaxGb);
  const flags = new Set(profile.jvmArgs.length ? profile.jvmArgs : JVM_BASE_FLAGS);
  return [`-Xms${min}G`, `-Xmx${max}G`, ...flags];
}