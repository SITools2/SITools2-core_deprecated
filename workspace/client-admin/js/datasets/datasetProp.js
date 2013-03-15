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
/*global Ext, sitools, ID, i18n, document, showResponse, SITOOLS_DATE_FORMAT, SITOOLS_DEFAULT_IHM_DATE_FORMAT, alertFailure, LOCALE, ImageChooser, loadUrl*/
Ext.namespace('sitools.component.datasets');


/**
 * Define the window of the dataset Configuration
 * @cfg {String} url the Url to save the data (only when modify)
 * @cfg {String} action (required) "active", "modify" "view"
 * @cfg {Ext.data.Store} store (required) : the datasets store 
 * 
 * @class sitools.component.datasets.datasetsMultiTablesPanel
 * @requires Ext.ux.PanelRecherche
 * @extends Ext.Window
 */
sitools.component.datasets.datasetsMultiTablesPanel = Ext.extend(Ext.Window, {
	closeAction : 'close', 
    initComponent : function () {
        Ext.apply(this, sitools.admin.datasets.abstractDatasetWin);
		//do it when loadUrl is ready.
        this.urlDictionary = loadUrl.get('APP_URL') + loadUrl.get('APP_DICTIONARIES_URL');
        this.urlDatasources = loadUrl.get('APP_URL') + loadUrl.get('APP_DATASOURCES_URL');
        this.urlDimension = loadUrl.get('APP_URL') + loadUrl.get('APP_DIMENSIONS_ADMIN_URL') + '/dimension';
        this.urlDatasetViews = loadUrl.get('APP_URL') + loadUrl.get('APP_DATASETS_VIEWS_URL');
        var action = this.action;
        if (this.action == 'modify') {
            this.title = i18n.get('label.modifyDataset');
        }
        
        if (this.action == 'create') {
            this.title = i18n.get('label.datasetProject');
        }
        if (this.action == 'view') {
            this.title = i18n.get('label.viewDataset');
        }

        /**
         * Construction de la grille Fields Setup
         */
        this.gridColumn = new sitools.admin.datasets.gridFieldSetup({
			urlDictionary : this.urlDictionary, 
			urlDimension : this.urlDimension, 
			action : action, 
			urlDataset : this.url
        });
		
		this.gridColumn.addListener('activate', function (panel) {
			if (action == 'view') {
				panel.getEl().mask();
			}
		});
		
		/**
		 * The main form of the dataset definition. 
		 */
		this.formulairePrincipal = new sitools.admin.datasets.datasetForm({
			urlDatasetViews : this.urlDatasetViews, 
			action : this.action, 
			urlDatasources : this.urlDatasources, 
			observer : this
		});

        /**
         * Proxy used to request a datasource
         * @type Ext.data.HttpProxy
         */
        this.httpProxyJDBC = new Ext.data.HttpProxy({
            url : loadUrl.get('APP_URL'),
            restful : true,
            method : 'GET'
        });

        /**
         * This store contains all tables of a datasource.
         * @type Ext.data.JsonStore
         */
        this.storeTablesJDBC = new Ext.data.JsonStore({
            root : "database.tables",
            fields : [ {
                name : 'url'
            }, {
                name : 'schemaName',
                mapping : 'schema'
            }, {
                name : 'name'
            } ],
            proxy : this.httpProxyJDBC,
            listeners : {
                scope : this,
                beforeload : function () {
                    this.dataSourceUrl = this.formulairePrincipal.getDataSourceUrl();
                    this.httpProxyJDBC.setUrl(this.dataSourceUrl);
                    this.httpProxyColumns.setUrl(this.dataSourceUrl);
                }
            }
        });

        /**
         * The columnModel of the grid that displays the tables of a datasource.
         * @type Ext.grid.ColumnModel
         */
        this.cmTablesJDBC = new Ext.grid.ColumnModel({
            columns : [ {
                id : 'name',
                header : i18n.get('headers.name'),
                width : 160,
                sortable : true,
                dataIndex : 'name'
            } ]
        });

        /**
         * The grid that displays the tables of a datasource.
         * @type Ext.grid.ColumnModel
         */
        this.gridTablesJDBC = new Ext.grid.GridPanel({
            layout : 'fit', 
            store : this.storeTablesJDBC,
            cm : this.cmTablesJDBC,
            sm : new Ext.grid.RowSelectionModel({}),
            enableDragDrop : true,
            stripeRows : true,
            title : 'Tables JDBC',
            id : 'Tables_JDBC'
        });

        // Creation de la grid des tables du dataset
        var cmTablesDataSet = new Ext.grid.ColumnModel({
            columns : [ {
                id : 'name',
                header : i18n.get('headers.name'),
                width : 160,
                sortable : true,
                dataIndex : 'name'
            }, {
                id : 'alias',
                header : i18n.get('headers.tableAlias'),
                width : 80,
                sortable : true,
                dataIndex : 'alias',
                editor : new Ext.form.TextField({
		            disabled : this.action == 'view' ? true : false
                })
            } ]
        });

        /**
         * The store that contains the tables of a Dataset.
         * @type Ext.grid.ColumnModel
         */
        this.storeTablesDataset = new sitools.widget.JsonStore({
            id : 'storeTablesDataset',
            fields : [ {
                name : 'id',
                type : 'string'
            }, {
                name : 'name',
                type : 'string'
            }, {
                name : 'alias',
                type : 'string'
            }, {
                name : 'schemaName',
                type : 'string'
            }

            ]
        });

        /**
         * The grid that displays the tables of a dataset.
         * @type Ext.grid.ColumnModel
         */
        this.gridTablesDataset = new Ext.grid.EditorGridPanel({
            layout : 'fit', 
            store : this.storeTablesDataset,
            cm : cmTablesDataSet,
            sm : new Ext.grid.RowSelectionModel({}),
            autoScroll : true,
            enableDragDrop : true,
            stripeRows : true,
            title : 'Tables Dataset'
        });

        var displayPanelTables = new sitools.component.datasets.selectItems({
			grid1 : this.gridTablesJDBC, 
			grid2 : this.gridTablesDataset, 
			defaultRecord : {}
        });
		
        var panelSelectTables = new Ext.Panel({
            title : i18n.get('label.selectTables'), // "select Tables",
            layout : 'fit', 
            items : [ displayPanelTables ],
            id : "selectTablesPanel",
            listeners : {
                scope : this,
                activate : function (panel) {
                    this.storeTablesJDBC.load();
					if (action == 'view') {
						panel.getEl().mask();
					}
					// Correction bug Table alias KO - ID: 3566683
					var indexAlias = this.gridTablesDataset.getColumnModel().getIndexById('alias');
					if (this.gridColumn.getStore().getCount() > 0){
					    this.gridTablesDataset.getColumnModel().setEditable(indexAlias, false);
					}
					else {
					    this.gridTablesDataset.getColumnModel().setEditable(indexAlias, true);
					}
                },
                // Permet de prendre en compte la nouvelle valeur
                // d'une cellule qui a le focus en changeant de tabPanel
                deactivate : function (panel) {
                    this.gridTablesDataset.stopEditing(false);
                }
            }
        });

        // Creation de la grid des columns d'une table
        /**
         * The proxy used to get the description of a JDBC table
         * @type Ext.data.HttpProxy
         */
        this.httpProxyColumns = new Ext.data.HttpProxy({
            url : "/",
            restful : true,
            method : 'GET'
        });

        var storeColumnTables = new Ext.data.JsonStore({
            proxy : this.httpProxyColumns,
            root : "table.attributes",
            autoLoad : false,
            fields : [ {
                name : 'name'
            }, {
                name : 'tableName'
            }, {
                name : 'schemaName'
            }, {
                name : 'structure'
            }, {
                name : 'nomAffiche'
            }, {
                name : 'sqlColumnType',
                mapping : 'type'
            }, {
                name : 'javaSqlColumnType',
                mapping : 'javaSqlType'
            }, {
                name : 'columnClass'
            }],
            listeners : {
                scope : this,
                beforeload : function (store) {                    
                    var record = this.formulairePrincipal.getDataSourceCombo().getStore().getById(this.formulairePrincipal.getDataSourceCombo().getValue());
                    this.dataSourceUrl = record.data.sitoolsAttachementForUsers;
                    if (!this.dataSourceUrl) {
                        return false;
                    }
                    this.httpProxyJDBC.setUrl(this.dataSourceUrl);
                    this.httpProxyColumns.setUrl(this.dataSourceUrl);
                },
                add : function (store, records) {
                    Ext.each(records, function (record) {
                        record.data.structure = {
                            tableName : record.data.tableName,
                            tableAlias : record.data.tableAlias,
                            schemaName : record.data.schemaName,
                            dataIndex : record.data.dataIndex                            
                        };
                        var tmp = record.data.tableAlias ? record.data.tableAlias : record.data.tableName;
                        tmp += "." + record.data.dataIndex;
                        record.data.nomAffiche = tmp;
                    });
                }
            }

        });

        var cmColumnTables = new Ext.grid.ColumnModel({
            columns : [ {
                id : 'tableName',
                header : i18n.get('headers.tableName'),
                sortable : true,
                dataIndex : 'tableName'
            }, {
                id : 'name',
                header : i18n.get('headers.name'),
                sortable : true,
                dataIndex : 'dataIndex'
            } ]
        });
        
        var cmColumnDataset = new Ext.grid.ColumnModel({
            columns : [ {
                id : 'tableAlias',
                header : i18n.get('headers.tableAlias'),
                sortable : true,
                dataIndex : 'tableAlias'
            }, {
                id : 'tableName',
                header : i18n.get('headers.tableName'),
                sortable : true,
                dataIndex : 'tableName'
            }, {
                id : 'name',
                header : i18n.get('headers.name'),
                sortable : true,
                dataIndex : 'dataIndex'
            } ]
        });

        /**
         * The grid used to display the columns of selected tables
         * @type Ext.grid.GridPanel
         */
        this.gridColumnTables = new Ext.grid.GridPanel({
			layout : 'fit', 
            store : storeColumnTables,
            id : "gridColumnTables", 
            cm : cmColumnTables,
            enableDragDrop : true,
            stripeRows : true,
            title : 'Columns Table'
        });

        // !!! le store de cette grille est le meme que celui de fields
        // setup....
        /**
         * The grid used to display the columns of the Dataset
         * @type Ext.grid.GridPanel
         */
        this.gridColumnDataSet = new Ext.grid.GridPanel({
			layout : 'fit', 
            store : this.gridColumn.getStore(),
            cm : cmColumnDataset,
            autoScroll : true,
            enableDragDrop : true,
            stripeRows : true,
            title : 'Columns Dataset'
        });

        var defaultRecord = [ {
            name : 'width',
            value : this.defaultColumnWidth
        }, {
            name : 'visible',
            value : this.defaultColumnVisible
        }, {
            name : 'sortable',
            value : this.defaultColumnSortable
        }, {
            name : 'filter',
            value : this.defaultColumnFiltrable
        }, {
            name : 'specificColumnType',
            value : 'DATABASE'
        } ];
        var displayPanel = new sitools.component.datasets.selectItems({
			grid1 : this.gridColumnTables, 
			grid2 : this.gridColumnDataSet, 
			defaultRecord : defaultRecord
        });
		displayPanel.addListener('activate', function (panel) {
			if (action == 'view') {
				panel.getEl().mask();
			}
		});

        /**
         * the third tab of the window.
         */
        this.panelSelectFields = new Ext.Panel({
            layout : 'fit', 
            title : i18n.get('label.selectFields'),
            items : [ displayPanel ],
            id : "datasetsMultiTablesPanel_SelectFields",
            listeners : {
                scope : this,
                // lorsque l'on arrive sur ce panel, on charge le store
                // de la
                // table gridColumnTAbles
                activate : function (panel) {
					this.loadColumnsJDBC();
					if (action == 'view') {
						panel.getEl().mask();
					}
                }
            }
        });

        /**
         * The panel that displays the join conditions.
         * @type sitools.admin.datasets.joinPanel
         */
        this.wizardJoinCondition = new sitools.admin.datasets.joinPanel({
			datasetId : this.datasetId, 
			gridTablesDataset : this.gridTablesDataset, 
			action : this.action,
			storeColumnDataset : this.gridColumnDataSet.getStore()
        });
        /**
         * the panel that displays the where clause
         * @type Ext.ux.PanelRecherche
         */
        this.wizardWhereClause = new Ext.ux.PanelRecherche('whereClauseId', i18n.get('label.wizardWhereClause'), this.gridColumn.getStore(), 'where');
        /**
         * the panel that displays the SQL specific query.
         * @type Ext.Panel
         */
        this.SqlWhereClause = new Ext.Panel({
            height : 350,
            items : [ {
                xtype : 'form',
                items : [ {
                    xtype : 'textarea',
                    id : "sqlQuery",
                    autoScroll : true,
                    height : 350,
                    anchor : '100%',
                    name : "sqlQuery", 
                    validator : function (value) {
						if (value.toLowerCase().match("where")) {
							if (value.toLowerCase().match("from")) {
								return true;
							}
							else {
								return false;
							}
						}
						else {
							return false;
						}
						
                    }, 
                    invalidText : i18n.get('label.invalidSQl')
                } ]

            } ]
        });
        var selecteur = new Ext.form.FormPanel({
            height : 30, 
            flex : 0.1, 
            id : "selecteurId", 
            items : [ {
                xtype : 'radiogroup',
                id : 'radioQueryType',
                fieldLabel : i18n.get('label.queryType'),
                width : 300,
                height : 30,
                items : [ {
					disabled : this.action == 'view' ? true : false, 
                    boxLabel : i18n.get('label.assistant'),
                    name : 'queryType',
                    inputValue : "W",
                    checked : true
                }, {
		            disabled : this.action == 'view' ? true : false, 
                    boxLabel : i18n.get('label.sql'),
                    name : 'queryType',
                    inputValue : "S"
                } ],
                listeners : {
                    scope : this,
                    change : function (radioGroup, radio) {
                        if (!Ext.isEmpty(radio)) {
							this.queryType = radio.inputValue;
                        }
                        if (this.queryType == 'W') {
	                        this.whereClausePanel.remove(this.SqlWhereClause, false);
	                        this.SqlWhereClause.hide();
	                        
	                        this.whereClausePanel.add(this.wizardJoinCondition);
	                        this.whereClausePanel.add(this.wizardWhereClause);
	                        this.wizardJoinCondition.show();
	                        this.wizardWhereClause.show();
	                        
	                        this.whereClausePanel.doLayout();
                        } else {
	                        this.whereClausePanel.remove(this.wizardJoinCondition, false);
	                        this.whereClausePanel.remove(this.wizardWhereClause, false);
	                        this.wizardJoinCondition.hide();
	                        this.wizardWhereClause.hide();
	                        
	                        this.whereClausePanel.add(this.SqlWhereClause);
	                        this.SqlWhereClause.show();
	                        this.whereClausePanel.doLayout();
                        }
                    }
                }
            } ]
        });
        /**
         * A single container with a flex layout. 
         * @type Ext.Panel
         */
        this.whereClausePanel = new Ext.Panel({
			flex : 0.9, 
			layout : "vbox", 
			layoutConfig : {
				align : "stretch"
			}
		});    
        var panelWhere = new Ext.Panel({
            layout : "vbox",
            layoutConfig : {
				align : "stretch", 
				flex : "ratio"
            }, 
            title : i18n.get('label.whereClause'),
            items : [ selecteur, this.whereClausePanel],
            listeners : {
                scope : this,
                activate : function () {
                    if (this.queryType == 'W') {
                        this.loadColumnsJDBC();
                        this.wizardJoinCondition.buildDefault();
                        this.whereClausePanel.add([this.wizardJoinCondition, this.wizardWhereClause]);
                        this.whereClausePanel.doLayout();
                        //this.wizardJoinCondition.show();
                        //this.wizardWhereClause.show();
                        //this.SqlWhereClause.hide();
                    } else {
                        this.whereClausePanel.add(this.SqlWhereClause);
                        this.whereClausePanel.doLayout();
                        //this.wizardJoinCondition.hide();
                        //this.wizardWhereClause.hide();
                        //this.SqlWhereClause.show();
                    }
                }
            }

        });
		panelWhere.addListener('activate', function () {
			if (action == 'view') {
				this.getEl().mask();
			}
		});
		
		var storeProperties = new Ext.data.JsonStore({
            fields : [ {
                name : 'name',
                type : 'string'
            }, {
                name : 'type',
                type : 'string'
            }, {
                name : 'value',
                type : 'string'
            } ],
            autoLoad : false
        });
        var smProperties = new Ext.grid.RowSelectionModel({
            singleSelect : true
        });
        
        var storeTypesProperties = new Ext.data.JsonStore({
            fields : ['name'],
            data : [{name : "String"}, {name : "Enum"}, {name : "Numeric"}, {name : "Date"}]
        });
	    var comboTypesProperties = new Ext.form.ComboBox({
	        store : storeTypesProperties, 
	        mode : 'local',
	        typeAhead : true,
	        triggerAction : 'all',
	        forceSelection : true,
	        selectOnFocus : true,
	        dataIndex : 'orderBy',
	        lazyRender : true,
	        listClass : 'x-combo-list-small',
	        valueField : 'name',
	        displayField : 'name',
	        tpl : '<tpl for="."><div class="x-combo-list-item comboItem">{name}</div></tpl>', 
	        width : 55
	    });

        var cmProperties = new Ext.grid.ColumnModel({
            columns : [ {
                header : i18n.get('headers.name'),
                dataIndex : 'name',
                editor : new Ext.form.TextField()
            }, {
                header : i18n.get('headers.type'),
                dataIndex : 'type', 
                editor : comboTypesProperties
            }, {
                header : i18n.get('headers.value'),
                dataIndex : 'value',
                editor : new Ext.form.TextField()
            }],
            defaults : {
                sortable : false,
                width : 100
            }
        });
        var tbar = {
            defaults : {
                scope : this
            },
            items : [ {
                text : i18n.get('label.create'),
                icon : loadUrl.get('APP_URL') + '/common/res/images/icons/toolbar_create.png',
                handler : this.onCreateProperty
            }, {
                text : i18n.get('label.delete'),
                icon : loadUrl.get('APP_URL') + '/common/res/images/icons/toolbar_delete.png',
                handler : this.onDeleteProperty
            } ]
        };
        
        /**
         * A panel to display Properties and manage them. 
         * The editor for the value column is build on the beforeEdit event and the value is formated to string if the afteredit event;
         */
        this.gridProperties = new Ext.grid.EditorGridPanel({
            title : i18n.get('title.properties'),
            id : 'componentGridProperties',
            tbar : tbar, 
            anchor : "95%", 
            height : 180,
            store : storeProperties,
            cm : cmProperties,
            sm : smProperties,
            viewConfig : {
                forceFit : true
            }, 
            listeners : {
				scope : this, 
				activate : function (panel) {
                    if (action == 'view') {
						panel.getEl().mask();
					}
                },
				beforeedit : function (e) {
					//Créer l'éditeur en fonction du type 
					if (e.column == 2) {
						var grid = e.grid;
						var rec = e.record;
						var column = grid.getColumnModel().columns[e.column];
						if (Ext.isEmpty(rec.get("type"))) {
							return false;
						}
						var editor;
						switch (rec.get('type')) {
						case "String" : 
							editor = new Ext.form.TextField();
							break;
						
						case "Numeric" : 
							editor = new Ext.form.NumberField();
							break;
						case "Date" : 
							editor = new Ext.form.DateField({
								format : SITOOLS_DEFAULT_IHM_DATE_FORMAT, 
								showTime : true
							});
							break;
						case "Enum" : 
							editor = new Ext.form.TextField();
							break;
						}
						
						column.setEditor(editor);
					}
					return true;
				}, 
				afteredit : function (e) {
					//Formatter en string
					if (e.column == 2) {
						var grid = e.grid;
						var rec = e.record;
						var column = grid.getColumnModel().columns[e.column];
						var value = e.value;
						if (Ext.isEmpty(rec.get("type"))) {
							return false;
						}
						switch (rec.get('type')) {
						case "String" : 
							value = String.format(value);
							break;
						
						case "Numeric" : 
							value = Ext.util.Format(value, "0.00");
							break;
						case "Date" : 
							value = value.format(SITOOLS_DEFAULT_IHM_DATE_FORMAT);
							break;
						case "Enum" : 
							value = String.format(value);
							break;
						}
						rec.set("value", value);	
					}
					
				}
            }
        });
        
        this.viewConfigPanel = new sitools.admin.datasets.datasetViewConfig({
			urlDatasetViews : this.urlDatasetViews, 
			action : this.action
        });
        

        /**
         * The main tabPanel of the window
         * @type Ext.TabPanel
         */
        this.tabPanel = new Ext.TabPanel({
            height : 450, 
            layoutConfig : {
				layoutOnCardChange : true
            }, 
            activeTab : 0,
            items : [ this.formulairePrincipal, this.gridProperties, panelSelectTables, this.panelSelectFields, this.gridColumn, panelWhere, this.viewConfigPanel ],
            buttons : [ {
                text : i18n.get('label.ok'),
                scope : this,
                handler : this.onValidate, 
                disabled : action == "view" ? true : false

            }, {
                text : i18n.get('label.cancel'),
                scope : this,
                handler : function () {
                    this.close();
                }
            } ], 
            listeners : {
				scope : this, 
				beforetabchange : function (tabP, newTab, currentTab) {
					
					if (!Ext.isEmpty(currentTab) && currentTab.id == "gridColumnSelect") {
						
						var check = this.gridColumn.gridFieldSetupValidation();
						if (! check.success) {
				            var tmp = new Ext.ux.Notification({
					            iconCls : 'x-icon-information',
					            title : i18n.get('label.error'),
					            html : check.message,
					            autoDestroy : true,
					            hideDelay : 1000
					        }).show(document);
					        return false;
				        }
					}
					return true;
				}, 
				datasourceChanged : function (field, newValue, oldValue) {
					var record = this.formulairePrincipal.getDataSourceCombo().getStore().getById(newValue);
                    this.dataSourceUrl = record.data.sitoolsAttachementForUsers;
                    this.httpProxyJDBC.setUrl(this.dataSourceUrl);
                    this.httpProxyColumns.setUrl(this.dataSourceUrl);
                    if (newValue != oldValue) {
                        if (this.gridColumnDataSet.getStore().getCount() > 0  ||
                                this.wizardWhereClause.getStore().getCount() > 0 || this.storeTablesDataset.getCount() > 0 ||
                                (Ext.getCmp('sqlQuery').getValue() && Ext.getCmp('sqlQuery').getValue() !== "")) {
                            var tot = Ext.Msg.show({
                                title : i18n.get('label.delete'),
                                buttons : Ext.Msg.YESNO,
                                msg : i18n.get('warning.changeDatasource'),
                                scope : this,
                                fn : function (btn, text) {
                                    if (btn == 'yes') {
                                        this.gridColumnDataSet.getStore().removeAll();
                                        this.wizardJoinCondition.deleteJoinPanelItems();
                                        this.wizardWhereClause.getStore().removeAll();
                                        this.storeTablesDataset.removeAll();
                                        Ext.getCmp('sqlQuery').setValue("");
                                    } else {
                                        field.setValue(oldValue);
                                    }
                                }

                            });
                        }
                    }
				}
            }

        });
        this.listeners = {
			scope : this, 
			resize : function (window, width, height) {
				var size = window.body.getSize();
				this.tabPanel.setSize(size);
			}

        };
        this.items = [ this.tabPanel ];
        sitools.component.datasets.datasetsMultiTablesPanel.superclass.initComponent.call(this);
    }, 
    /**
     * @method
     * Execute the parent onRender, and load the dataset, if url is set.
     */
    onRender : function () {
        sitools.component.datasets.datasetsMultiTablesPanel.superclass.onRender.apply(this, arguments);
        if (this.url) {
			this.loadDataset();
        }
    }, 
    /**
     * called when user click on Ok button. 
     * it will 
     * <ul class="mdetail-params">
     * <li>check the dataset (calling datasetValidation())</li>
     * <li>build the json object of the Dataset</li>
     * <li>call a method (PUT or POST depending on Action config)</li>
     * </ul>
     * @method
     */
    onValidate : function () {
        var datasetValidation = this.datasetValidation();
        if (!datasetValidation.success) {
            Ext.Msg.alert(i18n.get('label.error'), datasetValidation.message);
            return;
        }
        
        var f = this.findByType('form')[0].getForm();
        if (!f.isValid()) {
            Ext.Msg.alert(i18n.get('label.error'), i18n.get('warning.invalidForm'));
            return;
        }

        var putObject = {};
        Ext.iterate(f.getValues(), function (key, value) {
            if (key == 'image') {
                // TODO : definir une liste de mediaType et type
                putObject.image = {};
                putObject.image.url = value;
                putObject.image.type = "Image";
                putObject.image.mediaType = "Image";
            } else if (key == 'comboDataSource') {
                putObject.datasource = {};
                putObject.datasource.url = this.dataSourceUrl;
                putObject.datasource.id = this.formulairePrincipal.getDataSourceCombo().getValue();
                putObject.datasource.type = "datasource";
                putObject.datasource.mediaType = "datasource";
            } else if (key != "visible") {
                putObject[key] = value;
            }
        }, this);
        
        putObject.datasetView = {};
        var storeDatasetView = this.viewConfigPanel.getDatasetViewsCombo().getStore();
        var indexSelected = storeDatasetView.find("id", this.viewConfigPanel.getDatasetViewsCombo().getValue());
        var recDatasetView = storeDatasetView.getAt(indexSelected);
        putObject.datasetView = recDatasetView.data;
		
        putObject.datasetViewConfig = this.viewConfigPanel.getParametersValue();
        
        //save Properties...
        putObject.properties = [];
        this.gridProperties.getStore().each(function (rec) {
			if (rec.data.type == "Date") {
			    var dateValue = rec.get("value");
			    var date = Date.parseDate(dateValue, SITOOLS_DEFAULT_IHM_DATE_FORMAT);
			    if (!Ext.isEmpty(date)) {
					rec.data.value = date.format(SITOOLS_DATE_FORMAT);
			    }
			}
			putObject.properties.push(rec.data);
        });
        
        //visible field handling
        var visibleField = f.findField("visible");
        putObject.visible = visibleField.getValue();
        
        putObject.queryType = this.queryType;

        putObject.sqlQuery = Ext.getCmp('sqlQuery').getValue();

        if (this.wizardJoinCondition && this.wizardWhereClause) {
            putObject.predicat = [];
        }
        if (this.wizardWhereClause) {
            this.wizardWhereClause.getStore().each(function (item) {
                putObject.predicat.push({
                    closedParenthesis : item.data.parentheseFermante,
                    openParenthesis : item.data.parentheseOuvrante,
                    logicOperator : item.data.opLogique,
                    compareOperator : item.data.operateur,
                    leftAttribute : item.data.leftAttribute,
                    rightValue : item.data.rightAttribute
                });
            });
        }

        putObject.structures = [];
        this.gridTablesDataset.getStore().each(function (item) {
            putObject.structures.push({
                alias : item.data.alias,
                name : item.data.name,
                schemaName : item.data.schemaName,
                type : 'table'
            });
        });

        var store = this.gridColumn.getStore();
        store.clearFilter();
        if (store.getCount() > 0) {
            putObject.columnModel = [];
            var i;
            for (i = 0; i < store.getCount(); i++) {
                var rec = store.getAt(i).data;

                var tmp = {
                    id : rec.id,
                    dataIndex : rec.dataIndex,
                    header : rec.header,
                    toolTip : rec.toolTip,
                    width : rec.width,
                    sortable : rec.sortable,
                    orderBy : rec.orderBy, 
                    visible : rec.visible,
                    filter : rec.filter,
                    sqlColumnType : rec.sqlColumnType,
                    columnOrder : rec.columnOrder,
                    primaryKey : rec.primaryKey,
                    schema : rec.schemaName,
                    tableAlias : rec.tableAlias,
                    tableName : rec.tableName,
                    specificColumnType : rec.specificColumnType,
                    columnAlias : rec.columnAlias, 
                    datasetDetailUrl : rec.datasetDetailUrl, 
                    columnAliasDetail : rec.columnAliasDetail, 
                    javaSqlColumnType : rec.javaSqlColumnType,
                    format : rec.format,
                    columnClass : rec.columnClass,
                    image : rec.image, 
                    dimensionId : rec.dimensionId, 
                    unit : rec.unit
                };
                if (!Ext.isEmpty(rec.columnRendererCategory) && !Ext.isEmpty(rec.columnRenderer)) {
                    tmp.columnRenderer = rec.columnRenderer;
                }

                putObject.columnModel.push(tmp);
            }
        }
        
        //Gestion des structures
        //build Default if the panel is not activated...
        this.wizardJoinCondition.buildDefault();
        this.treeStructure = this.wizardJoinCondition.items.items[0];
        var mainTableNode = this.treeStructure.getRootNode();
        if (Ext.isEmpty(mainTableNode)) {
			Ext.Msg.alert(i18n.get('label.error'), i18n.get('label.noStructure'));
			return;
        }
        var mainTable = mainTableNode.attributes.table;
        
		var tree = [];

        var childs = mainTableNode.childNodes;
        for (var j = 0; j < childs.length; j++) {
            this.getAllNodes(childs[j], tree);
        }
        
        var structure = {
			mainTable : mainTable, 
			nodeList : tree
        };
        putObject.structure = structure;
        
        if (this.action == 'modify') {
            Ext.Ajax.request({
                url : this.url,
                method : 'PUT',
                scope : this,
                jsonData : putObject,
                success : function (ret) {
                    var Json = Ext.decode(ret.responseText);
                    if (!Json.success) {
                        Ext.Msg.alert(i18n.get('label.warning'), Json.message);
                        return;
                    }
                    this.close();
                    this.store.reload();
                },
                failure : alertFailure
            });
        } else {
            Ext.Ajax.request({
                url : this.url,
                method : 'POST',
                scope : this,
                jsonData : putObject,
                success : function (ret) {
                    var Json = Ext.decode(ret.responseText);
                    if (!Json.success) {
                        Ext.Msg.alert(i18n.get('label.warning'), Json.message);
                        return;
                    }
                    this.close();
                    this.store.reload();
				},
                failure : alertFailure
            });

        }

    }, 
    /**
     * Validate the Dataset : 
     *  - One and only one primary key
     *  - columnAlias must be unique
     * @returns {} an object with attributes : 
     *  - success : boolean
     *  - message : a message if success == false
     * 
     */
    datasetValidation : function () {
        var result = this.gridColumn.gridFieldSetupValidation();
        
        if (this.queryType == "S" && (Ext.getCmp('sqlQuery').getValue().substr(0, 4) != "FROM" || !Ext.getCmp('sqlQuery').getValue().toLowerCase().match("where"))) {
			result = {
                success : false, 
                message : i18n.get('label.invalidSQl')
            };
        }
        return result;
    }, 
    /**
     * called to refresh the store of the gridColumnTables. 
     * For each record in the gridTablesDataset, il will request the datasource to get the definition of a JDBC Table
     * @method
     */
    loadColumnsJDBC : function () {
        var store = this.gridTablesDataset.getStore();
		var record = this.formulairePrincipal.getDataSourceCombo().getStore().getById(this.formulairePrincipal.getDataSourceCombo().getValue());
        this.dataSourceUrl = record.data.sitoolsAttachementForUsers;
        if (!this.dataSourceUrl) {
            return false;
        }
		
        if (store._getDirty() || store.getModifiedRecords().length > 0) {
            var storeFields = this.gridColumnTables.getStore();
            storeFields.removeAll();

            this.httpProxyJDBC.setUrl(this.dataSourceUrl);
            this.httpProxyColumns.setUrl(this.dataSourceUrl);

            store.each(function (rec) {
                var storeFields = this.gridColumnTables.getStore();

                Ext.Ajax.request({
                    url : this.dataSourceUrl + "/" + rec.data.name,
                    method : 'GET',
                    params : {
                        tableName : rec.data.name,
                        tableAlias : rec.data.alias,
                        schemaName : rec.data.schemaName
                    },
                    scope : this,
                    success : function (ret, options) {
                        var Json = Ext.decode(ret.responseText);
                        if (Json.success) {
                            var store = this.gridColumnTables.getStore();
                            var columns = Json.table;
                            Ext.each(columns.attributes, function (column, index, columns) {
                                this.gridColumnTables.getStore().add(new Ext.data.Record({
                                    dataIndex : column.name,
                                    schemaName : options.params.schemaName,
                                    tableName : options.params.tableName,
                                    tableAlias : options.params.tableAlias,
                                    sqlColumnType : column.type,
                                    javaSqlColumnType : column.javaSqlType,
                                    columnClass : column.columnClass
                                }));
                            }, this);

                        } else {
                            Ext.Msg.alert(i18n.get('label.warning'), Json.message);
                        }
                    },
                    failure : alertFailure
                });
            }, this);
            store._setDirty(false);
            store.commitChanges();
        }
    }, 
    /**
     * A method called on create button of the property grid. 
     * Creates a new record with a String default type 
     */
    onCreateProperty : function () {
        var e = new Ext.data.Record({
			type : "String"
        });
        this.gridProperties.getStore().insert(0, e);
    },
    /**
     * Called on delete button of the property grid. 
     * Deletes all selected records. 
     */
    onDeleteProperty : function () {
        var s = this.gridProperties.getSelectionModel().getSelections();
        var i, r;
        for (i = 0; s[i]; i++) {
            r = s[i];
            this.gridProperties.getStore().remove(r);
        }
    }



});

Ext.reg('s-datasetsMultiTablesPanel', sitools.component.datasets.datasetsMultiTablesPanel);
