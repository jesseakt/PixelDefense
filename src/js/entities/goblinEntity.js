game.GoblinEntity = me.Entity.extend({
    init:function (x, y, settings) {
        //Save the goblin settings from tiled so we can spawn more at a future point.
        if(me.game.goblinSettings === undefined)
            me.game.goblinSettings = settings;
        settings = me.game.goblinSettings;
        settings.image = "goblinchilled";

        //Save width and height from entire enemy path defined in tiled map
        var width = settings.width;
        var height = settings.height;

        //Adjust size setting to math the individual sprite size
        settings.framewidth = 64;
        settings.frameheight = 64;

        //Redefine the default shape
        settings.shapes[0] = new me.Rect(0,0, settings.width, settings.height);

        //Call the constructor
        this._super(me.Entity, 'init', [settings.x, settings.y , settings]);

        //Create the different animations
        //Default animationSpeed = 100. Number of ms per frame
        //This generates a random animation speed between 90 and 110
        this.animationSpeed = 100 + Math.floor(Math.random()*11)*(Math.random>0.5?-1:1);
        this.renderable.addAnimation("walkdown", [0,1,2,3,4,5,4,3,2,1],this.animationSpeed);
        this.renderable.addAnimation("walkright", [11,12,13,14,15,16,15,14,13,12],this.animationSpeed);
        this.renderable.addAnimation("walkup", [22,23,24,25,26,27,26,25,24,23],this.animationSpeed);
        this.renderable.addAnimation("walkleft", [33,34,35,36,37,38,37,36,35,34],this.animationSpeed);
        this.renderable.addAnimation("death", [44,45,46,47,{name: 48, delay: Infinity}],this.animationSpeed);
        this.renderable.addAnimation("chilldown", [55,56,57,58,59,60,59,58,57,56],this.animationSpeed*2);
        this.renderable.addAnimation("chillright", [66,67,68,69,70,71,70,69,68,67],this.animationSpeed*2);
        this.renderable.addAnimation("chillup", [77,78,79,80,81,82,81,80,79,78],this.animationSpeed*2);
        this.renderable.addAnimation("chillleft", [88,89,90,91,92,93,92,91,90,89],this.animationSpeed*2);

        //Wave Bonus Data
        this.wave = game.data.wave;         //Current wave
        this.hp_buff = 2.5;                 //Bonus HP per wave
        this.speed_buff = 5;                //Bonus Speed per wave

        //Tower Defense Variables
        this.base_hp = 40;                  //Base health pool
        this.max_hp = this.base_hp + this.wave*this.hp_buff;    //Total Health Pool
        this.health_points = this.max_hp;   //Health Remaining
        this.bounty = 15;                   //Gold Dropped
        this.armor = 0;                     //Damage Mitigation
        this.enrage = 1;                    //Velocity Gained on health loss
        this.slowed = false;                //Flag to determine if this enemy is slowed or not
        this.slowFactor = 1;                //Current percentage of total move speed
        this.slowTimer = 0;                 //Countdown until not slowed
        this.bleeding = false;              //Flag to determine if this enemy is bleeding or not
        this.bleedDot = 0;                  //Damage taken per bleed roll failure
        this.bleedTimer = 0;                //Countdown to roll to stop bleeding
        this.bleedTimerBase = 60;           //Base time to calculate bleed
        this.bleedContFactor = 0;           //Chance to continue bleeding
        this.power = game.data.goblinPower;  //Player lives lost on enemy escape.
        this.forked = false;                //has entity been diverted yet, RE: level02


        //Entity base speed value
        this.vel_init = 40;                 //Initial value for velocity before buffs and rng
        this.vel_rand = 6;                  //RNG +-5
        this.baseVelocity = this.vel_init + this.wave*this.speed_buff + Math.floor(Math.random()*this.vel_rand)*(Math.random>0.5?-1:1); //Base movement speed.
        this.velocity = this.baseVelocity;

        //Set tick delay (Time until the unit starts moving)
        if(settings.tickDelay === undefined)
        {
            this.health_points = 0;     //Kill the enemy that spawns along with tiled
            this.power = 0;             //And don't punish the player for it.
            this.tickDelay = 0;
            this.bounty = 0;
        }
        else
        {
            this.tickDelay = settings.tickDelay;
            this.velocity = 0;
        }

        //Entity starting direction
        this.moveDirection = settings.moveDirection;
        this.changeDir(this.moveDirection);

        //Entity starting animation
        this.moveDirection<=45?this.renderable.setCurrentAnimation("walkright"):
        this.moveDirection<=135?this.renderable.setCurrentAnimation("walkup"):
        this.moveDirection<=225?this.renderable.setCurrentAnimation("walkleft"):
        this.moveDirection<=315?this.renderable.setCurrentAnimation("walkdown"):
        this.renderable.setCurrentAnimation("walkright");

        //Still update the object even if it is off screen
        this.alwaysUpdate = true;

        //Set collision type and types to respond to
        this.body.collisionType = me.collision.types.ENEMY_OBJECT;
        this.body.setCollisionMask(
            me.collision.types.WORLD_SHAPE|
            me.collision.types.PLAYER_OBJECT|
            me.collision.types.PROJECTILE_OBJECT);
    },

    /**
     * Update the entity (Move and Detect Collision)
     */
    update : function (dt) {
        //Despawn if necessary
        if(!this.alive){
            if(this.deathTimer === undefined){
                this.deathTimer = 0;
                if(this.power>0)
                    me.audio.play("goblin_death",false,null,0.5);
                if(!this.inViewport)
                    this.deathTimer = 100000;
            }
            else
                this.deathTimer += 1;
            if(this.deathTimer > Math.floor(me.sys.updatesPerSecond*50/60)){
                me.game.world.removeChild(this);
                if(game.data.level == 1)
                    game.Level01PlayScreen.__methods__.checkEnemyStrength();
                else if(game.data.level == 2)
                    game.Level02PlayScreen.__methods__.checkEnemyStrength();
                else
                    game.Level03PlayScreen.__methods__.checkEnemyStrength();
            }
        }

        //Countdown tickDelay until it reaches 0. Then walk on screen.
        if(this.tickDelay>0){
            this.tickDelay -= 1;
            if(this.tickDelay == 0)
            {
                this.velocity = this.baseVelocity;
                this.changeDir(this.moveDirection);
                return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
            }
            return false;
        }

        //Process bleed timer if necessary
        if(this.bleedTimer > 0){
            this.bleedTimer--;
        }
        else if(this.bleedTimer < 0){
            this.bleedTimer = 0;
        }

        //Process bleeding effect (Ignore armor)
        if(this.bleeding && this.bleedTimer == 0 && this.alive)
        {
            //Try to stop the bleeding
            if(Math.random()<=this.bleedContFactor){
                //Bleeding continues
                //Display blood spurt
                var bloodSettings = {};
                bloodSettings.lifetime = this.bleedTimerBase;
                me.game.world.addChild(me.pool.pull("BleedEffectEntity", this.pos.x + this.width*3/8, this.pos.y + this.height/2, bloodSettings));
                //Take damage
                this.health_points -= this.bleedDot;
                //Update timer
                this.bleedTimer += this.bleedTimerBase;
                //Update chance to stop bleeding (extra 3% chance to stop bleeding each failure)
                this.bleedContFactor -= 0.03;

                //If this enemy enrages, calculate new velocity after taking damage
                if(this.enrage>0){
                    this.changeVel(this.slowFactor*(this.baseVelocity + this.enrage*(this.max_hp - this.health_points)));
                }
                if(this.health_points <= 0)
                    this.health_points = 0;
            }
            else{
                //Bleeding stops
                this.bleeding = false;
                this.bleedDot = 0;
                this.bleedContFactor = 0;
                this.bleedTimer = 0;
            }
        }
        
        //If it's dead and doesn't know it yet, do all the things that are necessary when an enemy dies.
        if(this.health_points == 0 && this.alive){
            this.alive = 0;
            this.changeVel(0);
            this.renderable.setCurrentAnimation("death");
            game.data.gold += this.bounty;
            //TODO add an animation of coin splashing out of dead enemy
            //Flicker for a second then disappear
            this.renderable.flicker(1000,function(){
            })
            return false;
        }

        //Process slow timer if necessary
        if(this.slowTimer > 0){
            this.slowTimer--;
        }
        else if(this.slowTimer < 0){
            this.slowTimer = 0;
        }
        //Undo slow effects if slowTimer is 0 and enemy is still slowed
        if(this.slowTimer == 0 && this.slowed && this.alive){
            this.slowed = false;
            this.slowFactor = 1;
            this.changeVel(this.slowFactor*(this.baseVelocity + this.enrage*(this.max_hp - this.health_points)));
            //Reset animation
            this.moveDirection<=45?this.renderable.setCurrentAnimation("walkright"):
            this.moveDirection<=135?this.renderable.setCurrentAnimation("walkup"):
            this.moveDirection<=225?this.renderable.setCurrentAnimation("walkleft"):
            this.moveDirection<=315?this.renderable.setCurrentAnimation("walkdown"):
            this.renderable.setCurrentAnimation("walkright");
        }

        this.pos.x += this.velx * dt / 1000;
        this.pos.y += this.vely * dt / 1000;

        // Handle collisions against other shapes
        me.collision.check(this);

        // Return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    /**
    * Change total velocity of the entity
    */
    changeVel: function (newVel) {
        // Sets current velocity as the value passed through to it
        this.velocity = newVel;

        // Calculate velocity in x and y direction using trig
        this.velx = this.velocity * Math.cos(this.moveDirection * Math.PI/180);
        // Multiply this by negative 1 because down is positive, and the angle is Counter-Clockwise from positive X-axis
        this.vely = this.velocity * Math.sin(this.moveDirection * Math.PI/180) * -1;
    },

    /**
    * Change move direction of entity (Degrees counterclockwise from positive x-axis)
    */
    changeDir : function (newDir) {
        // Sets the entity's current movement direction (degrees clockwise from positive x-axis)
        this.moveDirection = newDir;

        // Calculate velocity in x and y direction using trig
        this.velx = this.velocity * Math.cos(this.moveDirection * Math.PI/180);
        // Multiply by negative 1 because down is positive, and the angle is Counter-Clockwise from positive X-axis
        this.vely = this.velocity * Math.sin(this.moveDirection * Math.PI/180) * -1;

    },

    /***
    * Start the bleed effect
    ***/
    causeBleeding: function (bleedDot) {
        if(!this.bleeding)
        {
            this.bleeding = true;
            this.bleedTimer += this.bleedTimerBase;
            this.bleedDot = bleedDot;
        }
        //If bleed is applied again, just reset to chance to continue bleeding to 1.
        this.bleedContFactor = 1;
    },

    /**
    * Damage entity (Also heals if given a negative argument)
    */
    damageEntity : function (amount) {
        //Calculate damage taken after damage mitigation and take damage if needed
        damaged = amount - this.armor;
        if(damaged<0)
            damaged = 0;
        this.health_points -= damaged;

        //Flicker if damage is sustained
        if(damaged>0)
        {
            this.renderable.flicker(250);
        }

        //If this enemy enrages, calculate new velocity after taking damage
        if(this.enrage>0 && damaged>0){
            this.changeVel(this.slowFactor*(this.baseVelocity + this.enrage*(this.max_hp - this.health_points)));
        }


        //Check if dead or has too much hp
        if(this.health_points > this.max_hp)
            this.health_points = this.max_hp;
        if(this.health_points <= 0){
            this.changeVel(0);
            this.health_points = 0;
        }
    },

    /**
    * Apply slow (Slows by given factor if not slowed. Resets slow timer if slowed)
    **/
    applySlow : function (slowFactor, slowAmount) {
        //Don't slow if there is already a better slow effect
        if(this.slowed && (this.slowTimer>slowAmount || this.slowFactor < (1-slowFactor)))
            return false;
        //Change animation if it wasn't previously slowed
        if(!this.slowed)
            this.moveDirection<=45?this.renderable.setCurrentAnimation("chillright"):
            this.moveDirection<=135?this.renderable.setCurrentAnimation("chillup"):
            this.moveDirection<=225?this.renderable.setCurrentAnimation("chillleft"):
            this.moveDirection<=315?this.renderable.setCurrentAnimation("chilldown"):
            this.renderable.setCurrentAnimation("chillright");
        //Apply slow effects
        this.slowed = true;
        this.slowTimer = slowAmount;
        this.slowFactor = 1-slowFactor;
        this.changeVel(this.slowFactor*(this.baseVelocity + this.enrage*(this.max_hp - this.health_points)));
    },

   /**
     * Collision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        //If the entity is overlapping a WORLD_SHAPE, check the world shape if we need to change direction.
        if(response.b.body.collisionType === me.collision.types.WORLD_SHAPE){
            if(response.bInA && response.b.name == "forkNode"){
                if(this.forked == false){
                    this.forked = true;
                    this.changeDir(response.b.moveDirection);
                    if(!this.slowed)
                        this.moveDirection<=45?this.renderable.setCurrentAnimation("walkright"):
                        this.moveDirection<=135?this.renderable.setCurrentAnimation("walkup"):
                        this.moveDirection<=225?this.renderable.setCurrentAnimation("walkleft"):
                        this.moveDirection<=315?this.renderable.setCurrentAnimation("walkdown"):
                        this.renderable.setCurrentAnimation("walkright");
                    else
                        this.moveDirection<=45?this.renderable.setCurrentAnimation("chillright"):
                        this.moveDirection<=135?this.renderable.setCurrentAnimation("chillup"):
                        this.moveDirection<=225?this.renderable.setCurrentAnimation("chillleft"):
                        this.moveDirection<=315?this.renderable.setCurrentAnimation("chilldown"):
                        this.renderable.setCurrentAnimation("chillright");
                }
            }
            else if(response.bInA){
                //Direction stored in world_shape type
                if(response.b.moveDirection != this.moveDirection){
                    this.changeDir(response.b.moveDirection);
                    //Process animation
                    if(!this.slowed)
                        this.moveDirection<=45?this.renderable.setCurrentAnimation("walkright"):
                        this.moveDirection<=135?this.renderable.setCurrentAnimation("walkup"):
                        this.moveDirection<=225?this.renderable.setCurrentAnimation("walkleft"):
                        this.moveDirection<=315?this.renderable.setCurrentAnimation("walkdown"):
                        this.renderable.setCurrentAnimation("walkright");
                    else
                        this.moveDirection<=45?this.renderable.setCurrentAnimation("chillright"):
                        this.moveDirection<=135?this.renderable.setCurrentAnimation("chillup"):
                        this.moveDirection<=225?this.renderable.setCurrentAnimation("chillleft"):
                        this.moveDirection<=315?this.renderable.setCurrentAnimation("chilldown"):
                        this.renderable.setCurrentAnimation("chillright");
                }
            }
        }
        // Make all other objects solid
        return false;
    }
});
