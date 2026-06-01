import type { LauncherSettings, ModDescriptor, OptimizationPreset } from "./types";

export const APP_NAME = "ZonkLauncher";
export const DEFAULT_GAME_VERSION = "1.21.8";
export const FALLBACK_GAME_VERSIONS = ["1.21.8", "1.21.7", "1.21.6", "1.21.5", "1.21.4"];
export const DEFAULT_FABRIC_LOADER = "0.19.2";

export const DEFAULT_SETTINGS: LauncherSettings = {
  closeLauncherOnGameStart: false,
  defaultRamMaxGb: 8,
  enableVerboseLogs: false
};

export const DEFAULT_MODS: ModDescriptor[] = [
  { slug: "fabric-api", name: "Fabric API", required: true, category: "core", enabledByDefault: true },
  { slug: "sodium", name: "Sodium", required: true, category: "render", enabledByDefault: true },
  { slug: "lithium", name: "Lithium", required: true, category: "core", enabledByDefault: true },
  { slug: "ferrite-core", name: "FerriteCore", required: true, category: "memory", enabledByDefault: true },
  { slug: "immediatelyfast", name: "ImmediatelyFast", required: true, category: "render", enabledByDefault: true },
  { slug: "modernfix", name: "ModernFix", required: true, category: "core", enabledByDefault: true },
  { slug: "krypton", name: "Krypton", required: false, category: "network", enabledByDefault: true },
  { slug: "c2me-fabric", name: "C2ME", required: false, category: "core", enabledByDefault: true },
  { slug: "moreculling", name: "More Culling", required: false, category: "render", enabledByDefault: true },
  { slug: "entityculling", name: "Entity Culling", required: false, category: "render", enabledByDefault: true },
  { slug: "dynamic-fps", name: "Dynamic FPS", required: false, category: "quality", enabledByDefault: true },
  { slug: "threadtweak", name: "ThreadTweak", required: false, category: "core", enabledByDefault: true },
  { slug: "memoryleakfix", name: "Memory Leak Fix", required: false, category: "memory", enabledByDefault: true },
  { slug: "debugify", name: "Debugify", required: false, category: "compat", enabledByDefault: true },
  { slug: "reeses-sodium-options", name: "Reese's Sodium Options", required: false, category: "quality", enabledByDefault: true },
  { slug: "sodium-extra", name: "Sodium Extra", required: false, category: "quality", enabledByDefault: true },
  { slug: "indium", name: "Indium", required: false, category: "compat", enabledByDefault: true },
  { slug: "iris", name: "Iris Shaders", required: false, category: "quality", enabledByDefault: true },
  { slug: "continuity", name: "Continuity", required: false, category: "quality", enabledByDefault: false },
  { slug: "enhanced-block-entities", name: "Enhanced Block Entities", required: false, category: "render", enabledByDefault: true },
  { slug: "cull-less-leaves", name: "Cull Less Leaves", required: false, category: "render", enabledByDefault: true },
  { slug: "modmenu", name: "Mod Menu", required: false, category: "quality", enabledByDefault: true },
  { slug: "no-chat-reports", name: "No Chat Reports", required: false, category: "quality", enabledByDefault: false }
];

export const PRESET_LABELS: Record<OptimizationPreset, string> = {
  pvp: "PvP",
  potato: "Potato",
  balanced: "Balanced"
};

export const JVM_BASE_FLAGS = [
  "-XX:+UnlockExperimentalVMOptions",
  "-XX:+UseG1GC",
  "-XX:G1NewSizePercent=30",
  "-XX:G1MaxNewSizePercent=40",
  "-XX:G1HeapRegionSize=8M",
  "-XX:G1ReservePercent=20",
  "-XX:G1HeapWastePercent=5",
  "-XX:G1MixedGCCountTarget=4",
  "-XX:InitiatingHeapOccupancyPercent=15",
  "-XX:G1MixedGCLiveThresholdPercent=90",
  "-XX:G1RSetUpdatingPauseTimePercent=5",
  "-XX:SurvivorRatio=32",
  "-XX:MaxTenuringThreshold=1",
  "-XX:+ParallelRefProcEnabled",
  "-XX:+AlwaysPreTouch",
  "-XX:+DisableExplicitGC",
  "-XX:+PerfDisableSharedMem",
  "-XX:MaxGCPauseMillis=200"
];

export const OPTIONS_TXT_PRESETS: Record<OptimizationPreset, string[]> = {
  pvp: [
    "renderDistance:8",
    "simulationDistance:6",
    "maxFps:260",
    "particles:1",
    "graphicsMode:0",
    "ao:1",
    "biomeBlendRadius:0",
    "clouds:false",
    "fancyGraphics:false",
    "entityShadows:false",
    "entityDistanceScaling:0.5",
    "mipmapLevels:0",
    "fov:0.8",
    "guiScale:2",
    "useVbo:true",
    "attackIndicator:1",
    "gamma:1.0"
  ],
  potato: [
    "renderDistance:5",
    "simulationDistance:4",
    "maxFps:360",
    "particles:2",
    "graphicsMode:0",
    "ao:0",
    "biomeBlendRadius:0",
    "clouds:false",
    "fancyGraphics:false",
    "entityShadows:false",
    "entityDistanceScaling:0.35",
    "mipmapLevels:0",
    "fov:0.8",
    "guiScale:2",
    "useVbo:true",
    "attackIndicator:1",
    "gamma:1.0"
  ],
  balanced: [
    "renderDistance:10",
    "simulationDistance:6",
    "maxFps:200",
    "particles:1",
    "graphicsMode:1",
    "ao:1",
    "biomeBlendRadius:1",
    "clouds:false",
    "fancyGraphics:true",
    "entityShadows:false",
    "entityDistanceScaling:0.75",
    "mipmapLevels:2",
    "fov:0.8",
    "guiScale:2",
    "useVbo:true",
    "attackIndicator:1",
    "gamma:1.0"
  ]
};

