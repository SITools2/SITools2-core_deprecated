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
 DEFAULT_PREFERENCES_FOLDER, SitoolsDesk, getDesktop, userLogin, projectGlobal, ColumnRendererEnum, SITOOLS_DATE_FORMAT
*/
Ext.namespace('sitools.user.component.dataviews');

/**
 * A Simple Object to publish common methods to use dataviews in Sitools2.
 * @type 
 */
sitools.user.component.dataviews.dataviewUtils = {
//sitools.user.component.liveGrid.dataviewUtils = {
	/**
	 * build the param that will represent the active selection.
	 * @param [Ext.data.Record] recSelected the selected records
	 * @returns {} this object contains the param that will use FORM API 
	 */
	getFormParamsFromRecsSelected : function (recSelected) {
        var rec = recSelected[0], result = {};
        var primaryKeyName = "";
        Ext.each(rec.fields.items, function (field) {
            if (field.primaryKey) {
                primaryKeyName = field.name;
            }
        });
        if (Ext.isEmpty(primaryKeyName)) {
            Ext.Msg.alert(i18n.get('label.error'), i18n.get('label.noPrimaryKey'));
            return;
        }
        // build the primaryKey Value
        var primaryKeyValues = [];
        Ext.each(recSelected, function (record) {
            primaryKeyValues.push(encodeURIComponent(record.get(primaryKeyName)));
        });

        // use the form API to request the selected records
        result["p[0]"] = "LISTBOXMULTIPLE|" + primaryKeyName + "|" + primaryKeyValues.join("|");
        return result;
	},
    

    /**
     * Get the renderer for a column from its featureType for the DataView
     * @param {Object} item col the Column definition
     * @param {Object} dataviewConfig the specific dataview Configuration.
     * @return {function} the renderer for a column
     */
    getRendererLiveGrid : function (item, dataviewConfig) {
        var renderer;
        if (!Ext.isEmpty(item.columnRenderer)) {
			renderer = function (value, metadata, record, rowIndex, colIndex,
					store) {
			    if (!Ext.isEmpty(value)) {
			        if (!Ext.isEmpty(item.columnRenderer.toolTip)){
			            metadata.attr = 'ext:qtip="' + item.columnRenderer.toolTip + '"';
			        }
			        
                    var imageStyle = "max-width:" + (item.width - 10) + "px;";
    	            if (!Ext.isEmpty(dataviewConfig) && !Ext.isEmpty(dataviewConfig.lineHeight)) {
    	                imageStyle += "max-height: " + (dataviewConfig.lineHeight - 10) + "px;";
    	            }
    				var html = sitools.user.component.dataviews.dataviewUtils.getRendererHTML(item, imageStyle);
                    var str;
                    if (!Ext.isEmpty(html)) {
                        if (item.columnRenderer.behavior == ColumnRendererEnum.IMAGE_FROM_SQL) {
    						var imageUrl = record.get(item.columnRenderer.columnAlias);						
    						str = String.format(html, value, imageUrl);
                        } else {
    				        str = String.format(html, value);
                        }
                    }
                    return str;
			    } else {
                    return value;
                }
                
			};
		} else {
            renderer = function (value) {
				var valueFormat = value;
				if (sql2ext.get(item.sqlColumnType) == 'dateAsString') {
					valueFormat = sitools.user.component.dataviews.dataviewUtils.formatDate(
							value, item);
				}
				if (sql2ext.get(item.sqlColumnType) == 'boolean') {
					valueFormat = value ? i18n.get('label.true') : i18n
							.get('label.false');
				}
				return valueFormat;
			};
        }
        return renderer;
    },
    

    
    /**
     * Get the template to render a column from its featureType for the DataView
     * @param {Object} col the Column definition
     * @param {String} style the style to add to the label part
     * @param {Object} dataviewConfig the specific dataview Configuration.
     * @return {String} a template to render a column from its featureType for the DataView
     */
    getRendererDataView : function (col, style, dataviewConfig) {
            var tplString = "", value, behavior, label, valueDisplayed;
	        var columnRenderer = col.columnRenderer;
	        if (!Ext.isEmpty(columnRenderer)) {
	            behavior = columnRenderer.behavior;
	            var html = sitools.user.component.dataviews.dataviewUtils.getRendererHTML(col, dataviewConfig);
		        switch (behavior) {
		        case ColumnRendererEnum.URL_LOCAL :
		        case ColumnRendererEnum.URL_EXT_NEW_TAB :
		        case ColumnRendererEnum.URL_EXT_DESKTOP :
	           
                case ColumnRendererEnum.DATASET_ICON_LINK :
		            if (!Ext.isEmpty(columnRenderer.linkText)) {
						tplString += String.format("<tpl if=\"this.isNotEmpty({0})\">", col.columnAlias);              
						value = String.format(html, "{" + col.columnAlias + "}");
						
						if(!Ext.isEmpty(columnRenderer.toolTip)){
						    tplString += String.format('<li  class="img-link" ext:qtip="{0}">', columnRenderer.toolTip);
						}
						
						tplString += String.format('<span class="dataview_columnValue"><div class=x-view-entete style="{2}">{0} </div> {1}</span>', col.header, value, style);
						tplString += "</tpl>";            
						tplString += String.format("<tpl if=\"this.isEmpty({0})\">", col.columnAlias);
						value = "";
						tplString += String.format('<span class="dataview_columnValue"><div class=x-view-entete style="{2}">{0} </div> {1}</span>', col.header, value, style);
						tplString += "</tpl>";
					} else if (!Ext.isEmpty(columnRenderer.image)) {
						tplString += String.format("<tpl if=\"this.isNotEmpty({0})\">", col.columnAlias);
						
						if(!Ext.isEmpty(columnRenderer.toolTip)){
                            tplString += String.format('<li  class="img-link" ext:qtip="{0}">', columnRenderer.toolTip);
                        }
						else {
						    tplString += String.format('<li  class="img-link" ext:qtip="{0}">', col.header);
						}
						tplString += String.format(html, "{" + col.columnAlias + "}");
						tplString += '</li></tpl>';
					}
		            break;
                case ColumnRendererEnum.IMAGE_THUMB_FROM_IMAGE :
                    tplString += String.format("<tpl if=\"this.isNotEmpty({0})\">", col.columnAlias);

                    if(!Ext.isEmpty(columnRenderer.toolTip)){
                        tplString += String.format('<li  class="img-link" ext:qtip="{0}">', columnRenderer.toolTip);
                    }
                    else {
                        tplString += String.format('<li  class="img-link" ext:qtip="{0}">', col.header);
                    }
                    tplString += String.format(html, "{" + col.columnAlias + "}");
                    tplString += '</li></tpl>';
                    break;
                case ColumnRendererEnum.IMAGE_FROM_SQL :
                    var imageUrl = "";
		            if (!Ext.isEmpty(columnRenderer.url)) {
		                imageUrl = columnRenderer.url;
		            } else if (!Ext.isEmpty(columnRenderer.columnAlias)) {
		                imageUrl = "{" + columnRenderer.columnAlias + "}";            
		            }
                    tplString += String.format("<tpl if=\"this.isNotEmpty({0})\">", col.columnAlias);
                    
                    if(!Ext.isEmpty(columnRenderer.toolTip)){
                        tplString += String.format('<li  class="img-link" ext:qtip="{0}">', columnRenderer.toolTip);
                    }
                    else {
                        tplString += String.format('<li  class="img-link" ext:qtip="{0}">', col.header, imageUrl);
                    }
                    
                    tplString += String.format(html, "{" + col.columnAlias + "}", imageUrl);
                    tplString += '</li></tpl>';
                    break;
	            default :	                              
                    tplString += String.format("<tpl if=\"this.isNotEmpty({0})\">", col.columnAlias);
	            
    	            if(!Ext.isEmpty(columnRenderer.toolTip)){
                        tplString += String.format('<li  class="img-link" ext:qtip="{0}">', columnRenderer.toolTip);
                    }
	            
                    value = String.format(html, "{" + col.columnAlias + "}");
	                tplString += String.format('<span class="dataview_columnValue"><div class=x-view-entete style="{2}">{0} </div> {1}</span>', col.header, value, style);
	                tplString += "</tpl>";            
	                tplString += String.format("<tpl if=\"this.isEmpty({0})\">", col.columnAlias);
	                value = "";
	                tplString += String.format('<span class="dataview_columnValue"><div class=x-view-entete style="{2}">{0} </div> {1}</span>', col.header, value, style);
	                tplString += "</tpl>";                    
	                break;
                }
            } else {
                if (sql2ext.get(col.sqlColumnType) == 'dateAsString') {
	                tplString += String.format('<span class="dataview_columnValue"><div class=x-view-entete style="{2}">{0} </div> <tpl if=\"this.isValidDate({1})\">{[Date.parseDate(values.{1}, SITOOLS_DATE_FORMAT).format("{3}")]}</tpl></span>', 
	                    col.header, 
	                    col.columnAlias, 
	                    style, 
	                    Ext.isEmpty(col.format) ? SITOOLS_DEFAULT_IHM_DATE_FORMAT : col.format);
	            }
	            else {
	                tplString += String.format('<span class="dataview_columnValue"><div class=x-view-entete style="{2}">{0} </div> {{1}}</span>', col.header, col.columnAlias, style);
	            }
            }
            
            return tplString;
        },
    
    /**
     * Get the HTML specific part to render a column corresponding to its featureType (columnRenderer)
     * It is a formated date where {0} must be replaced by the column value and {1} by the imageUrl to display in big only for ColumnRendererEnum.IMAGE_FROM_SQL
     * @param {Object} item the column definition
     * @param {Object} dataviewConfig the specific dataview Configuration.
     * @return {String} a formated HTML String 
     */
    getRendererHTML : function (item, imageStyle) {
        var renderer, valueDisplayed, imageUrl;
        var html;
        if (!Ext.isEmpty(item.columnRenderer) && !Ext.isEmpty(item.columnRenderer.behavior)) {
            
            var columnRenderer = item.columnRenderer;
            switch (columnRenderer.behavior) {
            case ColumnRendererEnum.URL_LOCAL :
                valueDisplayed = "";
                if (!Ext.isEmpty(columnRenderer.linkText)) {
                    valueDisplayed = columnRenderer.linkText;
                } else if (!Ext.isEmpty(columnRenderer.image)) {
                    valueDisplayed = "<img src=\"" + columnRenderer.image.url + "\" class='sitools-display-image' style ='" + imageStyle + "' ></img>";
                }
                html = "<a href='#' onClick='sitools.user.component.dataviews.dataviewUtils.downloadData(\"{0}\");'>" + valueDisplayed + "</a>"; 
                break;
            case ColumnRendererEnum.URL_EXT_NEW_TAB :
                valueDisplayed = "";
                if (!Ext.isEmpty(columnRenderer.linkText)) {
                    valueDisplayed = columnRenderer.linkText;
                } else if (!Ext.isEmpty(columnRenderer.image)) {
                    valueDisplayed = "<img  src=\"" + columnRenderer.image.url + "\" class='sitools-display-image' style ='" + imageStyle + "' ></img>";
                }
                html = "<a href='#' onClick='window.open(\"{0}\");'>" + valueDisplayed + "</a>"; 
                break;
            case ColumnRendererEnum.URL_EXT_DESKTOP :
                valueDisplayed = "";
                if (!Ext.isEmpty(columnRenderer.linkText)) {
                    valueDisplayed = columnRenderer.linkText;
                } else if (!Ext.isEmpty(columnRenderer.image)) {
                    valueDisplayed = "<img src=\"" + columnRenderer.image.url + "\" class='sitools-display-image' style ='" + imageStyle + "' ></img>";
                }
                html = "<a href='#' onClick='sitools.user.component.dataviews.dataviewUtils.showDisplayableUrl(\"{0}\", " + columnRenderer.displayable + ");'>" + valueDisplayed + "</a>"; 
                              
                break;
            case ColumnRendererEnum.IMAGE_NO_THUMB :
                html = "<a href='#' onClick='sitools.user.component.dataviews.dataviewUtils.showPreview(\"{0}\",\"" + columnRenderer.linkText + "\");'>" + columnRenderer.linkText + "</a>"; 
                break;
            case ColumnRendererEnum.IMAGE_THUMB_FROM_IMAGE :
                html = "<a href='#' onClick='sitools.user.component.dataviews.dataviewUtils.showPreview(\"{0}\",\"" + item.header + "\");'><img class='sitools-display-image' src='{0}' style ='" + imageStyle + "'></img></a>"; 
                break;
            case ColumnRendererEnum.IMAGE_FROM_SQL :
                html = "<div style='text-align:center;'><a href='#' onClick='sitools.user.component.dataviews.dataviewUtils.showPreview(\"{0}\",\"" + item.header + "\");'><img class='sitools-display-image' src='{1}' style ='" + imageStyle + "'></a></div>"; 
                break;
            case ColumnRendererEnum.DATASET_LINK :
                html = "<a href='#' onClick='sitools.user.component.dataviews.dataviewUtils.showDetailsData(\"{0}\"," +
                        "\"" + columnRenderer.columnAlias + "\", \""
                            + columnRenderer.datasetLinkUrl + "\");'>{0}</a>"; 
                break;
            case ColumnRendererEnum.DATASET_ICON_LINK :
                if (!Ext.isEmpty(columnRenderer.image)) {
                    imageUrl = columnRenderer.image.url;                    
                }
                html = "<a href='#' onClick='sitools.user.component.dataviews.dataviewUtils.showDetailsData(\"{0}\", \"" + columnRenderer.columnAlias + "\", \""
                    + columnRenderer.datasetLinkUrl + "\");'><img style ='" + imageStyle + "' class='sitools-display-image' src='" + imageUrl + "'></a>";
                break;
            default : 
                html = "{0}"; 
                break;
            }
        } 
        return html;
    },
    
    getRendererViewDataDetails : function (item) {
        
        
    },
    
    
    
    formatDate : function (value, item) {
        var valueFormat;
        var result = Date.parseDate(value, SITOOLS_DATE_FORMAT, true);                
        // try to build Date with "Y-m-d" format
        if (Ext.isEmpty(result)) {
            valueFormat = "";
        }
        else {
            if (Ext.isEmpty(item.format)) {
                valueFormat = result.format(SITOOLS_DEFAULT_IHM_DATE_FORMAT);
            }
            else {
                try {
                    valueFormat = result.format(item.format);
                }
                catch (err) {
                    valueFormat = "unable to format Date";
                }
            }
        }
        return valueFormat;    
    }, 
	/**
	 * @static
	 * Execute a REST OPTION request to the value url. 
	 * Switch on Content-Type value to determine if we open a new iframe, or a window. 
	 * @param {} value the url to request 
	 */
	downloadData : function (value) {
	//    value = encodeURIComponent(value);
	   //build first request to get the headers
	    Ext.Ajax.request({
			url : value,
			method : 'HEAD',
			scope : this,
			success : function (ret) {
				try {
					var headerFile = ret.getResponseHeader("Content-Type")
							.split(";")[0].split("/")[0];
					if (headerFile == "text") {
						Ext.Ajax.request({
							url : value,
							method : 'GET',
							scope : this,
							success : function (ret) {
								var windowConfig = {
									id : "winPreferenceDetailId",
									title : value
								};
								var jsObj = Ext.Panel;
								var componentCfg = {
									layout : 'fit',
									autoScroll : true,
									html : ret.responseText
								};
								SitoolsDesk.addDesktopWindow(
										windowConfig, componentCfg,
										jsObj);
							}
						});
					} else if (headerFile == "image") {
	                    sitools.user.component.dataviews.dataviewUtils.showPreview(value, item.header);
					} else {
						sitools.user.component.dataviews.dataviewUtils.downloadFile(value);         
					}
				} catch (err) {
					Ext.Msg.alert(i18n.get('label.error'), err);
				}
			},
			failure : function (ret) {
				return null;
			}
		});
	}, 
	/**
	 * @static
	 * Build a MIF panel with a given url and load it into the desktop 
	 * @param {} value the url to request 
     * @param {boolean} true if the url is displayable in a window, false otherwise
	 */
	showDisplayableUrl : function (value, isDisplayable) {
	    if (isDisplayable) {
		    var windowConfig = {
		        title : value,
		        id : value
		    };
		    
		    var jsObj = Ext.ux.ManagedIFrame.Panel;
		    var componentCfg = {
		        defaults : {
		            padding : 10
		        },
		        layout : 'fit',
		        region : 'center',
		        defaultSrc : value
		    };
		    
		    SitoolsDesk.addDesktopWindow(
		            windowConfig, componentCfg,
		            jsObj);
        } else {             
            sitools.user.component.dataviews.dataviewUtils.downloadFile(value);                
        }
	    
	}, 
	/**
	 * Use a spcialized MIF to download datas...
	 * @param {String} url the url to request.
	 */
	downloadFile : function (url) {
		if (Ext.getCmp("mifToDownload")) {
			Ext.getCmp("mifToDownload").destroy();
		}
		var mifToDownload = new Ext.ux.ManagedIFrame.Panel({
			layout : 'fit',
			id : "mifToDownload", 
	        region : 'center',
	        defaultSrc : url, 
	        renderTo : Ext.getBody(), 
	        cls : 'x-hidden'
		});
		
	}, 
	/**
	 * @static 
	 * Definition of the showDetailData method used by the columnRenderer. Calls the
	 * Livegrid corresponding to the dataset linked to the column. To filter the
	 * data : use the form API : ["RADIO|" + columnAlias + "|'" + value + "'"]
	 * @param {string} value
	 * @param {string} columnAlias
	 * @param {string} datasetUrl
	 */
	showDetailsData : function (value, columnAlias, datasetUrl) {
	    var desktop = getDesktop();
	
	    // récupération des données du dataset
	    Ext.Ajax.request({
	        scope : this,
	        method : 'GET',
	        url : datasetUrl,
	        success : function (response, opts) {
	            try {
	                var json = Ext.decode(response.responseText);
	                if (!json.success) {
	                    Ext.Msg.alert(i18n.get('label.error'), json.message);
	                    return;
	                }
	                var formParams = [ "RADIO|" + columnAlias + "|" + value ];
	                var dataset = json.dataset;
	                var jsObj = eval(dataset.datasetView.jsObject);
	                var componentCfg = {
	                    dataUrl : dataset.sitoolsAttachementForUsers,
	                    datasetId : dataset.id,
	                    datasetCm : dataset.columnModel,
	                    formParams : formParams, 
	                    datasetName : dataset.name, 
	                    dictionaryMappings : dataset.dictionaryMappings, 
		                datasetViewConfig : dataset.datasetViewConfig
	                };
	                
	                var AppUserStorage = loadUrl.get('APP_USERSTORAGE_USER_URL').replace('{identifier}', userLogin);
	                var windowConfig = {
	                    id : "wind" + dataset.id + columnAlias + value,
	                    title : i18n.get('label.dataTitle') + " : " + dataset.name,
	                    datasetName : dataset.name,
	                    type : "data",
	                    saveToolbar : true,
	                    urlPreferences : loadUrl.get('APP_URL') + AppUserStorage + "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName + "/" + dataset.name + "/data"
	                };
	                SitoolsDesk.addDesktopWindow(windowConfig, componentCfg, jsObj);
	
	            } catch (err) {                
	            }
	        }
	    });

	}, 
	/**
	 * @static 
	 * Definition of the showPreview method used by the columnRenderer.
	 * @param {string} value The img src
	 */
	showPreview : function (value, title) {
	    var previewWin = new sitools.widget.WindowImageViewer({            
	            title : title,
	            src : value,
	            hideAction : 'close',
	            resizeImage : false
	        });
	    
	    previewWin.show();
	    previewWin.toFront();
	}, 
	/**
	 * Return true if the column is NoClientAccess
	 * @param {Object} column the column object
	 * @return {boolean} true if the column should not be used in client
	 */
	isNoClientAccess : function (column) {
		return !Ext.isEmpty(column.columnRenderer) &&  ColumnRendererEnum.NO_CLIENT_ACCESS == column.columnRenderer.behavior;
	}

};