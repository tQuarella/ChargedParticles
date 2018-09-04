var Game = {}

Game.init = function() {
    game.stage.disableVisibilityChange = true;
};

Game.preload = function()
{
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}

Game.enemy = {};
Game.player = {};
Game.nodes = {};
Game.scoreText = '';

Game.create = function ()
{
    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(
        16, 16, 
        '',
        {fontSize: '16px', fill: '#FFF' }
    );

    player = this.physics.add.sprite(100, 450, 'star')
    player.setCollideWorldBounds(true);
    player.setBounce(0.2);
    player.particles = 0;

    enemy = this.physics.add.sprite(775, 50, 'dude');
    enemy.setCollideWorldBounds(true);
    enemy.setBounce(0.2);
    enemy.particles = 100;

    Game.createNodes(this);

    this.physics.add.collider(player, enemy, Game.fight, null, this);
}

Game.createNodes = function(gameState) {
    nodes = gameState.physics.add.staticGroup();

    for(i=0; i<5; i++) {
        var x = Phaser.Math.Between(10, 750);
        var y = Phaser.Math.Between(10, 575);

        var node = nodes.create(x, y, 'bomb');
        var nodeText = gameState.add.text(node.x - 5, node.y+10, 0);
        node.particleCountLabel = nodeText;
        node.production = Phaser.Math.Between(0,10);
    }
}
Game.updateScore = function() {
    scoreText.setText(
        'p: ' + player.particles + '\n' +
        'e: ' + enemy.particles
    );
}
Game.collectParticles = function(player, node) {
    var nodeParts = parseInt(node.particleCountLabel.text);
    player.particles += nodeParts;

    node.particleCountLabel.setText('0');
}

Game.fight = function(player, enemy) {
    var enemyParticles = enemy.particles;
    var playerParticles = player.particles;
    player.particles -= enemyParticles;
    enemy.particles -= playerParticles;

    if (player.particles < 0) { player.particles = 0; }
    if (enemy.particles < 0) { enemy.particles = 0; }
}

Game.update = function() {
    Game.handleInput();
    Game.handleNodeProduction();
    Game.updateScore();
    this.physics.overlap(
        player, nodes, Game.collectParticles, null, this
    );
}


Game.handleNodeProduction = function() {
    nodes.children.iterate(function(child) {
        if (Phaser.Math.Between(0,100) > 100 - child.production ) {
            var lbl = child.particleCountLabel;
            lbl.setText(parseInt(lbl.text)+1);
        }
    });
}

Game.handleInput = function() {
    var drag = 0.98;
    var accel = 5;

    var xvel = player.body.velocity.x;
    player.setVelocityX(xvel * drag); 
    if (cursors.left.isDown) {
        player.setVelocityX(xvel-accel);
    }
    if (cursors.right.isDown) {
        player.setVelocityX(xvel+accel);
    }
    
    var yvel = player.body.velocity.y;
    player.setVelocityY(yvel * drag);
    if (cursors.up.isDown) {
        player.setVelocityY(yvel-accel);
    }
    if (cursors.down.isDown) {
        player.setVelocityY(yvel+accel);
    }
}

Game.config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: Game.preload,
        create: Game.create,
        update: Game.update
    }
};

var game = new Phaser.Game(Game.config);