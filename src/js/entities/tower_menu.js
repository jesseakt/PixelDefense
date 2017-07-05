var TOWER_MENU_WIDTH = 128;
var TOWER_MENU_HEIGHT = 128;

game.Menu = game.Menu || {};

//Tower placement locations that appear on the map as concrete slabs
game.TowerLocationEntity = me.GUI_Object.extend({
    init: function(x, y, settings){
        settings.image = "tower_location";
        this._super(me.GUI_Object, "init", [x, y, settings]);

        this.x = x;
        this.y = y;        
        this.anchorPoint.set(0,0); 
        
        this.towerEntity = this;    //used so menu can alter towerPlaced flag
        this.towerPlaced = false;   //true if tower currently placed, determines menu to display
        this.currentTower = null;   //holds tower object currently place, used for upgrading towers
    },
    update:function(dt){
        return false;
    },    
    onClick: function(event){
        if(me.state.isPaused() == false){
            //Close any open menus
            game.functions.removeTowerMenu();  

            var settings = {};
            //set flag for settings used to pull up tower menu or upgrade menu
            if(this.towerPlaced == false){ 
                settings.upgrade = false;
            }else if(this.towerPlaced == true && this.currentTower != null){
                settings.upgrade = true;
            }else{
                console.log("Error towerPlaced flag is set but not currentTower object");
            }
            settings.towerEntity = this.towerEntity;
            //pull up menu container. passing (x,y,w,h, settings)
            this.Menu = new game.Menu.Container(
                this.x - ((TOWER_MENU_WIDTH / 2) - (this.width / 2)), 
                this.y - ((TOWER_MENU_HEIGHT / 2) - (this.height / 2)), 
                TOWER_MENU_WIDTH, TOWER_MENU_HEIGHT, settings);
            me.game.world.addChild(this.Menu);          
        }
    }
});


game.Menu.Container = me.Container.extend({
    init:  function(x, y, w, h, settings){
        this._super(me.Container, "init", [x, y, w, h]);
        this.x = x;
        this.y = y;
        this.parentMenu = null;
        this.towerEntity = settings.towerEntity;
        this.name = "tower_menu";        
        this.floating = true;
        this.anchorPoint.set(0.5, 0.5);        
        
        settings.parentMenu = this;
       
        //add circle image for popup menu
        this.addChild(new game.Menu.menu_circle(0, 0, 
            {width: TOWER_MENU_WIDTH, height: TOWER_MENU_HEIGHT} ), 100);
        //add menu buttons
        if(settings.upgrade == false){
            me.game.world.addChild(new game.Menu.arrow_button(
                this.x + 6, this.y + 6, settings), 500);
            me.game.world.addChild(new game.Menu.cannon_button(
                this.x + 90, this.y + 6, settings), 500);
            me.game.world.addChild(new game.Menu.slow_button(
                this.x + 6, this.y + 90, settings), 500);
            me.game.world.addChild(new game.Menu.cancel_button(
                this.x + 90, this.y + 90, settings), 500);
        //open upgrade menu
        }else if(settings.upgrade == true){
            me.game.world.addChild(new game.Menu.sell_button(
                this.x + 6, this.y + 90, settings), 500);
            me.game.world.addChild(new game.Menu.cancel_button(
                this.x + 90, this.y + 90, settings), 500);
            if(this.towerEntity.currentTower.name == "archer_tower"){
                 me.game.world.addChild(new game.Menu.AttackRadius(this.towerEntity.pos.x, 
                    this.towerEntity.pos.y, ARCHER_TOWER_RADIUS), Infinity);
                if(this.towerEntity.currentTower.upgradesInstalled[0] == false){
                    me.game.world.addChild(new game.Menu.arrow_multi_button(
                        this.x + 6, this.y + 6, settings), 500);
                }else{
                    me.game.world.addChild(new game.Menu.upgraded_button(
                        this.x + 6, this.y + 6, settings), 500);                    
                }

                if(this.towerEntity.currentTower.upgradesInstalled[1] == false){
                    me.game.world.addChild(new game.Menu.arrow_bleed_button(
                    this.x + 90, this.y + 6, settings), 500);
                }else{
                    me.game.world.addChild(new game.Menu.upgraded_button(
                        this.x + 90, this.y + 6, settings), 500);                    
                }
                
            }

            if(this.towerEntity.currentTower.name == "cannon_tower"){                
                if(this.towerEntity.currentTower.upgradesInstalled[0] == false){
                    me.game.world.addChild(new game.Menu.AttackRadius(this.towerEntity.pos.x, 
                        this.towerEntity.pos.y, CANNON_TOWER_RADIUS), Infinity);

                    me.game.world.addChild(new game.Menu.cannon_aoe_button(
                    this.x + 6, this.y + 6, settings), 500);
                }else{
                    me.game.world.addChild(new game.Menu.AttackRadius(this.towerEntity.pos.x, 
                        this.towerEntity.pos.y, Math.floor(CANNON_TOWER_RADIUS * 4/3 )), Infinity);

                    me.game.world.addChild(new game.Menu.upgraded_button(
                        this.x + 6, this.y + 6, settings), 500);                    
                }

                if(this.towerEntity.currentTower.upgradesInstalled[1] == false){
                    me.game.world.addChild(new game.Menu.cannon_damage_button(
                    this.x + 90, this.y + 6, settings), 500);
                }else{
                    me.game.world.addChild(new game.Menu.upgraded_button(
                        this.x + 90, this.y + 6, settings), 500);                    
                }
            }             
            
            if(this.towerEntity.currentTower.name == "slow_tower"){
                me.game.world.addChild(new game.Menu.AttackRadius(this.towerEntity.pos.x, 
                    this.towerEntity.pos.y, SLOW_TOWER_RADIUS), Infinity);
                if(this.towerEntity.currentTower.upgradesInstalled[0] == false){
                    me.game.world.addChild(new game.Menu.slow_damage_button(
                    this.x + 6, this.y + 6, settings), 500);
                }else{
                    me.game.world.addChild(new game.Menu.upgraded_button(
                        this.x + 6, this.y + 6, settings), 500);                    
                }

                if(this.towerEntity.currentTower.upgradesInstalled[1] == false){
                    me.game.world.addChild(new game.Menu.slow_slower_button(
                    this.x + 90, this.y + 6, settings), 500);
                }else{
                    me.game.world.addChild(new game.Menu.upgraded_button(
                        this.x + 90, this.y + 6, settings), 500);                    
                }
            }
        }
    },   
});



