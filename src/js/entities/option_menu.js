var OPTION_MENU_WIDTH = 640;
var OPTION_MENU_HEIGHT = 360;

game.OptionMenu = game.OptionMenu || {};

game.OptionMenu.Container = me.Container.extend({
    init: function(menu_settings){
        var text = me.game.world.getChildByName("option_menu_text");
        //close any open tower menus before pulling up pause menu
        var buttons = me.game.world.getChildByName("menu_button");
        var buttonsLength = buttons.length;
        var menus = [];

        for(var i = 0; i < buttonsLength; i++){
            me.game.world.removeChild(buttons[i]);
            var parentMenuFound = false;
            for(var j = 0; j < menus.length; j++)
                if(buttons[i].parentMenu === menus[j])
                    parentMenuFound = true;
            if(!parentMenuFound)
                menus.push(buttons[i].parentMenu);
        }

        for(var i = 0; i < menus.length; i++){
            me.game.world.removeChild(menus[i]);
        }

        //Set up pause/end of level menu settings
        var settings = {};
        this._super(me.Container, "init");
        this.parentMenu = null;
        this.name = "option_menu";        
        this.floating = true;
        this.anchorPoint.set(0.0, 0.0);  

        settings.parentMenu = this;
        settings.pauseMenu = menu_settings.pauseMenu; //true if this is pause menu, then no continue button
        settings.levelPassed = menu_settings.levelPassed;
       
        //close any tower menus before creating the menu
        game.functions.removeTowerMenu();

        //set background and add buttons common to all menus
        this.bg = new game.OptionMenu.background(640, 360, settings);
        me.game.world.addChild(this.bg, 1499);
        me.game.world.addChild(new game.OptionMenu.mainMenu_button(750, 415, settings), 1500);
        me.game.world.addChild(new game.OptionMenu.restart_button(380, 415, settings), 1500);

        //if pause menu, setup resume button and button text
        //if failed level menu, no middle button
        //if passed level menu, set up continue button
        if(menu_settings.pauseMenu == false){
            if(menu_settings.levelPassed == true){
                settings.menuText = "level_passed";
                me.game.world.addChild(new game.OptionMenu.continue_button(565, 415, settings), 1500);
            }else if(menu_settings.levelPassed == false){
                settings.menuText = "level_failed";
            }else{
                console.log("Error: Not pause menu but no level indicator");
            }
        }else{
            settings.menuText = "level_paused";
            me.game.world.addChild(new game.OptionMenu.continue_button(565, 415, settings), 1500);            
        }

        //add the button text and menu message
        me.game.world.addChild(new game.OptionMenu.ButtonText(0, 0, settings), Infinity);
        me.game.world.addChild(new game.OptionMenu.message(650, 300, settings), Infinity);

       
    },   
});

game.OptionMenu.background = me.Sprite.extend({
    init: function(x, y, settings){               
        settings.image = "option_menu";
        settings.anchorPoint = {x:0.5, y:0.5};
        settings.width = settings.framewidth = 640;
        settings.height = settings.frameheight = 360;
        this._super(me.Sprite, 'init', [x, y, settings]); 
        this.updateWhenPaused = true;  
        this.name = "option_menu_bg";        
        this.parentMenu = settings.parentMenu;
     
    },
    update: function(dt){
        return true;
    }
});

game.OptionMenu.message = me.Sprite.extend({
    init: function(x, y, settings){   
        if(settings.menuText == "level_paused"){            
            settings.image = "pause_text";      
            settings.width = settings.framewidth = 450;
            settings.height = settings.frameheight = 80;

        }else if(settings.menuText == "level_passed"){
            settings.image = "level_complete";
            settings.width = settings.framewidth = 475;
            settings.height = settings.frameheight = 80;

        }else if(settings.menuText == "level_failed"){
            settings.image = "level_failed";
            settings.width = settings.framewidth = 370;
            settings.height = settings.frameheight = 80;

        }else{
            console.log("Error: No valid menuText found" + settings.menuText);
        }
        settings.anchorPoint = {x:0.5, y:0.5};
        this._super(me.Sprite, 'init', [x, y, settings]); 
        this.updateWhenPaused = true;  
        this.name = "option_menu_text";
    },
    update: function(dt){
        return true;
    }

});

game.OptionMenu.restart_button = me.GUI_Object.extend({
    init: function(x, y, parentSettings){
        var settings = {};
        settings.image = "menu_button";
        settings.frameheight = 75;
        settings.framewidth = 150;
        settings.width = 450;
        settings.height = 75;

        this._super(me.GUI_Object, 'init', [x, y, settings]);

        this.addAnimation("button", [0]);
        this.addAnimation("hover", [1]);    
        this.addAnimation("confirm", [2]);    
        this.setCurrentAnimation("button");        
        this.anchorPoint.set(0.0, 0.0);
        this.pos.z = Infinity;
        this.updateWhenPaused = true;   
        this.name = "option_menu_button";  
        this.parentMenu = parentSettings.parentMenu;
        this.confirm = false;
             
    },    
    onOver: function(e){
        this.setCurrentAnimation("hover");        
    },
    onOut: function(e){
        this.setCurrentAnimation("button");
        this.confirm = false;
    },
    onClick(e){       
        if(this.confirm == false){
            this.confirm = true;
        }else{
            me.state.resume();        
            me.state.change(me.state.LEVEL_INTRO);   
        }
    },
    
    update: function(dt){
        if(this.confirm == true){
            this.setCurrentAnimation("confirm")
        }
       return true;
    },
});

