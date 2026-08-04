import { launch } from "@xmcl/core";
import type { LauncherProfile, TaskEvent } from "@shared/types";
import { getActiveMinecraftAuth } from "../auth/microsoft";
import { resolveJavaPath } from "../java/javaLocator";
import { getProfile } from "../profiles/profileManager";
import { buildJvmArgs } from "./jvmArgs";

export async function launchProfile(profileId: string, emit?: (event: TaskEvent) => void): Promise<void> {
  const profile: LauncherProfile = await getProfile(profileId);
  const auth = await getActiveMinecraftAuth();
  const javaPath = await resolveJavaPath();
  const version = profile.launchVersion ?? profile.gameVersion;

  emit?.({ scope: "launch", level: "info", message: `Launching ${profile.name}` });

  const process = await launch({
    gamePath: profile.gameDir,
    javaPath,
    version,
    extraJVMArgs: buildJvmArgs(profile),
    accessToken: auth.accessToken,
    username: auth.username,
    uuid: auth.uuid,
    userType: auth.userType,
    extraExecOption: {
      detached: true
    }
  } as never);

  process.unref();
  emit?.({ scope: "launch", level: "success", message: "Minecraft process started" });
}