export class CameraDirector {
    constructor(camera) {
        this.camera = camera;
        this.initialPos = new THREE.Vector3(0, 2, 8);
        this.target = new THREE.Vector3(0, 1, 0);
    }

    reset() {
        this.camera.position.copy(this.initialPos);
        this.camera.lookAt(this.target);
    }

    playIntro() {
        // Dramatic Zoom In
        this.camera.position.set(0, 2, 12);
        gsap.to(this.camera.position, {
            z: 8,
            duration: 1.5,
            ease: "power2.out"
        });
    }

    shake(intensity = 0.2, duration = 0.5) {
        gsap.to(this.camera.position, {
            x: `+=${intensity}`,
            y: `+=${intensity}`,
            yoyo: true,
            repeat: Math.floor(duration * 20),
            duration: 0.05,
            ease: "sine.inOut",
            onComplete: () => {
                // Return to roughly original (or let the next animation take over)
                // We don't force reset here to avoid snapping if moving
            }
        });
    }

    follow(targetMesh, offset = { x: 0, y: 2, z: 8 }, duration = 1) {
        // Smoothly follow a target
        // This is a simplified "look at" tween
        const dummy = { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z };

        gsap.to(dummy, {
            x: targetMesh.position.x + offset.x,
            y: targetMesh.position.y + offset.y,
            z: targetMesh.position.z + offset.z,
            duration: duration,
            onUpdate: () => {
                this.camera.position.set(dummy.x, dummy.y, dummy.z);
                this.camera.lookAt(targetMesh.position);
            }
        });
    }
}