game.OptionMenu.continue_button = me.GUI_Object.extend({
    init: function(x, y, parentSettings){
        var settings = {};

        settings.image = "menu_button";
        settings.frameheight = 75;
        settings.framewidth = 150;
        settings.width = 450;
        settings.height = 75;

        this._super(me.GUI_Object, 'init', [x, y, settings]);

        this.addAnimation("button", [0]);
        this.addAnimation("hover", [1]);  
        this.addAnimation("confirm", [2]);    
      
        this.setCurrentAnimation("button");        
        this.anchorPoint.set(0.0, 0.0);
        this.pos.z = Infinity;
        this.parentMenu = parentSettings.parentMenu;
        this.name = "option_menu_button";
        this.updateWhenPaused = true;
        this.currentLevel = game.data.level; //Store current level so we can't double click to skip a level.   
        this.menuText = parentSettings.menuText;

    },    
    onOver: function(e){
        this.setCurrentAnimation("hover");        
    },
    onOut: function(e){
        this.setCurrentAnimation("button");
    },
    
    onClick(e){                       
        if(this.menuText == "level_passed"){        //if level passed then continue to next level
            game.data.level = this.currentLevel + 1;
            if(game.data.level<=3 && game.data.level>=1){
                me.state.resume();
                me.state.change(me.state.LEVEL_INTRO);
            }
            else if(game.data.level>3){                
                me.state.resume();
                me.state.change(me.state.GAMEOVER);
            }
            else{
                me.state.resume();
                me.state.change(me.state.MENU);
            }
        }else if(this.menuText == "level_paused"){  //if pause_menu then close menu and resume game
            //Remove menu and buttons and resume game
            var text = me.game.world.getChildByName("option_menu_text");
            var bg = me.game.world.getChildByName("option_menu_bg");
            var buttons = me.game.world.getChildByName("option_menu_button");
            var buttonsLength = buttons.length;
            var menus = [];
    
            me.game.world.removeChild(text[0]);
            me.game.world.removeChild(text[1]);
            me.game.world.removeChild(bg[0]);
            for(var i = 0; i < buttonsLength; i++){
                me.game.world.removeChild(buttons[i]);
                var parentMenuFound = false;
                for(var j = 0; j < menus.length; j++)
                    if(buttons[i].parentMenu === menus[j])
                        parentMenuFound = true;
                if(!parentMenuFound)
                    menus.push(buttons[i].parentMenu);
            }    
            for(var i = 0; i < menus.length; i++){
                me.game.world.removeChild(menus[i]);
            }
            if(me.state.isPaused() == true){
                me.state.resume(true);
            }
        }
        
    },    
    update: function(dt){
       return true;
    },
});


game.OptionMenu.mainMenu_button = me.GUI_Object.extend({
    init: function(x, y, parentSettings){
        var settings = {};

        settings.image = "menu_button";
        settings.frameheight = 75;
        settings.framewidth = 150;
        settings.width = 450;
        settings.height = 75;

        this._super(me.GUI_Object, 'init', [x, y, settings]);

        this.addAnimation("button", [0]);
        this.addAnimation("hover", [1]);   
        this.addAnimation("confirm", [2]);    
     
        this.setCurrentAnimation("button");        
        this.anchorPoint.set(0.0, 0.0);
        this.pos.z = Infinity;
        this.parentMenu = parentSettings.parentMenu;
        this.name = "option_menu_button";
        this.updateWhenPaused = true;  
        this.confirm = false;
        
    },    
    onOver: function(e){
        this.setCurrentAnimation("hover");        
    },
    onOut: function(e){
        this.setCurrentAnimation("button");
        this.confirm = false;
    },
    
    onClick(e){
        if(this.confirm == false){
            this.confirm = true;
        }else{
            me.state.resume();        
            me.state.change(me.state.MENU);
        }
        return true;
    },
    update: function(dt){
        if(this.confirm == true){
            this.setCurrentAnimation("confirm");
        }
       return true;
    },
});


game.OptionMenu.ButtonText = me.Renderable.extend({   
    init: function(x, y, settings) {
        this._super(me.Renderable, 'init', [x, y, 10, 10]);
        this.font = new me.BitmapFont(
            me.loader.getBinary('font'), 
            me.loader.getImage('font'));
        this.updateWhenPaused = true;    
        this.name = "option_menu_text"; 
        this.pauseMenu = settings.pauseMenu;  
        this.levelPassed = settings.levelPassed;
        
    },
    update : function () {       
        
        return true;
    },
    draw : function (renderer) {
        this.font.draw(renderer, "Restart", 415, 440);
        this.font.draw(renderer, "Menu", 790, 440);
        if(this.pauseMenu == false && this.levelPassed == true){
            this.font.draw(renderer, "Continue", 590, 440);
        }else if(this.pauseMenu == true){
            this.font.draw(renderer, "Resume", 590, 440)
        }
  
    }

});

