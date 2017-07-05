game.levelIntroScreen = me.ScreenObject.extend({
    onResetEvent: function() {
        // play level complete music
        setTimeout(me.audio.playTrack("lost_island",0),500); //Wait for previous track to finish before starting
        me.audio.fade("lost_island", 0, 1, 500);

        if(game.data.level == 1)
            var backgroundImage = new me.Sprite(0, 0, {
                image: me.loader.getImage('introLevel01'),
                }
            ); 
        else if(game.data.level == 2)
            var backgroundImage = new me.Sprite(0, 0, {
                image: me.loader.getImage('introLevel02'),
                }
            );
        else if(game.data.level == 3)
            var backgroundImage = new me.Sprite(0, 0, {
                image: me.loader.getImage('introLevel03'),
                }
            );
        else
            me.state.change(me.state.MENU);  

        // position image starting in upper left corner
        backgroundImage.anchorPoint.set(0,0);

        // resize image to fit viewport
        backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);

        // add image to world container
        me.game.world.addChild(backgroundImage, 1);

        me.game.world.addChild(new (me.Renderable.extend ({
        // constructor
        init : function () {
          this._super(me.Renderable, 'init', [0, 0, me.game.viewport.width, me.game.viewport.height]);
          
        },
    
        update : function (dt) {
          return true;
        },    

        onDestroyEvent : function () {
          
        }
        })), 2);

        // change to play state on press Enter or click/tap
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER);
        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
            if (action === "enter") {
                if(game.data.level == 1)           
                    me.state.change(me.state.LEVEL01);
                else if (game.data.level == 2)
                    me.state.change(me.state.LEVEL02);
                else if (game.data.level == 3)
                    me.state.change(me.state.LEVEL03);
                else if (game.data.level > 3){
                    //me.state.change(me.state.WINSCREEN); //TODO
                    me.state.change(me.state.MENU);
                }
                else
                    me.state.change(me.state.MENU);
            }
        });

    },
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindPointer(me.input.pointer.LEFT);
        me.audio.fade("lost_island", 1, 0, 500);
        setTimeout(me.audio.stopTrack("lost_island"),500);
        me.event.unsubscribe(this.handler);

    }
});
