import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { FALLBACK_GAME_VERSIONS } from "@shared/catalog";
import type { LauncherProfile, ResolvedMod, TaskEvent } from "@shared/types";

interface ModrinthFile {
  filename: string;
  url: string;
  size: number;
  primary?: boolean;
  hashes?: {
    sha1?: string;
    sha512?: string;
  };
}

interface ModrinthDependency {
  project_id?: string;
  version_id?: string;
  dependency_type: "required" | "optional" | "incompatible" | "embedded";
}

interface ModrinthVersion {
  name: string;
  version_number: string;
  game_versions: string[];
  loaders: string[];
  files: ModrinthFile[];
  dependencies: ModrinthDependency[];
}

const USER_AGENT = "ZonkLauncher/0.1 (licensed optimization launcher)";

function modrinthUrl(slugOrId: string, gameVersion: string): string {
  const url = new URL(`https://api.modrinth.com/v2/project/${slugOrId}/version`);
  url.searchParams.set("game_versions", JSON.stringify([gameVersion]));
  url.searchParams.set("loaders", JSON.stringify(["fabric"]));
  return url.toString();
}

function pickJar(files: ModrinthFile[]): ModrinthFile | undefined {
  return files.find((file) => file.primary && file.filename.endsWith(".jar")) ?? files.find((file) => file.filename.endsWith(".jar"));
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`Modrinth ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function resolveMod(slugOrId: string, gameVersions = FALLBACK_GAME_VERSIONS): Promise<ResolvedMod | null> {
  for (const gameVersion of gameVersions) {
    const versions = await fetchJson<ModrinthVersion[]>(modrinthUrl(slugOrId, gameVersion));
    const selected = versions.find((version) => version.files.some((file) => file.filename.endsWith(".jar")));
    const file = selected ? pickJar(selected.files) : undefined;
    if (selected && file) {
      return {
        slug: slugOrId,
        name: selected.name,
        version: selected.version_number,
        fileName: file.filename,
        downloadUrl: file.url,
        sha512: file.hashes?.sha512,
        size: file.size
      };
    }
  }

  return null;
}

export async function resolveDefaultMods(profile: LauncherProfile): Promise<ResolvedMod[]> {
  const gameVersions = [profile.gameVersion, ...FALLBACK_GAME_VERSIONS.filter((version) => version !== profile.gameVersion)];
  const resolved: ResolvedMod[] = [];

  for (const slug of profile.modSlugs) {
    const mod = await resolveMod(slug, gameVersions);
    if (mod) resolved.push(mod);
  }

  return resolved;
}

async function downloadModFile(mod: ResolvedMod, modsDir: string): Promise<void> {
  const response = await fetch(mod.downloadUrl, {
    headers: {
      "User-Agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`Cannot download ${mod.fileName}: ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (mod.sha512) {
    const actual = createHash("sha512").update(buffer).digest("hex");
    if (actual !== mod.sha512) {
      throw new Error(`Hash mismatch for ${mod.fileName}`);
    }
  }

  await writeFile(join(modsDir, mod.fileName), buffer);
}

export async function downloadDefaultMods(
  profile: LauncherProfile,
  emit?: (event: TaskEvent) => void
): Promise<ResolvedMod[]> {
  const mods = await resolveDefaultMods(profile);
  const modsDir = join(profile.gameDir, "mods");
  await mkdir(modsDir, { recursive: true });

  for (const [index, mod] of mods.entries()) {
    emit?.({
      scope: "mods",
      level: "info",
      message: `Downloading ${mod.fileName}`,
      progress: index / Math.max(1, mods.length)
    });
    await downloadModFile(mod, modsDir);
  }

  emit?.({
    scope: "mods",
    level: "success",
    message: `Downloaded ${mods.length} mods`,
    progress: 1
  });
  return mods;
}

export const __testing = {
  modrinthUrl
};