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

/*global Ext, sitools, i18n, projectGlobal, alertFailure, showResponse*/

Ext.namespace('sitools.user.modules');
/**
 * ProjectDescription Module
 * @class sitools.user.modules.projectDescription
 * @extends Ext.Panel
 */
sitools.user.modules.projectDescription = Ext.extend(Ext.Panel, {
    initComponent : function () {
		Ext.Ajax.request({
			method : "GET", 
			url : projectGlobal.sitoolsAttachementForUsers, 
			success : function (response) {
				if (!showResponse(response, false)) {
	                return;
	            }
	            var config = Ext.decode(response.responseText);
	            this.add({
					xtype : "panel", 
					html : Ext.util.Format.htmlDecode(config.project.htmlDescription), 
					autoScroll : true
				});
				this.doLayout();
			}, 
			failure : alertFailure, 
			scope : this
		});
        sitools.user.modules.projectDescription.superclass.initComponent.call(this);
    }
});

Ext.reg('sitools.user.modules.projectDescription', sitools.user.modules.projectDescription);
