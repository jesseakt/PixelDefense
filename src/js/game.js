
/* Game namespace */
var game = {

    // an object where to store game information
    data : {
        // Player Gold Amount
        gold : 125, 
        // Bonus Gold Awarded per wave
        bonus_gold : 25,
        //Current Level Number
        level : 1,
        //Max or last game level
        lastLevel : 3,        
        //Current Wave Number
        wave : 0,
        //Enemy Strength
        enemyStrength : 0,
        // Number of Player Lives Remaining
        playerLives : 10,

        upgradeCostFactor: [1, 2]        //1x cost for first upgrade, 2x cost for second, extend if additional upgrades
    },

    // Run on page load.
    "onload" : function () {
        // Initialize the video.
        if (!me.video.init(1280, 720, {wrapper : "screen", scale : "auto"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // Initialize the audio.
        me.audio.init("aac");

        // set and load all resources.
        // (this will also automatically switch to the loading screen)
        me.loader.preload(game.resources, this.loaded.bind(this));
        me.state.change(me.state.LOADING);
    },

    // Run on game resources loaded.
    "loaded" : function () {
        //Set User defined states
        me.state.LEVEL_COMPLETE= me.state.USER + 0;
        me.state.LEVEL01 = me.state.USER + 1;
        me.state.LEVEL02 = me.state.USER + 2;
        me.state.LEVEL03 = me.state.USER + 3;
        me.state.INSTRUCTIONS = me.state.USER + 4;

        me.state.transition("fade", "#000000", 500);
        me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.LEVEL01, new game.Level01PlayScreen());
        me.state.set(me.state.LEVEL02, new game.Level02PlayScreen());
        me.state.set(me.state.LEVEL03, new game.Level03PlayScreen());
        me.state.set(me.state.GAMEOVER, new game.gameOverScreen());
        me.state.set(me.state.LEVEL_INTRO, new game.levelIntroScreen());
        me.state.set(me.state.INSTRUCTIONS, new game.InstructionScreen());

        // Load Enemy Entities to pool
        me.pool.register("FootmanEntity", game.FootmanEntity);
        me.pool.register("GoblinEntity", game.GoblinEntity);
        me.pool.register("ImpEntity", game.ImpEntity);

        // Load Map Entities to pool
        me.pool.register("MapNode", game.MapNode);
        me.pool.register("KillNode", game.KillNode);
        me.pool.register("ForkNode", game.ForkNode);

        //Load Tower Entities to pool
        me.pool.register("TowerLocationEntity", game.TowerLocationEntity);
        me.pool.register("ArcherTowerEntity", game.ArcherTowerEntity);
        me.pool.register("CannonTowerEntity",game.CannonTowerEntity);
        me.pool.register("SlowTowerEntity", game.SlowTowerEntity);
        

        //Load Projectile Entities to pool
        me.pool.register("ArrowEntity", game.ArrowEntity);
        me.pool.register("CannonballEntity", game.CannonballEntity);
        me.pool.register("ExplosionEntity", game.ExplosionEntity);
        me.pool.register("FreezeExplosionEntity", game.FreezeExplosionEntity);
        me.pool.register("BleedEffectEntity",game.BleedEffectEntity);

        // display the title screen
        me.state.change(me.state.MENU);
    }
};
