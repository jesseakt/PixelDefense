var     SLOW_TOWER_COST = 75;
var     SLOW_TOWER_RADIUS = 128;



game.SlowTowerEntity = me.Entity.extend({
    init: function (x,y,settings) {        
        //offset entity so that center is where TowerLocationEntity was  
        x = x - 64;
        y = y - 80;
        settings.image = "slow_tower";
        //set image width to actual image size
        settings.framewidth = 64;
        settings.frameheight = 64;
        //set width and height to attack radius
        settings.width = SLOW_TOWER_RADIUS * 2;
        settings.height = SLOW_TOWER_RADIUS * 2;

        this._super(me.Entity, "init", [x,y,settings]);         
        //set anchor point and image location to center of entity(hitbox)
        this.anchorPoint.set(0.5,0.5);  

        //Towers are PLAYER_OBJECTS
        //These interact with walking enemies (ENEMY_OBJECT)  
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.body.setCollisionMask(me.collision.types.ENEMY_OBJECT);

        //Define Tower Defense Variables. These may be updated with the upgrade system
        this.fireDelay = Math.floor(me.sys.updatesPerSecond*250/60);           //Value added to rofCooldown after firing
        this.slowCooldown = 0;          //This must be 0 to fire
        this.slowDamage = 0;            //Damage upon slow effect
        this.slowFactor = .35;          //Percentage to slow a given enemy
        this.slowDuration = 500;        //Ticks to apply slow effect for
        this.slowDistance = SLOW_TOWER_RADIUS;        //Radius to affect enemies with slow
        this.targets = [];              //List of possible targets
        this.upgradeLevel = 0;          //Default to level 0 tower
        this.name = "slow_tower";       //used to produce proper upgrade menu
        this.value = SLOW_TOWER_COST;       //Store current value of tower

        //Upgrade logic
        this.upgradesInstalled = [false, false];    //Upgrades Installed

    },
    upgrade: function (index) {
        //Don't install if already installed, else mark as installed
        if(this.upgradesInstalled[index])
            return false;
        this.upgradesInstalled[index] = true;   //Flag upgrade as installed
        this.value += Math.floor(SLOW_TOWER_COST*game.data.upgradeCostFactor[this.upgradeLevel]); //Update value
        this.upgradeLevel++;    //Update upgradeLevel

        //Update variables associated with upgrade
        //Slow effect does chill damage
        if(index == 0){
            this.slowDamage += 8;
        }

        //Slow effect is "timesAsEffective" more effective, multiplicatively 
        //(I promise this should work every time, at least 60% of the time :p )
        else if(index == 1){
            var timesAsEffective = 1.5;
            this.slowFactor = Math.floor((1 - Math.pow(1-this.slowFactor, timesAsEffective)) *100)/100.;
        }

        //Return true if upgrade successful
        return true;
    },   

    update: function (dt) {
        //Process Slow Cooldown if necessary
        if(this.slowCooldown > 0){
            this.slowCooldown--;
        }
        else if(this.slowCooldown < 0){
            this.slowCooldown = 0;
        }

        //Apply slow effect to targets if in range
        if(this.targets.length>0 && this.slowCooldown == 0){
            //Remove targets that are out of range
            var i = 0;
            while(i < this.targets.length){
                if(this.targets[i].alive == false || (this.distanceTo(this.targets[i]) > 150)){
                    this.targets = this.targets.slice(0,i).concat(this.targets.slice(i+1,this.targets.length));
                    continue;
                }
                i++;
            }

            //If no remaining targets then bail before applying slow
            if(this.targets.length == 0)
                return false;

            //Apply slow to remaining targets
            for(i = 0; i < this.targets.length; i++){
                this.targets[i].applySlow(this.slowFactor, this.slowDuration);
                this.targets[i].damageEntity(this.slowDamage);
            }

            //Display freeze explosion effect
            var freezeSettings = {};
            freezeSettings.lifetime = this.fireDelay;
            me.game.world.addChild(me.pool.pull("FreezeExplosionEntity", this.pos.x + 48, this.pos.y + 48, freezeSettings));

            //Set cooldown
            this.slowCooldown += this.fireDelay;
        }
        return false;
    },

    onCollision: function(response, other){
        //Add this to the list of possible enemies if it isn't in the list already.
        if(response.aInB){
            found = 0;
            for(i=0; i<this.targets.length; i++){
                if(other === this.targets[i])
                    found = 1;
            }
            if(!found)
                this.targets.push(other);
        }
        return false;
    }
});