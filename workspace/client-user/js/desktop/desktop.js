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
/*global alertFailure, showResponse, loadUrl, showVersion, userPreferences:true, modulesExistants:true, utils_logout, sitools, userStorage, publicStorage, DEFAULT_PREFERENCES_FOLDER, 
 getDesktop, Ext, window, i18n, SitoolsDesk, userLogin, projectGlobal, createModule, sql2ext, loadModules, DEFAULT_WIN_HEIGHT, DEFAULT_WIN_WIDTH*/
/*
 * @include "../../../client-public/js/desktop/App.js"
 * @include "../../../client-public/js/desktop/Desktop.js"
 * @include "../sitoolsProject.js"
 */
/**
 * <a href="http://sourceforge.net/tracker/?func=detail&aid=3358501&group_id=531341&atid=2158259">[3358501]</a><br/>
 * 2011/08/03 D.Arpin {Some windows did not have saveSettings Method. In this case, don't save this window Settings}
 */ 
Ext.namespace('Ext.ux', "sitools.user.desktop");
/**
 * Main Application of sitools desktop
 * When instanciate, it will : 
 *  - build an instance of Ext.app.App ()
 *  - launch initProject on projectGlobal object.
 *  
 * @requires Ext.app.App
 * @class sitools.user.Desktop.App
 */
