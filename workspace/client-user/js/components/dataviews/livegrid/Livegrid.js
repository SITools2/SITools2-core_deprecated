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

/*global Ext, sitools, i18n, sql2ext, extColModelToSrv, window, 
 extColModelToJsonColModel, DEFAULT_NEAR_LIMIT_SIZE,
 DEFAULT_LIVEGRID_BUFFER_SIZE, SITOOLS_DEFAULT_IHM_DATE_FORMAT,
 DEFAULT_PREFERENCES_FOLDER, SitoolsDesk, getDesktop, userLogin, projectGlobal, getColumnModel, loadUrl, getApp
*/

/*
 * @include "Ext.ux.livegrid/Ext.ux.livegrid-all-debug.js"
 * @include "storeLiveGrid.js"
 * @include "../../plot.dataPlotter.js"
 * @include "contextMenu.js"
 * @include "../../columnsDefinition/dependencies/columnsDefinition.js"
 * @include "../../viewDataDetail/viewDataDetail.js" 
 * @include "../../../../../client-public/js/widgets/gridfilters/GridFilters.js"
 * @include "../../plot/dataPlotter.js"
 */

Ext.override(Ext.ux.grid.livegrid.GridView, {
    /**
     * Override this method to add a specific line Height
     * @param {Ext.grid.GridPanel}
     *            grid The grid panel this view is attached to
     */
    init : function (grid) {
        this._gridViewSuperclass.init.call(this, grid);
		
        this.rowHeight = this.calcLineHeight();
        
        grid.on('expand', this._onExpand, this);
    },
    /**
     * Returns the height of the livegrid rows.
     * @return {int} 
     */
    calcLineHeight : function () {
		//default Value : 23
		var lineHeight = 23;
		if (Ext.isEmpty(this.showImage)) {
			this.calcShowImage(this.cm.columns);
		}
		if (this.showImage && !Ext.isEmpty(this.datasetViewConfig.lineHeight)) {
			lineHeight = this.datasetViewConfig.lineHeight;
		}
		return lineHeight;
    },
	/**
     * Determines if an image should be displayed in liveGrid
     * @return void
     */
    calcShowImage : function () {
		this.showImage = false;
		Ext.each(this.cm.columns, function (column) {
			if (! column.hidden && !Ext.isEmpty(column.columnRenderer)) {
				if (sitools.admin.datasets.columnRenderer.behaviorEnum.isDisplayingImage(column.columnRenderer)) {
					this.showImage = true;
				}
			}
		}, this);
    }, 
    /**
     * Overwritten so the rowIndex can be changed to the absolute index.
     * 
     * If the third parameter equals to <tt>true</tt>, the method will also
     * repaint the selections.
     */
    // private
    processRows : function (startRow, skipStripe, paintSelections) {
        //DA : calculer si une image doit être affichée
//		if (Ext.isEmpty(this.showImage)) {
//			this.calcShowImage(this.cm.columns);
//		}
        if (!this.ds || this.ds.getCount() < 1) {
            return;
        }

        skipStripe = skipStripe || !this.grid.stripeRows;

        var cursor = this.rowIndex;
        var rows = this.getRows();
        var index = 0;

        var row = null;
        for (var idx = 0, len = rows.length; idx < len; idx++) {
            row = rows[idx];

            row.rowIndex = index = cursor + idx;
            row.className = row.className.replace(this.rowClsRe, ' ');
            if (!skipStripe && (index + 1) % 2 === 0) {
                row.className += ' x-grid3-row-alt';
            }
			
			//DA Fix the line Height
			this.fly(row).setHeight(this.rowHeight);

            if (paintSelections !== false) {
                if (this.grid.selModel.isSelected(this.ds.getAt(index)) === true) {
                    this.addRowClass(index, this.selectedRowClass);
                } else {
                    this.removeRowClass(index, this.selectedRowClass);
                }
                this.fly(row).removeClass("x-grid3-row-over");
            }
        }

        // add first/last-row classes
        if (cursor === 0) {
            Ext.fly(rows[0]).addClass(this.firstRowCls);
        } else if (cursor + rows.length == this.ds.totalLength) {
            Ext.fly(rows[rows.length - 1]).addClass(this.lastRowCls);
        }
    }, 
     /**
     * Recomputes the number of visible rows in the table based upon the height
     * of the component. The method adjusts the <tt>rowIndex</tt> property as
     * needed, if the sum of visible rows and the current row index exceeds the
     * number of total data available.
     */
    // protected
    adjustVisibleRows : function () {
        if (Ext.isEmpty(this.showImage)) {
            this.calcShowImage();
        }
        if (this.rowHeight == -1) {
            this.rowHeight = this.calcLineHeight();
        }

        var g = this.grid, ds = g.store;

        var c = g.getGridEl();
        var cm = this.cm;
        var size = c.getSize();
        var width = size.width;
        var vh = size.height;

        var vw = width - this.getScrollOffset();
        // horizontal scrollbar shown?
        if (cm.getTotalWidth() > vw) {
            // yes!
            vh -= this.horizontalScrollOffset;
        }

        vh -= this.mainHd.getHeight();

        var totalLength = ds.totalLength || 0;

        var visibleRows = Math.max(1, Math.floor(vh / this.rowHeight));

        this.rowClipped = 0;
        // only compute the clipped row if the total length of records
        // exceeds the number of visible rows displayable
        if (totalLength > visibleRows && this.rowHeight / 3 < (vh - (visibleRows * this.rowHeight))) {
            visibleRows = Math.min(visibleRows + 1, totalLength);
            this.rowClipped = 1;
        }

        // if visibleRows didn't change, simply void and return.
        if (this.visibleRows == visibleRows) {
            return;
        }

        this.visibleRows = visibleRows;

        // skip recalculating the row index if we are currently buffering, but
        // not if we
        // are just pre-buffering
        if (this.isBuffering && !this.isPrebuffering) {
            return;
        }

        // when re-rendering, doe not take the clipped row into account
        if (this.rowIndex + (visibleRows - this.rowClipped) > totalLength) {
            this.rowIndex = Math.max(0, totalLength - (visibleRows - this.rowClipped));
            this.lastRowIndex = this.rowIndex;
        }

        this.updateLiveRows(this.rowIndex, true);
    }


});
Ext.ns("sitools.user.component.dataviews.livegrid");

