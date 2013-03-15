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
/*global Ext, sitools, projectGlobal, commonTreeUtils, showResponse, DEFAULT_PREFERENCES_FOLDER, 
 document, i18n, $, Flotr, userLogin, SitoolsDesk, comboY, drawPlotButton, getPlotConfig, sql2ext, loadUrl,
 SITOOLS_DATE_FORMAT, SITOOLS_DEFAULT_IHM_DATE_FORMAT, getColumn*/
/*
 * @include "../viewDataDetail/viewDataDetail.js"
 * @include "../../sitoolsProject.js"
 */
/**
 * 
 * <a href="https://sourceforge.net/tracker/?func=detail&aid=3313793&group_id=531341&atid=2158259">[3313793]</a><br/>
 * 16/06/2011 m.gond {Display the right number of data plotted} <br/>
 * 
 * ExtJS layout for plotting data
 */

Ext.namespace('sitools.user.component');

/**
 * @cfg {} dataplot The store that contains the records
 * @cfg {string} datasetName the dataset Name
 * @cfg {string} componentType Should be "plot"
 * @requires sitools.user.component.viewDataDetail
 * @class sitools.user.component.dataPlotter
 * @extends Ext.Panel
 */
sitools.user.component.dataPlotter = function (config) {
//sitools.component.users.datasets.dataPlotter = function (config) {

    /** Variable to know if the plot has been done once */
    var hasPlotted = false;

    /** function to get numeric fields */
    function getNumericFields(arrayFields) {
        var numericFields = [];
        var store = new Ext.data.JsonStore({
			fields : [{
				name : "columnAlias", 
				type : "string"
			}, {
				name : "sqlColumnType", 
				type : "string"
			}]
        });
        Ext.each(arrayFields, function (field) {
            if (!Ext.isEmpty(field.sqlColumnType)) {
                var extType = sql2ext.get(field.sqlColumnType);
                if (extType.match(/^(numeric)+[48]?$/gi) !== null && !field.hidden) {
                    store.add(new Ext.data.Record(field));
                }
                if (extType.match(/dateAsString/gi) !== null && !field.hidden) {
                    store.add(new Ext.data.Record(field));
                }
            }  
        }, this);
        
        return store;
    }
    
    /** function to get numeric fields */
    function getVisibleFields(arrayFields) {
        var visibleFields = [];
        Ext.each(arrayFields, function (field) {
            if (!field.hidden) {
                visibleFields.push(field.columnAlias);
            }
        }, this);
        return visibleFields;
    }

    /**
     * Buffer size for display in the bottom bar
     */
    var bufferSize = config.dataplot.getCount();

    /**
     * Buffer range for display in the bottom bar
     */
    var bufferRange = config.dataplot.bufferRange;

    /**
     * Dataset url for data details
     */
    var dataUrl = config.dataplot.dataUrl;

    /**
     * Point tag
     */
    var pointTag = null;

    var columnModel = config.dataplot.columnModel;
    
    /** Initial fields list */
    var initialFields = getNumericFields(config.dataplot.columnModel.columns);
    /** Point tag field list */
    var pointTagFields = getVisibleFields(config.dataplot.columnModel.columns);
    
    /** Initial data */
    var rawData = config.dataplot.data.items;

    /** field for x axis label */
    var titleX = new Ext.form.Field({
        fieldLabel : i18n.get('label.plot.form.xlabel'), 
        anchor : "95%",
        name : "titleX"
    });
    /** field for x axis label */
    var xFormat = null;

    /** field for y axis label */
    var titleY = new Ext.form.Field({
        fieldLabel : i18n.get('label.plot.form.ylabel'), 
        anchor : "95%",
        name : "titleY"
    });
    /** field for x axis label */
    var yFormat = null;

    
    /** combobox for x field */
    var comboX = new Ext.form.ComboBox({
        store : initialFields, 
        anchor : "95%",
        name : "comboX",
        allowBlank : false,
        emptyText : i18n.get('label.plot.select.xaxis'),
        fieldLabel : i18n.get('label.plot.select.xcolumn'),
        selectOnFocus : true,
        triggerAction : 'all',
        valueField : "columnAlias", 
        displayField : "columnAlias", 
        editable : false,
        mode : 'local',
        listeners : {
            scope : this, 
            select : function (combo, record, index) {
                titleX.setValue(combo.getValue());
                var extType = sql2ext.get(record.get("sqlColumnType"));
                if (extType.match(/dateAsString/gi) !== null) {
                    if (Ext.isEmpty(xFormat)) {
						xFormat = new Ext.form.Field({
	                        fieldLabel : i18n.get('label.plot.form.xFormat'), 
					        anchor : "95%",
							name : "xFormat",
							value : config.userPreference && config.userPreference.xFormat ? config.userPreference.xFormat : SITOOLS_DEFAULT_IHM_DATE_FORMAT
					    });
	                    this.fieldSetX.insert(1, xFormat);
                    }
                }
                else {
					this.fieldSetX.remove(xFormat);
					xFormat = null;
                }
                this.fieldSetX.doLayout();
            },
            expand : function (combo) {
                combo.store.clearFilter(true);
                if (comboY.getValue() !== '' && comboY.getValue() !== null) {
                    combo.store.filterBy(function (record, id) {
                        return record.get('field1') !== comboY.getValue();
                    });
                }

            }
        }
    });
    
    /** combo box for y data */
    var comboY = new Ext.form.ComboBox({
        store : initialFields, 
        name : "comboY",
        allowBlank : false,
        anchor : "95%",
        emptyText : i18n.get('label.plot.select.yaxis'),
        fieldLabel : i18n.get('label.plot.select.ycolumn'),
        selectOnFocus : true,
        editable : false,
        valueField : "columnAlias", 
        displayField : "columnAlias", 
        triggerAction : 'all',
        mode : 'local',
        listeners : {
            scope : this, 
            select : function (combo, record, index) {
                titleY.setValue(combo.getValue());
                var extType = sql2ext.get(record.get("sqlColumnType"));
                if (extType.match(/dateAsString/gi) !== null) {
                    if (Ext.isEmpty(yFormat)) {
						yFormat = new Ext.form.Field({
	                        fieldLabel : i18n.get('label.plot.form.yFormat'), 
					        anchor : "95%",
							name : "yFormat",
							value : config.userPreference && config.userPreference.yFormat ? config.userPreference.yFormat : SITOOLS_DEFAULT_IHM_DATE_FORMAT
					    });
//	                    if (Ext.isEmpty(xFormat)) {
//							this.leftPanel.insert(2, yFormat);
//	                    }
//	                    else {
//							this.leftPanel.insert(3, yFormat);
//	                    }
					    this.fieldSetY.insert(1, yFormat);
                    }
                }
                else {
					this.fieldSetY.remove(yFormat);
					yFormat = null;
                }
                this.fieldSetY.doLayout();
            },
            expand : function (combo) {
                combo.store.clearFilter(true);
                if (comboX.getValue() !== '' && comboX.getValue() !== null) {
                    combo.store.filterBy(function (record, id) {
                        return record.get('field1') !== comboX.getValue();
                    });
                }

            }
        }
    });

    /** field for x axis label */
    var titlePlot = new Ext.form.Field({
        anchor : "95%",
        fieldLabel : i18n.get('label.plot.form.title'), 
        name : "titlePlot"
    });

    /** checkbox for drawing line */
    var checkLine = new Ext.form.Checkbox({
        fieldLabel : i18n.get('label.plot.form.drawline'), 
        name : "checkLine",
        scope : this,
        listeners : {
            check : function (checkbox, checked) {
                if (!drawPlotButton.disabled && hasPlotted) {
                    drawPlotButton.fireEvent('click', null);
                }
            }
        }
    });

    /** Combo box for tag title */
    var comboTag = new Ext.form.ComboBox({
        store : pointTagFields,
        name : "comboTag",
        anchor : "95%",
        allowBlank : true,
        emptyText : i18n.get('label.plot.select.tag'),
        fieldLabel : i18n.get('label.plot.select.tagcolumn'),
        selectOnFocus : true,
        triggerAction : 'all',
        mode : 'local',
        scope : this,
        listeners : {
            select : function (combo, record, index) {
                if (!drawPlotButton.disabled && hasPlotted) {
                    drawPlotButton.fireEvent('click', null);
                }
            }
        }
    });
    
    var comboXColor = new sitools.widget.colorField({
		fieldLabel : i18n.get('label.plot.label.color'),
        anchor : "95%",
		name : "comboXColor"
	});
    
    var comboYColor = new sitools.widget.colorField({
		fieldLabel : i18n.get('label.plot.label.color'),
        anchor : "95%",
		name : "comboYColor", 
		value : "#000000"
	});
	this.fieldSetX = new Ext.form.FieldSet({
		title : i18n.get('title.plot.xAxis'), 
		items : [comboX, titleX, comboXColor], 
		collapsible : true
	});
	this.fieldSetY = new Ext.form.FieldSet({
		title : i18n.get('title.plot.yAxis'), 
		items : [comboY, titleY, comboYColor], 
		collapsible : true
	});
    /** right panel is the plot place */
    var rightPanel = new Ext.Panel({
        id : 'plot-right-panel',
        title : i18n.get('title.plot.panel'),
        region : 'center',
        margins : '2 2 2 1',
        scope : this,
        listeners : {
            bodyresize : function (window, width, height) {
                if (this.isVisible() && hasPlotted) {
                    drawPlotButton.fireEvent('click', null);
                }
            }
        }
    });
        /** button to draw the plot */
    var drawPlotButton = new Ext.Button({
        text : i18n.get('label.plot.draw'),
        disabled : true,
        listeners : {
            scope : this, 
			click : function (button, e) {
                var plotConfig = getPlotConfig(columnModel);
                this.plot = Flotr.draw($(rightPanel.body.id), [ plotConfig.data ], plotConfig.config);
                $(rightPanel.body.id).stopObserving('flotr:click');
                $(rightPanel.body.id).observe('flotr:click', function (evt) {
                    var idx = encodeURIComponent(evt.memo[1].prevHit.primaryKey);
                    var jsObj = sitools.user.component.viewDataDetail;
                    var componentCfg = {
                        datasetUrl : dataUrl, 
                        baseUrl : dataUrl + '/records',
                        datasetId : config.dataplot.datasetId, 
                        fromWhere : "plot",
                        url : dataUrl + '/records/' + idx
                    };
                    var AppUserStorage = loadUrl.get('APP_USERSTORAGE_USER_URL').replace('{identifier}', userLogin);
                    var windowConfig = {
                            id : "simpleDataDetail" + config.datasetId, 
                            title : i18n.get('label.viewDataDetail') + " : " + evt.memo[1].prevHit.primaryKey,
                            datasetName : config.datasetName, 
                            saveToolbar : false, 
                            urlPreferences : loadUrl.get('APP_URL') + AppUserStorage + "/" + DEFAULT_PREFERENCES_FOLDER + "/" + projectGlobal.projectName + "/" + config.datasetName + "/simpleDataDetail",
                            type : "simpleDataDetail"
                        };
                    SitoolsDesk.addDesktopWindow(windowConfig, componentCfg, jsObj, true);
                });
                $(rightPanel.body.id).stopObserving('flotr:select');
                $(rightPanel.body.id).observe('flotr:select', function (evt) {
                    var area = evt.memo[0];
                    var options = plotConfig.config;
                    options.xaxis.min = area.x1;
                    options.xaxis.max = area.x2;
                    options.yaxis.min = area.y1;
                    options.yaxis.max = area.y2;
                    this.plot = Flotr.draw($(this.id), [ plotConfig.data ], options);
                });
                hasPlotted = true;
            }
        }
    });

    /** left panel is a form */
    this.leftPanel = new Ext.FormPanel({
        title : i18n.get('title.plot.form'),
        region : 'west',
        split : true,
        width : 300,
        autoScroll : true, 
        collapsible : true,
        margins : '2 1 2 2',
        cmargins : '2 2 2 2',
        padding : '5',
        monitorValid : true,
        items : [ titlePlot, checkLine, comboTag, this.fieldSetX, this.fieldSetY],
        buttons : [drawPlotButton],
        listeners : {
            clientvalidation : function (panel, valid) {
                if (valid && (comboX.getValue() !== comboY.getValue())) {
                    drawPlotButton.setDisabled(false);
                } else {
                    drawPlotButton.setDisabled(true);
                }
            }
        }
    });

    
    
    /** Bottom bar with current records */
    var bbar = new Ext.Toolbar({
        items : [ '->', {
            id : 'plot-tb-text',
            xtype : 'tbtext',
            text : 'Displaying ' + bufferSize + ' record' + (bufferSize > 1 ? 's' : '') + ' from ' + (bufferRange[0] + 1) + ' to ' + (bufferRange[1] + 1)
        } ]
    });
    
    /** Automatic plot refresh when buffering */
    rightPanel.addListener('buffer', 
		function (storage, rowindex, min, total) {
			if (this.isVisible() && hasPlotted) {
				rawData = storage.data.items;
				bufferSize = storage.bufferSize;
				bufferRange = storage.bufferRange;
				bbar.findById('plot-tb-text').setText(
                'Displaying ' + bufferSize + ' record' + (bufferSize > 1 ? 's' : '') + ' from ' + (bufferRange[0] + 1) + ' to ' + (bufferRange[1] + 1));
				var plotConfig = getPlotConfig(columnModel, rawData);
				this.plot = Flotr.draw($(rightPanel.body.id), [ plotConfig.data ], plotConfig.config);
			}
		}, 
		this
	);

    /**
     * Function to create plot-able dataset from the store
     */
    function createData(columnModel, storeItems) {
        var outData = [];
        Ext.each(storeItems, function (item) {
            var tag = comboTag.getValue() !== '' ? item.get(comboTag.getValue()) : null;
            var colXType = sql2ext.get(getColumn(columnModel, comboX.getValue()).sqlColumnType);
            var colYType = sql2ext.get(getColumn(columnModel, comboY.getValue()).sqlColumnType);
            var xValue, yValue;
            switch (colXType) {
            case "dateAsString" : 
				xValue = Date.parseDate(item.get(comboX.getValue()), SITOOLS_DATE_FORMAT, true);
                if (!Ext.isEmpty(xValue)) {
					xValue = xValue.getTime();	
                }
				break;
            case "numeric" : 
				xValue = parseFloat(item.get(comboX.getValue()));
				break;
            default : 
				xValue = item.get(comboX.getValue());
				break;
            }
            switch (colYType) {
            case "dateAsString" : 
				var value = item.get(comboY.getValue());
				yValue = Date.parseDate(value, SITOOLS_DATE_FORMAT, true);
                
                if (!Ext.isEmpty(yValue)) {
					yValue = yValue.getTime();	
                }
                break;
            case "numeric" : 
				yValue = parseFloat(item.get(comboY.getValue()));
				break;
            default : 
				yValue = item.get(comboY.getValue());
				break;
            }
            outData.push([ xValue, yValue, item.id, tag ? tag : item.id ]);
        }, this);
        return outData;
    }

    // /** Function to transform log checks in plot styles */
    // function scaleTypeFromCheckBox (checkbox) {
    // var style = 'linear';
    // if (checkbox.getValue()) {
    // style = 'logarithmic';
    // }
    // return style;
    // }

    function getColumn(columnModel, columnAlias) {
		var result;
		for (var i = 0; i < columnModel.columns.length; i++) {
			if (columnModel.columns[i].columnAlias == columnAlias) {
				result = columnModel.columns[i];
			}
		}
		return result;
    }
    /** Main function to draw the plot */
    function getPlotConfig(columnModel, newdata) {
        var d1 = createData(columnModel, newdata || rawData);
        var yAxisFormat = "Normal";
        var colY = getColumn(columnModel, comboY.getValue());
        var colYType = sql2ext.get(colY.sqlColumnType);
        
        var xAxisFormat = "Normal";
        var colX = getColumn(columnModel, comboX.getValue());
        var colXType = sql2ext.get(colX.sqlColumnType);
        
        var plotConfig = {
            HtmlText : false,
            colors : [ '#00A8F0', '#C0D800', '#cb4b4b', '#4da74d', '#9440ed' ], // =>
            // The
            // default
            // colorscheme.
            // When
            // there
            // are
            // > 5
            // series,
            // additional
            // colors
            // are
            // generated.
            title : titlePlot.getValue(),
            legend : {
                show : true, // => setting to true will show the legend, hide
                // otherwise
                noColumns : 1, // => number of colums in legend table
                labelFormatter : null, // => fn: string -> string
                labelBoxBorderColor : '#ccc', // => border color for the
                // little label boxes
                container : null, // => container (as jQuery object) to put
                // legend in, null means default on top of
                // graph
                position : 'ne', // => position of default legend container
                // within plot
                margin : 5, // => distance from grid edge to default legend
                // container within plot
                backgroundColor : '#CCCCCC', // => null means auto-detect
                backgroundOpacity : 1.0
            // => set to 0 to avoid background, set to 1 for a solid background
            },
            xaxis : {
                ticks : null, // => format: either [1, 3] or [[1, 'a'], 3]
                noTicks : 5, // => number of ticks for automagically
                color : comboXColor.getValue() ? comboXColor.getValue() : "#000000", 
                tickFormatter : function (value) {
					if (colXType == "dateAsString") {
						var dt = new Date();
						dt.setTime(value);
						return dt.format(xFormat ? xFormat.getValue() : SITOOLS_DEFAULT_IHM_DATE_FORMAT);	
					}
					return value;
                }, 
                // generated ticks
                tickDecimals : null, // => no. of decimals, null means auto
                min : null, // => min. value to show, null means set
                // automatically
                max : null, // => max. value to show, null means set
                // automatically
                autoscaleMargin : 0, // => margin in % to add if auto-setting
                // min/max
                title : titleX.getValue(), 
                mode : colXType == "dateAsString" ? "time" : "Normal", 
                labelsAngle : colXType == "dateAsString" ? 45 : 0, 
                timeFormat : this.xFormat ? this.xFormat.getValue() : SITOOLS_DATE_FORMAT

            // ,
            // scale : scaleTypeFromCheckBox(logX)
            },
            yaxis : {
                ticks : null, // => format: either [1, 3] or [[1, 'a'], 3]
                color : comboYColor.getValue() ? comboYColor.getValue() : "#000000", 
                noTicks : 5, // => number of ticks for automagically
                // generated ticks
                tickDecimals : null, // => no. of decimals, null means auto
                tickFormatter : function (value) {
					if (colYType == "dateAsString") {
						var dt = new Date();
						dt.setTime(value);
						return dt.format(yFormat ? yFormat.getValue() : SITOOLS_DEFAULT_IHM_DATE_FORMAT);	
					}
					return value;
                }, 
                min : null, // => min. value to show, null means set
                // automatically
                max : null, // => max. value to show, null means set
                // automatically
                autoscaleMargin : 0, // => margin in % to add if auto-setting
                // min/max
                title : titleY.getValue(), 
                mode : colYType == "dateAsString" ? "time" : "Normal", 
                labelsAngle : 0, 
                timeFormat : SITOOLS_DATE_FORMAT
                
            // ,
            // scale : scaleTypeFromCheckBox(logY)
            },
            y2axis : {
                title : ' '
            },
            points : {
                show : true, // => setting to true will show points, false
                // will hide
                radius : 3, // => point radius (pixels)
                lineWidth : 2, 
                fill : true, // => true to fill the points with a color,
                // false for (transparent) no fill
                fillColor : '#ffffff' // => fill color
            },
            lines : {
                show : checkLine.getValue(), // => setting to true will show
                // lines, false will hide
                lineWidth : 0.1, // => line width in pixels
                fill : false, // => true to fill the area from the line to the
                // x axis, false for (transparent) no fill
                fillColor : null
            // => fill color
            },
            grid : {
                color : '#545454', // => primary color used for outline and
                // labels
                backgroundColor : '#FFFFFF', // => null for transparent, else
                // color
                tickColor : '#dddddd', // => color used for the ticks
                labelMargin : 3
            // => margin in pixels
            },
            selection : {
                mode : 'xy', // => one of null, 'x', 'y' or 'xy'
                color : '#B6D9FF', // => selection box color
                fps : 10
            // => frames-per-second
            },
            spreadsheet : {
                show : false
            },
            mouse : {
                track : true, // => true to track the mouse, no tracking
                // otherwise
                position : 'se', // => position of the value box (default
                // south-east)
                margin : 2, // => margin in pixels of the valuebox
                color : '#ff3f19', // => line color of points that are drawn
                // when mouse comes near a value of a series
                trackDecimals : 1, // => decimals for the track values
                sensibility : 10 * 1000000000, // => the lower this number, the more
                // precise you have to aim to show a value
                radius : 3
            // => radius of the track point
            },
            shadowSize : 4
        // => size of the 'fake' shadow
        };
        var out = {
            data : d1,
            config : plotConfig
        };
        return out;
    }
    
    /*
     * Constructor call
     */
    sitools.user.component.dataPlotter.superclass.constructor.call(this, Ext.apply({
        id : 'plot-panel',
        layout : 'border',
        items : [ this.leftPanel, rightPanel ],
        bbar : bbar
    }, config));
    
};

