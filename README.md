# ZonkLauncher

ZonkLauncher is a Windows-first Minecraft optimization launcher built around legal Microsoft/Minecraft authentication, Fabric profiles, Modrinth downloads, aggressive performance presets, and a companion Fabric client mod named `ZonkOptimizer`.

This repo intentionally does not implement cracked/offline account bypasses, authlib injection, or redistribution of Mojang/Microsoft-owned game files. The launcher installs from official manifests, downloads mods from their upstream providers, and requires an account that owns Minecraft Java Edition.

## Current Alpha Scope

- Electron + React + TypeScript desktop shell.
- Profile manager for an optimized Fabric 1.21.8 profile.
- Modrinth resolver/downloader for a curated performance mod list.
- JVM heap and launch-argument builder.
- Preset generators for `options.txt`, Sodium, Iris, and ZonkOptimizer.
- Microsoft auth service using `msmc`.
- `@xmcl/core` / `@xmcl/installer` integration points for game install and launch.
- Fabric Loom project for `ZonkOptimizer`.

## Run

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
npm run dist
```

## Project Layout

- `launcher/` - Electron app and launcher services.
- `zonk-optimizer/` - Fabric client mod skeleton with Mixin patches.
- `docs/` - architecture, mod list, testing, and license notes.
- `PLAN.md` - original product plan kept as source context.

