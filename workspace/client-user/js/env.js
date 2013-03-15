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
/*global Ext, ann, alert, document, alertFailure, getDesktop, SitoolsDesk */
/*global DEFAULT_WIN_HEIGHT, DEFAULT_WIN_WIDTH, sitools, loadUrl, includeJs, DEFAULT_PREFERENCES_FOLDER */

/*
 * @include "desktop/desktop.js"
 * @include "components/columnsDefinition/dependencies/columnsDefinition.js"
 * @include "components/forms/forms.js"
 */

Ext.namespace('sitools.env');
var userPreferences = null;
var userLogin = null;
var sql2ext = {

    map : [],
    load : function (url) {

        var i18nRef = this;
        Ext.Ajax.request({
            method : 'GET',
            url : url,
            // params:'formLogin', using autorization instead
            success : function (response, opts) {
                ann(response.responseText, "no response is sent");
                i18nRef.map = i18nRef.transformsPropertiesToMap(response.responseText);
            },
            failure : function (response, opts) {
                alert("Error! Can't read i18n file with url :" + url);
            }
        });

    },
    /**
     * Transforms a properties Text to a map
     * 
     * @param text
     *            raw properties file
     * @returns a map (associative array) TODO check when the raw properties
     */
    transformsPropertiesToMap : function (text) {
        var array = text.split('\n');
        var localMap = [];
        var i;
        for (i = 0; i < array.length; i++) {
            var string = array[i];
            var indexOfEqualsSign = string.indexOf('=');
            if (indexOfEqualsSign >= 1) {
                var key = string.substring(0, indexOfEqualsSign).replace('\r', '');
                var value = string.substring(indexOfEqualsSign + 1).replace('\r', '');
                localMap[key] = value;
            }
        }
        return localMap;
    },
    /**
     * return the i18n value
     * 
     * @param name
     * @returns
     */
    get : function (entry) {
        return !Ext.isEmpty(this.map[entry]) ? this.map[entry] : 'auto';
    }
};
var i18n = {

    map : [],
    /**
     * Load a properties file and and the name/values in a associative array ;
     * Executing this function on multiple properties file increase the size of
     * the array Results can be displayed in the help panel with the display()
     * function
     * 
     * @param url
     *            URL of the i18n file
     * @param callback
     *            No args function that will be executed
     * @returns void
     */
    load : function (url, callback) {

        var i18nRef = this;
        Ext.Ajax.request({
            method : 'GET',
            url : url,
            // params:'formLogin', using autorization instead
            success : function (response, opts) {
                ann(response.responseText, "no response is sent");
                i18nRef.map = i18nRef.transformsPropertiesToMap(response.responseText);
                if (Ext.isFunction(callback)) {
                    callback();
                }
            },
            failure : function (response, opts) {
                alert("Error! Can't read i18n file with url :" + url);
            }
        });

    },
    /**
     * Transforms a properties Text to a map
     * 
     * @param text
     *            raw properties file
     * @returns a map (associative array) TODO check when the raw properties
     *          file is rotten
     */
    transformsPropertiesToMap : function (text) {
        var array = text.split('\n');
        var localMap = [];
        var i;
        for (i = 0; i < array.length; i++) {
            var string = array[i];
            var indexOfEqualsSign = string.indexOf('=');
            if (indexOfEqualsSign >= 1) {
                var key = string.substring(0, indexOfEqualsSign).replace('\r', '');
                var value = string.substring(indexOfEqualsSign + 1).replace('\r', '');
                localMap[key] = value;
            }
        }
        return localMap;
    },
    /**
     * return the i18n value
     * 
     * @param name
     * @returns
     */
    get : function (entry) {
        return !Ext.isEmpty(this.map[entry]) ? this.map[entry] : entry;
    }
};

/**
 * To be defined
 */
var componentManager = {
    loadedComponents : [],
    load : function (name) {

    }
};

