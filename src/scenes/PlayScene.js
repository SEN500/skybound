export default class PlayScene extends Phaser.Scene {
  constructor() { super('PlayScene'); }

  create() {
    // --- world bounds & camera
    this.cameras.main.setBounds(0, 0, 2000, 540);
    this.physics.world.setBounds(0, 0, 2000, 540);

    // --- generate simple textures (no external assets)
    this.createTextures();

    // --- platforms group (static)
    this.platforms = this.physics.add.staticGroup();
    // floor
    for (let i = 0; i < 50; i++) {
      this.platforms.create(i * 64 + 32, 540 - 16, 'ground').setScale(1).refreshBody();
    }
    // a few floating platforms
    this.platforms.create(400, 380, 'ground').setScale(1, 0.5).refreshBody();
    this.platforms.create(560, 300, 'ground').setScale(1, 0.5).refreshBody();
    this.platforms.create(760, 220, 'ground').setScale(1, 0.5).refreshBody();
    this.platforms.create(1200, 300, 'ground').setScale(1, 0.5).refreshBody();

    // --- player
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 40).setOffset(2, 8);
    this.player.setBounce(0.05);

    // camera follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // collisions
    this.physics.add.collider(this.player, this.platforms);

    // --- player controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    // movement vars
    this.canDoubleJump = true;
    this.dashTimer = 0;
    this.dashCooldown = 0;

    // --- collectables
    this.packages = this.physics.add.group();
    this.spawnPackage(420, 340);
    this.spawnPackage(580, 260);
    this.spawnPackage(780, 180);
    this.spawnPackage(1250, 260);

    this.physics.add.overlap(this.player, this.packages, this.collectPackage, null, this);

    // --- goal
    this.goal = this.physics.add.staticSprite(1800, 480, 'goal');
    this.physics.add.overlap(this.player, this.goal, () => {
      this.add.text(this.cameras.main.scrollX + 360, 200, 'You win!', { font: '48px Arial', fill:'#fff' }).setScrollFactor(0);
      this.scene.pause();
    }, null, this);

    // --- HUD simple
    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { font: '20px Arial', fill:'#ffffff' }).setScrollFactor(0);

    // small instructions
    this.add.text(16, 480, 'Move: ← →  Jump: Z  Dash: X', { font: '16px Arial', fill: '#002' }).setScrollFactor(0).setBackgroundColor('#ffffff66').setPadding(6);
  }

  update(time, delta) {
    // handle input (horizontal)
    const left = this.cursors.left.isDown;
    const right = this.cursors.right.isDown;
    let accel = 2000;
    if (left) {
      this.player.setAccelerationX(-accel);
      this.player.flipX = true;
    } else if (right) {
      this.player.setAccelerationX(accel);
      this.player.flipX = false;
    } else {
      this.player.setAccelerationX(0);
      this.player.setDragX(1200);
    }
    // cap speed
    this.player.setMaxVelocity(400, 1000);

    // grounded check
    const onGround = this.player.body.blocked.down;

    // jump with jump-buffer / coyote simple
    if (Phaser.Input.Keyboard.JustDown(this.keyZ)) {
      if (onGround) {
        this.player.setVelocityY(-430);
        this.canDoubleJump = true;
      } else if (this.canDoubleJump) {
        this.player.setVelocityY(-380);
        this.canDoubleJump = false;
      }
    }

    // dash
    if (this.dashCooldown > 0) this.dashCooldown -= delta;
    if (this.dashTimer > 0) {
      this.dashTimer -= delta;
      // keep dash velocity
      // no gravity applied during dash (approx)
      this.player.setVelocityY(0);
    } else {
      // normal physics returns
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyX) && this.dashCooldown <= 0) {
      const dir = this.player.flipX ? -1 : 1;
      this.player.setVelocityX(dir * 700);
      this.dashTimer = 150; // ms
      this.dashCooldown = 600; // ms cooldown
    }

    // update HUD
    this.scoreText.setText('Score: ' + this.score);
  }

  // helper: spawn a package
  spawnPackage(x,y) {
    const p = this.packages.create(x,y,'package');
    p.setBounce(0.2);
    p.setCollideWorldBounds(true);
    this.physics.add.collider(p, this.platforms);
  }

  collectPackage(player, pkg) {
    pkg.destroy();
    this.score += 1;
  }

  createTextures() {
    // player: simple rectangle with eyes
    const g = this.textures.createCanvas('player', 32, 48);
    const ctx = g.getContext();
    ctx.fillStyle = '#2b7';
    roundRect(ctx, 0, 0, 32, 48, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(8, 12, 4, 4);
    ctx.fillRect(20, 12, 4, 4);
    g.refresh();

    // ground
    const g2 = this.textures.createCanvas('ground', 64, 16);
    const ctx2 = g2.getContext();
    ctx2.fillStyle = '#6b4f2d';
    ctx2.fillRect(0,0,64,16);
    ctx2.fillStyle = '#8b6b3a';
    ctx2.fillRect(0,8,64,4);
    g2.refresh();

    // package
    const g3 = this.textures.createCanvas('package', 18, 18);
    const ctx3 = g3.getContext();
    ctx3.fillStyle = '#f2c94c';
    ctx3.fillRect(0,0,18,18);
    ctx3.fillStyle = '#b98900';
    ctx3.fillRect(0,7,18,4);
    g3.refresh();

    // goal
    const g4 = this.textures.createCanvas('goal', 48, 80);
    const ctx4 = g4.getContext();
    ctx4.fillStyle = '#5e9';
    ctx4.fillRect(0,0,48,80);
    ctx4.fillStyle = '#fff';
    ctx4.fillRect(8,20,32,8);
    ctx4.fillRect(8,40,32,8);
    g4.refresh();

    // helper: rounded rect function
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }
  }
}

