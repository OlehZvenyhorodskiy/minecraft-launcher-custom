package dev.zonk.optimizer.mixin;

import dev.zonk.optimizer.ZonkOptimizer;
import net.minecraft.client.gui.screen.Screen;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(Screen.class)
public abstract class ScreenMixin {
    @Inject(method = "renderBackground", at = @At("HEAD"), cancellable = true, require = 0)
    private void zonk$disableScreenBackgroundBlur(CallbackInfo ci) {
        if (ZonkOptimizer.CONFIG.rendering.disableScreenBlur) {
            ci.cancel();
        }
    }
}