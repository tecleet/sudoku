export class LightingStudio {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.init();
    }

    init() {
        // Clear existing lights if any (simple way is to just add new ones, 
        // assuming SceneManager is fresh or we don't care about old ones for now. 
        // Ideally SceneManager should have a clear method, but we'll just add on top or rely on fresh init)

        // 1. Ambient (Fill) - Cool blueish tint for shadows
        const ambientLight = new THREE.AmbientLight(0xddeeff, 0.3);
        this.sceneManager.add(ambientLight);

        // 2. Key Light (Main Sun) - Warm
        const keyLight = new THREE.DirectionalLight(0xffffee, 1.0);
        keyLight.position.set(5, 8, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.bias = -0.0001;
        this.sceneManager.add(keyLight);

        // 3. Rim Light (Backlight) - Bright cool/purple for "Pro" look
        const rimLight = new THREE.SpotLight(0x8800ff, 2.0);
        rimLight.position.set(-5, 5, -5);
        rimLight.lookAt(0, 0, 0);
        this.sceneManager.add(rimLight);

        // 4. Fill Light (Soft)
        const fillLight = new THREE.PointLight(0xffaa00, 0.5);
        fillLight.position.set(-5, 2, 5);
        this.sceneManager.add(fillLight);

        // Floor (Infinite Shadow Catcher)
        const planeGeo = new THREE.PlaneGeometry(100, 100);
        const planeMat = new THREE.ShadowMaterial({ opacity: 0.2 });
        const floor = new THREE.Mesh(planeGeo, planeMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -2;
        floor.receiveShadow = true;
        this.sceneManager.add(floor);

        // Background Gradient (Optional, using CSS usually, but we can add a big sphere if needed)
        // For now, we rely on the CSS background, but let's add some fog
        this.sceneManager.scene.fog = new THREE.FogExp2(0xffffff, 0.02);
    }
}
