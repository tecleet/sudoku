export class PostProcessor {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.composer = null;
        this.init();
    }

    init() {
        const { renderer, scene, camera } = this.sceneManager;

        // Ensure renderer is set up for high quality
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1.5;

        // Create Composer
        this.composer = new THREE.EffectComposer(renderer);

        // Render Pass (Base Scene)
        const renderPass = new THREE.RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        // Bloom Pass (Glow)
        // resolution, strength, radius, threshold
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,  // Strength
            0.4,  // Radius
            0.85  // Threshold
        );
        this.composer.addPass(bloomPass);

        // Handle Resize
        this.sceneManager.addResizeListener((width, height) => {
            this.composer.setSize(width, height);
        });
    }

    render() {
        if (this.composer) {
            this.composer.render();
        }
    }
}
