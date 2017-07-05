game.functions = {

    //remove all object used to create the tower menu
	removeTowerMenu: function(){
		var menuObjects = me.game.world.getChildByName("tower_menu_object");
        var menuObjectsLength = menuObjects.length;
        var menus = [];

        for(var i = 0; i < menuObjectsLength; i++){
            var parentMenuFound = false;
            for(var j = 0; j < menus.length; j++)
                if(menuObjects[i].parentMenu === menus[j])
                    parentMenuFound = true;
            if(!parentMenuFound){
                if(menuObjects[i].parentMenu != null){
                    menus.push(menuObjects[i].parentMenu);
                }
            }
            //remove object from world
            me.game.world.removeChild(menuObjects[i]);
        }
        //remove menu container after objects removed
        for(var i = 0; i < menus.length; i++){
            me.game.world.removeChild(menus[i]);
        }        

	}

}