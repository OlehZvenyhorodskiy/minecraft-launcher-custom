# Architecture

ZonkLauncher is split into three layers:

1. Electron main process: filesystem access, auth, Modrinth, Minecraft install, Java detection, and process launch.
2. React renderer: profiles, mod list, settings, logs, and launch controls.
3. ZonkOptimizer Fabric mod: client-side render and particle cuts that live inside Minecraft, behind a user-editable config.

The main process exposes a small typed IPC surface through `window.zonk`. Renderer code never reads tokens or game files directly.

## Legal Boundary

The launcher requires Microsoft/Minecraft authentication. It does not provide cracked/offline authentication, authlib injection, or license-bypass workflows.

## Install Flow

1. Create or select an optimized profile.
2. Resolve compatible Fabric mod versions from Modrinth.
3. Install vanilla Minecraft and Fabric with `@xmcl/installer`.
4. Write performance config files into the profile game directory.
5. Download mods into `<profile>/mods`.
6. Launch with `@xmcl/core` using a refreshed Microsoft Minecraft token.

