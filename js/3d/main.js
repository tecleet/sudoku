import { SceneManager } from './SceneManager.js';
import { LightingStudio } from './LightingStudio.js';
import { PostProcessor } from './PostProcessor.js';
import { CameraDirector } from './CameraDirector.js';
import { ToyActor } from './ToyActor.js';
import { TrashCanActor } from './TrashCanActor.js';
import { Effects } from './Effects.js';
import { AnimationController } from './AnimationController.js';

export class Game3D {
    constructor(containerId) {
        this.sceneManager = new SceneManager(containerId);

        // New Studio Lighting (Replaces Environment)
        this.lightingStudio = new LightingStudio(this.sceneManager);

        // Post Processing
        this.postProcessor = new PostProcessor(this.sceneManager);
        this.sceneManager.setRenderCallback(() => this.postProcessor.render());

        // Cinematic Camera
        this.cameraDirector = new CameraDirector(this.sceneManager.camera);

        this.toy = new ToyActor();
        this.sceneManager.addActor(this.toy);

        this.trashCan = new TrashCanActor();
        this.sceneManager.addActor(this.trashCan);

        this.effects = new Effects(this.sceneManager);
        this.sceneManager.addActor(this.effects);

        this.animController = new AnimationController(
            this.sceneManager,
            this.toy,
            this.trashCan,
            this.effects,
            this.cameraDirector
        );

        // Initial positions
        this.reset();
    }

    reset() {
        this.toy.reset();
        this.toy.mesh.position.set(0, 0, 0);
        this.trashCan.mesh.position.set(4, -2, -2);
        this.cameraDirector.reset();
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