var data = {
    ret : null,
    /**
     * Fetch a html file in the url, and display its content into the helpPanel. *
     * 
     * @param url
     * @returns
     */
    get : function (url, cbk) {
        Ext.Ajax.request({
            method : 'GET',
            url : url,
            success : function (response, opts) {
                cbk(Ext.decode(response.responseText));
            },
            failure : function (response, opts) {
                Ext.Msg.alert("Warning", "Error! Can't get data with url :" + url);
            }
        });
        return this.ret;
    }

};

/**
 * Global project variable Used to get the projectId from the url
 */
var projectGlobal = {
    /**
     * Get the current projectId from the url url is like :
     * /sitools/client-user/{projectName}/indexproject.html /sitools/client-user/
     * can be changed
     * 
     * @return the projectId
     */
    projectId : null,
    projectName : null,
    preferences : null,
    userRoles : null, 
    isAdmin : false,
    sitoolsAttachementForUsers : null,
    modules : null,
    callback : function () {
    },

    initProject : function (callback) {
        this.callback = callback;
        this.projectName = this.getProjectName();
        this.getDataViewsDependencies();
        //this.projectName = this.getProjectInfo();
    },

    getDataViewsDependencies : function () {
		Ext.Ajax.request({
            url : loadUrl.get('APP_URL') + loadUrl.get('APP_DATASETS_VIEWS_URL'),
            method : "GET",
            scope : this,
            success : function (ret) {
                var json = Ext.decode(ret.responseText);
                if (!json.success) {
                    Ext.Msg.alert(i18n.get('label.warning'), i18n.get('warning.noProjectName'));
                    return false;
                } else {
                    var data = json.data;                    
                    Ext.each(data, function (datasetViewComponent) {
						includeJs(datasetViewComponent.fileUrl);
                    });
                }
            },
            callback : function () {
                this.getFormDependencies();
            }
        });   
    }, 
    getFormDependencies : function () {
		Ext.Ajax.request({
            url : loadUrl.get('APP_URL') + loadUrl.get('APP_FORMCOMPONENTS_URL'),
            method : "GET",
            scope : this,
            success : function (ret) {
                var json = Ext.decode(ret.responseText);
                if (!json.success) {
                    Ext.Msg.alert(i18n.get('label.warning'), i18n.get('warning.noProjectName'));
                    return false;
                } else {
                    var data = json.data;                    
                    Ext.each(data, function (formComponent) {
						includeJs(formComponent.fileUrlUser);
                    });
                }
            },
            callback : function () {
                this.projectName = this.getProjectInfo();
            }
        });   
    }, 
    getUserRoles : function (cb) {
		if (Ext.isEmpty(userLogin)) {
			cb.call();
		} 
		else {
			Ext.Ajax.request({
	            url : loadUrl.get('APP_URL') + loadUrl.get("APP_USER_ROLE_URL"),
	            method : "GET",
	            scope : this,
	            success : function (ret) {
	                var json = Ext.decode(ret.responseText);
	                if (!json.success) {
	                    Ext.Msg.alert(i18n.get('label.warning'), i18n.get('warning.noProjectName'));
	                    return false;
	                } else {
	                    var user = json.user;                    
	                    this.userRoles = user.roles;
	                    for (var index = 0; index < this.userRoles.length; index++) {
							var role = this.userRoles[index];
							if (role.name == "Administrator") {
								this.isAdmin = true;
							}
	                    }
	                }
	            },
	            callback : cb
	        });   
		}
    }, 
    getProjectName : function () {
        if (this.projectName === null) {
            // get the relative url
            var url = document.location.pathname;
            // split the url to get each part of the url in a tab cell
            var tabUrl = url.split("/");

            var i = 0, index;
            var found = false;
            // search for index.html, the projectName is right before
            // '/index.html'
            while (i < tabUrl.length && !found) {
                if (tabUrl[i] == "project-index.html") {
                    found = true;
                    index = i;
                }
                i++;
            }
            // get the projectName from the tabUrl
            this.projectName = tabUrl[index - 1];

            if (this.projectName === undefined || this.projectName === "") {
                Ext.Msg.alert(i18n.get('label.warning'), i18n.get('warning.noProject'));
            }
        }
        return this.projectName;
    },
    /**
     * Get the name of a project from the server
     */
    getProjectInfo : function () {
        Ext.Ajax.request({
            url : loadUrl.get('APP_URL') + loadUrl.get('APP_PORTAL_URL') + '/projects/' + this.projectName,
            method : "GET",
            scope : this,
            success : function (ret) {
                var data = Ext.decode(ret.responseText);
                if (!data.success) {
                    Ext.Msg.alert(i18n.get('label.warning'), i18n.get('warning.noProjectName'));
                    return false;
                } else {
                    this.modules = data.project.modules;
                    this.sitoolsAttachementForUsers = data.project.sitoolsAttachementForUsers;
                    this.projectId = data.project.id;
                    this.projectName = data.project.name;
                }
                var topEl = Ext.get('toppanel');
                topEl.update(Ext.util.Format.htmlDecode(data.project.htmlHeader));
             
                this.getPreferences();
            },
            failure : function () {
				Ext.Msg.alert(i18n.get('label.warning'), i18n.get('warning.noProject'));
            }
        });
    },    
    getPreferences : function () {
        if (!Ext.isEmpty(userLogin)) {
            var AppUserStorage = loadUrl.get('APP_USERSTORAGE_USER_URL').replace('{identifier}', userLogin);
            Ext.Ajax.request({
//                url : "/sitools/userstorage/" + userLogin + "/" + DEFAULT_PREFERENCES_FOLDER + "/" + this.projectName + "/desktop?media=json",
                url : loadUrl.get('APP_URL') + AppUserStorage + "/" + DEFAULT_PREFERENCES_FOLDER + "/" + this.projectName + "/desktop?media=json",
                method : 'GET',
                scope : this,
                success : function (ret) {
                    try {
                        this.preferences = Ext.decode(ret.responseText);
		                this.callback.call();
                    } catch (err) {
                        this.callback.call();
                    }
                },
                failure : function (ret) {
                    this.getPublicPreferences();
                }
            });
        } else {
            this.getPublicPreferences();
        }
    }, 
    getPublicPreferences : function () {
        var AppPublicStorage = loadUrl.get('APP_PUBLIC_STORAGE_URL');
        Ext.Ajax.request({
//                url : "/sitools/userstorage/" + userLogin + "/" + DEFAULT_PREFERENCES_FOLDER + "/" + this.projectName + "/desktop?media=json",
            url : loadUrl.get('APP_URL') + AppPublicStorage + "/" + DEFAULT_PREFERENCES_FOLDER + "/" + this.projectName + "/desktop?media=json",
            method : 'GET',
            scope : this,
            success : function (ret) {
                try {
                    this.preferences = Ext.decode(ret.responseText);
                } catch (err) {
                    this.preferences = null;
                }
            }, 
            callback : this.callback
        });
    }
};
userLogin = Ext.util.Cookies.get('userLogin');
var userStorage = {
    set : function (filename, filepath, content, callback) {
        this.url = loadUrl.get('APP_URL') + loadUrl.get('APP_USERSTORAGE_USER_URL').replace('{identifier}', userLogin);
        Ext.Ajax.request({
            url : this.url,
            method : 'POST',
            scope : this,
            params : {
                filepath : filepath,
                filename : filename
            },
            jsonData : content,
            success : function (ret) {
                var Json = Ext.decode(ret.responseText);
                if (!Json.success) {
                    Ext.Msg.alert(i18n.get('label.warning'), Json.message);
                    return;
                } else {
                    var notify = new Ext.ux.Notification({
                        iconCls : 'x-icon-information',
                        title : i18n.get('label.information'),
                        html : Json.message,
                        autoDestroy : true,
                        hideDelay : 1000
                    });
                    notify.show(document);
                }
            },
            failure : function () {
                Ext.Msg.alert(i18n.get('label.warning'), i18n.get('label.warning.savepreference.error'));
                return;
            },
            callback : function () {
                if (!Ext.isEmpty(callback)) {
                    callback.call();
                }
            }
        });

    },
    get : function (filename, filepath) {
        Ext.Ajax.request({
            url : this.url + "/?media=json",
            method : 'GET',
            scope : this,
            params : {
                filepath : filepath,
                filename : filename
            },
            success : function (ret) {
                try {
                    alert('success');
                    var Json = Ext.decode(ret.responseText);
                    return Json;
                } catch (err) {
                    alert(err);
                }
            },
            failure : function (ret) {
                return null;
            }
        });
    }
};

