package dev.zonk.optimizer.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import net.fabricmc.loader.api.FabricLoader;

import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;

public final class Config {
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    public ParticleConfig particles = new ParticleConfig();
    public RenderingConfig rendering = new RenderingConfig();
    public EntityConfig entities = new EntityConfig();
    public MiscConfig misc = new MiscConfig();

    public static Config defaults() {
        Config config = new Config();
        config.particles.customAllowlist.add("minecraft:crit");
        config.particles.customAllowlist.add("minecraft:enchanted_hit");
        config.particles.customAllowlist.add("minecraft:sweep_attack");
        config.particles.customAllowlist.add("minecraft:totem_of_undying");
        config.particles.customAllowlist.add("minecraft:witch");
        config.particles.customAllowlist.add("minecraft:instant_effect");
        config.particles.customAllowlist.add("minecraft:effect");
        config.particles.customAllowlist.add("minecraft:entity_effect");
        config.particles.customAllowlist.add("minecraft:dragon_breath");
        config.particles.customAllowlist.add("minecraft:end_rod");
        config.particles.customAllowlist.add("minecraft:campfire_signal_smoke");
        config.particles.customAllowlist.add("minecraft:flame");
        config.particles.customAllowlist.add("minecraft:splash");
        config.particles.customAllowlist.add("minecraft:bubble");
        config.particles.customAllowlist.add("minecraft:bubble_pop");
        config.particles.customAllowlist.add("minecraft:portal");
        config.particles.customAllowlist.add("minecraft:sonic_boom");
        config.particles.customAllowlist.add("minecraft:trial_spawner_detection");
        return config;
    }

    public static Config load() {
        Path path = FabricLoader.getInstance().getConfigDir().resolve("zonk-optimizer.json");
        if (Files.notExists(path)) {
            Config config = defaults();
            config.save(path);
            return config;
        }

        try (Reader reader = Files.newBufferedReader(path)) {
            Config config = GSON.fromJson(reader, Config.class);
            return config == null ? defaults() : config;
        } catch (IOException error) {
            return defaults();
        }
    }

    public void save(Path path) {
        try {
            Files.createDirectories(path.getParent());
            try (Writer writer = Files.newBufferedWriter(path)) {
                GSON.toJson(this, writer);
            }
        } catch (IOException ignored) {
        }
    }

    public boolean shouldSpawnParticle(String id) {
        if ("vanilla".equalsIgnoreCase(particles.preset)) return true;
        return particles.customAllowlist.contains(id);
    }

    public static final class ParticleConfig {
        public String preset = "pvp";
        public Set<String> customAllowlist = new HashSet<>();
    }

    public static final class RenderingConfig {
        public boolean disableRain = true;
        public boolean disableSnow = true;
        public boolean disableClouds = true;
        public boolean disableScreenBlur = true;
        public int blockEntityRenderDistance = 32;
    }

    public static final class EntityConfig {
        public boolean skipOffscreenAnimations = true;
        public double tickRangeMultiplier = 0.6;
    }

    public static final class MiscConfig {
        public int menuFpsCap = 30;
        public boolean logSpam = false;
        public boolean safeMode = true;
    }
}

