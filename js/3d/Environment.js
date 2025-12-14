export class Environment {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.init();
    }

    init() {
        // Ambient Light (Soft fill)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.sceneManager.add(ambientLight);

        // Main Directional Light (Sun/Key light)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(5, 10, 7);
        mainLight.castShadow = true;

        // Shadow properties
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.bias = -0.001;

        // Shadow camera volume
        const d = 10;
        mainLight.shadow.camera.left = -d;
        mainLight.shadow.camera.right = d;
        mainLight.shadow.camera.top = d;
        mainLight.shadow.camera.bottom = -d;

        this.sceneManager.add(mainLight);

        // Rim Light (Backlight for definition)
        const rimLight = new THREE.SpotLight(0x90caf9, 0.8);
        rimLight.position.set(-5, 8, -5);
        rimLight.lookAt(0, 0, 0);
        this.sceneManager.add(rimLight);

        // Floor (Shadow catcher)
        // We use a ShadowMaterial so only the shadow is visible, not the plane itself
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.ShadowMaterial({
            opacity: 0.3,
            color: 0x000000
        });

        const floor = new THREE.Mesh(planeGeometry, planeMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2; // Slightly below the actors
        floor.receiveShadow = true;

        this.sceneManager.add(floor);
    }
}
