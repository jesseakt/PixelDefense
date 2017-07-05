game.HUD = game.HUD || {};


game.HUD.Container = me.Container.extend({

    init: function() {
        // call the constructor
        this._super(me.Container, 'init');

        this.isPersistent = true;
        this.floating = true;
        this.name = "HUD";
        me.game.world.addChild(new game.HUD.ResourceBar(0, 0));
        this.addChild(new game.HUD.ResourcesDisplay(0, 0));
        me.game.world.addChild(new game.HUD.PauseMenuButton(1200, 5));
    }
});

game.HUD.ResourceBar = me.Sprite.extend({
    init: function(x,y){
        var settings = {};
        settings.image = "HUD_bar";
        settings.width = settings.framewidth = 1280;
        settings.height = settings.frameheight = 64;
        settings.anchorPoint = {x:0.0, y:0.0};
        this._super(me.Sprite, 'init', [x, y, settings]);

    },
    update: function(dt){
        return false;
    }
}),

game.HUD.PauseMenuButton = me.GUI_Object.extend({
    init: function(x, y){
       
        var settings = {};
        settings.image = "pause_menu";
        settings.frameheight = 50;
        settings.framewidth = 50;
        settings.width = 150;
        settings.height = 50;
        
        this._super(me.GUI_Object, 'init', [x, y, settings]);      
        this.alwaysUpdate = true;
        this.settings = settings;
        //set images for switching between play and paused
        this.addAnimation("button", [0]);
        this.addAnimation("hover", [1]);
        this.addAnimation("clicked", [2]);
        this.setCurrentAnimation("button");
        this.updateWhenPaused = true;

        //Music options
        this.musicStopsWhilePaused = true;

        this.anchorPoint.set(0.0, 0.0);
        this.pos.z = Infinity;
        this.x = x;
        this.y = y;
        this.updateWhenPaused = true;
       
    },
    onOver: function(e){
        if(me.state.isPaused() == false){
            this.setCurrentAnimation("hover");
        }
        
    },
    onOut: function(e){
        this.setCurrentAnimation("button");
    },
    onClick(e){          
        if(me.state.isPaused() == false){              
            this.setCurrentAnimation("clicked");
            //menu_settings will determine what is displayed on menu
            var menu_settings = {};
            menu_settings.pauseMenu = true;
            menu_settings.levelPassed = undefined;
            menu_settings.width = 640;
            menu_settings.height = 360;

            this.optionMenu = new game.OptionMenu.Container(menu_settings);
            me.game.world.addChild(this.optionMenu);            
            me.state.pause(this.musicStopsWhilePaused);       
        }
    },
    update: function(dt){
        if(me.state.isPaused() == true && !this.isCurrentAnimation("clicked")){
            this.setCurrentAnimation("clicked");
        }else if(me.state.isPaused() == false && this.isCurrentAnimation("clicked")){
            this.setCurrentAnimation("button");
        }
        return true;       
    }

});

game.HUD.ResourcesDisplay = me.Renderable.extend({
    init: function(x, y) {
        this._super(me.Renderable, 'init', [x, y, 10, 10]);
        this.font = new me.BitmapFont(
            me.loader.getBinary('font'), 
            me.loader.getImage('font'));

        // local copy of the global score
        this.gold = game.data.gold;
    },
    update : function () {        
        if (this.gold !== game.data.gold) {
            this.gold = game.data.gold;
            return true;
        }
        return false;
    },
    draw : function (renderer) {
        this.font.draw(renderer, game.data.gold, 540, 10);
        this.font.draw(renderer, game.data.wave, 670, 10);
        this.font.draw(renderer, game.data.playerLives, 765, 10);
  
    }

});
