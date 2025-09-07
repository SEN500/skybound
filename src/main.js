import BootScene from './scenes/BootScene.js';
import PlayScene from './scenes/PlayScene.js';

const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: 'game',
  backgroundColor: '#7fc8ff',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: [BootScene, PlayScene]
};

window.game = new Phaser.Game(config);

