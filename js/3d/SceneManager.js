export class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container ${containerId} not found`);
            return;
        }

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.actors = [];
        this.mixers = []; // For animation mixers if needed

        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        // Fog for depth
        this.scene.fog = new THREE.Fog(0xffffff, 10, 50);

        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 2, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.clientWidth || window.innerWidth, this.container.clientHeight || window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for perf
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

        this.container.appendChild(this.renderer.domElement);

        // Resize Handler
        window.addEventListener('resize', () => this.onResize());

        // Start Loop
        this.render();
    }

    add(object) {
        this.scene.add(object);
    }

    addActor(actor) {
        this.actors.push(actor);
        if (actor.mesh) this.scene.add(actor.mesh);
    }

    onResize() {
        if (!this.camera || !this.renderer) return;

        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    render() {
        requestAnimationFrame(() => this.render());

        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // Update actors
        this.actors.forEach(actor => {
            if (actor.update) actor.update(time, delta);
        });

        // Update mixers
        this.mixers.forEach(mixer => mixer.update(delta));

        this.renderer.render(this.scene, this.camera);
    }
}