var publicStorage = {
    set : function (filename, filepath, content, callback) {
        this.url = loadUrl.get('APP_URL') + loadUrl.get('APP_PUBLIC_STORAGE_URL');
        Ext.Ajax.request({
            url : this.url,
            method : 'POST',
            scope : this,
            params : {
                filepath : filepath,
                filename : filename
            },
            jsonData : content,
            success : function (ret) {
                var Json = Ext.decode(ret.responseText);
                if (!Json.success) {
                    Ext.Msg.alert(i18n.get('label.warning'), Json.message);
                    return;
                } else {
                    var notify = new Ext.ux.Notification({
                        iconCls : 'x-icon-information',
                        title : i18n.get('label.information'),
                        html : Json.message,
                        autoDestroy : true,
                        hideDelay : 1000
                    });
                    notify.show(document);
                }
            },
            failure : function () {
                Ext.Msg.alert(i18n.get('label.warning'), i18n.get('label.warning.savepreference.error'));
                return;
            },
            callback : function () {
                if (!Ext.isEmpty(callback)) {
                    callback.call();
                }
            }
        });

    },
    get : function (filename, filepath) {
        Ext.Ajax.request({
            url : this.url + "/?media=json",
            method : 'GET',
            scope : this,
            params : {
                filepath : filepath,
                filename : filename
            },
            success : function (ret) {
                try {
                    var Json = Ext.decode(ret.responseText);
                    return Json;
                } catch (err) {
                    alert(err);
                }
            },
            failure : function (ret) {
                return null;
            }
        });
    }, 
    remove : function () {
        this.url = loadUrl.get('APP_URL') + loadUrl.get('APP_PUBLIC_STORAGE_URL') + "?recursive=true";
        Ext.Ajax.request({
            url : this.url,
            method : 'DELETE',
            scope : this,
            success : function (ret) {
                var notify = new Ext.ux.Notification({
                    iconCls : 'x-icon-information',
                    title : i18n.get('label.information'),
                    html : i18n.get("label.publicUserPrefDeleted"),
                    autoDestroy : true,
                    hideDelay : 1000
                });
                notify.show(document);
            },
            failure : function (ret) {
                //cas normal... 
				if (ret.status == 404) {
					var notify = new Ext.ux.Notification({
				        iconCls : 'x-icon-information',
				        title : i18n.get('label.information'),
				        html : i18n.get("label.publicUserPrefDeleted"),
				        autoDestroy : true,
				        hideDelay : 1000
				    });
				    notify.show(document);
				}
				else {
					var notifye = new Ext.ux.Notification({
				        iconCls : 'x-icon-error',
				        title : i18n.get('label.error'),
				        html : ret.responseText,
				        autoDestroy : true,
				        hideDelay : 1000
				    });
				    notifye.show(document);
				}
                
            }
        });
    }
};

