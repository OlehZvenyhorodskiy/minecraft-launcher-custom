package dev.zonk.optimizer.mixin;

import dev.zonk.optimizer.ZonkOptimizer;
import net.minecraft.client.render.WorldRenderer;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(WorldRenderer.class)
public abstract class WorldRendererMixin {
    @Inject(method = "renderClouds", at = @At("HEAD"), cancellable = true, require = 0)
    private void zonk$disableClouds(CallbackInfo ci) {
        if (ZonkOptimizer.CONFIG.rendering.disableClouds) {
            ci.cancel();
        }
    }

    @Inject(method = "renderWeather", at = @At("HEAD"), cancellable = true, require = 0)
    private void zonk$disableWeather(CallbackInfo ci) {
        if (ZonkOptimizer.CONFIG.rendering.disableRain || ZonkOptimizer.CONFIG.rendering.disableSnow) {
            ci.cancel();
        }
    }
}

