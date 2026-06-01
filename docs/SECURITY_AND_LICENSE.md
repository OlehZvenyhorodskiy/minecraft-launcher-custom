# Security And License Notes

ZonkLauncher does not bypass Microsoft, Mojang, or Minecraft authentication. Users must own Minecraft Java Edition.

Stored auth refresh data is encrypted with Electron `safeStorage` where available. The renderer receives only display-safe account metadata.

Mods are downloaded from Modrinth at install time. The launcher does not mirror third-party mod jars inside the repository.

ZonkOptimizer is client-side and should not send gameplay-altering data to servers. Riskier patches are behind config switches so users can keep a conservative profile for anti-cheat-sensitive servers.

