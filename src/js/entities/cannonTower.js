var     CANNON_TOWER_COST = 75;
var     CANNON_TOWER_RADIUS = 128;


game.CannonTowerEntity = me.Entity.extend({
    init: function (x,y,settings) {        
        //offset entity so that center is where TowerLocationEntity was  
        x = x - 64;
        y = y - 80;

        settings.image = "cannon_tower";
        //set image width to actual image size
        settings.framewidth = 64;
        settings.frameheight = 64;
        //set width and height to attack radius
        settings.width = CANNON_TOWER_RADIUS * 2;
        settings.height = CANNON_TOWER_RADIUS * 2;


        this._super(me.Entity, "init", [x,y,settings]);         
        //set anchor point and image location to center of entity(hitbox)
        this.anchorPoint.set(0.5,0.5);  

        //Towers are PLAYER_OBJECTS
        //These interact with walking enemies (ENEMY_OBJECT)  
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.body.setCollisionMask(me.collision.types.ENEMY_OBJECT);

        //Define Tower Defense Variables. These may be updated with the upgrade system
        this.fireDelay = Math.floor(2*me.sys.updatesPerSecond*60/60);           //Value added to rofCooldown after firing
        this.cannonCooldown = 0;        //This must be 0 to fire
        this.cannonDamage = 20;         //Damage upon cannonball delivery
        this.cannonDistance = CANNON_TOWER_RADIUS;      //Distance an cannonball will travel before despawn
        this.cannonVelocity = 400;      //Velocity the cannonball travels at
        this.cannonAoe = 80;            //Cannonball area of effect distance
        this.cannonballScale = 0.75;    //Scale factor for ball and explosion
        this.targets = [];              //List of possible targets
        this.currentTarget = null;      //Currently targeted enemy object
        this.upgradeLevel = 0;          //default to level 0 tower
        this.name = "cannon_tower";     //used to produce proper upgrade menu
        this.value = CANNON_TOWER_COST;     //Store current value of tower

        //Upgrade logic
        this.upgradesInstalled = [false, false];    //Upgrades Installed
    },   
    upgrade: function (index) {
        //Don't install if already installed, else mark as installed
        if(this.upgradesInstalled[index])
            return false;
        this.upgradesInstalled[index] = true;   //Flag upgrade as installed
        this.value += Math.floor(CANNON_TOWER_COST * game.data.upgradeCostFactor[this.upgradeLevel]); //Update value
        this.upgradeLevel++;    //Update upgradeLevel

        //Update variables associated with upgrade
        //(Larger) cannonball has larger aoe and increased firing range
        if(index == 0){
            this.cannonballScale = 1;
            this.cannonDistance = Math.floor(this.cannonDistance*4/3);
            this.cannonAoe = Math.floor(this.cannonAoe*4/3);
        }

        //Cannonball has upgraded damage
        else if(index == 1){
            this.cannonDamage = Math.floor(this.cannonDamage*1.5);
        }

        //Return true if upgrade successful
        return true;
    },

    update: function (dt) {
        //Process Cannon Cooldown if necessary
        if(this.cannonCooldown > 0){
            this.cannonCooldown--;
        }
        else if(this.cannonCooldown < 0){
            this.cannonCooldown = 0;
        }

        //Choose a new target if we don't have one, and there's one in the targets pool
        if(this.currentTarget == null && this.targets.length>0)
            this.currentTarget = this.targets[0];

        //Update target if we already have one, and select an appropriate target when we find one
        if(this.currentTarget != null){
            //if current target is dead or out of range set to null
            if(this.currentTarget.alive == false || (this.distanceTo(this.currentTarget) > 150)){
                this.currentTarget = null;
                //Find a new target if possible
                while(this.currentTarget == null && this.targets.length>0){
                    if(this.targets[0].alive == false || (this.distanceTo(this.targets[0]) > 150))
                        this.targets = this.targets.slice(1,this.targets.length);
                    else
                        this.currentTarget = this.targets[0];
                }
            }
        }

        //Fire at a target if we have one and we're off cooldown
        if(this.currentTarget != null && this.cannonCooldown == 0){
            //JS Object with flight settings for the projectile
            var cannonSettings = {};
            cannonSettings.targetAng = -1*this.angleTo(this.currentTarget).radToDeg();
            cannonSettings.parent = this; //For calculating distance the cannonball has flown.
            cannonSettings.cannonDamage = this.cannonDamage;
            cannonSettings.cannonAoe = this.cannonAoe;
            cannonSettings.cannonballScale = this.cannonballScale;
            cannonSettings.cannonDistance = this.cannonDistance;
            cannonSettings.cannonVelocity = this.cannonVelocity;
            cannonSettings.cannonTargets = this.targets;
            cannonSettings.cannonTarget = this.currentTarget;
            //console.log("targetPosAng = " + cannonSettings.targetAng + "\n");
            
            me.game.world.addChild(me.pool.pull("CannonballEntity", this.pos.x + this.width*7/16, this.pos.y + this.height*3/8, cannonSettings));
            this.cannonCooldown += this.fireDelay;  
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