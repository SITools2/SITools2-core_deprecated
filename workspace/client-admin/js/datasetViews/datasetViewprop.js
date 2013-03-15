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
/*global Ext, sitools, ID, i18n, document, showResponse, alertFailure, LOCALE, ImageChooser, 
 showHelp, includeJs*/
Ext.namespace('sitools.admin.datasetView');

/**
 * A panel to edit Dataviews. 
 * @class sitools.admin.datasetView.DatasetViewPropPanel
 * @extends Ext.Window
 */
sitools.admin.datasetView.DatasetViewPropPanel = Ext.extend(Ext.Window, {
//sitools.component.datasetView.DatasetViewPropPanel = Ext.extend(Ext.Window, {
    width : 700,
    height : 480,
    modal : true,
    id : ID.PROP.DATAVIEW,
    layout : 'fit',
    initComponent : function () {
        if (this.action == 'create') {
            this.title = i18n.get('label.createDatasetView');
        } else if (this.action == 'modify') {
            this.title = i18n.get('label.modifyDatasetView');
        }
        this.items = [ {
            xtype : 'panel',
            layout : 'fit',
            title : i18n.get('label.datasetViewInfo'),
            items : [ {
                xtype : 'form',
                border : false,
                labelWidth : 150,
                padding : 10,
                items : [ {
                    xtype : 'textfield',
                    name : 'id',
                    hidden : true
                }, {
                    xtype : 'textfield',
                    name : 'name',
                    fieldLabel : i18n.get('label.name'),
                    anchor : '100%', 
                    allowBlank : false
                }, {
                    xtype : 'textfield',
                    name : 'description',
                    fieldLabel : i18n.get('label.description'),
                    anchor : '100%', 
                    allowBlank : false
                }, {
                    xtype : 'textfield',
                    name : 'jsObject',
                    fieldLabel : i18n.get('label.jsObject'),
                    anchor : '100%', 
                    allowBlank : false
                }, {
                    xtype : 'textfield',
                    name : 'fileUrl',
                    id : 'fileUrlId', 
                    fieldLabel : i18n.get('label.fileUrl'),
                    anchor : '100%', 
                    allowBlank : false
                }, {
                    xtype : 'sitoolsSelectImage',
                    name : 'imageUrl',
                    fieldLabel : i18n.get('label.image'),
                    anchor : '100%', 
                    allowBlank : true
                }, {
                        xtype : 'spinnerfield',
                        name : 'priority',
                        id : 'priorityId', 
                        fieldLabel : i18n.get('label.priority'),
                        minValue : 0,
                        maxValue : 10,
                        allowDecimals : false,
                        incrementValue : 1,
                        accelerate : true,
                        anchor : "50%", 
                        allowBlank : false
                    }]
            } ],
            buttons : [ {
                text : i18n.get('label.ok'),
                scope : this,
                handler : this._onValidate
            }, {
                text : i18n.get('label.cancel'),
                scope : this,
                handler : function () {
                    this.close();
                }
            } ]
        } ];
        sitools.admin.datasetView.DatasetViewPropPanel.superclass.initComponent.call(this);
    },
    onRender : function () {
        sitools.admin.datasetView.DatasetViewPropPanel.superclass.onRender.apply(this, arguments);
        if (this.action == 'modify') {
            var f = this.findByType('form')[0].getForm();
            Ext.Ajax.request({
                url : this.url,
                method : 'GET',
                scope : this,
                success : function (ret) {
                    var data = Ext.decode(ret.responseText);
                    f.setValues(data.datasetView);
                },
                failure : alertFailure
            });
        }
    },

    /**
     * Called when ok Button is pressed. 
     * Send a request (POST or PUT depending on action param) to the server with a definition of a datasetView JSON object.
     */
    _onValidate : function () {
        var frm = this.findByType('form')[0].getForm();
        if (!frm.isValid()) {
            Ext.Msg.alert(i18n.get('label.warning'), i18n.get('warning.invalidForm'));
            return;
        }
        var met = this.action == 'modify' ? 'PUT' : 'POST';
        var jsonObject = frm.getFieldValues();

        Ext.Ajax.request({
            url : this.url,
            method : met,
            scope : this,
            jsonData : jsonObject,
            success : function (ret) {
                //load the scripts defined in this component. 
				includeJs(frm.items.get('fileUrlId').getValue());
                this.store.reload();
                this.close();
            },
            failure : alertFailure
        });
    }

});

Ext.reg('s-datasetViewprop', sitools.admin.datasetView.DatasetViewPropPanel);
