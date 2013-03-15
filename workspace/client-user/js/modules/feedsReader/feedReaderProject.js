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
/*global Ext, sitools, projectGlobal, i18n*/

Ext.namespace('sitools.user.modules');

/**
 * Feeds Reader Module.
 * @class sitools.user.modules.feedsReaderProject
 * @extends Ext.Panel
 */
sitools.user.modules.feedsReaderProject = Ext.extend(Ext.Panel, {
    layout : "fit",
    initComponent : function () {
        var storeFeeds = new Ext.data.JsonStore({
            fields : [ 'id', 'feedType', 'title', 'feedSource', 'name' ],
            url : projectGlobal.sitoolsAttachementForUsers + "/feeds",
            root : "data",
            autoLoad : true
        });

        var cb = new Ext.form.ComboBox({
            // all of your config options
            store : storeFeeds,
            displayField : 'name',
            valueField : 'id',
            typeAhead : true,
            mode : 'local',
            forceSelection : true,
            triggerAction : 'all',
            emptyText : i18n.get('label.selectAFeed'),
            selectOnFocus : true,
            scope : this,
            listeners : {
                scope : this,
                select : this.selectProject
            }
        });

        this.tbar = {
            xtype : 'toolbar',
            defaults : {
                scope : this
            },
            items : [ cb ]
        };

        /**/

        sitools.user.modules.feedsReaderProject.superclass.initComponent.call(this);

    },

    selectProject : function (combo, rec, index) {
        this.remove(this.feedsReader);
        var url = projectGlobal.sitoolsAttachementForUsers + "/clientFeeds/" + rec.data.name;

        this.feedsReader = new sitools.widget.FeedGridFlux({
            urlFeed : url,
            feedType : rec.data.feedType,
            feedSource : rec.data.feedSource,
            autoLoad : true
        });

        this.add(this.feedsReader);
        this.doLayout();
    }

});

Ext.reg('sitools.user.modules.feedsReaderProject', sitools.user.modules.feedsReaderProject);
