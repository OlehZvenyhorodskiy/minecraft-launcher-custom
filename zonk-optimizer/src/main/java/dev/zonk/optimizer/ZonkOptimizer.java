package dev.zonk.optimizer;

import dev.zonk.optimizer.config.Config;
import net.fabricmc.api.ClientModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class ZonkOptimizer implements ClientModInitializer {
    public static final String MOD_ID = "zonk-optimizer";
    public static final Logger LOGGER = LoggerFactory.getLogger(MOD_ID);
    public static Config CONFIG = Config.defaults();

    @Override
    public void onInitializeClient() {
        CONFIG = Config.load();
        if (CONFIG.misc.logSpam) {
            LOGGER.info("ZonkOptimizer loaded with preset {}", CONFIG.particles.preset);
        }
    }
}