Ext.extend(sitools.user.component.dataPlotter, Ext.Panel, {
	/** 
     * Must be implemented to save window Settings
     * @return {}
     */
    _getSettings : function () {
        return this.leftPanel.getForm().getValues();
    }, 
    /**
     * Load the userPreferences...
     */
    afterRender : function () {
		sitools.user.component.dataPlotter.superclass.afterRender.call(this);
		this.el.on("contextmenu", function (e, t, o) {
			e.stopEvent();
			var ctxMenu = new Ext.menu.Menu({
				items : [{
					text : i18n.get('label.plot.savePng'), 
					scope : this, 
					handler : function () {
						this.plot.saveImage("png", "plotImage");
					}
				}]
			});
			ctxMenu.showAt(e.getXY());
//			this.plot.saveImage("png");
		}, this);

		if (Ext.isEmpty(this.userPreference)) {
			return;
		}
		var record, idx;
		//load the preference a first Time...
		this.leftPanel.getForm().loadRecord(new Ext.data.Record(this.userPreference));
		//fire select to create optional fields...
		var comboX = this.leftPanel.find("name", "comboX")[0];
		if (!Ext.isEmpty(comboX.getValue())) {
			idx = comboX.getStore().find("columnAlias", this.userPreference.comboX); 
			record = comboX.getStore().getAt(idx);
			if (record) {
				comboX.fireEvent("select", comboX, record, idx);
			}
		}
		var comboY = this.leftPanel.find("name", "comboY")[0];
		if (!Ext.isEmpty(comboY.getValue())) {
			idx = comboY.getStore().find("columnAlias", this.userPreference.comboY);
			record = comboY.getStore().getAt(idx);
			if (record) {
				comboY.fireEvent("select", comboY, record, idx);
			}
		}
		//reload the preference with all fields...
		this.leftPanel.getForm().loadRecord(new Ext.data.Record(this.userPreference));
    }
	
});

Ext.reg('sitools.user.component.dataPlotter', sitools.user.component.dataPlotter);
