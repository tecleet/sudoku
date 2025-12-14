import { SceneManager } from './SceneManager.js';
import { Environment } from './Environment.js';
import { ToyActor } from './ToyActor.js';
import { TrashCanActor } from './TrashCanActor.js';
import { Effects } from './Effects.js';
import { AnimationController } from './AnimationController.js';

export class Game3D {
    constructor(containerId) {
        this.sceneManager = new SceneManager(containerId);
        this.environment = new Environment(this.sceneManager);

        this.toy = new ToyActor();
        this.sceneManager.addActor(this.toy);

        this.trashCan = new TrashCanActor();
        this.sceneManager.addActor(this.trashCan);

        this.effects = new Effects(this.sceneManager);
        // Add effects as an actor so it gets updated in the loop
        this.sceneManager.addActor(this.effects);

        this.animController = new AnimationController(
            this.sceneManager,
            this.toy,
            this.trashCan,
            this.effects
        );

        // Initial positions
        this.reset();
    }

    reset() {
        this.toy.reset();
        this.toy.mesh.position.set(0, 0, 0);
        this.trashCan.mesh.position.set(4, -2, -2);
    }

    playGameOver() {
        // Ensure correct size before playing
        this.sceneManager.onResize();
        this.animController.playGameOverSequence();
    }

    resize() {
        this.sceneManager.onResize();
    }
}

// Expose to window for script.js to use
window.Game3D = Game3D;
