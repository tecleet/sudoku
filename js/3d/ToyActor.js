export class ToyActor {
    constructor() {
        this.mesh = new THREE.Group();
        this.bodyGroup = new THREE.Group(); // For squash/stretch
        this.mesh.add(this.bodyGroup);

        this.createModel();
    }

    createModel() {
        // Materials
        const pinkMat = new THREE.MeshPhysicalMaterial({
            color: 0xff69b4,
            roughness: 0.3,
            metalness: 0.1,
            clearcoat: 0.5,
            clearcoatRoughness: 0.1
        });

        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // --- Body ---
        const bodyGeo = new THREE.CapsuleGeometry(0.6, 0.8, 4, 16);
        this.body = new THREE.Mesh(bodyGeo, pinkMat);
        this.body.castShadow = true;
        this.body.receiveShadow = true;
        this.bodyGroup.add(this.body);

        // --- Head ---
        const headGeo = new THREE.SphereGeometry(0.5, 32, 32);
        this.head = new THREE.Mesh(headGeo, pinkMat);
        this.head.position.y = 0.75;
        this.head.castShadow = true;
        this.bodyGroup.add(this.head);

        // --- Face ---
        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.08, 16, 16);

        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.18, 0.85, 0.42);
        this.bodyGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.18, 0.85, 0.42);
        this.bodyGroup.add(rightEye);

        // Mouth (Torus segment)
        const mouthGeo = new THREE.TorusGeometry(0.1, 0.03, 8, 16, Math.PI);
        const mouth = new THREE.Mesh(mouthGeo, eyeMat);
        mouth.position.set(0, 0.75, 0.45);
        mouth.rotation.x = Math.PI / 1.2; // Sad/Shocked mouth
        this.bodyGroup.add(mouth);

        // --- Limbs (Separate groups for articulation) ---

        // Arms
        this.leftArm = this.createLimb(pinkMat, -0.7, 0.2, 0, Math.PI / 4);
        this.rightArm = this.createLimb(pinkMat, 0.7, 0.2, 0, -Math.PI / 4);

        // Legs
        this.leftLeg = this.createLimb(pinkMat, -0.3, -0.8, 0, 0);
        this.rightLeg = this.createLimb(pinkMat, 0.3, -0.8, 0, 0);

        this.bodyGroup.add(this.leftArm);
        this.bodyGroup.add(this.rightArm);
        this.bodyGroup.add(this.leftLeg);
        this.bodyGroup.add(this.rightLeg);
    }

    createLimb(material, x, y, z, rotZ) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.rotation.z = rotZ;

        const limbGeo = new THREE.CapsuleGeometry(0.15, 0.6, 4, 8);
        const limb = new THREE.Mesh(limbGeo, material);
        // Offset so rotation pivot is at the "shoulder/hip"
        limb.position.y = -0.3;
        limb.castShadow = true;

        group.add(limb);
        return group;
    }

    // Animation Helpers
    setSquash(amount) {
        // Amount < 1 = squash, > 1 = stretch
        this.bodyGroup.scale.set(1 / amount, amount, 1 / amount);
    }

    reset() {
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0);
        this.bodyGroup.scale.set(1, 1, 1);
        this.bodyGroup.rotation.set(0, 0, 0);
    }
}
