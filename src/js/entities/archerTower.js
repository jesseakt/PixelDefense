var     ARCHER_TOWER_COST =  50;
var     ARCHER_TOWER_RADIUS = 160; //4 tile attack radius


game.ArcherTowerEntity = me.Entity.extend({
    init: function (x,y,settings) {        
        //offset entity so that center is where TowerLocationEntity was
        x = x - (ARCHER_TOWER_RADIUS - 64);
        y = y - (ARCHER_TOWER_RADIUS - 48);

        settings.image = "archer_tower";

        //set image width to actual image sizes
        settings.framewidth = 64;
        settings.frameheight = 64;
        //set width and height to attack radius
        settings.width = ARCHER_TOWER_RADIUS * 2;
        settings.height = ARCHER_TOWER_RADIUS * 2;

        this._super(me.Entity, "init", [x,y,settings]);         
        //set anchor point and image location to center of entity(hitbox)
        this.anchorPoint.set(0.5,0.5);  

        //Towers are PLAYER_OBJECTS
        //These interact with walking enemies (ENEMY_OBJECT)  
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;
        this.body.setCollisionMask(me.collision.types.ENEMY_OBJECT);

        //Define Tower Defense Variables. These may be updated with the upgrade system
        this.fireDelay = Math.floor(me.sys.updatesPerSecond*60/60);            //Value added to rofCooldown after firing
        this.arrowCooldown = 0;         //This must be 0 to fire
        this.numProjectiles = 1;        //Number of projectiles to shoot
        this.bleedArrows = false;       //Default to normal arrows
        this.bleedChance = 0;           //Chance to start bleeding
        this.bleedDot = 0;              //Damage per bleed update
        this.arrowDamage = 10;          //Damage upon arrow delivery
        this.arrowDistance = ARCHER_TOWER_RADIUS;       //Distance an arrow will travel before despawn
        this.arrowVelocity = 400;       //Velocity the arrow travels at
        this.targets = [];              //List of possible targets
        this.currentTarget = null;      //Currently targeted enemy object
        this.upgradeLevel = 0;          //default to level 0 tower
        this.name = "archer_tower";     //used to produce proper upgrade menu
        this.value = ARCHER_TOWER_COST;     //Store current value of tower

        //Upgrade logic
        this.upgradesInstalled = [false, false];    //Upgrades Installed

    },
    upgrade: function (index) {
        //Don't install if already installed, else mark as installed
        if(this.upgradesInstalled[index])
            return false;
        this.upgradesInstalled[index] = true;   //Flag upgrade as installed
        this.value += Math.floor(ARCHER_TOWER_COST*game.data.upgradeCostFactor[this.upgradeLevel]); //Update value
        this.upgradeLevel++;    //Update upgradeLevel

        //Update variables associated with upgrade
        //2 arrows shooting different targets at slightly reduced damage
        if(index == 0){
            this.numProjectiles += 1;
            this.arrowDamage = Math.floor(this.arrowDamage*.8);
        }

        //Give bleed effect to arrows.
        else if(index == 1){
            this.bleedArrows = true;
            this.bleedChance = 0.5;
            this.bleedDot = 2;
        }

        //Return true if upgrade successful
        return true;
    },

    update: function (dt) {
        //Process Arrow Cooldown if necessary
        if(this.arrowCooldown > 0){
            this.arrowCooldown--;
            return false;
        }
        else if(this.arrowCooldown < 0){
            this.arrowCooldown = 0;
            return false;
        }

        //Remove targets that are out of range
        var i = 0;
        while(i < this.targets.length){
            if(this.targets[i].alive == false || (this.distanceTo(this.targets[i]) > 150)){
                this.targets = this.targets.slice(0,i).concat(this.targets.slice(i+1,this.targets.length));
                continue;
            }
            i++;
        }
        var fired = false;

        //If bleed arrows, sort the targets so that the ones that aren't bleeding come first in the list
        if(this.bleedArrows){
            this.targets.sort(function(a,b){return a.bleeding - b.bleeding});
        }

        //Fire a projectile at each unique target until we run out of projectiles
        for(i = 0; i < this.numProjectiles; i++)
        {
            //Set target
            if(this.targets.length > i)
                this.currentTarget = this.targets[i];
            else
                break;
            //Shoot arrow
            var arrowSettings = {};
            arrowSettings.targetAng = -1*this.angleTo(this.currentTarget).radToDeg();
            arrowSettings.parent = this; //For calculating distance the arrow has flown.
            arrowSettings.arrowDamage = this.arrowDamage;
            arrowSettings.arrowDistance = this.arrowDistance;
            arrowSettings.arrowVelocity = this.arrowVelocity;
            arrowSettings.arrowTarget = this.currentTarget;
            if(this.bleedArrows && Math.random()<this.bleedChance){
                arrowSettings.bleedEffect = true;
                arrowSettings.bleedDot = 2;
            }
            else{
                arrowSettings.bleedEffect = false;
                arrowSettings.bleedDot = 0;
            }
            me.game.world.addChild(me.pool.pull("ArrowEntity", this.pos.x + this.width/2, this.pos.y + this.height*3/8, arrowSettings));
            fired = true;
        }

        //Cleanup by untargetting and setting arrowCooldown if we fired
        if(fired){
            this.currentTarget = null;
            this.arrowCooldown += this.fireDelay;
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