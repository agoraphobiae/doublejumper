game.PlayerEntity = me.ObjectEntity.extend( {
	init: function (x, y, settings) {
		settings.spritewidth = settings.width = 2;
		settings.spriteheight = settings.height = 4;
		settings.image = "player_sprite64";

		this.parent(x, y, settings);
		console.log(settings);

		// a bug as described by WWW guy in MelonJS
		var shape = this.getShape();
		shape.resize(
			shape.width - 1,
			shape.height
		);
		// default movement vel
		this.setVelocity(0.4, 0.9);
		this.walkVelocity = new me.Vector2d(0.19, 0.9);

		// things outside screen aren't updated
		// but player is used to move screen
		this.alwaysUpdate = true;

		game.player = this;
		this.doublejumped = false;
		console.log(game.ENEMY);
	},

	update: function (dt) {
		me.game.viewport.moveTo(
			Math.floor(this.pos.x/40) * 40,
			Math.floor(this.pos.y/24) * 24
		);

		if (me.input.isKeyPressed('left')) {
			this.vel.x = -this.walkVelocity.x;
		} else if (me.input.isKeyPressed('right')) {
			this.vel.x = this.walkVelocity.x;
		} else {
			this.vel.x = 0;
		}
		if (me.input.isKeyPressed('run')) {
			// reach max vel
			this.vel.x *= 2;
		}

		if (me.input.isKeyPressed('jump')) {
			console.time('jump');
			if (!this.jumping && !this.falling) {
				this.jumpar();
			}
		}


		// if (me.input.isKeyPressed('shoot')) {
		// 	var newEnemy = me.pool.pull('enemy', 0, 0, new me.ObjectSettings());
		// 	me.game.world.addChild(newEnemy);
		// 	// me.game.world.addChild(new game.EnemyEntity(0, 0, new me.ObjectSettings()));
		// }

		if (!this.jumping && !this.falling) {
			this.doublejumped = false;
			console.timeEnd('jump');
		}

		collision = this.updateMovement();
		collide = me.game.world.collide(this);

		if (collide) {
			if(collide.obj.type === game.ENEMY_OBJECT) {
				if(!this.falling) {
					this.die();
				} else if (this.doublejumped) {
					this.die();
				} else {
					collide.obj.die();
					this.jumpar();
					this.doublejumped = true;
					this.falling = false;
				}
			}
		}

		if (this.vel.x != 0 || this.vel.y != 0) {
			// this.parent(dt);
			return true;
		}

		return true;
	},

	jumpar: function() {		
		this.vel.y = -this.maxVel.y;
		this.jumping = true;
	},

	die: function() {
		me.game.world.removeChild(this);
	}
});

game.enemies = [];

game.EnemyEntity = me.ObjectEntity.extend({
	init: function (x, y, settings) {
		settings.name = "enemy";
		settings.image = "enemy";
		settings.spritewidth = settings.width = 2;
		settings.spriteheight = settings.height = 4;
		settings.x = x;
		settings.y = y;
		settings.z = 5;

		this.addShape(new me.Rect(new me.Vector2d(0,0), 2, 4));

		this.parent(x, y, settings);

		// var shape = this.getShape();
		// shape.resize(
		// 	shape.width - 1,
		// 	shape.height
		// );

		this.setVelocity(0.1, 0.9);
		this.pos.x = x + settings.width - settings.spritewidth;

		this.alwaysUpdate = true;
		this.type = game.ENEMY_OBJECT;
		this.goingLeft = true;
		this.activated = false;

		game.enemies.push(this);
	},

	update: function (dt) {
		// doesn't work
		// if(Math.abs(me.game.viewport.worldToLocal(this.pos.x, this.pos.y)) < 10) {
		// 	console.log(me.game.viewport.worldToLocal(this.pos.x, this.pos.y));
		// }
		if (this.activated) {
			if (game.player.pos.x > this.pos.x) {
				this.goingLeft = false;
				this.vel.x = this.accel.x;
			} else {
				this.goingLeft = true;
				this.vel.x = -this.accel.x;
			}


			collision = this.updateMovement();

			collide = me.game.world.collide(this);
			if (collide && collide.obj.type === this.type) {
				if(collide.x > 0 && this.goingLeft) {
					this.pos.x -= 1;
					this.updateMovement();
				} else if (collide.x < 0 && this.goingLeft == false) {
					this.pos.x += 1;
					this.updateMovement();
				} // else not my fault don't bother fixing
				this.vel.x = 0;
			}
		}

		return false;
	},

	die: function () {
		me.game.world.removeChild(this);
	}
});

// console.time reports 583.505ms to jump
// 1167.151ms to double jump
game.nextEnemy = 0;
game.spawnDelay = 2000;
game.spawnDelayMin = 1200;
game.spawnDecay = 0.90;
function spawnEnemy () {
	if (game.nextEnemy == game.enemies.length) { return; }
	console.log(game.nextEnemy, game.enemies.length);
	console.log(game.enemies[Math.min(game.nextEnemy, game.enemies.length)]);

	game.enemies[game.nextEnemy].activated = true;
	game.nextEnemy += 1;
	if (game.spawnDelay * Math.pow(game.spawnDecay, game.nextEnemy) < 0.5 * game.spawnDelay) {
		game.enemies[game.nextEnemy].activated = true;
		game.nextEnemy += 1;
		game.spawnDecay = 0.95;
	}

	if (game.spawnDelay * Math.pow(game.spawnDecay, game.nextEnemy) < 0.30 * game.spawnDelay) {
		game.enemies[game.nextEnemy].activated = true;
		game.nextEnemy += 1;
		game.spawnDecay = 0.99;
	}

	console.log(game.spawnDelay * Math.pow(game.spawnDecay, game.nextEnemy));
	console.log(game.spawnDelay);
	console.log(game.spawnDecay);
	console.log("spawned enemy at " + me.timer.getTime());
}
game.spawnTimer = me.timer.setInterval(function() {
	// "spawn" enemies
	spawnEnemy();

	if(game.spawnTimer) {
		me.timer.clearInterval(game.spawnTimer);
		game.spawnTimer = me.timer.setInterval(function () {
			spawnEnemy();
		}, Math.max(game.spawnDelay * Math.pow(game.spawnDecay, game.nextEnemy), game.spawnDelayMin));
	}
}, Math.max(game.spawnDelay, game.spawnDelayMin));