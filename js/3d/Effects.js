export class Effects {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.particles = [];
    }

    createExplosion(position, color = 0xffd700, count = 20) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions.push(position.x, position.y, position.z);

            // Random velocity
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 2 + Math.random() * 3;

            velocities.push(
                speed * Math.sin(phi) * Math.cos(theta),
                speed * Math.sin(phi) * Math.sin(theta),
                speed * Math.cos(phi)
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.2,
            transparent: true,
            opacity: 1
        });

        const particleSystem = new THREE.Points(geometry, material);
        this.sceneManager.add(particleSystem);

        this.particles.push({
            mesh: particleSystem,
            velocities: velocities,
            age: 0,
            lifetime: 1.5 // seconds
        });
    }

    update(time, delta) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.age += delta;

            if (p.age >= p.lifetime) {
                // Remove
                this.sceneManager.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.particles.splice(i, 1);
                continue;
            }

            // Update positions
            const positions = p.mesh.geometry.attributes.position.array;
            for (let j = 0; j < p.velocities.length / 3; j++) {
                const idx = j * 3;

                // Gravity
                p.velocities[idx + 1] -= 9.8 * delta;

                positions[idx] += p.velocities[idx] * delta;
                positions[idx + 1] += p.velocities[idx + 1] * delta;
                positions[idx + 2] += p.velocities[idx + 2] * delta;
            }
            p.mesh.geometry.attributes.position.needsUpdate = true;

            // Fade out
            p.mesh.material.opacity = 1 - (p.age / p.lifetime);
        }
    }
}
