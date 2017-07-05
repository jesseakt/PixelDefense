game.Level01PlayScreen = me.ScreenObject.extend({
    
    onResetEvent: function() {
        //Set audio track
        setTimeout(me.audio.playTrack("level01bgm",0),500); //Wait for previous track to finish before playing
        me.audio.fade("level01bgm",0,1,500); //Fade in


        // Reset Enemy settings so we'll save the proper settings for the new level
        me.game.footmanSettings = undefined;
        me.game.goblinSettings = undefined;
        me.game.impSettings = undefined;

        // Set level data
        game.data.gold = 125;
        game.data.playerLives = 10;
        game.data.wave = 0;
        game.data.enemyStrength = 0;

        //Define and populate an object holding the enemy spawn data for this level
        game.levelData = {};
        game.levelData.waveDelay = Math.floor(me.sys.updatesPerSecond*500/60);
        //Number of footmen, footman tick seperation, number of goblins, goblin tick seperation, number of imps, imp tick seperation
        game.levelData.waveInfo =   [[4, 150,   0,  0,      0, 0],
                                    [4,  100,   2,  150,    0, 0],
                                    [4,  100,   3,  150,    0, 0],
                                    [10, 100,   0,  0,      0, 0],
                                    [5,  100,   5,  150,    0, 0],
                                    [3,  100,   0,  0,      1, 0],
                                    [5,  100,   10, 100,    1, 0],
                                    [10, 100,   5,  100,    2, 200],
                                    [20, 75,    5,  75,     1, 0],
                                    [15, 50,    5,  75,     3, 100]];

        //Power of Footman, Goblins, and Imps, respectively
        game.levelData.enemyPower = [1, 2, 3];
        game.levelData.numberWaves = game.levelData.waveInfo.length;
        game.levelData.waveStrength = [];
        for(i = 0; i<game.levelData.waveInfo.length; i++)
        {
            //Calculate the strength of the wave
            game.levelData.waveStrength.push(game.levelData.waveInfo[i][0]*game.levelData.enemyPower[0] + 
                                             game.levelData.waveInfo[i][2]*game.levelData.enemyPower[1] + 
                                             game.levelData.waveInfo[i][4]*game.levelData.enemyPower[2]);
        }

        //Set Power values to game data from the level's enemyPower array, which will be passed to entities
        game.data.footmanPower = game.levelData.enemyPower[0];
        game.data.goblinPower = game.levelData.enemyPower[1];
        game.data.impPower = game.levelData.enemyPower[2];

        //Load the map
        me.levelDirector.loadLevel("map01");
        me.game.footmanSettings.tickDelay = 0;
        me.game.goblinSettings.tickDelay = 0;
        me.game.impSettings.tickDelay = 0;

        //Spawn first wave. Check this when enemies die.
        this.checkEnemyStrength();

        // Add our HUD to the game world, add it last so that this is on top of the rest.
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD);
    },

    checkEnemyStrength: function() {
        //Calculate current enemy strength
        var calculatedStrength = 0;
        for(i = 0; i < me.game.world.children.length; i++)
        {
            if(me.game.world.children[i].name != undefined)
            {
                if(me.game.world.children[i].name == "FootmanEntity" && me.game.world.children[i].alive){
                    calculatedStrength += game.data.footmanPower;
                }
                else if(me.game.world.children[i].name == "GoblinEntity" && me.game.world.children[i].alive){
                    calculatedStrength += game.data.goblinPower;
                }
                else if(me.game.world.children[i].name == "ImpEntity" && me.game.world.children[i].alive){
                    calculatedStrength += game.data.impPower;
                }
            }
        }

        game.data.enemyStrength = calculatedStrength;

        if(game.data.wave == 0)
            game.data.enemyStrength = 0;

        //Check if we need to spawn another wave yet
        if(game.data.enemyStrength < (3+game.data.wave) && game.data.wave < game.levelData.numberWaves)
        {
            this.spawnNewWave(game.data.wave);        //If it's not the last level and the enemies are weak, spawn a new wave
            game.data.wave += 1;                      //Increment wave counter
        }
        //Final wave logic
        else if (game.data.enemyStrength == 0 && game.data.wave >= game.levelData.numberWaves)
        {
            me.state.pause(true);
            //menu_settings will determine what is displayed on menu
            var menu_settings = {};
            menu_settings.pauseMenu = false;
            menu_settings.levelPassed = true;
            menu_settings.width = 640;
            menu_settings.height = 360;
            var optionMenu = new game.OptionMenu.Container(menu_settings);
            me.game.world.addChild(optionMenu);
            return true;

        }
    },
    spawnNewWave: function(nextWave) {
        //Add wave bonus gold (except for first wave)
        if(nextWave>0)
            game.data.gold += game.data.bonus_gold;

        //Add strength for next wave
        game.data.enemyStrength += game.levelData.waveStrength[nextWave];
        
        //Reset tick delay
        me.game.goblinSettings.tickDelay = me.game.footmanSettings.tickDelay = me.game.impSettings.tickDelay = game.levelData.waveDelay;
        
        //Populate New Enemies
        for(i = 0; i < game.levelData.waveInfo[nextWave][0]; i++)
        {
            me.game.world.addChild(me.pool.pull("FootmanEntity"));
            me.game.footmanSettings.tickDelay += Math.floor(me.sys.updatesPerSecond*game.levelData.waveInfo[nextWave][1]/60);
        }
        for(i = 0; i < game.levelData.waveInfo[nextWave][2]; i++)
        {
            me.game.world.addChild(me.pool.pull("GoblinEntity"));
            me.game.goblinSettings.tickDelay += Math.floor(me.sys.updatesPerSecond*game.levelData.waveInfo[nextWave][3]/60);
        }
        for(i = 0; i < game.levelData.waveInfo[nextWave][4];i++)
        {
            me.game.world.addChild(me.pool.pull("ImpEntity"));
            me.game.impSettings.tickDelay += Math.floor(me.sys.updatesPerSecond*game.levelData.waveInfo[nextWave][5]/60);
        }
    },
    onDestroyEvent: function() {
        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD);
        me.game.footmanSettings = undefined;
        me.game.goblinSettings = undefined;
        me.game.impSettings = undefined;
        me.audio.fade("level01bgm", 1, 0, 500);
        setTimeout(me.audio.stopTrack("level01bgm"),500);
    }
});
