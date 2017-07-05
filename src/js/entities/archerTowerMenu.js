game.Menu.arrow_button = me.GUI_Object.extend({
    init: function(x, y, settings){
        settings.image = "arrow_icons";
        settings.frameheight = 32;
        settings.framewidth = 32;
        settings.width = 64;
        settings.height = 32;

        this._super(me.GUI_Object, 'init', [x, y, settings]);
        this.cost = ARCHER_TOWER_COST;
      
        this.addAnimation("arrow", [0]);
        this.addAnimation("arrow_confirm", [1]);        
        this.setCurrentAnimation("arrow");
        //set true if icon was initially clicked once and needs
        //to be clicked again to confirm
        this.confirm = false;

        this.anchorPoint.set(0.0, 0.0);
        this.setOpacity(0.75);
        this.pos.z = 500;
        this.parentMenu = settings.parentMenu;
        this.name = "tower_menu_object";
        this.towerEntity = settings.towerEntity;

        //display cost of current tower or upgrade
        me.game.world.addChild(new game.Menu.CostDisplay(this.pos.x, this.pos.y, this.cost), Infinity);
        
    },    
    onOver: function(e){
        if(game.data.gold >= ARCHER_TOWER_COST){
            this.setOpacity(1.0);
        }
        var atkRadObj = me.game.world.getChildByProp("tag", "attackRadius");
        for(i = 0; i < atkRadObj.length; i++){
            me.game.world.removeChild(atkRadObj[i]);            
        }

        me.game.world.addChild(new game.Menu.AttackRadius(this.towerEntity.pos.x, 
            this.towerEntity.pos.y, ARCHER_TOWER_RADIUS), Infinity);
    },
    onOut: function(e){
        this.setOpacity(0.75);
        this.confirm = false;
     
        var atkRadObj = me.game.world.getChildByProp("tag", "attackRadius");
        for(i = 0; i < atkRadObj.length; i++){
            me.game.world.removeChild(atkRadObj[i]);            
        }
    },
    onClick(e){     
        if(game.data.gold >= ARCHER_TOWER_COST && this.confirm == false){
            this.confirm = true;
        }
        else if(game.data.gold >= ARCHER_TOWER_COST && this.confirm == true){
            this.towerEntity.towerPlaced = true;
            me.audio.play("tower_drop");
            game.data.gold -= ARCHER_TOWER_COST;

            //Place archer tower on map
            this.towerEntity.currentTower = me.game.world.addChild(
                new game.ArcherTowerEntity(this.parentMenu.pos.x, this.parentMenu.pos.y, 
                {width: 0, height: 0}));

            //Remove menu and buttons
            game.functions.removeTowerMenu();        

        }
    },
    update: function(dt){
        if(this.confirm == true){
            this.setCurrentAnimation("arrow_confirm");
        }
        else{
            this.setCurrentAnimation("arrow");
        }
    },

});