sitools.user.desktop.App = function () {
	/**
     * <p>Create each module.</p> 
     * <p>1 - request the project to get All modules defined. </p>
     * <p>2 - As callback, create a module for each module of the project. 
     *     In case user is logged, will check if the module is in the preference list, before adding module.</p>
     */
    function callbackRESTCreateProject() {
        // tableau de modules a passer a l'application
        var modules = [];

        
        
        // Check for user authorization
        var isAuthorized = false;
		Ext.Ajax.request({
			scope : this,
			url : projectGlobal.sitoolsAttachementForUsers,
			method : 'GET',
			success : function (response) {
				if (response.status == 200) {
				    var data = Ext.decode(response.responseText);
				    isAuthorized = true;
					if (data.project.maintenance) {
						desktopReady.call(this);
						Ext.get('ux-taskbar').mask();
						var alertWindow = new Ext.Window({
							title : i18n.get('label.maintenance'),
							width : 600, 
							height : 400, 
							autoScroll : true, 
							closable : false, 
							items : [{
								xtype : 'panel', 
								layout : 'fit', 
								autoScroll : true, 
								html : data.project.maintenanceText, 
								padding : "5"
							}], 
							modal : true
						});
						alertWindow.show();
						return;
					}
					projectGlobal.modules = data.project.modules;
					Ext.each(projectGlobal.modules, function (config) {
						// par défaut, on charge tous les modules visibles par défaut si jamais il
						// n'y a pas de
						// user
						if (projectGlobal.preferences === null || Ext.isEmpty(projectGlobal.preferences.projectSettings)) {
							if (config.visible) {
								var module = createModule(config, this);
								SitoolsDesk.modulesACharger++;
								modules.push(module);
							}
						}
						// sinon, on ne charge que les modules dont les ids sont
						// chargé dans
						// les pref
						else {
							Ext.each(projectGlobal.preferences.projectSettings,
								function (pref) {
									if (pref == config.id) {
										var module = createModule(config, this);
										modules.push(module);
										SitoolsDesk.modulesACharger++;
									}
								}
							);
						}
					}, this);
					if (SitoolsDesk.modulesACharger === 0) {
						Ext.Msg.alert(i18n.get("label.warning"), i18n.get("label.noModules"));
						SitoolsDesk.fireEvent('allJsIncludesDone', this);
					}
					SitoolsDesk.app.initModules(modules);
				}
			},
			failure : function (response) {
				if (response.status == 403) {
					Ext.get('ux-taskbar').mask();
					Ext.Msg.alert(
						'Status', 
						i18n.get('warning.not.authorized'), 
						function () {
							window.location = loadUrl.get('APP_URL') + loadUrl.get('APP_CLIENT_USER_URL');
						}
					);
					return;
				}
			}
		});
    }

    /**
     * Initialize the project. 
     * Load sql2Ext settings, 
     * Call the projectGloabal initProject method
     */
    function initProject() {
    	//Add the app listeners
		SitoolsDesk.app.addListener("allJsIncludesDone", loadPreferences);
		SitoolsDesk.app.addListener("ready", desktopReady);

		sql2ext.load(loadUrl.get('APP_URL') + "/client-user/conf/sql2ext.properties");
        projectGlobal.initProject(callbackRESTCreateProject);

        // Ext.QuickTips.init();

        // Apply a set of config properties to the singleton
        Ext.apply(Ext.QuickTips.getQuickTip(), {
            maxWidth : 200,
            minWidth : 100,
            showDelay : 50,
            trackMouse : true
        });
    }
    

    /**
     * Called when deletePrefButton is pressed. 
     * Remove the public Preferences.
     */
    function deletePublicPref() {
    	publicStorage.remove();
    }
    /**
     * Called when Save button is pressed. 
     * Loop through all desktop windows and save windows settings via  userStorage.set method
     * @param forPublicUser true to save on publicStorage, false (null) to save on userStorage
     */
    function saveWindowSettings(forPublicUser) {
        var desktopSettings = [];
        getDesktop().getManager().each(function (window) {
            var urlSaveSettings, AppUserStorage;
            //Construct url to save the data, user storage or publicDataStorage
            if (forPublicUser) {
				AppUserStorage = loadUrl.get('APP_USERSTORAGE_USER_URL').replace('{identifier}', userLogin);
            }
            else {
				AppUserStorage = loadUrl.get('APP_PUBLIC_STORAGE_URL');
            }
            if (!Ext.isEmpty(window.specificType) && window.specificType == 'componentWindow') {
                var component = window.get(0);
                urlSaveSettings = loadUrl.get('APP_URL') + AppUserStorage + "/" + DEFAULT_PREFERENCES_FOLDER;
	            var fileName = "";
	            var title = window.title;
	            if (component.componentType == "form") {
	                fileName = component.componentType + component.formName;
	            }
	            else if (component.componentType == "formProject") {
	                fileName = "formProject";
	                component.datasetName = component.formName;
	            }
	            else {
	                fileName = component.componentType;
	            }
                var componentSettings = component._getSettings();
                //Bug 3358501 : add a test on Window.saveSettings.
                if (Ext.isFunction(window.saveSettings)) {
	                desktopSettings.push(window.saveSettings(component.datasetName, fileName, componentSettings, forPublicUser));
                }
            } else {
                //Bug 3358501 : add a test on Window.saveSettings.
                if (Ext.isFunction(window.saveSettings)) {
	                desktopSettings.push(window.saveSettings(window.getId(), window.getId(), null, forPublicUser));	
                }
                
            }
        });
        userPreferences = {};
        userPreferences.windowSettings = desktopSettings;
        var projectSettings = [];
        Ext.each(this.SitoolsDesk.app.getModules(), function (module) {
            projectSettings.push(module.id);
        });
        userPreferences.projectSettings = projectSettings;
        if (forPublicUser) {
			publicStorage.set("desktop", "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName, userPreferences);
        }
        else {
			userStorage.set("desktop", "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName, userPreferences);
        }

    }

    /**
     * Called when login is pressed.
     * Show a {sitools.widget.Login} window
     */
    function _onLogin() {
        var tmp = new sitools.widget.Login({
            closable : true,
            url : loadUrl.get('APP_URL') + '/login',
            register : loadUrl.get('APP_URL') + '/inscriptions/user',
            reset : loadUrl.get('APP_URL') + '/resetPassword'
        }).show();
    }

    /**
     * Called when logout is pressed.
     */
    function _onLogout() {
        utils_logout();
    }

    /**
     * private Open a window in the desktop with the Datas. If the Window with
     * the specified Id already  exists, it destroy it and rebuild it. 
     * 
     * @param {} windowSettings  
     *      {string} id (required) : windowId
     *      {string} title (required) : windowTitle, 
     *      {string} datasetName (required) : datasetName, 
     *      {string} moduleId : String
     *      {} position : [xpos, ypos]
     *      {} size : {
     *          width : w
     *          height : h
     *      }
     *      {string} specificType : sitoolsSpecificType
     *      [Ext.Button] toolbarItems 
     * @param componentConfiguration : Object containing the configuration
     * @param JsObj : the name of the Javascript Object used to build the component inside the window
     * @returns
     */
    function addWinData(windowSettings, componentCfg, JsObj, reloadComp) {
        var desktop = getDesktop();
        var win = desktop.getWindow(windowSettings.id);
        if (win) {
            if (reloadComp) {
                win.removeAll();
                win.add(new JsObj(componentCfg));
                win.doLayout();
            }
            if (win.minimized) {
                win.show();
            } 
            win.toFront();
            return;
        }
        //Create the component
        try {
            var component = new JsObj(componentCfg);
            
            var newwin;
            var winHeight = windowSettings.winHeight || DEFAULT_WIN_HEIGHT;
            var winWidth = windowSettings.winWidth || DEFAULT_WIN_WIDTH;
            
            var tbar;
            if (!Ext.isEmpty(windowSettings.toolbarItems)) {
                // Create the toolbar with the windowSettings.toolbarItems
                tbar = new Ext.Toolbar({
                    xtype : 'toolbar',
                    items : windowSettings.toolbarItems
                });
            }
            
            var fileName = "";
            var title = windowSettings.title;
            if (windowSettings.type == "form") {
                fileName = windowSettings.type + componentCfg.formName;
            }
            else if (windowSettings.type == "data" && Ext.isDefined(component.getWindowTitle)) {
                title = component.getWindowTitle(windowSettings.datasetDescription, windowSettings.datasetName);
            }
            else {
                fileName = windowSettings.type;
            }
            
            newwin = desktop.createWindow({
                id : windowSettings.id,
                stateful : false,
                title : title,             
                width : winWidth,
                height : winHeight,
                shim : false,
                tbar : tbar,
                animCollapse : false,
                constrainHeader : true,
                layout : 'fit',
                specificType : 'componentWindow',
                datasetName : windowSettings.datasetName,
                datasetDescription : windowSettings.datasetDescription,
                fileName : fileName, 
                component : component, 
                autoscroll : true,
                typeWindow : windowSettings.type,
                tools : [ {
                    id : "save",
                    scope : this, 
                    qtip : i18n.get('label.saveSettings'),
                    handler : function (event, toolEl, window) {
				        if (projectGlobal.isAdmin) {
							var ctxMenu = new Ext.menu.Menu({
								items: ['<b class="menu-title">' + i18n.get('label.chooseSave') + '</b>',
				                {
				                    text: i18n.get("label.myself"),
				                    handler : function () {
										window.saveSettings(window.datasetName, window.fileName, window.component._getSettings(), false);
				                    }
				                }, {
				                    text: i18n.get("label.publicUser"),
				                    handler : function () {
										window.saveSettings(window.datasetName, window.fileName, window.component._getSettings(), true);
				                    }
				                }] 
							});
							ctxMenu.showAt(event.getXY());
							
				        }
				        else {
							window.saveSettings(window.datasetName, window.fileName, window.component._getSettings());
				        }
					},
                    hidden : Ext.isEmpty(userLogin) || !windowSettings.saveToolbar
                } ]
            });
            var pos, size;
            pos = windowSettings.position;
            size = windowSettings.size;
            if (size !== null) {
                size = Ext.decode(size);
                newwin.setSize(size);
            }
            else {
                size = newwin.getSize();
                size.width = size.width + 1;
    
                newwin.setSize(size);
            }
            newwin.show();
    
            newwin.add(component);
    
           
    
            if (!Ext.isEmpty(pos)) {
                pos = Ext.decode(pos);
                newwin.setPosition(pos);
            }
            
            
            newwin.doLayout();
        } catch (r) {
            Ext.Msg.alert(i18n.get("label.warning"), i18n.get("label.nocomponentfound"));
            throw (r);
        }
    }
    
    /**
     * Load the module Window corresponding to the project Preference. 
     * 1 - load the module Windows
     * 2 - load the Component windows (actually only "data" type window) 
     */
    function loadPreferences() {
	    if (!Ext.isEmpty(projectGlobal.preferences)) {
		    Ext.each(projectGlobal.preferences.windowSettings, function (pref) {
		        //1° cas : les fenêtres de modules
		        if (Ext.isEmpty(pref.windowSettings.typeWindow)) {
					var moduleId = pref.windowSettings.moduleId;
		        
		            var module = SitoolsDesk.app.getModule(moduleId);
		            if (!Ext.isEmpty(module)) {
		                var win = module.createWindow();
		                var pos = pref.windowSettings.position;
		                var size = pref.windowSettings.size;
		
		                if (pos !== null && size !== null) {
		                    pos = Ext.decode(pos);
		                    size = Ext.decode(size);
		
		                    win.setPosition(pos[0], pos[1]);
		                    win.setSize(size);
		                }
		            }
		        }
		        //les autres fenêtres : on nne traite que les cas windowSettings.typeWindow == "data"
		        else {
					var type = pref.windowSettings.typeWindow;
					var componentCfg, jsObj, windowSettings;
					if (type == "data") {
					    var datasetUrl = pref.componentSettings.datasetUrl;
						Ext.Ajax.request({
							method : "GET", 
							url : datasetUrl, 
							success : function (ret) {
						        var Json = Ext.decode(ret.responseText);
						        if (showResponse(ret)) {
						            var dataset = Json.dataset;
						            var componentCfg, javascriptObject;
						            var windowConfig = {
						                datasetName : dataset.name,
						                datasetDescription : dataset.description,
						                type : type, 
						                saveToolbar : true, 
						                toolbarItems : []
						            };
						            switch (type) {
									
									case "data" : 
							            javascriptObject = eval(dataset.datasetView.jsObject);
						
							                //add the toolbarItems configuration
						                Ext.apply(windowConfig, {
						                    id : type + dataset.id
						                });
						                
						                if (dataset.description !== "") {
											windowConfig.title = dataset.description;
						                }
						                else {
											windowConfig.title = "Diplay data :" + dataset.name;
						                }
						                componentCfg = {
						                    dataUrl : dataset.sitoolsAttachementForUsers,
						                    datasetId : dataset.id,
						                    datasetCm : dataset.columnModel, 
						                    datasetName : dataset.name, 
	                    					datasetViewConfig : dataset.datasetViewConfig
						                };
						                SitoolsDesk.addDesktopWindow(windowConfig, componentCfg, javascriptObject);
						
										break;
									
									}
						        }
							}, 
							failure : alertFailure
						});	
					}
					if (type == "formProject") {
				        jsObj = sitools.user.component.forms.projectForm;
				        componentCfg = {
				            formId : pref.componentSettings.formId,
				            formName : pref.componentSettings.formName,
				            formParameters : pref.componentSettings.formParameters,
				            formWidth : pref.componentSettings.formWidth,
				            formHeight : pref.componentSettings.formHeight, 
				            formCss : pref.componentSettings.formCss, 
				            properties : pref.componentSettings.properties, 
				            urlServicePropertiesSearch : pref.componentSettings.urlServicePropertiesSearch, 
				            urlServiceDatasetSearch : pref.componentSettings.urlServiceDatasetSearch,
							dictionaryName : pref.componentSettings.dictionaryName
				        };
				        windowSettings = {
				            type : "formProject", 
				            title : i18n.get('label.forms') + " : " + pref.componentSettings.formName, 
				            id : "formProject"  + pref.componentSettings.formId, 
				            saveToolbar : true, 
				            datasetName : pref.componentSettings.formName, 
				            winWidth : 600, 
				            winHeight : 600
				        };
				        SitoolsDesk.addDesktopWindow(windowSettings, componentCfg, jsObj);
						
					}
					if (type == "form") {
						jsObj = sitools.user.component.forms;
						componentCfg = {
				            dataUrl : pref.componentSettings.dataUrl,
//	                        datasetId : pref.componentSettings.datasetId,
//	                        datasetName : pref.componentSettings.datasetName,
//	                        datasetCm : pref.componentSettings.datasetCm,
	                        formId : pref.componentSettings.formId,
	                        formName : pref.componentSettings.formName,
	                        formParameters : pref.componentSettings.formParameters,
	                        formWidth : pref.componentSettings.formWidth,
	                        formHeight : pref.componentSettings.formHeight, 
	                        formCss : pref.componentSettings.formCss
//	                        datasetView : pref.componentSettings.datasetView,
//	                        dictionaryMappings : pref.componentSettings.dictionaryMappings
				        };
				        windowSettings = {
	                        datasetName : pref.componentSettings.datasetName, 
	                        type : "form", 
	                        title : i18n.get('label.forms') + " : " + pref.componentSettings.datasetName + "." + pref.componentSettings.formName, 
	                        id : "form" + pref.componentSettings.datasetId + pref.componentSettings.formId, 
	                        saveToolbar : true
				        };	
				        SitoolsDesk.addDesktopWindow(windowSettings, componentCfg, jsObj);
					}
				}
		    }, this);
		    
		} 
		else {
			Ext.each(projectGlobal.modules, function (moduleData) {
				if (moduleData.publicOpened) {
					var module = SitoolsDesk.app.getModule(moduleData.id);
					var win = module.createWindow();
				}
			});
		}
		//when preferences are loaded fireEvent Ready.
		this.fireEvent('ready');		
    }
    
    /**
     * Unmask desktop Elements
     */
    function desktopReady() {
		if (Ext.get("x-desktop").isMasked()) {
			Ext.get("x-desktop").unmask();
		}
		if (Ext.get("ux-taskbar").isMasked()) {
			Ext.get("ux-taskbar").unmask();
		}
    }
    
	/**
	 * Mask all the desktop element. 
	 */
	function maskDesktop() {
		Ext.get("x-desktop").mask(i18n.get("label.loadingSitools"));
		Ext.get("ux-taskbar").mask();
	}
    
	var app = new Ext.app.App({
        //initialize app
        init : function () {
            // START HERE !!!
            Ext.QuickTips.init();
            Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
			//WTF with IE...
			if (Ext.isIE) {
				Ext.Msg.confirm(i18n.get('label.warning'), i18n.get('label.IEWarning'), function(buttonId) {
					if (buttonId == "yes") {
						maskDesktop();
						initProject();
					}
					else {
						window.location.replace("https://www.google.com/chrome/index.html");	
					}
				});
				
			}
			else {
				maskDesktop();
				initProject();
			}

            
        },
        //overrides getModules
        getModules : function () {
			return this.modules;
        },
        //overrides
        findModule : function (moduleId) {
			var result;
			Ext.each(this.modules, function (module) {
				if (module.id == moduleId) {
					result = module;
				}
			});
			return result;
        },
        //add some method 
        saveWindowSettings : function () {
            var desktopSettings = [];
            getDesktop().getManager().each(function (window) {
                var urlSaveSettings;
                if (!Ext.isEmpty(window.specificType) && window.specificType == 'componentWindow') {
                    var component = window.get(0);
                    var AppUserStorage = loadUrl.get('APP_USERSTORAGE_USER_URL').replace('{identifier}', userLogin);
                    urlSaveSettings = loadUrl.get('APP_URL') + AppUserStorage + "/" + DEFAULT_PREFERENCES_FOLDER;
                    var componentSettings = component._getSettings();
                    //Bug 3358501 : add a test on Window.saveSettings.
                    if (Ext.isFunction(window.saveSettings)) {
						desktopSettings.push(window.saveSettings(component.datasetName, component.componentType, componentSettings, urlSaveSettings));
                    }
                } else {
                    //Bug 3358501 : add a test on Window.saveSettings.
                    if (Ext.isFunction(window.saveSettings)) {
						desktopSettings.push(window.saveSettings(window.getId(), window.getId(), null, urlSaveSettings));	
                    }
                    
                }
            });
            userPreferences = {};
            userPreferences.windowSettings = desktopSettings;
            var projectSettings = [];
            Ext.each(SitoolsDesk.app.getModules(), function (module) {
                projectSettings.push(module.id);
            });
            userPreferences.projectSettings = projectSettings;
            userStorage.set("desktop", "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName, userPreferences);
		},

        //overrides
        getStartConfig : function () {
            var title;
            var login;
            if (Ext.isEmpty(Ext.util.Cookies.get('userLogin'))) {
                title = i18n.get("label.guest");
                login = false;
            } else {
                title = Ext.util.Cookies.get('userLogin');
                login = true;
            }
            var toolItems = [ {
                text : login ? 'label.logout' : 'label.login',
                iconCls : login ? 'logout' : 'login',
                scope : this,
                handler : login ? _onLogout : _onLogin
            }, '-', {
                text : 'label.version',
                iconCls : 'version',
                scope : this,
                handler : function () {
					showVersion();
                }
            }];
            if (!Ext.isEmpty(userLogin)) {
                toolItems.push("-");
	            toolItems.push({
                    text : 'label.save',
                    iconCls : 'settings',
                    handler : function () {
                        saveWindowSettings();
                    },
                    scope : this
                });
                
            }
            if (!Ext.isEmpty(userLogin) && projectGlobal && projectGlobal.isAdmin) {
                toolItems.push("-");
	            toolItems.push({
                    text : 'label.saveAsPublic',
                    iconCls : 'settings',
                    handler : function () {
                        saveWindowSettings(true);
                    },
                    scope : this
                });
                toolItems.push("-");
	            toolItems.push({
                    text : 'label.deletePublicPref',
                    iconCls : 'settings',
                    handler : function () {
                        deletePublicPref();
                    },
                    scope : this
                });
                
            }
            if (!Ext.isEmpty(userLogin)) {
                toolItems.push("-");
	            toolItems.push({
	                text : i18n.get('label.editProfile'),
	                itemId : 'menu_editProfile',
	                icon : '/sitools/common/res/images/icons/tree_userman.png',
	                identifier : userLogin,
	                labelSeparator : '|',
	                edit : '/sitools/editProfile/' + userLogin,
	                handler : function () {
	                    var edit = new sitools.widget.editProfile({
	                        closable: true,
	                        identifier : userLogin,
	                        url: this.edit,
	                        handler : this.onRender
	                    });
	                    edit.show();
	                }
                });
                
            }
            return {
                title : title,
                iconCls : 'user',
                toolItems : toolItems
            };
        }

    });
    
    /**
     * private Create a Module from a Json configuration
     * Include all Css and JS dependencies. 
     * After loading all Js dependencies,  fire event allJsIncludesDone 
     * 
     * @param {} config The json représentation of a module
     * @returns Ext.app.Module the created Module
     */
    function createModule(config) {
		function includeCss(url) {
	        var headID = document.getElementsByTagName("head")[0];
	        var newCss = document.createElement('link');
	        newCss.type = 'text/css';
	        newCss.rel = 'stylesheet';
	        newCss.href = url;
	        newCss.media = 'screen';
	        // pas possible de monitorer l'evenement onload sur une balise link
	        headID.appendChild(newCss);
	    }
	
	    function includeJs(ConfUrls, indexAInclure) {
	        //Test if all inclusions are done for this module
	        if (indexAInclure < ConfUrls.length) {
	            // if not : include the Js Script
	            var DSLScript = document.createElement("script");
	            DSLScript.type = "text/javascript";
	            DSLScript.onload = includeJs.createDelegate(this, [ ConfUrls, indexAInclure + 1 ]);
	            DSLScript.onreadystatechange = includeJs.createDelegate(this, [ ConfUrls, indexAInclure + 1 ]);

	            DSLScript.src = ConfUrls[indexAInclure].url;
	
	            var headID = document.getElementsByTagName('head')[0];
	            headID.appendChild(DSLScript);
	        } else {
	            //if all includes are done, Add 1 to the modulesCharges 
	            SitoolsDesk.modulesCharges++;
	            //test if all modules are loaded.
	            if (SitoolsDesk.modulesCharges == SitoolsDesk.modulesACharger) {
		            //End of loading all Javascript files.  
					SitoolsDesk.app.fireEvent('allJsIncludesDone', this);
	            }
	        }
	    }
	
	    var module = new Ext.app.Module({
	        id : config.id,
	        name : config.name,
	        author : config.author,
	        description : config.description,
	        url : config.url,
	        properties : config.properties,
	        init : function () {
	            // loading for i18n
	            // menu demarrer
	            this.launcher = {
	                text : i18n.get(config.title),
	                iconCls : config.icon,
	                handler : this.createWindow,
	                scope : this
	            };
	
	            // barre fisheye
	            this.fisheye = {
	                id : config.id,
	                text : i18n.get(config.title),
	                imagePath : config.imagePath,
	                // mettre imperativement entre double quote
	
	                fct : "SitoolsDesk.app.getModule('" + config.id + "').createWindow();"
	            };
	
	            // s'il y a des dependances
	            if (config.dependencies) {
	                if (config.dependencies.css) {
	                    Ext.each(config.dependencies.css, function (dependenceCss) {
	                        includeCss(dependenceCss.url);
	                    });
	                }
	
	                if (config.dependencies.js) {
	                    includeJs(config.dependencies.js, 0);
	                }
	
	            } else {
	                SitoolsDesk.app.modulesCharges++;
	            }
	
	        },
	
	        getWindow : function () {
				return getDesktop().getWindow(config.id);
	        },
	        createWindow : function (cfgCmp) {
	
	            var desktop = getDesktop();
	
	            var win = desktop.getWindow(config.id);
	            if (!win) {
	
	                win = desktop.createWindow({
	                    id : config.id,
	                    stateful : false,
	                    title : i18n.get(config.title),
	                    width : config.defaultWidth,
	                    height : config.defaultHeight,
	                    iconCls : config.icon,
	                    x : config.x,
	                    y : config.y,
	                    shim : false,
	                    animCollapse : false,
	                    constrainHeader : true,
	                    layout : 'fit',
	                    specificType : config.specificType,
	                    items : [ {
	                        layout : 'fit',
	                        xtype : config.xtype, 
	                        cfgCmp : cfgCmp, 
	                        moduleProperties : config.properties
	                    }]
	                });
	                // console.dir (userPreferences);
	                if (!Ext.isEmpty(projectGlobal.preferences)) {
	                    Ext.each(projectGlobal.preferences.windowSettings, function (preference) {
	                        if (preference.windowSettings.moduleId == config.id) {
	                            var pos = preference.windowSettings.position;
	                            var size = preference.windowSettings.size;
	
	                            if (pos !== null && size !== null) {
	                                pos = Ext.decode(pos);
	                                size = Ext.decode(size);
	
	                                win.setPosition(pos);
	                                win.setSize(size);
	                            }
	                        }
	                    });
	                }
	
	            } else {
	                desktop.getManager().bringToFront(win);
	            }
	
	            // win.setHeight (win.height + 10);
	            // win.doLayout (false);
	
	            // win.fireEvent ('bodyResize', arguments);
	            win.show();
	            return win;
	
	        }
	    });
	
	    return module;
	}
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

    return {
		/**
		 * {integer} modulesCharges The number of loaded Modules
		 */
		modulesCharges : 0, 
	
		/**
		 * {integer} modulesACharger The number of modules to load at start.
		 */
		modulesACharger : 0,         
		/**
         * the sitools Ext.app.App instance
         * @type Ext.app.App
         */
        app : app,

        /**
         * public dynamically add a new application to the desktop
         * 
         * 1. moduleFactory.createModule 2. ajout du module dans le fisheyeMenu
         */
        addApplication : function (composant) {
            modulesExistants = SitoolsDesk.app.getModules();
            if (!modulesExistants) {
                modulesExistants = [];
            }

            var nouveauModule = createModule(composant, this);
            modulesExistants.push(nouveauModule);

            SitoolsDesk.app.addModule(nouveauModule);
        },

        /**
         * public dynamically remove an application from the desktop
         * 
         * On supprime son icone du menu demarrer et du fisheyeMenu ainsi que de
         * la liste des modules existants
         */
        removeApplication : function (idApplication) {
            var moduleToRemove = SitoolsDesk.app.getModule(idApplication);
            modulesExistants = SitoolsDesk.app.getModules();
            SitoolsDesk.app.removeModule(moduleToRemove);
        }, 
        
        
        /**
         * public load the preferences for a window if the user is logged and then build the window 
         * 
         * @cfg {} windowSettings Window Settings object build with attributes
         *      {string} id (required) : windowId
         *      {string} title (required) : windowTitle, 
         *      {string} type (required if saveToolbar) : the type of the window, will determine the userStorage path
         *          [forms, data]
         *      {string} datasetName (required if saveToolbar) : name of the dataset, will determine the userStorage name
         *      {string} urlPreferences (required if saveToolbar) : the url to request to get the userPreferences
         *      {boolean} saveToolbar  : true if the saveSettings toolbar should be displayed
         *          default false
         * 
         * @cfg {} component : the items to add to the Window
         * @cfg {string} JsObj : the name of the Javascript Object used to build the component inside the window
         */
        addDesktopWindow : function (windowSettings, component, JsObj, reloadComp) {
            if (Ext.isEmpty(windowSettings.saveToolbar)) {
                windowSettings.saveToolbar = false;
            }
//            if (Ext.isEmpty(windowSettings.id)) {
//                throw ("NoWinId");
//            }
            if (Ext.isEmpty(windowSettings.title)) {
                throw ("NoWinTitle");
            }
            if (windowSettings.saveToolbar !== false && Ext.isEmpty(windowSettings.type)) {
                throw ("NoWinType");
            }
            if (windowSettings.saveToolbar !== false && Ext.isEmpty(windowSettings.datasetName)) {
                throw ("NoWinDatasetName");
            }
            if (Ext.isEmpty(reloadComp)) {
                reloadComp = false;
            }

            //if no user logged, load the window with no parameters or if the window is without saving
            if (windowSettings.saveToolbar === false) {
                addWinData(windowSettings, component, JsObj, reloadComp);
                return;
            }
            //build the url to request preferences : 
            var fileName = "";
            if (windowSettings.type == "form") {
				fileName = windowSettings.type + component.formName;
            }
            else {
				fileName = windowSettings.type;
            }
            var AppUserStorage = loadUrl.get('APP_USERSTORAGE_USER_URL').replace('{identifier}', userLogin);
            var urlPreferences = loadUrl.get('APP_URL') + AppUserStorage + "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName + "/" + windowSettings.datasetName + "/" + fileName; 
			var urlPublicPreferences = loadUrl.get('APP_URL') + loadUrl.get('APP_PUBLIC_STORAGE_URL') + "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName + "/" + windowSettings.datasetName + "/" + fileName;
            
            var addWinPublic = function (windowSettings, component, JsObj, reloadComp) {
	            Ext.Ajax.request({
		            scope : this,
	                method : 'GET',
	                url : urlPublicPreferences,
	                success : function (response, opts) {
	                    try {
	                        var json = Ext.decode(response.responseText);
	
	                        Ext.apply(windowSettings, json.windowSettings);
	                        Ext.apply(component, {
	                            userPreference : json.componentSettings
	                        });
	                        addWinData(windowSettings, component, JsObj, reloadComp);
	                    } catch (err) {
	                        addWinData(windowSettings, component, JsObj, reloadComp);
	                    }
	                },
	                failure : function (response, opts) {
	                    addWinData(windowSettings, component, JsObj, reloadComp);
	                }
	            });
            };
            if (Ext.isEmpty(userLogin)) {
				addWinPublic(windowSettings, component, JsObj, reloadComp);	
            }
            else {
	            Ext.Ajax.request({
	                scope : this,
	                method : 'GET',
	                url : urlPreferences,
	                success : function (response, opts) {
	                    try {
	                        var json = Ext.decode(response.responseText);
	
	                        Ext.apply(windowSettings, json.windowSettings);
	                        Ext.apply(component, {
	                            userPreference : json.componentSettings
	                        });
	                        addWinData(windowSettings, component, JsObj, reloadComp);
	                    } catch (err) {
							addWinPublic(windowSettings, component, JsObj, reloadComp);
	                    }
	                },
	                failure : function (response, opts) {
	                    addWinPublic(windowSettings, component, JsObj, reloadComp);
	//                    addWinData(windowSettings, component, JsObj, reloadComp);
	                }
	            });
            }
        }, 
        getDesktop : function () {
			return this.app.desktop;	
		}
    };
};



