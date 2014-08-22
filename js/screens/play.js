game.PlayScreen = me.ScreenObject.extend({
	// state change action
	onResetEvent: function() {
		// game.data.score = 0;
		me.levelDirector.loadLevel("map2");

		// add our HUD to the game world
		this.HUD = new game.HUD.Container();
		me.game.world.addChild(this.HUD);
	},


	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		// remove the HUD from the game world
		me.game.world.removeChild(this.HUD);
	}
});
