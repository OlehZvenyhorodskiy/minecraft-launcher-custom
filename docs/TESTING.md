# Testing

## Unit

Run:

```powershell
npm test
```

Covered first:

- JVM heap recommendation and flag generation.
- Profile creation defaults.
- Modrinth URL construction and version fallback.

## Manual Launcher QA

1. Run `npm run dev`.
2. Sign in with Microsoft.
3. Create the optimized profile.
4. Resolve and download mods.
5. Install Minecraft/Fabric.
6. Launch and verify the Java process starts.

## FPS Benchmark

Use the same world seed, coordinates, render distance, and window size for each pass.

- Vanilla Minecraft.
- ZonkLauncher profile with `pvp` preset.
- ZonkLauncher profile with `potato` preset.

Record average FPS, 1% low, peak RAM, and chunk-load stutter notes in `docs/BENCHMARKS.md`.

