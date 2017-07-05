game.ArrowEntity = me.Entity.extend({   
    init: function (x,y,settings) {
        //Define appearance
        settings.image = "arrows"; 
        settings.width = 9;
        settings.height = 9;      
        this._super(me.Entity, "init", [x,y,settings]); 

        //Save information from settings
        this.damage = settings.arrowDamage;
        this.bleedEffect = settings.bleedEffect;
        this.bleedDot = settings.bleedDot;
        this.maxDistance = settings.arrowDistance;
        this.velocity = settings.arrowVelocity;
        this.moveDirection = settings.targetAng;
        if(this.moveDirection<0)
            this.moveDirection += 360;
        this.parent = settings.parent;
        this.currentTarget = settings.arrowTarget;

        //create the different animations
        this.renderable.addAnimation("left", [0]);
        this.renderable.addAnimation("right", [1]);
        this.renderable.addAnimation("up", [2]);
        this.renderable.addAnimation("down", [3]);
        this.renderable.addAnimation("downleft", [4]);
        this.renderable.addAnimation("upright", [5]);
        this.renderable.addAnimation("upleft", [6]);
        this.renderable.addAnimation("downright", [7]);

        //Assign animation based on flight angle
        this.moveDirection<=22.5?this.renderable.setCurrentAnimation("right"):
        this.moveDirection<=67.5?this.renderable.setCurrentAnimation("upright"):
        this.moveDirection<=112.5?this.renderable.setCurrentAnimation("up"):
        this.moveDirection<=157.5?this.renderable.setCurrentAnimation("upleft"):
        this.moveDirection<=202.5?this.renderable.setCurrentAnimation("left"):
        this.moveDirection<=247.5?this.renderable.setCurrentAnimation("downleft"):
        this.moveDirection<=292.5?this.renderable.setCurrentAnimation("down"):
        this.moveDirection<=337.5?this.renderable.setCurrentAnimation("downright"):
        this.renderable.setCurrentAnimation("right");      

        //Define types of collisions for projectiles
        this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
        this.body.setCollisionMask(me.collision.types.ENEMY_OBJECT);

        // Calculate velocity in x and y direction using trig
        this.velx = this.velocity * Math.cos(this.moveDirection * Math.PI/180);
        // Multiply this by negative 1 because down is positive, and the angle is Counter-Clockwise from positive X-axis
        this.vely = this.velocity * Math.sin(this.moveDirection * Math.PI/180) * -1;

        me.audio.play("arrow_shoot");
    },

    update: function (dt) {
        if(this.distanceTo(this.parent)>this.maxDistance){
            me.game.world.removeChild(this);
            return false;
        }

        //Move the object
        this.pos.x += this.velx * dt / 1000;
        this.pos.y += this.vely * dt / 1000;

        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    destroy: function(){
    },

    onCollision: function(response, other){
        //only cause damage and disappear if target object
        if(other === this.currentTarget){
            response.a.damageEntity(this.damage);
            if(this.bleedEffect)
                response.a.causeBleeding(this.bleedDot);
            me.game.world.removeChild(this);
        }
        return false;
    }
});

game.CannonballEntity = me.Entity.extend({   
    init: function (x,y,settings) {
        //Define appearance
        settings.image = "cannonball"; 
        settings.width = 32;
        settings.height = 32;      
        this._super(me.Entity, "init", [x,y,settings]); 
        this.anchorPoint.set(0.5,0.5);

        //Save information from settings
        this.damage = settings.cannonDamage;
        this.maxDistance = settings.cannonDistance;
        this.velocity = settings.cannonVelocity;
        this.cannonballScale = settings.cannonballScale;
        this.aoe_dist = settings.cannonAoe/2;
        this.moveDirection = settings.targetAng;
        if(this.moveDirection<0)
            this.moveDirection += 360;
        this.parent = settings.parent;
        this.targets = settings.cannonTargets;
        this.currentTarget = settings.cannonTarget;

        //Scale to the proper size
        this.renderable.scale(this.cannonballScale,this.cannonballScale);

        //create the different animations
        this.renderable.addAnimation("left", [4]);
        this.renderable.addAnimation("right", [0]);
        this.renderable.addAnimation("up", [2]);
        this.renderable.addAnimation("down", [6]);
        this.renderable.addAnimation("downleft", [5]);
        this.renderable.addAnimation("upright", [1]);
        this.renderable.addAnimation("upleft", [3]);
        this.renderable.addAnimation("downright", [7]);

        //Assign animation based on flight angle
        this.moveDirection<=22.5?this.renderable.setCurrentAnimation("right"):
        this.moveDirection<=67.5?this.renderable.setCurrentAnimation("upright"):
        this.moveDirection<=112.5?this.renderable.setCurrentAnimation("up"):
        this.moveDirection<=157.5?this.renderable.setCurrentAnimation("upleft"):
        this.moveDirection<=202.5?this.renderable.setCurrentAnimation("left"):
        this.moveDirection<=247.5?this.renderable.setCurrentAnimation("downleft"):
        this.moveDirection<=292.5?this.renderable.setCurrentAnimation("down"):
        this.moveDirection<=337.5?this.renderable.setCurrentAnimation("downright"):
        this.renderable.setCurrentAnimation("right");      

        //Define types of collisions for projectiles
        this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
        this.body.setCollisionMask(me.collision.types.ENEMY_OBJECT);

        // Calculate velocity in x and y direction using trig
        this.velx = this.velocity * Math.cos(this.moveDirection * Math.PI/180);
        // Multiply this by negative 1 because down is positive, and the angle is Counter-Clockwise from positive X-axis
        this.vely = this.velocity * Math.sin(this.moveDirection * Math.PI/180) * -1;

        //TODO update cannon audio
        me.audio.play("cannon_shoot",false, null, 0.15);
    },

    update: function (dt) {
        //Explode, damage, then disappear (if at end of flight range, or if sufficiently close to target enemy)
        if((this.distanceTo(this.parent)>this.maxDistance) || this.distanceTo(this.currentTarget)<=this.aoe_dist*.75){
            //Remove targets that are out of range
            var i = 0;
            while(i < this.targets.length){
                //Remove out of range targets
                if(this.targets[i].alive == false || (this.distanceTo(this.targets[i]) > this.aoe_dist)){
                    //Always hit the cannon target if it's alive as long as the cannonball doesn't REALLY whiff
                    if(this.targets[i].alive && this.targets[i] === this.currentTarget && this.distanceTo(this.currentTarget)<=this.aoe_dist*1.25){
                        i++;
                        continue;
                    }
                    this.targets = this.targets.slice(0,i).concat(this.targets.slice(i+1,this.targets.length));
                    continue;
                }
                i++;
            }

            //Apply damage to remaining targets
            for(i = 0; i < this.targets.length; i++){
                this.targets[i].damageEntity(this.damage);
            }

            //Generate graphical explosion
            var explosionSettings = {};
            explosionSettings.lifetime = 180;
            explosionSettings.explosionScale = this.cannonballScale;
            me.game.world.addChild(me.pool.pull("ExplosionEntity", this.pos.x-32, this.pos.y-32, explosionSettings));

            //Remove the cannonball object
            me.game.world.removeChild(this);
            return false;
        }

        //Move the object
        this.pos.x += this.velx * dt / 1000;
        this.pos.y += this.vely * dt / 1000;

        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    destroy: function(){
    },

    onCollision: function(response, other){
        //Add entities encountered to target list.
        var found = 0;
        for(i=0; i<this.targets.length; i++){
            if(other === this.targets[i])
                found = 1;
        }
        if(!found)
            this.targets.push(other);

        //Don't explode yet
        return false;
    }
});

//Only graphics and sound of cannonball explosion
game.ExplosionEntity = me.Entity.extend({   
    init: function (x,y,settings) {
        //Define appearance
        settings.image = "explosion"; 
        settings.width = 128;
        settings.height = 128;      
        this._super(me.Entity, "init", [x,y,settings]); 
        this.anchorPoint.set(0.5,0.5);

        //Ticks to live for
        this.lifetime = settings.lifetime;

        //Scale explosion size
        this.explosionScale = settings.explosionScale;
        this.renderable.scale(this.explosionScale,this.explosionScale);

        //Create explosion animation
        this.renderable.setOpacity(0.75);
        this.animationSpeed = 100;
        this.renderable.addAnimation("explosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, {name: 15, delay: Infinity}], this.animationSpeed);
        this.renderable.setCurrentAnimation("explosion");

        //TODO put explosion sound here
        //me.audio.play("arrow_shoot");
    },

    update: function (dt) {
        //Countdown until lifetime expires, else, remove this object
        if(this.lifetime>0)
            this.lifetime--;
        else{
            me.game.world.removeChild(this);
            return false;
        }

        return (this._super(me.Entity, 'update', [dt]));
    },

    destroy: function(){
    },

    onCollision: function(response, other){
        return false;
    }
});

//Only graphics and sound of tower's freeze effect
game.FreezeExplosionEntity = me.Entity.extend({   
    init: function (x,y,settings) {
        //Define appearance
        settings.image = "freeze_exp"; 
        settings.width = 160;
        settings.height = 160;      
        this._super(me.Entity, "init", [x,y,settings]); 
        //this.anchorPoint.set(0,0);

        //Ticks to live for
        this.lifetime = settings.lifetime;

        //Create freeze explosion animation
        this.renderable.setOpacity(0.5);
        this.animationSpeed = 100;
        this.renderable.addAnimation("freezeExplosion", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, {name: 11, delay: Infinity}], this.animationSpeed);
        this.renderable.setCurrentAnimation("freezeExplosion");

        me.audio.play("slow_shoot", false, null, 0.25);
    },

    update: function (dt) {
        //Countdown until lifetime expires, else, remove this object
        if(this.lifetime>0)
            this.lifetime--;
        else{
            me.game.world.removeChild(this);
            return false;
        }

        return (this._super(me.Entity, 'update', [dt]));
    },

    destroy: function(){
    },

    onCollision: function(response, other){
        return false;
    }
});

//Bleed Effect on enemy
game.BleedEffectEntity = me.Entity.extend({   
    init: function (x,y,settings) {
        //Define appearance
        settings.image = "bleedEffect"; 
        settings.width = 32;
        settings.height = 32;      
        this._super(me.Entity, "init", [x,y,settings]); 
        //this.anchorPoint.set(0,0);

        //Ticks to live for
        this.lifetime = settings.lifetime;

        //Create blood explosion animation
        this.renderable.setOpacity(0.5);
        this.animationSpeed = 100;
        this.renderable.addAnimation("bloodEffect", [0, 1, 2, 3, 4, {name: 5, delay: Infinity}], this.animationSpeed);
        this.renderable.setCurrentAnimation("bloodEffect");
    },

    update: function (dt) {
        //Countdown until lifetime expires, else, remove this object
        if(this.lifetime>0)
            this.lifetime--;
        else{
            me.game.world.removeChild(this);
            return false;
        }

        return (this._super(me.Entity, 'update', [dt]));
    },

    destroy: function(){
    },

    onCollision: function(response, other){
        return false;
    }
});