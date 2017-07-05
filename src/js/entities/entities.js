/**
 * MapNode Entity
 * MapNodes store a property "moveDirection" that is passed to a colliding enemy entity.
 */
game.MapNode = me.Entity.extend({
    init:function (x, y, settings) {
        settings.image = "";
        var width = settings.width;
        var height = settings.height;
        settings.framewidth = width;
        settings.frameheight = height;
        settings.shapes[0] = new me.Rect(0,0, settings.width, settings.height);

        // Call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        //Save the moveDirection property passed from Tiled
        this.moveDirection = settings.moveDirection;

        //Set collision type as WORLD_SHAPE.
        this.body.collisionType = me.collision.types.WORLD_SHAPE;

    },
    update : function (dt) {
        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },
    onCollision : function (response, other) {
        /* If true is returned, makes other objects solid
         * Return false because we don't want this behavior in a TD game*/
        return false;
    }
});

/**
* KillNode Entity
* KillNodes are similar to MapNodes but will kill an enemy entity on collision.
* Ultimately, use this to process the TD logic associated with an enemy escaping through the gate.
* Do not award bounty. Subtract enemy power from the player's lives. 
* Remove object that interacts with it.
*/

game.KillNode = me.Entity.extend({

    init:function (x, y, settings) {
        settings.image = "";
        var width = settings.width;
        var height = settings.height;
        settings.framewidth = width;
        settings.frameheight = height;
        settings.shapes[0] = new me.Rect(0,0, settings.width, settings.height);

        // Call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        //Save the moveDirection property passed from Tiled
        this.moveDirection = settings.moveDirection;
        this.ended = false;

        //Set collision type as WORLD_SHAPE.
        this.body.collisionType = me.collision.types.WORLD_SHAPE;

    },
    update : function (dt) {

        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },
    onCollision : function (response, other) {
        if(response.a.health_points>0)
        {
            if(this.ended)
                return false;

            response.a.bounty = 0;

            //Return to title if player has too few lives.
            //Go to loss screen if player has too few lives.
            if(game.data.playerLives - response.a.power <= 0){
                this.ended = true;
                me.state.pause(true);
                var menu_settings = {};
                menu_settings.pauseMenu = false;
                menu_settings.levelPassed = false;
                menu_settings.width = 640;
                menu_settings.height = 360;
                var optionMenu = new game.OptionMenu.Container(menu_settings);
                me.game.world.addChild(optionMenu);
                return false;
            }
            game.data.playerLives -= response.a.power;
            game.data.enemyStrength -= response.a.power;
            if(game.data.level == 1)
                game.Level01PlayScreen.__methods__.checkEnemyStrength();
            else if(game.data.level == 2)
                game.Level02PlayScreen.__methods__.checkEnemyStrength();
            else
                game.Level03PlayScreen.__methods__.checkEnemyStrength();
            response.a.pos._x += 2*response.a.width*Math.cos(response.a.moveDirection * Math.PI/180);
            response.a.pos._y -= 2*response.a.height*Math.sin(response.a.moveDirection * Math.PI/180);
            response.a.health_points = 0;
            response.a.bounty = 0;
            response.a.power = 0;
        }
        /* If true is returned, makes other objects solid
         * Return false because we don't want this behavior in a TD game*/
        return false;
    }
});

/**
* ForkNode Entity
* Used in level two to split the enemies above and below the fork
*/
game.ForkNode = me.Entity.extend({
    init:function (x, y, settings) {
        settings.image = "";
        var width = settings.width;
        var height = settings.height;
        settings.framewidth = width;
        settings.frameheight = height;
        settings.shapes[0] = new me.Rect(0,0, settings.width, settings.height);

        this._super(me.Entity, 'init', [x, y , settings]);
        this.name = "forkNode";        
        this.fork = true;
        this.enemiesDiverted = {};

        //Set collision type as WORLD_SHAPE.
        this.body.collisionType = me.collision.types.WORLD_SHAPE;

    },
    update : function (dt) {
        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },
    onCollision : function (response, other) {
        var found = false;
        
        for(i = 0; i < this.enemiesDiverted.length; i++){
            if(this.enemiesDiverted[i] === response.b){
                found = true;
            }
        }
        if(found == false){
            if(this.fork == true){
                this.moveDirection = 45;
                this.fork = false;
            }else if(this.fork == false){
                this.moveDirection = 315;
                this.fork = true;
            }
        }
        /* If true is returned, makes other objects solid
         * Return false because we don't want this behavior in a TD game*/
        return false;
    }
});