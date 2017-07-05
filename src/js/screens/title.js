game.TitleScreen = me.ScreenObject.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
        // play title music
        setTimeout(me.audio.playTrack("title_music",0),500); //Wait for previous track to finish before starting
        me.audio.fade("title_music", 0, 1, 500);

        var backgroundImage = new me.Sprite(0, 0, {
            image: me.loader.getImage('title3'),
            }
        );

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

        //reset level to level 1
        game.data.level = 1; 

        // change to play state on press Enter or click/tap
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
        me.input.bindKey(me.input.KEY.I, "instructions", true);
        me.input.bindKey(me.input.KEY.NUM1, "gotolevel1", true);
        me.input.bindKey(me.input.KEY.NUM2, "gotolevel2", true);
        me.input.bindKey(me.input.KEY.NUM3, "gotolevel3", true);
        me.input.bindKey(me.input.KEY.NUMPAD1, "gotolevel1", true);
        me.input.bindKey(me.input.KEY.NUMPAD2, "gotolevel2", true);
        me.input.bindKey(me.input.KEY.NUMPAD3, "gotolevel3", true);
        me.input.bindKey(me.input.KEY.Q, "toggleQuality", true);
        me.input.bindPointer(me.input.pointer.LEFT, me.input.KEY.ENTER);
        this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
          if (action === "enter") {           
            me.state.change(me.state.LEVEL_INTRO);
          }
          else if(action === "gotolevel1"){
            game.data.level = 1;
            me.state.change(me.state.LEVEL_INTRO);
          }
          else if(action === "gotolevel2"){
            game.data.level = 2;
            me.state.change(me.state.LEVEL_INTRO);
          }
          else if(action === "gotolevel3"){
            game.data.level = 3;
            me.state.change(me.state.LEVEL_INTRO);
          }
          else if(action === "instructions") {
            me.state.change(me.state.INSTRUCTIONS);
          }
          else if(action === "toggleQuality") {
            if(me.sys.fps == 60){
              //Update image
              for(i = (me.game.world.children.length) -1; i >= 0; i--)
                if(me.game.world.children[i].name !== "me.debugPanel")
                    me.game.world.removeChild(me.game.world.children[i]);
              var backgroundImage = new me.Sprite(0, 0, {
                image: me.loader.getImage('title3low'),
              });
              backgroundImage.anchorPoint.set(0,0);
              backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);
              me.game.world.addChild(backgroundImage, 0);

              //Update settings
              me.sys.fps = 30;  
              me.sys.updatesPerSecond = 30;
            }
            else if(me.sys.fps == 30){
              //Update image
              for(i = (me.game.world.children.length) -1; i >= 0; i--)
                if(me.game.world.children[i].name !== "me.debugPanel")
                    me.game.world.removeChild(me.game.world.children[i]);
              var backgroundImage = new me.Sprite(0, 0, {
                image: me.loader.getImage('title3'),
              });
              backgroundImage.anchorPoint.set(0,0);
              backgroundImage.scale(me.game.viewport.width / backgroundImage.width, me.game.viewport.height / backgroundImage.height);
              me.game.world.addChild(backgroundImage, 0);

              //Update settings
              me.sys.fps = 60;
              me.sys.updatesPerSecond = 60;
            }
          }
        });

    },
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
        me.input.unbindKey(me.input.KEY.NUM1);
        me.input.unbindKey(me.input.KEY.NUM2);
        me.input.unbindKey(me.input.KEY.NUM3);
        me.input.unbindKey(me.input.KEY.NUMPAD1);
        me.input.unbindKey(me.input.KEY.NUMPAD2);
        me.input.unbindKey(me.input.KEY.NUMPAD3);
        me.input.unbindKey(me.input.KEY.Q);
        me.input.unbindPointer(me.input.pointer.LEFT);
        me.input.unbindKey(me.input.KEY.I);
        me.audio.fade("title_music", 1, 0, 500);
        setTimeout(me.audio.stopTrack("title_music"),500);
        me.event.unsubscribe(this.handler);

    }
});
