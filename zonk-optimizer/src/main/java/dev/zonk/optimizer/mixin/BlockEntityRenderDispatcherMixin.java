package dev.zonk.optimizer.mixin;

import dev.zonk.optimizer.ZonkOptimizer;
import net.minecraft.block.entity.BlockEntity;
import net.minecraft.client.MinecraftClient;
import net.minecraft.client.render.VertexConsumerProvider;
import net.minecraft.client.render.block.entity.BlockEntityRenderDispatcher;
import net.minecraft.client.util.math.MatrixStack;
import net.minecraft.entity.Entity;
import net.minecraft.util.math.Vec3d;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(BlockEntityRenderDispatcher.class)
public abstract class BlockEntityRenderDispatcherMixin {
    @Inject(method = "render", at = @At("HEAD"), cancellable = true, require = 0)
    private <E extends BlockEntity> void zonk$cullDistantBlockEntities(
        E blockEntity,
        float tickProgress,
        MatrixStack matrices,
        VertexConsumerProvider vertexConsumers,
        CallbackInfo ci
    ) {
        Entity camera = MinecraftClient.getInstance().cameraEntity;
        if (camera == null) return;

        int maxDistance = ZonkOptimizer.CONFIG.rendering.blockEntityRenderDistance;
        Vec3d center = Vec3d.ofCenter(blockEntity.getPos());
        if (camera.getPos().squaredDistanceTo(center) > (double) maxDistance * maxDistance) {
            ci.cancel();
        }
    }
}

