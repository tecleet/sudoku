export class AnimationController {
    constructor(sceneManager, toy, trashCan, effects) {
        this.sceneManager = sceneManager;
        this.toy = toy;
        this.trashCan = trashCan;
        this.effects = effects;
    }

    playGameOverSequence() {
        const tl = gsap.timeline();

        // Initial State
        this.toy.reset();
        this.toy.mesh.position.set(0, 0, 0);
        this.toy.mesh.rotation.y = Math.PI; // Facing camera

        // Trash can position
        this.trashCan.mesh.position.set(4, -2, -2);
        this.trashCan.mesh.rotation.y = -Math.PI / 4;

        // Camera Start
        const cam = this.sceneManager.camera;
        cam.position.set(0, 2, 8);
        cam.lookAt(0, 1, 0);

        // --- Sequence ---

        // 1. Anticipation (Squash)
        tl.to(this.toy.bodyGroup.scale, {
            x: 1.2, y: 0.8, z: 1.2,
            duration: 0.3,
            ease: "power2.in"
        });

        // 2. Jump (Stretch)
        tl.to(this.toy.bodyGroup.scale, {
            x: 0.8, y: 1.2, z: 0.8,
            duration: 0.1,
            ease: "power2.out"
        });

        // 3. The Throw (Parabolic Arc)
        // We animate x/z linearly, and y with a gravity arc
        const jumpDuration = 1.2;

        // X/Z Motion
        tl.to(this.toy.mesh.position, {
            x: 4, // Trash can X
            z: -2, // Trash can Z
            duration: jumpDuration,
            ease: "power1.inOut"
        }, "<"); // Start with previous

        // Y Motion (Arc)
        // We use a custom object to simulate Y for more control or just simple keyframes
        // Let's use keyframes for the arc: Up then Down
        tl.to(this.toy.mesh.position, {
            y: 4, // Peak
            duration: jumpDuration * 0.4,
            ease: "power2.out"
        }, "<");

        tl.to(this.toy.mesh.position, {
            y: -0.5, // Inside can
            duration: jumpDuration * 0.6,
            ease: "bounce.out" // Little bounce on floor/can
        }, ">");

        // Rotation (Spinning wildly)
        tl.to(this.toy.mesh.rotation, {
            x: Math.PI * 4,
            z: Math.PI * 2,
            duration: jumpDuration,
            ease: "none"
        }, `-=${jumpDuration}`);

        // 4. Impact
        tl.add(() => {
            // Particles
            this.effects.createExplosion(new THREE.Vector3(4, 0, -2), 0xff69b4, 30);

            // Camera Shake
            gsap.to(cam.position, {
                x: "+=0.2",
                y: "+=0.2",
                duration: 0.1,
                yoyo: true,
                repeat: 5
            });
        }, "-=0.2"); // Slightly before end of jump

        // 5. Can Wobble
        tl.to(this.trashCan.mesh.rotation, {
            z: 0.2,
            duration: 0.1,
            yoyo: true,
            repeat: 3,
            ease: "sine.inOut"
        }, "<");

        // 6. Camera Zoom to Can
        tl.to(cam.position, {
            x: 3,
            y: 1,
            z: 3,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => cam.lookAt(4, 0, -2)
        }, "-=0.5");

        return tl;
    }
}
