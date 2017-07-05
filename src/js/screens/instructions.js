game.InstructionScreen = me.ScreenObject.extend({
    
    onResetEvent: function() {
        // play title music
        setTimeout(me.audio.playTrack("instruction_screen",0),500); //Wait for previous track to finish before starting
        me.audio.fade("instruction_screen", 0, .5, 500);

        var backgroundImage = new me.Sprite(0, 0, {
            image: me.loader.getImage('instructions1'),
            }
        ); 

        // position image starting in upper left corner
        backgroundImage.anchorPoint.set(0,0);

        // resize image to fit viewport
        backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);

        // Counter to count the number of instruction screens shown
        game.data.instructionsShown = 1;

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
            if(game.data.instructionsShown == 1){
                var backgroundImage = new me.Sprite(0, 0, {
                    image: me.loader.getImage('instructions2'),
                    }
                );
                backgroundImage.anchorPoint.set(0,0);
                backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);
                me.game.world.addChild(backgroundImage,2);
                game.data.instructionsShown++;
            }
            else if(game.data.instructionsShown == 2){
                var backgroundImage = new me.Sprite(0, 0, {
                    image: me.loader.getImage('instructions3'),
                    }
                );
                backgroundImage.anchorPoint.set(0,0);
                backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);
                me.game.world.addChild(backgroundImage,3);
                game.data.instructionsShown++;
            }
            else if(game.data.instructionsShown == 3){
                var backgroundImage = new me.Sprite(0, 0, {
                    image: me.loader.getImage('instructions4'),
                    }
                );
                backgroundImage.anchorPoint.set(0,0);
                backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);
                me.game.world.addChild(backgroundImage,4);
                game.data.instructionsShown++;
            }
            else if(game.data.instructionsShown == 4){
                var backgroundImage = new me.Sprite(0, 0, {
                    image: me.loader.getImage('instructions5'),
                    }
                );
                backgroundImage.anchorPoint.set(0,0);
                backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);
                me.game.world.addChild(backgroundImage,5);
                game.data.instructionsShown++;
            }
            else if(game.data.instructionsShown == 5){
                var backgroundImage = new me.Sprite(0, 0, {
                    image: me.loader.getImage('instructions6'),
                    }
                );
                backgroundImage.anchorPoint.set(0,0);
                backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);
                me.game.world.addChild(backgroundImage,6);
                game.data.instructionsShown++;
            }
            else{
                me.state.change(me.state.MENU);
            }

          }
        });

    },

    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindPointer(me.input.pointer.LEFT);
        me.audio.fade("instruction_screen", .5, 0, 500);
        setTimeout(me.audio.stopTrack("instruction_screen"),500);
        me.event.unsubscribe(this.handler);

    }
});
