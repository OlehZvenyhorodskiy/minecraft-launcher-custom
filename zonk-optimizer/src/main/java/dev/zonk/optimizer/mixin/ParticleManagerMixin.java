package dev.zonk.optimizer.mixin;

import dev.zonk.optimizer.ZonkOptimizer;
import net.minecraft.client.particle.Particle;
import net.minecraft.client.particle.ParticleManager;
import net.minecraft.particle.ParticleEffect;
import net.minecraft.registry.Registries;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

@Mixin(ParticleManager.class)
public abstract class ParticleManagerMixin {
    @Inject(
        method = "addParticle(Lnet/minecraft/particle/ParticleEffect;DDDDDD)Lnet/minecraft/client/particle/Particle;",
        at = @At("HEAD"),
        cancellable = true,
        require = 0
    )
    private void zonk$filterParticle(
        ParticleEffect effect,
        double x,
        double y,
        double z,
        double velocityX,
        double velocityY,
        double velocityZ,
        CallbackInfoReturnable<Particle> cir
    ) {
        String id = Registries.PARTICLE_TYPE.getId(effect.getType()).toString();
        if (!ZonkOptimizer.CONFIG.shouldSpawnParticle(id)) {
            cir.setReturnValue(null);
        }
    }
}