game.Menu.menu_circle = me.Sprite.extend({
    init: function(x, y, settings){               
        settings.image = "menu_circle";
        settings.anchorPoint = {x:0.0, y:0.0};
        this._super(me.Sprite, 'init', [x, y, settings]);        
    },
    update: function(dt){
        return true;
    }

});

game.Menu.upgraded_button = me.GUI_Object.extend({
    init: function(x, y, settings){
        settings.image = "upgraded_icon";
        settings.frameheight = settings.height = 32;
        settings.framewidth = settings.width = 32;         
        this._super(me.GUI_Object, 'init', [x, y, settings]);
        this.anchorPoint.set(0.0, 0.0);
        this.parentMenu = settings.parentMenu;
        this.name = "tower_menu_object";
    },
    onClick(e){
       
    }
});

game.Menu.CostDisplay = me.Renderable.extend({
    
    init: function(x, y, cost) {
        this._super(me.Renderable, 'init', [x, y, 10, 10]);
        this.cost = cost;
        this.parentMenu = null;
        this.name = "tower_menu_object";
        this.font = new me.BitmapFont(
            me.loader.getBinary('moneyfont'), 
            me.loader.getImage('moneyfont'));
        
    },
    update : function () {      
        return false;
    },
    draw : function (renderer) {        
        this.font.draw(renderer, this.cost, this.pos.x + 2, this.pos.y + 24); 
    }

});

game.Menu.AttackRadius = me.Renderable.extend({
    
    init: function(x, y, r) {
        this._super(me.Renderable, 'init', [x, y, 0, 0]);
        this.anchorPoint.set(0.5, 0.5);
        this.name = "tower_menu_object"; 
        this.tag = "attackRadius";
        this.radius = r;       
    },
    update : function () {      
        return false;
    },
    draw : function (renderer) {        
        renderer.setLineWidth(1);
        renderer.setColor("rgba(255, 0, 0, 1");
        renderer.strokeArc(this.pos.x - this.radius + 32, this.pos.y - this.radius + 32, this.radius, 0, 2 * Math.PI)
        
        renderer.setColor("rgba(255, 0, 0, 0.2");
        renderer.setLineWidth(this.radius / 2 - 16);
        renderer.strokeArc(this.pos.x - (this.radius / 2 + this.radius / 4 + 8) + 32, this.pos.y - (this.radius / 2 + this.radius / 4 + 8) + 32, (this.radius / 2 + this.radius / 4 + 8), 0, 2 * Math.PI)

    }
});

game.Menu.cancel_button = me.GUI_Object.extend({
    init: function(x, y, settings){
        settings.image = "cancel_icon";

        this._super(me.GUI_Object, 'init', [x, y, settings]);
        this.anchorPoint.set(0.0, 0.0);
        this.parentMenu = settings.parentMenu;
        this.name = "tower_menu_object";
    },
    onClick(e){
        game.functions.removeTowerMenu();        
    }
});

game.Menu.sell_button = me.GUI_Object.extend({
    init: function(x, y, settings){
        settings.image = "sell_icons";
        settings.frameheight = 32;
        settings.framewidth = 32;
        settings.width = 64;
        settings.height = 32;

        this._super(me.GUI_Object, 'init', [x, y, settings]);

        this.addAnimation("sell", [0]);
        this.addAnimation("sell_confirm", [1]);        
        this.setCurrentAnimation("sell");
        this.confirm = false;


        this.anchorPoint.set(0.0, 0.0);
        this.parentMenu = settings.parentMenu;
        this.setOpacity(0.75);
        this.name = "tower_menu_object";
    },
    onOver: function(e){      
        this.setOpacity(1.0);        
    },
    onOut: function(e){
        this.setOpacity(0.75);        
    },
    onClick(e){

        if(this.confirm == false){
            this.confirm = true;
        }else{

            //Remove menu and buttons
            game.functions.removeTowerMenu();   
            me.audio.play("sell_item");

            //Refund gold
            var tower = this.parentMenu.towerEntity.currentTower;
            var baseCost = tower.value;
            var refundFactor = .5           //Percentage of tower value to refund
            game.data.gold += Math.floor(baseCost * refundFactor);

            //remove actual tower
            me.game.world.removeChild(tower);
            this.parentMenu.towerEntity.currentTower = null;
            this.parentMenu.towerEntity.towerPlaced = false;
        }
    },
    update: function(dt){
         if(this.confirm == true){
            this.setCurrentAnimation("sell_confirm");
        }
        else{
            this.setCurrentAnimation("sell");
        }
    }
});