/**
 * The LiveGrid used to show Dataset Datas.
 * 
 * @cfg {string} dataUrl (Required) The datasetAttachment to request to load the datas 
 * @cfg {string} datasetId (Required)  The DatasetId, 
 * @cfg {Ext.grid.ColumnModel} datasetCm (Required) A definition of a ColumnModel 
 * @cfg {} userPreference {}  {
 *            componentSettings {Array} : Array of the Columns as saved by the user 
 *            windowSettings {Object} : { 
 *            moduleId : String 
 *                position : [xpos, ypos] 
 *                size : { 
 *                    width : w 
 *                    height : h 
 *                } 
 *                specificType : String 
 *            } 
 *      }
 * @cfg {Array} formParams list of the form params used to search thrue
 * the grid ["TEXTFIELD|AliasColumn1|X", "TEXTFIELD|AliasColumn2|Y"] 
 * @cfg {Array} filters Array of Ext.ux.Filter : [{ 
 *          columnAlias : Alias1, 
 *          data : {
 *            comparison : "LIKE", 
 *            type : "string", 
 *            value : "01" 
 *          } 
 *      }, {
 *            columnAlias : Alias2, 
 *            data : { 
 *              comparison : "gt", 
 *              type : "date",
 *              value : "199-11-04" 
 *            } 
 *      }] 
 *      
 * @requires sitools.user.component.dataviews.livegrid.LiveGrid.storeLiveGrid
 * @requires sitools.user.component.dataviews.ctxMenu
 * @requires sitools.user.component.columnsDefinition
 * @requires sitools.user.component.viewDataDetail
 * @requires Ext.ux.grid.GridFiltersSpe
 * @requires sitools.user.component.dataPlotter
 * @class sitools.user.component.dataviews.livegrid.LiveGrid
 * @extends Ext.ux.grid.livegrid.EditorGridPanel
 * 
 * 
 */