function showResponse(ret, notification) {
    try {
        var Json = Ext.decode(ret.responseText);
        if (!Json.success) {
            Ext.Msg.alert(i18n.get('label.warning'), Json.message);
            return false;
        }
        if (notification) {
            var notify = new Ext.ux.Notification({
                iconCls : 'x-icon-information',
                title : i18n.get('label.information'),
                html : Json.message,
                autoDestroy : true,
                hideDelay : 1000
            });
            notify.show(document);
        }
        return true;
    } catch (err) {
        Ext.Msg.alert(i18n.get('label.warning'), i18n.get('warning.javascriptError') + " : " + err);
        return false;
    }
}

/**
 * Object to expose common tree Utils Methods
 * @requires sitools.user.component.datasetOpensearch
 * @requires sitools.user.component.forms
 */
var commonTreeUtils = {
    addShowData : function (node, dataset) {
        node.appendChild({
            id : "nodedata" + dataset.id,
            text : i18n.get('label.dataTitle'),
            winTitle : i18n.get('label.dataTitle') + " : " + dataset.name,
            leaf : true,
            type : "data",
            datasetId : dataset.id,
            columnModel : dataset.columnModel,
            datasetName : dataset.name,
            datasetDescription : dataset.description,
            dataUrl : dataset.sitoolsAttachementForUsers, 
            dictionaryMappings : dataset.dictionaryMappings,
            icon : loadUrl.get('APP_URL') + "/common/res/images/icons/tree_datasets.png", 
            datasetView : dataset.datasetView, 
            datasetViewConfig : dataset.datasetViewConfig
        });
        
    },

    addShowDefinition : function (node, dataset) {
        node.appendChild({
            text : i18n.get('label.definitionTitle'),
            winTitle : i18n.get('label.definitionTitle') + " : " + dataset.name,
            leaf : true,
            type : "defi",
            datasetId : dataset.id,
            columnModel : dataset.columnModel,
            datasetName : dataset.name, 
            dictionaryMappings : dataset.dictionaryMappings,
            icon : loadUrl.get('APP_URL') + "/common/res/images/icons/tree_dictionary.png"
        });
    },

    addOpensearch : function (node, dataset) {
        node.appendChild({
            text : i18n.get('label.opensearch'),
            winTitle : i18n.get('label.opensearch') + " : " + dataset.name,
            leaf : true,
            type : "openSearch",
            datasetId : dataset.id,
            columnModel : dataset.columnModel,
            datasetName : dataset.name,
            dataUrl : dataset.sitoolsAttachementForUsers, 
            icon : loadUrl.get('APP_URL') + "/common/res/images/icons/toolbar_open_search.png"
        });
    },

    addForm : function (node, dataset) {
        node.appendChild({
            text : i18n.get('label.forms'),
            leaf : false,
            children : [ {
                leaf : true
            } ],
            datasetId : dataset.id,
            columnModel : dataset.columnModel,
            datasetName : dataset.name,
            listeners : {
                scope : this,
                beforeexpand : function (node) {
                    var conn = new Ext.data.Connection();
                    conn.request({
                        url : dataset.sitoolsAttachementForUsers + '/forms?media=json',
                        success : function (response) {
                            node.removeAll(true);
                            var forms = Ext.decode(response.responseText);
                            if (!forms.success) {
                                Ext.msg.alert(i18n.get('label.warning'), forms.message);
                                return;
                            }
                            Ext.each(forms.data, function (form) {
                                node.appendChild({
                                    leaf : true,
                                    winTitle : i18n.get('label.forms') + " : " + dataset.name + "." + form.name,
                                    datasetId : dataset.id,
                                    columnModel : dataset.columnModel,
                                    datasetName : dataset.name,
                                    dataUrl : dataset.sitoolsAttachementForUsers,
                                    type : "form",
                                    text : form.name,
                                    formId : form.id,
                                    formName : form.name,
                                    formParameters : form.parameters,
                                    formWidth : form.width,
                                    formHeight : form.height,
                                    formCss : form.css, 
                                    node : this, 
                                    icon : loadUrl.get('APP_URL') + "/common/res/images/icons/tree_forms.png", 
                                    datasetView : dataset.datasetView

                                });
                            });

                        }
                    });
                }
            }
        });
    },

    addFeeds : function (node, dataset) {
        node.appendChild({
            text : i18n.get('label.feeds'),
            leaf : false,
            children : [ {
                leaf : true
            } ],
            datasetId : dataset.id,
            datasetName : dataset.name,
            listeners : {
                scope : this,
                beforeexpand : function (node) {
                    var conn = new Ext.data.Connection();
                    conn.request({
                        url : dataset.sitoolsAttachementForUsers + '/feeds?media=json',
                        success : function (response) {
                            node.removeAll(true);
                            var feeds = Ext.decode(response.responseText);
                            if (!feeds.success) {
                                Ext.msg.alert(i18n.get('label.warning'), feeds.message);
                                return;
                            }
                            Ext.each(feeds.data, function (feed) {
                                node.appendChild({
                                    leaf : true,
                                    winTitle : i18n.get('label.feeds') + " : " + dataset.name + "." + feed.title,
                                    type : "feeds",
                                    text : feed.name,
                                    datasetId : dataset.id,
                                    feedId : feed.name,
                                    dataUrl : dataset.sitoolsAttachementForUsers,
                                    feedType : feed.feedType,
                                    feedSource : feed.feedSource,
                                    datasetName : dataset.name, 
                                    icon : loadUrl.get('APP_URL') + "/common/res/images/icons/rss.png"
                                    
                                });
                            });

                        }
                    });
                }
            }
        });
    },

    /**
     * Build the component regarding to the node, 
     * Load a window with this component into the SitoolsDesk
     * @param node
     */
    treeAction : function (node) {
        var desktop = getDesktop();
        var win = desktop.getWindow("wind" + node.id);

        if (!win) {
            var componentCfg, javascriptObject;
            var windowConfig = {
                title : node.attributes.winTitle, 
                datasetName : node.attributes.datasetName, 
                datasetDescription : node.attributes.datasetDescription,
                type : node.attributes.type, 
                saveToolbar : true, 
                toolbarItems : []
            };

            if (node.attributes.type == "data") {
                //open the dataView according to the dataset Configuration.
                javascriptObject = eval(node.attributes.datasetView.jsObject);
                //add the toolbarItems configuration
//                Ext.apply(windowConfig, {
//                    id : node.attributes.type + node.attributes.datasetId
//                });
                componentCfg = {
                    dataUrl : node.attributes.dataUrl,
                    datasetId : node.attributes.datasetId,
                    datasetCm : node.attributes.columnModel, 
                    datasetName : node.attributes.datasetName,
                    dictionaryMappings : node.attributes.dictionaryMappings,
                    datasetViewConfig : node.attributes.datasetViewConfig
                };
                
            }
            if (node.attributes.type == "defi") {
                javascriptObject = sitools.user.component.columnsDefinition;
                Ext.apply(windowConfig, {
                    id : node.attributes.type + node.attributes.datasetId
                });
                componentCfg = {
                    datasetId : node.attributes.datasetId,
                    datasetCm : node.attributes.columnModel, 
                    datasetName : node.attributes.datasetName,
                    dictionaryMappings : node.attributes.dictionaryMappings
                };
            }
            if (node.attributes.type == "openSearch") {
                javascriptObject = sitools.user.component.datasetOpensearch;
                Ext.apply(windowConfig, {
                    id : node.attributes.type + node.attributes.datasetId
                });
                componentCfg = {
                    datasetId : node.attributes.datasetId,
                    dataUrl : node.attributes.dataUrl, 
                    datasetName : node.attributes.datasetName
                };
            }
            if (node.attributes.type == "form") {
                javascriptObject = sitools.user.component.forms;
                Ext.apply(windowConfig, {
                    id : node.attributes.type + node.attributes.datasetId + node.attributes.formId
                });
                componentCfg = {
                    dataUrl : node.attributes.dataUrl,
//                    datasetId : node.attributes.datasetId,
//                    datasetName : node.attributes.datasetName,
//                    datasetCm : node.attributes.columnModel,
                    formId : node.attributes.formId,
                    formName : node.attributes.formName,
                    formParameters : node.attributes.formParameters,
                    formWidth : node.attributes.formWidth,
                    formHeight : node.attributes.formHeight, 
                    formCss : node.attributes.formCss 
//                    datasetView : node.attributes.datasetView

                };
            }
            if (node.attributes.type == "feeds") {
                javascriptObject = sitools.widget.FeedGridFlux;
                var url = node.attributes.dataUrl + "/clientFeeds/" + node.attributes.feedId;
                Ext.apply(windowConfig, {
                    id : node.attributes.type + node.attributes.datasetId + node.attributes.feedId
                });
                componentCfg = {
                    datasetId : node.attributes.datasetId,
                    urlFeed : url,
                    feedType : node.attributes.feedType, 
                    datasetName : node.attributes.datasetName,
                    feedSource : node.attributes.feedSource,
                    autoLoad : true
                };

            }
            SitoolsDesk.addDesktopWindow(windowConfig, componentCfg, javascriptObject);

        } else {
            win.toFront();
        }
    }
};
