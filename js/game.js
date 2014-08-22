// game namespace
var game = {
	data : {
		empty: "empty"
	},

	tile_size: 2,

	ENEMY_OBJECT: 0,

	// runs on pageload
	"onload": function () {
		if (! me.video.init("screen", 40, 24, true, "auto", true)) {
			alert("Your browser doesn't support HTML5 canvas!");
			return;
		}

		if (document.location.hash === "#debug") {
			window.onReady( function() {
				me.plugin.register.defer(this, debugPanel, "debug");
			});
		}

		me.audio.init("ogg,mp3");

		me.loader.onload = this.loaded.bind(this);

		me.loader.preload(game.resources);

		me.state.change(me.state.LOADING);
	},

	"loaded" : function () {
		me.sys.gravity = 0.05;
		// me.sys.fps = 30;

		me.state.set(me.state.MENU, new game.TitleScreen());
		me.state.set(me.state.PLAY, new game.PlayScreen());

		// register player
		me.pool.register("player", game.PlayerEntity);
		me.pool.register("enemy", game.EnemyEntity);
		// bind keyboard
		me.input.bindKey(me.input.KEY.A, "left");
		me.input.bindKey(me.input.KEY.D, "right");
		me.input.bindKey(me.input.KEY.W, "jump", true);
		me.input.bindKey(me.input.KEY.SHIFT, "run");
		me.input.bindKey(me.input.KEY.SPACE, "shoot", true);

		// start
		me.state.change(me.state.PLAY);
	}
};