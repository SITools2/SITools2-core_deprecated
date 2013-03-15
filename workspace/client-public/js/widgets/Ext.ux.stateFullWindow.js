/***************************************
* Copyright 2011, 2012 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
* 
* This file is part of SITools2.
* 
* SITools2 is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* SITools2 is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with SITools2.  If not, see <http://www.gnu.org/licenses/>.
***************************************/
/*global Ext, sitools, i18n,document,projectGlobal,userStorage*/
Ext.ns('Ext.ux');
Ext.ux.stateFullWindow = Ext.extend(Ext.Window, {
    saveSettings : function (datasetName, fileName, componentSettings, forPublicUser) {
	    if (Ext.isEmpty(userLogin)) {
		    Ext.Msg.alert(i18n.get('label.warning', 'label.needLogin'));
		    return;
	    }
	    var position = Ext.encode(this.getPosition());
	    var size = Ext.encode(this.getSize());

	    var putObject = {};

	    // putObject['datasetId'] = datasetId;
	    // putObject['componentType'] = componentType;
	    putObject.componentSettings = componentSettings;

	    putObject.windowSettings = {};
	    putObject.windowSettings.size = size;
	    putObject.windowSettings.position = position;
	    putObject.windowSettings.specificType = this.specificType;
	    putObject.windowSettings.moduleId = this.getId();
	    putObject.windowSettings.typeWindow = this.typeWindow;
	    if (forPublicUser) {
	    	publicStorage.set(fileName, "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName + "/" + datasetName, putObject);
	    }
	    else {
	    	userStorage.set(fileName, "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName + "/" + datasetName, putObject);
	    }
	    return putObject;
    }
//    getComponentError : function () {
//        return this.componentError;
//    },
//    setComponentError : function (value) {
//        this.componentError = value;
//    },
//    show : function () {
//        Ext.ux.stateFullWindow.superclass.show.call(this);
//    }

});
Ext.reg('statewindow', Ext.ux.stateFullWindow);
