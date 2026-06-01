import { OPTIONS_TXT_PRESETS } from "./catalog";
import type { OptimizationPreset } from "./types";

const particleAllowlist = [
  "minecraft:crit",
  "minecraft:enchanted_hit",
  "minecraft:sweep_attack",
  "minecraft:totem_of_undying",
  "minecraft:witch",
  "minecraft:instant_effect",
  "minecraft:effect",
  "minecraft:entity_effect",
  "minecraft:dragon_breath",
  "minecraft:end_rod",
  "minecraft:campfire_signal_smoke",
  "minecraft:flame",
  "minecraft:splash",
  "minecraft:bubble",
  "minecraft:bubble_pop",
  "minecraft:portal",
  "minecraft:sonic_boom",
  "minecraft:trial_spawner_detection"
];

export function buildOptionsTxt(preset: OptimizationPreset): string {
  return `${OPTIONS_TXT_PRESETS[preset].join("\n")}\n`;
}

export function buildSodiumOptions(preset: OptimizationPreset): string {
  const renderDistance = preset === "potato" ? 5 : preset === "balanced" ? 10 : 8;
  const payload = {
    quality: {
      cloud_quality: "OFF",
      weather_quality: "OFF",
      leaves_quality: preset === "balanced" ? "DEFAULT" : "FAST",
      mipmap_levels: preset === "balanced" ? 2 : 0,
      enable_vignette: false
    },
    advanced: {
      cpu_render_ahead_limit: preset === "potato" ? 1 : 2,
      use_advanced_staging_buffers: true,
      use_no_error_gl_context: true
    },
    performance: {
      chunk_update_threads: 0,
      always_defer_chunk_updates: true,
      animate_only_visible_textures: true
    },
    notifications: {
      hide_donation_button: true
    },
    renderDistance
  };

  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function buildIrisProperties(preset: OptimizationPreset): string {
  const shadowDistance = preset === "balanced" ? 64 : 32;
  return [
    "enableShaders=false",
    `maxShadowRenderDistance=${shadowDistance}`,
    "shaderPack=",
    "disableUpdateMessage=true",
    ""
  ].join("\n");
}

export function buildZonkOptimizerConfig(preset: OptimizationPreset): string {
  const blockEntityDistance = preset === "balanced" ? 48 : preset === "potato" ? 24 : 32;
  const entityMultiplier = preset === "balanced" ? 0.85 : preset === "potato" ? 0.45 : 0.6;
  const menuFpsCap = preset === "balanced" ? 45 : 30;
  const config = {
    particles: {
      preset,
      customAllowlist: particleAllowlist
    },
    rendering: {
      disableRain: preset !== "balanced",
      disableSnow: preset !== "balanced",
      disableClouds: true,
      disableScreenBlur: true,
      blockEntityRenderDistance: blockEntityDistance
    },
    entities: {
      skipOffscreenAnimations: true,
      tickRangeMultiplier: entityMultiplier
    },
    misc: {
      menuFpsCap,
      logSpam: false,
      safeMode: true
    }
  };

  return `${JSON.stringify(config, null, 2)}\n`;
}