sitools.user.component.dataviews.livegrid.LiveGrid = function (config) {
//sitools.user.component.liveGrid = function (config) {
    /**
	 * @param {Array} listeColonnes
	 *            ColumnModel of the grid
	 * @param {Array} activeFilters
	 *            Definition of the filters used to build the grid
	 * 
	 * @returns {Array} The filters configuration for the grid
	 */
    function getFilters(listeColonnes, activeFilters) {

        var filters = [];
        var i = 0;
        if (!Ext.isEmpty(listeColonnes)) {
            // First loop on all the columns
            Ext.each(listeColonnes, function (item, index, totalItems) {
                if (item.filter) {
                    var boolActiveFilter = false, activeFilterValue = "", activeComparison = "";
                    // loop on active filters to determine if there is an active
                    // filter on the column
                    Ext.each(activeFilters, function (activeFilter) {
                        if (item.columnAlias == activeFilter.columnAlias) {
                            boolActiveFilter = true;
                            // construct the value for the specific filter
                            if (activeFilter.data.type == 'numeric') {
                                if (!Ext.isObject(activeFilterValue)) {
                                    activeFilterValue = {};
                                }
                                activeFilterValue[activeFilter.data.comparison] = activeFilter.data.value;
                            } else if (activeFilter.data.type == 'date') {
                                var date = new Date();
                                var tmp = activeFilter.data.value.split('-');
                                date.setFullYear(tmp[0], tmp[1] - 1, tmp[2]);

                                if (!Ext.isObject(activeFilterValue)) {
                                    activeFilterValue = {};
                                }
                                if (activeFilter.data.comparison == 'eq') {
                                    activeFilterValue.on = date;
                                }
                                if (activeFilter.data.comparison == 'gt') {
                                    activeFilterValue.after = date;
                                }
                                if (activeFilter.data.comparison == 'lt') {
                                    activeFilterValue.before = date;
                                }
                            } else {
                                activeFilterValue = activeFilter.data.value;
                            }
                        }
                    });
                    var filter = {
                        type : sql2ext.get(item.sqlColumnType),
                        active : boolActiveFilter,
                        dataIndex : item.columnAlias,
                        columnAlias : item.columnAlias,
                        value : activeFilterValue
                    };

                    filters.push(filter);
                }
                i++;

            }, this);
        }
        return filters;

    }


    /**
     * {String} urlRecords the url to request the API to get the records
     */
    this.urlRecords = config.dataUrl + '/records';
    /** 
     * {String} sitoolsAttachementForUsers the attachment url of the dataset
     */
    this.sitoolsAttachementForUsers = config.dataUrl;
    /** {String} datasetName the dataset Name */
    this.datasetName = config.datasetName;
    
    var xg = Ext.grid;

    var dataviewConfig = sitoolsUtils.arrayProperties2Object(config.datasetViewConfig);
    /*
	 * Construction of the column Model : user preferences have priority on the
	 * initial definition of the model column in the dataset
	 */
    var colModel;

    if (!Ext.isEmpty(config.userPreference) && config.userPreference.datasetView == "Ext.ux.livegrid" && !Ext.isEmpty(config.userPreference.colModel)) {
        colModel = config.userPreference.colModel;
    }
    else {
		colModel = config.datasetCm; 
    }
    var cm = getColumnModel(colModel, config.dictionaryMappings, dataviewConfig);


    /*
	 * the filters of the grid
	 */
    var filters = getFilters(config.datasetCm, config.filters);
    // Using the extended gridFilter to filter with the columnAlias
    var filtersSimple = new Ext.ux.grid.GridFiltersSpe({
        encode : false, // json encode the filter query
        local : false, // defaults to false (remote filtering)
        filters : filters
    });

    var myStoreSimple = new sitools.user.component.dataviews.livegrid.StoreLiveGrid({
		datasetCm : config.datasetCm,
		urlRecords : this.urlRecords,
		sitoolsAttachementForUsers : this.sitoolsAttachementForUsers,
		userPreference : config.userPreference, 
		bufferSize : DEFAULT_LIVEGRID_BUFFER_SIZE, 
		formParams : config.formParams, 
		formMultiDsParams : config.formMultiDsParams, 
		mainView : this, 
		datasetId : config.datasetId
	});
    
    myStoreSimple.addListener("beforeload", function (store, options) {
        //set the nocount param to false.
        //before load is called only when a new action (sort, filter) is applied
        if (!store.isInSort || store.isNewFilter) {
            options.params.nocount = false;
        } else {
            options.params.nocount = true;
        }
        store.isInSort = false;
        store.isNewFilter = false;
	    
	    
	    this._loadMaskAnchor = Ext.get(this.getView().mainBody.dom.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode);
	    
	    this._loadMaskAnchor.mask(i18n.get('label.waitMessage'), "x-mask-loading");
	    

        //this.el.mask(i18n.get('label.waitMessage'), "x-mask-loading");
    }, this);
    
    myStoreSimple.addListener("load", function (store, records, options) {
		if (this._loadMaskAnchor && this._loadMaskAnchor.isMasked()) {
			this._loadMaskAnchor.unmask();
		}
        

    }, this);    
    

	/*
	 * Here is where the magic happens: BufferedGridView. The nearLimit is a
	 * parameter for the predictive fetch algorithm within the view. If your
	 * bufferSize is small, set this to a value around a third or a quarter of
	 * the store's bufferSize (e.g. a value of 25 for a bufferSize of 100; a
	 * value of 100 for a bufferSize of 300). The loadMask is optional but
	 * should be used to provide some visual feedback for the user when the
	 * store buffers (the loadMask from the GridPanel will only be used for
	 * initial loading, sorting and reloading).
	 */
    var myViewSimple = new Ext.ux.grid.livegrid.GridView({
        nearLimit : DEFAULT_NEAR_LIMIT_SIZE, 
		loadMask : {
			msg : i18n.get('label.waitMessage'),
			msgCls : "x-mask-loading"
        }, 
        datasetViewConfig : dataviewConfig
    });
	
    /*
	 * BufferedRowSelectionModel introduces a different selection model and a
	 * new <tt>selectiondirty</tt> event. You can keep selections between
	 * <b>all</bb> ranges in the grid; records which are currently in the
	 * buffer and are selected will be added to the selection model as usual.
	 * Rows representing records <b>not</b> loaded in the current buffer will
	 * be marked using a predictive index when selected. Selected rows will be
	 * successively read into the selection store upon scrolling through the
	 * view. However, if any records get added or removed, and selection ranges
	 * are pending, the selectiondirty event will be triggered. It is up to the
	 * user to either clear the pending selections or continue with requesting
	 * the pending selection records from the data repository. To put the whole
	 * matter in a nutshell: Selected rows which represent records <b>not</b>
	 * in the current data store will be identified by their assumed index in
	 * the data repository, and <b>not</b> by their id property. Events such as
	 * <tt>versionchange</tt> or <tt>selectiondirty</tt> can help in telling
	 * if their positions in the data repository changed.
	 */
    var selModelSimple = new Ext.ux.grid.livegrid.RowSelectionModel({});

    /*
	 * PlotXY button for launching numeric data preview as a plot
	 */
    var plotButton = new Ext.Button({
        text : 'Plot',
        icon : loadUrl.get('APP_URL') + "/res/images/icons/plot.png",
        scope : this,
        listeners : {
            click : function (button, e) {
                e.stopEvent();
                var jsObj = sitools.user.component.dataPlotter;
                var componentCfg = {
                    dataplot : Ext.apply(myStoreSimple, {
                        datasetId : config.datasetId,
                        columnModel : button.scope.colModel
                    }), 
                    datasetName : config.datasetName, 
                    componentType : "plot"
                };
                var AppUserStorage = loadUrl.get('APP_USERSTORAGE_USER_URL').replace('{identifier}', userLogin);
                var windowConfig = {
                    id : "plot" + config.datasetId,
                    title : "Data plot : " + config.datasetName,
                    datasetName : config.datasetName,
                    type : "plot",
                    saveToolbar : true,
                    urlPreferences : loadUrl.get('APP_URL') + AppUserStorage + "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName + "/" + this.datasetName + "/plot", 
                    winHeight : 600
                };
                SitoolsDesk.addDesktopWindow(windowConfig, componentCfg, jsObj);
            }
        }
    });
    var ctxMenu = new sitools.user.component.dataviews.ctxMenu({
		grid : this, 
		event : null, 
		dataUrl : this.sitoolsAttachementForUsers, 
		datasetId : config.datasetId, 
		datasetName : this.datasetName, 
		origin : "Ext.ux.livegrid",
        urlDetail : this.sitoolsAttachementForUsers, 
        listeners : {
			scope : this, 
			beforeShow : function (menu) {
				//Refresh the grid associated to the menu.
				menu.setGrid(Ext.getCmp(this.id));
				menu.setSelections(this.getSelectionModel().getSelections());
			}
        }
    });
	/**
	 * {Ext.Toolbar} Top toolbar with services
	 */
	this.topBar = new Ext.Toolbar({
		items : [{
			text : 'Services', 
			menu : ctxMenu
        }, "-", {
            text : i18n.get("label.multiSort"),
            scope : this, 
            handler : function () {
                var pos = this.getPosition();

                //this.ownerCt.ownerCt reprensents the Window
                //this.ownerCt.ownerCt.items.items[0] reprensents the first (and only child of the window) -> the future component
                var up = new sitools.widget.sortersTool({
                    pos : pos,
                    store : this.getStore(),
                    columnModel : this.getColumnModel()
                });
                up.show();
            }, 
            icon : loadUrl.get('APP_URL') + "/common/res/images/icons/hmenu-asc-all.png"
        }, "-",
        plotButton, "-",
        {
            text : i18n.get('label.definitionTitle'),
            icon :  loadUrl.get('APP_URL') + "/common/res/images/icons/tree_dictionary.png",
            scope : this,
            handler : function () {
                
                var windowConfig = {
                    title : i18n.get('label.definitionTitle') + " : " + this.datasetName, 
                    datasetName : this.datasetName, 
                    datasetDescription : this.datasetDescription,
                    type : "defi",
                    saveToolbar : true, 
                    toolbarItems : []
                };
                
                var javascriptObject = sitools.user.component.columnsDefinition;
                Ext.apply(windowConfig, {
                    id : "defi" + this.datasetId
                });
                var componentCfg = {
                    datasetId : this.datasetId,
                    datasetCm : config.datasetCm, 
                    datasetName : this.datasetName,
                    dictionaryMappings : config.dictionaryMappings
                };
                
                SitoolsDesk.addDesktopWindow(windowConfig, componentCfg, javascriptObject);

            }
        }]
	});
    
    /**
     * {Ext.ux.grid.livegrid.Toolbar} Bottom bar of the liveGrid
     */
    this.bottomBar = new Ext.ux.grid.livegrid.Toolbar({
        view : myViewSimple,
        enableOverflow: true,
        displayInfo : true,
        refreshText : i18n.get('label.refreshText')
    });
    
    // -- CONSTRUCTOR --
	sitools.user.component.dataviews.livegrid.LiveGrid.superclass.constructor.call(this, Ext.apply({
	        view : myViewSimple,
	        store : myStoreSimple,
	        layout : 'fit',
	        cm : cm,
	        sm : selModelSimple,
	        bbar : this.bottomBar,
	        dataviewUtils : sitools.user.component.dataviews.dataviewUtils, 
	        tbar : this.topBar, 
	        columnLines : true,
	        datasetId : config.datasetId,
	        componentType : "data",
	        plugins : [ filtersSimple ],
	        listeners : {
	            rowcontextmenu : function (grid, rowIndex, e) {
	                e.stopEvent();
	                var selections = grid.getSelectionModel().getSelections();
	                var ctxMenuLeVrai = new sitools.user.component.dataviews.ctxMenu({
						grid : grid, 
						event : e, 
						dataUrl : this.sitoolsAttachementForUsers, 
						datasetId : this.datasetId, 
						datasetName : this.datasetName, 
						origin : "Ext.ux.livegrid",
	                    urlDetail : this.sitoolsAttachementForUsers
	                });
					var xy = e.getXY();
					ctxMenuLeVrai.showAt(xy);

					//console.log (ctxMenuLeVrai);
	            },
	            rowdblclick : function (grid, rowIndex, e) {
	                e.stopEvent();
	
	                // var desktop = window.SitoolsDesk.app.getDesktop();
	
	                var componentCfg = {
	                    baseUrl : this.urlRecords + "/",
	                    grid : grid, 
	                    fromWhere : "Ext.ux.livegrid", 
	                    datasetId : config.datasetId,
                        datasetUrl : this.sitoolsAttachementForUsers, 
                        selections : [grid.getSelectionModel().getSelected()]
	                };
	                var jsObj = sitools.user.component.viewDataDetail;
	                var AppUserStorage = loadUrl.get('APP_USERSTORAGE_USER_URL').replace('{identifier}', userLogin);
	                var windowConfig = {
	                    id : "dataDetail" + config.datasetId,
	                    title : i18n.get('label.viewDataDetail') + " : " + this.datasetName,
	                    datasetName : this.datasetName,
	                    saveToolbar : true,
	                    urlPreferences : loadUrl.get('APP_URL') + AppUserStorage + "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName + "/" + this.datasetName + "/dataDetail",
	                    type : "dataDetail", 
	                    toolbarItems : [{
			                icon : loadUrl.get('APP_URL') + "/common/res/images/icons/simple-arrow-left.png", 
			                handler : function () {
			                    this.ownerCt.ownerCt.items.items[0].goPrevious();
			                }
			            }, {
			                icon : loadUrl.get('APP_URL') + "/common/res/images/icons/simple-arrow-right.png", 
			                handler : function () {
								this.ownerCt.ownerCt.items.items[0].goNext();
			                }
			            }]
	                };
	                SitoolsDesk.addDesktopWindow(windowConfig, componentCfg, jsObj, true);
	            }
	        }
	    }, config));    

};

