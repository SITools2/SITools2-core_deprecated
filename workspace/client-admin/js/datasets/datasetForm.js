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
/*global Ext, sitools, ID, i18n, document, showResponse, alertFailure, LOCALE, ImageChooser*/
Ext.namespace('sitools.admin.datasets');


/**
 * Define the window of the dataset Configuration
 * @cfg {String} url the Url to save the data (only when modify)
 * @cfg {String} action (required) "active", "modify" "view"
 * @cfg {Ext.data.Store} store (required) : the datasets store 
 * @class sitools.admin.datasets.datasetForm
 * @extends Ext.Panel
 */
//sitools.component.datasets.datasetForm = Ext.extend(Ext.Panel, {
sitools.admin.datasets.datasetForm = Ext.extend(Ext.Panel, {
    initComponent : function () {
		var action = this.action;

        //Datasource Store
        var storeDataSource = new Ext.data.JsonStore({
            fields : [ 'id', 'name', 'sitoolsAttachementForUsers' ],
            url : this.urlDatasources,
            root : "data",
            listeners : {
				scope : this, 
				load : function (store, recs) {
					if (Ext.isEmpty(this.comboDataSource.getValue())) {
						if (!Ext.isEmpty(recs[0])) {
							this.comboDataSource.setValue(recs[0].id);
						}
					}
				}
            }
        });
        /**
         * Combo to select Datasources.
         * Uses the storeDataSource.
         */
        this.comboDataSource = new Ext.form.ComboBox({
            disabled : this.action == 'view' ? true : false, 
            id : "comboDataSource",
            store : storeDataSource,
            fieldLabel : i18n.get('label.dataSource'),
            displayField : 'name',
            valueField : 'id',
            typeAhead : true,
            mode : 'local',
            name : 'comboDataSource',
            forceSelection : true,
            triggerAction : 'all',
            editable : false,
            emptyText : i18n.get('label.dataSourceSelect'),
            selectOnFocus : true,
            anchor : '50%',
            value : "",
            listeners : {
                scope : this,
                change : function (field, newValue, oldValue) {
                    this.getBubbleTarget().fireEvent("datasourceChanged", field, newValue, oldValue);
                }
            },
            validator : function (value) {
                if (Ext.isEmpty(value)) {
                    return false;
                } else {
                    return true;
                }
            }
        });

        Ext.apply(this, {
            layout : 'fit', 
            title : i18n.get('label.datasetInfo'),
            items : [ {
                xtype : 'form',
                border : false,
                padding : 10,
                defaults : {
					disabled : this.action == 'view' ? true : false
                }, 
                items : [ {
                    xtype : 'hidden',
                    name : 'id'
                }, {
                    xtype : 'textfield',
                    name : 'name',
                    fieldLabel : i18n.get('label.name'),
                    anchor : '95%',
                    vtype : "name", 
                    maxLength : 50
                }, {
                    xtype : 'textfield',
                    name : 'description',
                    fieldLabel : i18n.get('label.description'),
                    anchor : '95%',
                    maxLength : 200
                }, {
                    xtype : 'sitoolsSelectImage',
                    name : 'image',
                    vtype : "image", 
                    fieldLabel : i18n.get('label.image'),
                    anchor : '95%',
                    growMax : 400

                }, this.comboDataSource, {
                    xtype : 'textfield',
                    vtype : "attachment", 
                    name : 'sitoolsAttachementForUsers',
                    id : 'sitoolsAttachementForUsers',
                    fieldLabel : i18n.get('label.userAttach'),
                    anchor : '95%',
                    maxLength : 100
                }, {
                    xtype : 'checkbox',
                    name : 'visible',
                    id : 'visible',
                    fieldLabel : i18n.get('label.isVisible'),
                    anchor : '95%',
                    maxLength : 100
                }, {
                    xtype : 'textfield',
                    disabled : true,
                    name : 'expirationDate',
                    id : 'expirationDate',
                    fieldLabel : i18n.get('label.expirationDate'),
                    anchor : '95%',
                    maxLength : 100
                }, {
                    xtype : 'htmleditor',
                    id : 'descriptionHTML',
                    fieldLabel : i18n.get('label.descriptionHTML'),
                    height : 150,
                    anchor : '95%'
                }, {
                    xtype : 'hidden',
                    name : 'dirty', 
                    value : false
                } ]
            } ], 
            listeners : {
				"activate" : function () {
					if (action == 'view') {
						this.getEl().mask();
					}
				}
            }
        });
        
		
		
		sitools.admin.datasets.datasetForm.superclass.initComponent.call(this);
    }, 
    /**
     * Get the combo of dataSources
     * @return {Ext.form.ComboBox}
     */
    getDataSourceCombo : function () {
		return this.comboDataSource;
    },
//    /**
//     * Get the combo of Dataviews
//     * @return {Ext.form.ComboBox}
//     */
//    getDatasetViewsCombo : function () {
//		return this.comboDatasetViews;
//    }, 
    /**
     * Get the url of the datasource
     * @return {string}
     */
    getDataSourceUrl : function () {
		var record = this.getDataSourceCombo().getStore().getById(this.getDataSourceCombo().getValue());
        if (!record) {
            return false;
        }
		return record.data.sitoolsAttachementForUsers;
    }
	
});