game.Menu.arrow_multi_button = me.GUI_Object.extend({
    init: function(x, y, settings){
        settings.image = "arrow_multi_icons";
        settings.frameheight = 32;
        settings.framewidth = 32;
        settings.width = 64;
        settings.height = 32;

        this._super(me.GUI_Object, 'init', [x, y, settings]);

        this.addAnimation("arrow_multi", [0]);
        this.addAnimation("arrow_multi_confirm", [1]);        
        this.setCurrentAnimation("arrow_multi");
        //set true if icon was initially clicked once and needs
        //to be clicked again to confirm
        this.confirm = false;

        this.anchorPoint.set(0.0, 0.0);
        this.setOpacity(0.75);
        this.pos.z = 500;
        this.parentMenu = settings.parentMenu;
        this.name = "tower_menu_object";
        this.towerEntity = settings.towerEntity;
        //console.log(this.towerEntity);

        //Set this to the index that corresponds to the upgrade number in the archer tower file
        this.upgradeIndex = 0;
        //Cost for this upgrade
        this.upgradeCost = ARCHER_TOWER_COST*game.data.upgradeCostFactor[this.towerEntity.currentTower.upgradeLevel];
        //Flag if this upgrade has been installed already
        this.upgradedAlready = this.towerEntity.currentTower.upgradesInstalled[this.upgradeIndex];

        //display cost of current tower or upgrade
        me.game.world.addChild(new game.Menu.CostDisplay(this.pos.x, this.pos.y, this.upgradeCost), Infinity);

        
    },
    onOver: function(e){       
        if(game.data.gold >= this.upgradeCost && !this.upgradedAlready){
            this.setOpacity(1.0);
        }
    },
    onOut: function(e){
        this.setOpacity(0.75);
        this.confirm = false;
    },
    onClick(e){     
        if(game.data.gold >= this.upgradeCost && !this.upgradedAlready && this.confirm == false){
            this.confirm = true;
        }
        else if(game.data.gold >= this.upgradeCost && !this.upgradedAlready && this.confirm == true){
            me.audio.play("upgrade");

            game.data.gold -= this.upgradeCost;
            this.towerEntity.currentTower.upgrade(this.upgradeIndex);

            //Remove menu and buttons
            game.functions.removeTowerMenu();        

        }
    },
    update: function(dt){
        if(this.confirm == true){
            this.setCurrentAnimation("arrow_multi_confirm");
        }
        else{
            this.setCurrentAnimation("arrow_multi");
        }
    },

});

game.Menu.arrow_bleed_button = me.GUI_Object.extend({
    init: function(x, y, settings){
        settings.image = "arrow_bleed_icons";
        settings.frameheight = 32;
        settings.framewidth = 32;
        settings.width = 64;
        settings.height = 32;

        this._super(me.GUI_Object, 'init', [x, y, settings]);

        this.addAnimation("arrow_bleed", [0]);
        this.addAnimation("arrow_bleed_confirm", [1]);        
        this.setCurrentAnimation("arrow_bleed");
        //set true if icon was initially clicked once and needs
        //to be clicked again to confirm
        this.confirm = false;

        this.anchorPoint.set(0.0, 0.0);
        this.setOpacity(0.75);
        this.pos.z = 500;
        this.parentMenu = settings.parentMenu;
        this.name = "tower_menu_object";
        this.towerEntity = settings.towerEntity;

        //Set this to the index that corresponds to the upgrade number in the archer tower file
        this.upgradeIndex = 1;
        //Cost for this upgrade
        this.upgradeCost = ARCHER_TOWER_COST*game.data.upgradeCostFactor[this.towerEntity.currentTower.upgradeLevel];
        //Flag if this upgrade has been installed already
        this.upgradedAlready = this.towerEntity.currentTower.upgradesInstalled[this.upgradeIndex];

        //display cost of current tower or upgrade
        me.game.world.addChild(new game.Menu.CostDisplay(this.pos.x, this.pos.y, this.upgradeCost), Infinity);
        
    },
    onOver: function(e){       
        if(game.data.gold >= this.upgradeCost && !this.upgradedAlready){
            this.setOpacity(1.0);
        }
    },
    onOut: function(e){
        this.setOpacity(0.75);
        this.confirm = false;
    },
    onClick(e){     
        if(game.data.gold >= this.upgradeCost && !this.upgradedAlready && this.confirm == false){
            this.confirm = true;
        }
        else if(game.data.gold >= this.upgradeCost && !this.upgradedAlready && this.confirm == true){
            me.audio.play("upgrade");

            game.data.gold -= this.upgradeCost;
            this.towerEntity.currentTower.upgrade(this.upgradeIndex);

            //Remove menu and buttons
            game.functions.removeTowerMenu();        

        }
    },
    update: function(dt){
        if(this.confirm == true){
            this.setCurrentAnimation("arrow_bleed_confirm");
        }
        else{
            this.setCurrentAnimation("arrow_bleed");
        }
    },

});
