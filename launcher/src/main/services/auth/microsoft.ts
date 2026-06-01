import { safeStorage } from "electron";
import { randomUUID } from "node:crypto";
import { Auth } from "msmc";
import type { PublicAccount, TaskEvent } from "@shared/types";
import { getAccountsFile } from "../paths";
import { JsonStore } from "../../store/jsonStore";

interface PrivateAccountRecord {
  id: string;
  username: string;
  uuid: string;
  xuid?: string;
  active: boolean;
  encryptedRefresh: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountFile {
  accounts: PrivateAccountRecord[];
}

export interface MinecraftLaunchAuth {
  accessToken: string;
  username: string;
  uuid: string;
  userType: "msa";
}

const accountStore = new JsonStore<AccountFile>(getAccountsFile(), { accounts: [] });

function encrypt(value: string): string {
  if (safeStorage.isEncryptionAvailable()) {
    return `safe:${safeStorage.encryptString(value).toString("base64")}`;
  }

  return `plain:${Buffer.from(value, "utf8").toString("base64")}`;
}

function decrypt(value: string): string {
  const [scheme, payload] = value.split(":", 2);
  if (scheme === "safe") {
    return safeStorage.decryptString(Buffer.from(payload, "base64"));
  }

  if (scheme === "plain") {
    return Buffer.from(payload, "base64").toString("utf8");
  }

  throw new Error("Unsupported token storage format");
}

function toPublic(record: PrivateAccountRecord): PublicAccount {
  return {
    id: record.id,
    username: record.username,
    uuid: record.uuid,
    xuid: record.xuid,
    active: record.active,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function ownsJavaEdition(entitlements: string[]): boolean {
  return entitlements.includes("game_minecraft") || entitlements.includes("product_minecraft");
}

function requireMinecraftProfile(minecraft: Awaited<ReturnType<Awaited<ReturnType<InstanceType<typeof Auth>["launch"]>>["getMinecraft"]>>) {
  if (!minecraft.profile) {
    throw new Error("Minecraft profile was not returned for this account.");
  }
  return minecraft.profile;
}

export async function listAccounts(): Promise<PublicAccount[]> {
  return (await accountStore.read()).accounts.map(toPublic);
}

export async function loginMicrosoft(emit?: (event: TaskEvent) => void): Promise<PublicAccount> {
  emit?.({ scope: "auth", level: "info", message: "Opening Microsoft sign-in" });

  const auth = new Auth("select_account");
  auth.on("load", (_asset, message) => {
    emit?.({ scope: "auth", level: "info", message });
  });

  const xbox = await auth.launch("electron", {
    width: 520,
    height: 720,
    resizable: false
  });
  const minecraft = await xbox.getMinecraft();
  const entitlements = await minecraft.entitlements();

  if (!ownsJavaEdition(entitlements)) {
    throw new Error("This Microsoft account does not own Minecraft Java Edition.");
  }

  const profile = requireMinecraftProfile(minecraft);
  const refreshToken = xbox.save();
  const now = new Date().toISOString();
  const record: PrivateAccountRecord = {
    id: randomUUID(),
    username: profile.name,
    uuid: profile.id,
    xuid: minecraft.xuid,
    active: true,
    encryptedRefresh: encrypt(refreshToken),
    createdAt: now,
    updatedAt: now
  };

  await accountStore.update((file) => ({
    accounts: [...file.accounts.map((account) => ({ ...account, active: false })), record]
  }));

  emit?.({ scope: "auth", level: "success", message: `Signed in as ${record.username}` });
  return toPublic(record);
}

export async function getActiveMinecraftAuth(): Promise<MinecraftLaunchAuth> {
  const file = await accountStore.read();
  const active = file.accounts.find((account) => account.active);
  if (!active) throw new Error("Sign in with Microsoft before launching.");

  const auth = new Auth("select_account");
  const xbox = await auth.refresh(decrypt(active.encryptedRefresh));
  const minecraft = await xbox.getMinecraft();
  const entitlements = await minecraft.entitlements();

  if (!ownsJavaEdition(entitlements)) {
    throw new Error("The active account no longer reports Minecraft Java Edition ownership.");
  }

  const refreshed = xbox.save();
  const profile = requireMinecraftProfile(minecraft);
  await accountStore.update((current) => ({
    accounts: current.accounts.map((account) =>
      account.id === active.id
        ? {
            ...account,
            username: profile.name,
            uuid: profile.id,
            xuid: minecraft.xuid,
            encryptedRefresh: encrypt(refreshed),
            updatedAt: new Date().toISOString()
          }
        : account
    )
  }));

  return {
    accessToken: minecraft.mcToken,
    username: profile.name,
    uuid: profile.id,
    userType: "msa"
  };
}
