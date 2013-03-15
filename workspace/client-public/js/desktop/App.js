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
/*!
 * Ext JS Library 3.2.1
 * Copyright(c) 2006-2010 Ext JS, Inc.
 * licensing@extjs.com
 * http://www.extjs.com/license
 */
/*global Ext, sitools, ID, i18n, showResponse,LOCALE,window*/
/*
 * @include "Desktop.js"
 */
/**
 * The Main Application 
 * @cfg {} cfg The initial config 
 * @class Ext.app.App
 * @extends Ext.util.Observable
 */
Ext.app.App = function (cfg) {
	Ext.apply(this, cfg);

	this.addEvents({
	    'ready' : true,
	    'beforeunload' : true
	});
	
	var application = this;
	var initApplication = function (){
	    Ext.QuickTips.init();
	    application.initApp();
	};
	var getUserRole = function (){
	    projectGlobal.getUserRoles(initApplication);
	};
	var callback = function () {
	    loadUrl.load('/sitools/client-user/siteMap', getUserRole);
	};

    if (!Ext.isEmpty(Ext.util.Cookies.get('userLogin'))) {
        var auth = Ext.util.Cookies.get('hashCode');

        Ext.Ajax.defaultHeaders = {
            "Authorization" : auth,
            "Accept" : "application/json",
            "User-Agent" : "Sitools"
        };
    } else {
        Ext.Ajax.defaultHeaders = {
            "Accept" : "application/json",
            "User-Agent" : "Sitools"
        };
    }

	if (!Ext.isEmpty(userLogin)) {
	    Ext.Ajax.request ({
            url : '/sitools/userstorage/' + userLogin + '/'+ DEFAULT_PREFERENCES_FOLDER + '/portal/portal',
            //TODO : headers de la requete
            method : 'GET',
            success : function (response) {
	            if (Ext.isEmpty(response.responseText)) {
	                i18n.load('/sitools/res/i18n/' + LOCALE + '/gui.properties', callback);
	                return;
	            }
	            try {
	                var json = Ext.decode(response.responseText);
	                if (Ext.isEmpty(json.language)) {
	                    i18n.load('/sitools/res/i18n/' + LOCALE + '/gui.properties', callback);
	                }
	                else {
	                    i18n.load('/sitools/res/i18n/' + json.language + '/gui.properties', callback);
	                }
	            }
	            catch (err) {
	                i18n.load('/sitools/res/i18n/' + LOCALE + '/gui.properties', callback);
	            }
	            
            },
            failure : function () {
                i18n.load('/sitools/res/i18n/' + LOCALE + '/gui.properties', callback);
            }
	    })
    }
	else {
	    i18n.load('/sitools/res/i18n/' + LOCALE + '/gui.properties', callback);
	}
	    

	

};

Ext.extend(Ext.app.App, Ext.util.Observable, {
    /**
     * True when application is ready
     * @type Boolean
     */
    isReady : false,
    /**
     * The list of modules
     * @type [Ext.app.Module]  
     */
    modules : null,
    /**
     * The fishEyeMenu
     * @type Ext.ux.FisheyeMenuExtention 
     */
    fisheye : null,
	
	/**
	 * BasicMethod to override.
	 */
	getStartConfig : function () {

    },
    
    /**
     * Initialize application.
     * Call the method init wich must have been override on instanciation.
     */
    initApp : function () {
		this.startConfig = this.startConfig || this.getStartConfig();

	    this.desktop = new Ext.Desktop(this);

	    this.tabMenu = [];

	    this.launcher = this.desktop.taskbar.startMenu;

	    this.modules = this.getModules();
	    if (this.modules) {
		    this.initModules(this.modules);
	    }

	    this.init();
	    
	    Ext.EventManager.on(window, 'beforeunload', this.onUnload, this);
	    this.isReady = true;
    },

	/**
	 * @method
	 * BasicMethod to override.
	 */
    getModules : Ext.emptyFn,
	/**
	 * @method
	 * BasicMethod to override.
	 */
    init : Ext.emptyFn,

	/**
	 * Add all modules to fisheye menu and launcher.
	 */
    initModules : function (ms) {
	    this.modules = ms;

	    for (var i = 0, len = ms.length; i < len; i++) {
		    var m = ms[i];

		    this.launcher.add(m.launcher);
		    this.tabMenu.push(m.fisheye);
		    m.app = this;
	    }

	    this.fisheye = new Ext.ux.FisheyeMenuExtention({
	        renderTo : 'fisheye-menu-bottom',
	        hAlign : 'center', // left|center|right
	        vAlign : 'bottom', // top|bottom
	        itemWidth : 60,
	        items : this.tabMenu
	    });

	    // quand tous les modules sont prets,
	    // l'application est prete a etre utilisee
	    this.isReady = true;
    },

    /**
     * Add a single Module
     * @param {Ext.app.Module} module
     */
    addModule : function (module) {
	    this.launcher.add(module.launcher);
	    this.fisheye.addItem(module.fisheye);
	    module.app = this;
    },
    /**
     * Remove a single Module
     * @param {Ext.app.Module} moduleToRemove
     */
    removeModule : function (moduleToRemove) {
	    this.launcher.remove(moduleToRemove.id);
	    this.fisheye.removeItem(moduleToRemove.fisheye.id);
	    this.modules.remove(moduleToRemove);

    },

    /**
     * Return a {Ext.app.Module} module from his name
     * @param {string} name
     * @return {Ext.app.Module} if founded, "" else
     */
    getModule : function (name) {
	    var ms = this.modules;
	    if (!Ext.isEmpty(ms)) {
		    for (var i = 0, len = ms.length; i < len; i++) {
			    if (ms[i].id == name || ms[i].appType == name) {
				    return ms[i];
			    }
		    }
	    }
	    return '';
    },

    /**
     * 
     * @return {Ext.Desktop} the Desktop object
     */
    getDesktop : function () {
	    return this.desktop;
    },

    /**
     * @return {Ext.ux.FisheyeMenuExtention} return the Fisheye menu object
     */
    getFisheyeMenu : function () {
	    return this.fisheye;
    },

    /**
     * Called by the event beforeunload on the window object
     * @param {} e
     */
    onUnload : function (e) {
	    if (this.fireEvent('beforeunload', this) === false) {
		    e.stopEvent();
	    }
    }, 
    /**
     * @deprecated (it is not masking taskBar)
     */
    showSpinner : function () {
    	Ext.getBody().mask("loading...", "x-mask-loading");
    }, 
    /**
     * @deprecated (it is not masking taskBar)
     */
    hideSpinner : function () {
    	if (Ext.getBody().isMasked()){
    		Ext.getBody().unmask();
    	}
    }
});
