import { access } from "node:fs/promises";
import { join } from "node:path";
import { getSettings } from "../settings";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function resolveJavaPath(): Promise<string> {
  const settings = await getSettings();
  if (settings.javaPath && (await exists(settings.javaPath))) return settings.javaPath;

  const javaHome = process.env.JAVA_HOME;
  if (javaHome) {
    const javaExe = join(javaHome, "bin", process.platform === "win32" ? "javaw.exe" : "java");
    if (await exists(javaExe)) return javaExe;
  }

  return process.platform === "win32" ? "javaw.exe" : "java";
}

