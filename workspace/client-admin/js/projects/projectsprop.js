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
 showHelp, loadUrl*/
Ext.namespace('sitools.component.projects');

/**
 * Create, or Edit a Project 
 * @cfg {String} url the url to request the project,
 * @cfg {string} action should be "view", "modify", "create"
 * @cfg {Ext.data.Store} store the store that contains all projects
 * @cfg {string} projectName the name of the selected project if action != "create"
 * @cfg {string} projectAttachement the sitoolsAttachement of the edit project. 
 * @class sitools.component.projects.ProjectsPropPanel
 * @extends Ext.Window
 */
sitools.component.projects.ProjectsPropPanel = Ext.extend(Ext.Window, {
    width : 700,
    height : 580,
    modal : true,
    pageSize : 10,
    dataSets : "",
    id : ID.COMPONENT_SETUP.PROJECT,
	allModulesDetached : false, 
	allModulesInvisible : false, 
	
    initComponent : function () {
        var action = this.action;
        if (this.action == 'view') {
            this.title = i18n.get('label.viewProject');
        }
        if (this.action == 'modify') {
            this.title = i18n.get('label.modifyProject');            
        }
        if (this.action == 'create') {
            this.title = i18n.get('label.createProject');
        }

        var storeDataSets = new Ext.data.JsonStore({
            id : 'storeDataSets',
            fields : [ {
                name : 'id',
                type : 'string'
            }, {
                name : 'name',
                type : 'string'
            }, {
                name : 'description',
                type : 'string'
            }, {
                name : 'type',
                type : 'string'
            }, {
                name : 'mediaType',
                type : 'string'
            }, {
                name : 'visible',
                type : 'string'
            }, {
                name : 'status',
                type : 'string'
            }, {
                name : 'properties'
            }, {
                name : 'url',
                type : 'string'
            } ]
        });

        var cmDataSets = new Ext.grid.ColumnModel({
            columns : [ {
                header : i18n.get('headers.name'),
                dataIndex : 'name',
                width : 100
            }, {
                header : i18n.get('headers.description'),
                dataIndex : 'description',
                width : 100
            } ],
            defaults : {
                sortable : true,
                width : 100
            }
        });

        var smDataSets = new Ext.grid.RowSelectionModel({
            singleSelect : false
        });
        var tbar = {
            xtype : 'toolbar',
            defaults : {
                scope : this
            },
            items : [ {
                text : i18n.get('label.add'),
                hidden : this.mode == 'select',
                icon : loadUrl.get('APP_URL') + '/common/res/images/icons/toolbar_create.png',
                handler : this._onCreate
            }, {
                text : i18n.get('label.remove'),
                hidden : this.mode == 'select',
                icon : loadUrl.get('APP_URL') + '/common/res/images/icons/toolbar_delete.png',
                handler : this._onDelete
            }, '->', {
                xtype : 's-filter',
                hidden : this.mode == 'list',
                emptyText : i18n.get('label.search'),
                store : this.store,
                pageSize : this.pageSize
            } ]
        };

        /**
         * {Ext.grid.EditorGridPanel} gridDataSets The grid that displays datasets
         */
        this.gridDataSets = new Ext.grid.EditorGridPanel({
            id : 'gridDataSets',
            title : i18n.get('title.gridDataSets'),
            store : storeDataSets,
            tbar : tbar,
            cm : cmDataSets,
            sm : smDataSets,
            viewConfig : {
                forceFit : true
            }, 
            listeners : {
				"activate" : function () {
					if (action == 'view') {
						this.getEl().mask();
					}
				}
            }
        });

        /**
         * {Ext.FormPanel} formProject The main Form 
         */
        this.formProject = new Ext.FormPanel({
            title : i18n.get('label.projectInfo'),
            xtype : 'form',
            border : false,
            autoScroll : true, 
            padding : 10,
            trackResetOnLoad : true,
            items : [ {
                xtype : 'hidden',
                name : 'id'
            }, {
                xtype : 'hidden',
                name : 'maintenance'
            }, {
                xtype : 'textfield',
                name : 'name',
                fieldLabel : i18n.get('label.name'),
                anchor : '100%',
                maxLength : 30,
                allowBlank : false
            }, {
                xtype : 'textfield',
                name : 'description',
                fieldLabel : i18n.get('label.description'),
                anchor : '100%'
//                ,
//                maxLength : 100
            }, {
                xtype : 'textfield',
                vtype : "attachment",
                name : 'sitoolsAttachementForUsers',
                fieldLabel : i18n.get('label.userAttach'),
                anchor : '100%',
                maxLength : 100
            }, {
                xtype : 'sitoolsSelectImage',
                name : 'image',
                fieldLabel : i18n.get('label.image'),
                anchor : '100%',
                growMax : 400
            }, {
                xtype : 'textfield',
                name : 'css',
                fieldLabel : i18n.get('label.css'),
                anchor : '100%',
                maxLength : 100
            }, {
                xtype : 'checkbox',
                name : 'visible',
                fieldLabel : i18n.get('label.isVisible'),
                anchor : '100%',
                maxLength : 100
            }, {
                xtype : 'htmleditor',
                id : 'htmlDescription',
                fieldLabel : i18n.get('label.descriptionHTML'),
                height : 150,
                anchor : '95%'
            }, {
                xtype : 'htmleditor',
                id : 'htmlHeader',
                fieldLabel : i18n.get('label.htmlHeader'),
                height : 150,
                anchor : '95%'
            }, {
                xtype : 'htmleditor',
                id : 'maintenanceText',
                fieldLabel : i18n.get('label.maintenanceText'),
                height : 150,
                anchor : '95%'
            } ], 
            listeners : {
				"activate" : function () {
					if (action == 'view') {
						this.getEl().mask();
					}
				}
            }

        });
        
        this.allModulesAttachedBtn = new Ext.Button({
            text : this.allModulesDetached ? i18n.get('label.allDetached') : i18n.get('label.allAttached'),
            hidden : this.mode == 'select',
            icon : loadUrl.get('APP_URL') + '/common/res/images/icons/toolbar_create.png',
            handler : this._onAllModulesAttached, 
            scope : this
        });
        
        this.allModulesVisibleBtn = new Ext.Button({
            text : this.allModulesInvisible ? i18n.get('label.allInvisible') : i18n.get('label.allVisible'),
            hidden : this.mode == 'select',
            icon : loadUrl.get('APP_URL') + '/common/res/images/icons/toolbar_create.png',
            handler : this._onAllModulesVisible, 
            scope : this
        });
        
        this.listRolesBtn = new Ext.Button({
            text : i18n.get('label.rolecrud'),
            icon : loadUrl.get('APP_URL') + '/common/res/images/icons/tree_role.png',
            scope : this,
            handler : this._onRoles
        });
        
        var tbarModules = {
	        xtype : 'sitools.widget.GridSorterToolbar',
	        gridId : "gridModules", 
	        items: [this.allModulesAttachedBtn, this.allModulesVisibleBtn, this.listRolesBtn]
        };
        var storeModules  = new Ext.data.JsonStore({
            root : 'data',
            restful : true,
            remoteSort : false,
			autoSave : false,
            autoLoad : false, 
            url : loadUrl.get('APP_URL') + loadUrl.get('APP_PROJECTS_MODULES_URL'),
            idProperty : 'id',
            fields : [ {
                name : 'id',
                type : 'string'
            }, {
                name : 'name',
                type : 'string'
            }, {
                name : 'description',
                type : 'string'
            }, {
                name : 'author',
                type : 'string'
            }, {
                name : 'version',
                type : 'string'
            }, {
                name : 'url',
                type : 'string'
            }, {
				name : "icon", 
				type : "string"
            }, {
				name : "title", 
				type : "string"
            }, {
                name : 'imagePath',
                type : 'string'
            }, {
                name : 'defaultWidth'
            }, {
                name : 'defaultHeight'
            }, {
                name : 'x'
            }, {
                name : 'y'
            }, {
                name : 'xtype',
                type : 'string'
            }, {
                name : 'specificType',
                type : 'string'
            }, {
                name : 'dependencies'
            }, {
				name : "attached", 
				type : "boolean"
            }, {
				name : "visible", 
				type : "boolean"
            }, {
				name : "priority", 
				type : "numeric"
            }, {
                name : "listRoles"
            }], 
            listeners : {
				scope : this, 
				update : function (store, record) {
					var index = store.indexOf(record);
					if (record.get('attached') === false) {
						record.set("visible", false);
					}
					if (store.allAttached()) {
						this.allModulesAttachedBtn.setText(i18n.get("label.Detached"));
						this.allModulesDetached = true;
					}
					if (store.allDetached()) {
						this.allModulesAttachedBtn.setText(i18n.get("label.Attached"));
						this.allModulesDetached = false;
						this.allModulesVisibleBtn.setText(i18n.get("label.allVisible"));
						this.allModulesInvisible = false;
					}
				}
            }, 
            allAttached : function () {
				var result = true;
				this.each(function (record) {
					if (record.get("attached") === false) {
						result = false;
						return false;
					}
				});
				return result;
            }, 
            allDetached : function () {
				var result = true;
				this.each(function (record) {
					if (record.get("attached") === true) {
						result = false;
						return false;
					}
				});
				return result;
            }
        });
        var smModules = new Ext.grid.RowSelectionModel({
            singleSelect : false
        });
	    var attached = new Ext.grid.CheckColumn({
	        header : i18n.get('headers.attached'),
	        dataIndex : "attached",
	        width : 55
	    });
	    var visible = new Ext.grid.CheckColumn({
	        header : i18n.get('headers.visible'),
	        dataIndex : "visible",
	        width : 55
	    });
	    
        var cmModules = new Ext.grid.ColumnModel({
            columns : [attached,  {
                header : i18n.get('headers.name'),
                dataIndex : 'name',
                width : 100
            }, {
                header : i18n.get('headers.description'),
                dataIndex : 'description',
                width : 100
            }, visible ],
            defaults : {
                sortable : true,
                width : 100
            }
        });

        /**
         * {Ext.grid.GridPanel} modulePanel The grid that displays modules
         */
		this.modulePanel = new Ext.grid.GridPanel({
            id : 'gridModules',
            title : i18n.get('title.modules'),
            store : storeModules,
            cm : cmModules,
            sm : smModules,
            tbar : tbarModules, 
            viewConfig : {
                forceFit : true
            }, 
            listeners : {
				"activate" : function () {
					if (action == 'view') {
						this.getEl().mask();
					}
				}
            }, 
            plugins : [attached, visible]
        });
        
        /**
         * {Ext.TabPanel} tabPanel the main Item of the window
         */
        this.tabPanel = new Ext.TabPanel({
            height : 550,
            activeTab : 0,
            items : [this.formProject, this.gridDataSets, this.modulePanel ],
            buttons : [ {
                text : i18n.get('label.ok'),
                scope : this,
                handler : this.onValidate, 
                hidden : this.action == "view"
            }, {
                text : i18n.get('label.cancel'),
                scope : this,
                handler : function () {
                    this.close();
                }
            } ]        
        });
        this.items = [this.tabPanel];
		this.listeners = {
			scope : this, 
			resize : function (window, width, height) {
				var size = window.body.getSize();
				this.tabPanel.setSize(size);
			}

        };        
        sitools.component.projects.ProjectsPropPanel.superclass.initComponent.call(this);
    },
    /**
     * Create a {sitools.admin.projects.datasetsWin} datasetWindow to add datasets
     */
    _onCreate : function () {
        var up = new sitools.admin.projects.datasetsWin({
            mode : 'select',
            url : loadUrl.get('APP_URL') + '/datasets',
            storeDatasets : this.gridDataSets.getStore()
        });
        up.show(this);

    },
    /**
     * Delete a selected Dataset
     * @return {}
     */
    _onDelete : function () {
        var recs = this.gridDataSets.getSelectionModel().getSelections();
        if (recs.length === 0) {
            return Ext.Msg.alert(i18n.get('label.warning'), i18n.get('warning.noselection'));
        }
        this.gridDataSets.getStore().remove(recs);
    },
    
    _onRoles : function () {
        var rec = this.modulePanel.getSelectionModel().getSelected();
        if (!rec) {
            return Ext.Msg.alert(i18n.get('label.warning'), i18n.get('warning.noselection'));
        }
        var gp = new sitools.admin.usergroups.RolesPanel({
            mode : 'list',
            rec : rec
        });
        gp.show(ID.BOX.ROLE);
    },
    
    onUpload : function () {
        function validate(data, config) {
            config.fieldUrl.setValue(data.url);
        }
        // console.dir (this);
        var chooser = new ImageChooser({
            url : loadUrl.get('APP_URL') + '/client-admin/res/json/componentList.json',
            width : 515,
            height : 350,
            fieldUrl : this.ownerCt.items.items[0]
        });
        chooser.show(document, validate);
        // Ext.Msg.alert('upload non impl&eacute;ment&eacute;');
    },
    /**
     * Check the validity of form
     * and call onSaveProject method
     * @return {Boolean}
     */
    onValidate : function () {
		var f = this.findByType('form')[0].getForm();
        if (!f.isValid()) {
            Ext.Msg.alert(i18n.get('label.error'), i18n.get('warning.invalidForm'));
            return false;
        }
		if (this.action == 'modify') {
			var name = f.findField("name").getValue();
			var originalName = f.findField("name").originalValue;
			if (originalName != name) {
				Ext.Msg.show({
					title : i18n.get('label.warning'),
					buttons : Ext.Msg.YESNO,
					msg : i18n
							.get('projectProp.warning.projectName.changed'),
					scope : this,
					fn : function (btn, text) {
						if (btn == 'yes') {
							this.onSaveProject();
						}
					}
				});
			} else {
                this.onSaveProject();
            }
		} else {
            this.onSaveProject();
        }

	},
    /**
     * Build the object to save project. 
     * Then call a PUT or POST request (depending on action) to save project.
     */        
    onSaveProject : function () {
        var f = this.findByType('form')[0].getForm();
        var putObject = {};
        Ext.iterate(f.getValues(), function (key, value) {
            if (key == 'image') {
                // TODO : definir une liste de mediaType et type
                putObject.image = {};
                putObject.image.url = value;
                putObject.image.type = "Image";
                putObject.image.mediaType = "Image";
            } else if (key != "visible") {
                putObject[key] = value;
            }
        }, this);
        
        //visible field handling
        var visibleField = f.findField("visible");
        putObject.visible = visibleField.getValue();
        
        var store = this.findById('gridDataSets').getStore();
        if (store.getCount() > 0) {
            putObject.dataSets = [];
            store.each(function (record) {
                putObject.dataSets.push({
                    id : record.data.id,
                    description : record.data.description,
                    name : record.data.name,
                    mediaType : 'DataSet',
                    type : 'DataSet',
                    visible : record.data.visible, 
                    status : record.data.status, 
                    properties : record.data.properties, 
                    url : record.data.url
                });
            });
        }
        var storeModule = this.modulePanel.getStore();
        if (storeModule.getCount() > 0) {
            putObject.modules = [];
            var i = 0;
            storeModule.each(function (record) {
                
                
                if (record.data.attached) {
                    
                    if (Ext.isEmpty(record.data.listRoles)){
                        record.data.listRoles = undefined;
                    }
                    
					putObject.modules.push({
						author : record.data.author,
						defaultHeight : record.data.defaultHeight,
						defaultWidth : record.data.defaultWidth,
						dependencies : record.data.dependencies,
						description : record.data.description,
						id : record.data.id,
						icon : record.data.icon, 
						imagePath : record.data.imagePath,
						name : record.data.name,
						specificType : record.data.specificType,
						title : record.data.title,
						url : record.data.url,
						version : record.data.version,
						visible : record.data.visible,
						x : record.data.x,
						xtype : record.data.xtype,
						y : record.data.y,
						priority : i, 
						listRoles : record.data.listRoles
					});
					i++;
                }
            });
        }
        
        var method = (this.action == 'modify') ? "PUT" : "POST";
		
        Ext.Ajax.request({
			url : this.url,
			method : method,
			scope : this,
			jsonData : putObject,
			success : function (ret) {
				var data = Ext.decode(ret.responseText);
				if (data.success === false) {
					Ext.Msg.alert(i18n.get('label.warning'), i18n
									.get(data.message));
				} else {
					this.close();
					this.store.reload();
				}
				// Ext.Msg.alert(i18n.get('label.information'),
				// i18n.get('msg.uservalidate'));
			},
			failure : alertFailure
		});
        

    },
	/**
	 * do a specific render to fill informations from the project. 
	 */
    onRender : function () {
        sitools.component.projects.ProjectsPropPanel.superclass.onRender.apply(this, arguments);
        if (this.url) {
            // var gs = this.groupStore, qs = this.quotaStore;
            if (this.action == 'modify' || this.action == "view") {
                Ext.Ajax.request({
                    url : this.url,
                    method : 'GET',
                    scope : this,
                    success : function (ret) {
                        var f = this.findByType('form')[0].getForm();
                        var grid = this.findById('gridDataSets');
                        var store = grid.getStore();
                        var data = Ext.decode(ret.responseText).project;
                        var dataSets = data.dataSets;


                        // Chargement des dataSets disponible et mise a jour de
                        Ext.each(dataSets, function (dataSet) {
                            var rec = {};
                            rec.id = dataSet.id;
                            rec.name = dataSet.name;
                            rec.description = dataSet.description;
                            rec.type = dataSet.description;
                            rec.mediaType = dataSet.mediaType;  
                            rec.status = dataSet.status;
                            rec.visible = dataSet.visible;
                            rec.properties = dataSet.properties;
                            rec.url = dataSet.url;

                            store.add(new Ext.data.Record(rec));
                        });
                        // ceuw attaches au projet

                        var rec = {};
                        rec.id = data.id;
                        rec.name = data.name;
                        rec.description = data.description;
                        rec.sitoolsAttachementForUsers = data.sitoolsAttachementForUsers;
                        rec.image = data.image.url;
                        rec.css = data.css;
                        rec.visible = data.visible;
                        rec.htmlHeader = data.htmlHeader;
                        rec.htmlDescription = data.htmlDescription;
                        rec.maintenanceText = data.maintenanceText;
                        rec.maintenance = data.maintenance;
                        
                        var record = new Ext.data.Record(rec);

                        f.loadRecord(record);
                        this.modulePanel.getStore().load({
							scope : this, 
							callback : function (moduleRecs) {
								this.displayProjectModules(moduleRecs, data);
							}
                        });
                    },
                    failure : function (ret) {
                        var data = Ext.decode(ret.responseText);
                        Ext.Msg.alert(i18n.get('label.warning'), data.errorMessage);
                    }
                });
            }
            else {
				this.modulePanel.getStore().load({
					scope : this, 
					callback : function (moduleRecs) {
						this.displayProjectModules();
					}
	            });
            }
        }
    }, 
    /**
	 * Will fill information from the project to the modulesRecords. 
	 * Then will call a sort on the store  
     * @param {[Ext.data.Records]} modulesRecords an Array of records loaded from request to modules application
     * @param {} project the project object containing projectModules
     */
    displayProjectModules : function (modulesRecords, project) {
		if (this.action == 'create') {
			this.modulePanel.getStore().each(function (rec) {
				rec.set("attached", true);
				rec.set("visible", true);
			});
		}
		else {
			Ext.each(modulesRecords, function (moduleRec) {
				moduleRec.set("priority", modulesRecords.length + 1);
				Ext.each(project.modules, function (projectModule) {
					if (moduleRec.id == projectModule.id) {
						moduleRec.set("attached", true);
						moduleRec.set("visible", projectModule.visible);
						moduleRec.set("priority", projectModule.priority);
						moduleRec.set("listRoles", projectModule.listRoles);
						return false;
					}
				});			
			});
		}
		this.modulePanel.getStore().sort('priority');
	}, 
	/**
	 * Called when this.allModulesAttachedBtn is pressed
	 */
	_onAllModulesAttached : function () {
		this.modulePanel.getStore().each(function (rec) {
			rec.set("attached", ! this.allModulesDetached);
		}, this);
		if (this.allModulesDetached) {
			this.allModulesInvisible = false;
			this.allModulesVisibleBtn.setText(i18n.get('label.allVisible'));
		}
	}, 
	/**
	 * Called when this.allModulesVisibleBtn is pressed
	 */
	_onAllModulesVisible : function () {
		this.modulePanel.getStore().each(function (rec) {
			if (!this.allModulesInvisible) {
				rec.set("attached", ! this.allModulesInvisible);
			}
			rec.set("visible", ! this.allModulesInvisible);
		}, this);
		this.allModulesInvisible = ! this.allModulesInvisible;
		this.allModulesVisibleBtn.setText(this.allModulesInvisible ? i18n.get('label.allInvisible') : i18n.get('label.allVisible'));
	}
	
    
    

});

Ext.reg('s-projectsprop', sitools.component.projects.ProjectsPropPanel);
