export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {
    // nothing to load: we generate small graphics at runtime
  }
  create() {
    this.scene.start('PlayScene');
  }
}

