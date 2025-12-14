export class TrashCanActor {
    constructor() {
        this.mesh = new THREE.Group();
        this.createModel();
    }

    createModel() {
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.4,
            metalness: 0.8
        });

        const darkMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8
        });

        // Main Can (Cylinder with open top)
        // We use a tube or just a cylinder
        const canGeo = new THREE.CylinderGeometry(1.2, 1, 2.5, 32);
        const can = new THREE.Mesh(canGeo, metalMat);
        can.castShadow = true;
        can.receiveShadow = true;
        this.mesh.add(can);

        // Rim
        const rimGeo = new THREE.TorusGeometry(1.2, 0.1, 16, 32);
        const rim = new THREE.Mesh(rimGeo, metalMat);
        rim.position.y = 1.25;
        rim.rotation.x = Math.PI / 2;
        this.mesh.add(rim);

        // Inside (Black hole illusion)
        const insideGeo = new THREE.CircleGeometry(1.1, 32);
        const inside = new THREE.Mesh(insideGeo, darkMat);
        inside.position.y = 1.2;
        inside.rotation.x = -Math.PI / 2;
        this.mesh.add(inside);

        // Details (Ribs)
        for (let i = 0; i < 3; i++) {
            const ribGeo = new THREE.TorusGeometry(1.1 - (i * 0.05), 0.05, 8, 32);
            const rib = new THREE.Mesh(ribGeo, metalMat);
            rib.position.y = -0.5 + (i * 0.8);
            rib.rotation.x = Math.PI / 2;
            rib.scale.set(1 + i * 0.1, 1 + i * 0.1, 1);
            this.mesh.add(rib);
        }
    }
}
