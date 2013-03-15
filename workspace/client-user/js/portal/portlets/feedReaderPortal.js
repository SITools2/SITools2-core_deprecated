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
/*global Ext, i18n, sitools, window, loadUrl */

Ext.namespace('sitools.component.users.portal');

sitools.component.users.portal.feedsReaderPortal = Ext.extend(Ext.Panel, {
    portalId : "idPortal",
    layout : "fit",
    initComponent : function () {
        var storeFeeds = new Ext.data.JsonStore({
            fields : [ 'id', 'name', 'feedType', 'title', 'feedSource', {
                name : 'visible',
                type : 'boolean'
            } ],
            url : loadUrl.get('APP_URL') + loadUrl.get('APP_PORTAL_URL') + '/' + this.portalId + '/listFeeds',
            root : "data",
            autoLoad : true,
            listeners : {
                scope : this, 
                load : function (store, records, options) {
                    if (store.getCount() !== 0) {
						this.comboFeeds.setValue(storeFeeds.getAt(0).data.id);
						this.selectFeeds(this.comboFeeds, storeFeeds.getAt(0));
			        }
                }
            }
        });

        this.comboFeeds = new Ext.form.ComboBox({
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
                select : this.selectFeeds

            }
        });
        

        this.tbar = {
            xtype : 'toolbar',
            defaults : {
                scope : this
            },
            items : [ this.comboFeeds ]
        };

        /**/

        sitools.component.users.portal.feedsReaderPortal.superclass.initComponent.call(this);

    },

    selectFeeds : function (combo, rec, index) {
        this.remove(this.feedsReader);
        var url = loadUrl.get('APP_URL') + loadUrl.get('APP_PORTAL_URL') + "/" + this.portalId + "/clientFeeds/" + rec.data.name;

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

Ext.reg('sitools.component.users.portal.feedsReaderPortal', sitools.component.users.portal.feedsReaderPortal);
