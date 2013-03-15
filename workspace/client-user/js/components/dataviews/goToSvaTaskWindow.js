/*******************************************************************************
 * Copyright 2011, 2012 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
 * 
 * This file is part of SITools2.
 * 
 * SITools2 is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * SITools2 is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * SITools2. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/
/*global Ext, sitools, i18n, SitoolsDesk */

Ext.namespace('sitools.user.component.dataviews');

/**
 * A simple window to display results of SVA
 * @class sitools.user.component.dataviews.goToSvaTaskWindow
 * @extends Ext.Window
 */
sitools.user.component.dataviews.goToSvaTaskWindow = Ext.extend(Ext.Window, {
//sitools.user.component.livegrid.goToSvaTaskWindow = Ext.extend(Ext.Window, {
	modal : true,
    width : "800", 
    initComponent : function () {
        var svaTask = this.svaTask;
        this.title = i18n.get('label.info');
		
		var message = "<span style='font-weight:bold'>" + i18n.get('label.status') + " : </span>" + svaTask.status
				+ "<br>";
		message += "<span style='font-weight:bold'>" + i18n.get('label.id') + " : </span>" + svaTask.id + "<br>";
		message += "<span style='font-weight:bold'>" + i18n.get('label.url')
				+ " : </span> <a target='_blank' href='" + svaTask.statusUrl
				+ "'>" + svaTask.statusUrl + "</a><br>";
		message += "<br>" + i18n.get('label.svaTaskPlace');

		this.buttons = [{
			text : i18n.get('label.goSvaTask'),
			handler : this.goToSvaTask
		}, {
			text : i18n.get('label.close'),
			handler : function () {
				this.ownerCt.ownerCt.close();
			}
		}];
        
        var panel = new Ext.Panel({
            layout : 'fit', 
            padding: 5,
            width : "800", 
            html : message  
        });
        
        this.items = panel;
        
        sitools.user.component.dataviews.goToSvaTaskWindow.superclass.initComponent.call(this);

	},
    
    goToSvaTask : function () {
        this.ownerCt.ownerCt.close();
        var homeModule = SitoolsDesk.app.findModule("EspacePersonnel");
        if (!Ext.isEmpty(homeModule.getWindow())) {
            homeModule.getWindow().close();
        }
        homeModule.createWindow({
            activePanel : "task"
        });
    }

});