Ext.extend(sitools.user.component.dataviews.livegrid.LiveGrid, Ext.ux.grid.livegrid.EditorGridPanel, {
    svaList : null,
    /**
     * @private
	 * @returns the JsonColModel used to store the userPreferences.
	 */
    _getSettings : function () {
		return {
			colModel : extColModelToJsonColModel(this.colModel.config), 
			datasetView : "Ext.ux.livegrid",
			datasetUrl : this.sitoolsAttachementForUsers
        };

    },
    /**
     * @private
     * return the filters of the liveGrid.
     * @return [] Array of filter object 
     */
    getFilters : function () {
	    return this.filters;
	}, 
    /**
     * 
     * @return {String} 
     */
    getRequestParam : function () {
        var request = "", formParams = {};
    
        var colModel = extColModelToSrv(this.getColumnModel());
        if (!Ext.isEmpty(colModel)) {
            request += "&colModel=" + Ext.util.JSON.encode(colModel);
        }
    
        // First case : no records selected: build the Query
        if (Ext.isEmpty(this.getSelections())) {
			request += this.getRequestParamWithoutSelection();
        } 
        // Second case : Records are selected
        else {
            var recSelected;
            request += "&" + this.getRecSelectedParamForLiveGrid();
        }
        return request;
    }, 
    getSelections : function () {
		return this.getSelectionModel().getSelections();
    }, 
    
    getNbRowsSelected : function () {
		return this.getSelectionModel().getAllSelections(false).length;
    }, 
    getRequestParamWithoutSelection : function () {
		var result = "", formParams = {};
        // Add the filters params
        var filters = this.filters;
        if (!Ext.isEmpty(filters)) {
            filters = this.plugins[0].buildQuery(filters.getFilterData(filters));
            if (!Ext.isEmpty(Ext.urlEncode(filters))) {
                result += "&" + Ext.urlEncode(filters);
            }

        }
        // add the sorting params
        var storeSort = this.getStore().getSortState();
        if (!Ext.isEmpty(storeSort)) {
            var sort;
            if (!Ext.isEmpty(storeSort.sorters)) {
                sort = {
                    ordersList : storeSort.sorters
                };
            } else {
                sort = {
                    ordersList : [ storeSort ]
                };
            }
            result += "&sort=" + Ext.encode(sort);
        }

        // add the formParams
        var formParamsTmp = this.getStore().getFormParams(), i = 0;
        if (!Ext.isEmpty(formParamsTmp)) {
            Ext.each(formParamsTmp, function (param) {
                formParams["p[" + i + "]"] = param;
                i += 1;
            }, this);
            result += "&" + Ext.urlEncode(formParams);
        }
        return result;
    }, 
    /**
	 * @method
	 * will check if there is some pendingSelection (no requested records)
	 * <li>First case, there is no pending Selection, it will build a form parameter
	 * with a list of id foreach record.</li>
	 * <li>Second case, there is some pending Selection : it will build a ranges parameter
	 * with all the selected ranges.</li>
	 * @returns {} Depending on liveGridSelectionModel, will return either an object that will use form API 
	 * (p[0] = LISTBOXMULTIPLE|primaryKeyName|primaryKeyValue1|primaryKeyValue1|...|primaryKeyValueN), 
	 * either an object that will contain an array of ranges of selection 
	 * (ranges=[range1, range2, ..., rangen] where rangeN = [startIndex, endIndex])
	 * 
	 */
	getRecSelectedParamForLiveGrid : function () {
		var sm = this.getSelectionModel(), result;
		if (Ext.isEmpty(sm.getPendingSelections())) {
			//First Case : no pending Selections.
			var recSelected = sm.getSelections();
			result = Ext.urlEncode(this.dataviewUtils.getFormParamsFromRecsSelected(recSelected));
		}
		else {
			//Second Case : there is a pending Selection, send all the ranges.
			var ranges = sm.getAllSelections(true);
			result = "ranges=" + Ext.util.JSON.encode(ranges);
			//We have to re-build all the request in case we use a range selection.
            result += this.getRequestParamWithoutSelection();
		}
		return result;
	}
});

/**
 * @static
 * Implementation of the method getParameters to be able to load view Config panel.
 * @return {Array} the parameters to display into administration view. 
 */
sitools.user.component.dataviews.livegrid.LiveGrid.getParameters = function () {
	return [{
		jsObj : "Ext.slider.SingleSlider", 
		config : {
			minValue : 20, 
			maxValue : 100, 
			increment : 5, 
			width : 400,
			value : 25, 
			fieldLabel : i18n.get("label.lineHeight"), 
			plugins: [new Ext.ux.plugins.SliderRange(), new Ext.slider.Tip()], 
			parameterName : "lineHeight"
		}
	}];
};

 

Ext.reg('sitoolsLiveGrid', sitools.user.component.dataviews.livegrid.LiveGrid);
