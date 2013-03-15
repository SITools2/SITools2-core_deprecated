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
/*global Ext, sitools, i18n,document,window,SitoolsDesk*/
Ext.namespace('sitools.widget');

/**
 * @param urlFeed :
 *            The feed URL
 */
sitools.widget.rss2FeedReader = function (config) {
    Ext.apply(this);
    this.layout = "fit";
    var store = new Ext.data.Store({
        autoLoad : true,
        sortInfo : {field : 'pubDate', direction : "DESC"},
        proxy : new Ext.data.HttpProxy({
            url : config.urlFeed,
            restful : true,
            listeners : {
                scope : this,
                exception : onRequestFeedException
            }
        // url : 'http://extjs.com/forum/external.php?type=RSS2'
        }),
        reader : new Ext.data.XmlReader({
            record : 'item'
        }, [ 'title', 'author', {
            name : 'pubDate',
            type : 'date'
        }, 'link', 'description', 'content', 'guid', {
        	name : 'imageUrl',
        	mapping : "enclosure@url"
        }, {
        	name : 'imageType',
        	mapping : "enclosure@type"
        }])

    });

    var columns = [ {
        id : 'image',
        header : "Image",
        dataIndex : 'imageUrl',
        sortable : false,
        width : 50
        ,
        renderer : this.imageRenderer
    }, {
        id : 'title',
        header : "Title",
        dataIndex : 'title',
        sortable : true,
        width : 420,
        renderer : this.formatTitle
    }, {
        header : "Author",
        dataIndex : 'author',
        width : 100,
        hidden : true,
        sortable : true
    }, {
        id : 'last',
        header : "Date",
        dataIndex : 'pubDate',
        width : 150,
        renderer : this.formatDate,
        sortable : true
    } ];

    sitools.widget.rss2FeedReader.superclass.constructor.call(this, {
        // height : 300,
        columns : columns,
        store : store,
        loadMask : {
            msg : i18n.get("label.loadingFeed")
        },
        sm : new Ext.grid.RowSelectionModel({
            singleSelect : true
        }),
        autoExpandColumn : 'title',
        viewConfig : {
            forceFit : true,
            enableRowBody : true,
            showPreview : true,
            getRowClass : this.applyRowClass
        },
        tbar : [ {
            pressed : true,
            enableToggle : true,
            text : i18n.get('label.feedsSummary'),
            icon : loadUrl.get('APP_URL') + "/common/res/images/icons/summary_RSS.png",
            scope : this,
            toggleHandler : function (btn, pressed) {
                this.togglePreview(pressed);
            }
        } ],
        listeners : config.listeners
        
    });

    // this.on('rowcontextmenu', this.onContextClick, this);
    // this.on('beforeShow',this.loadData);
};

Ext.extend(sitools.widget.rss2FeedReader, Ext.grid.GridPanel, {

   
    loadData : function () {
        this.loadFeed('http://feeds.feedburner.com/extblog');
        this.doLayout();
    },

    loadFeed : function (url) {
        this.store.baseParams = {
            feed : url
        };
        this.store.load();
    },

    togglePreview : function (show) {
        this.view.showPreview = show;
        this.view.refresh();
    },

    // within this function "this" is actually the GridView
    applyRowClass : function (record, rowIndex, p, ds) {
        if (this.showPreview) {
            var xf = Ext.util.Format;
            p.body = '<p class=sous-titre-flux>' + xf.ellipsis(xf.stripTags(record.data.description), 200) + '</p>';
            return 'x-grid3-row-expanded';
        }
        return 'x-grid3-row-collapsed';
    },

    formatDate : function (date) {
        if (!date) {
            return '';
        }
        var now = new Date();
        var d = now.clearTime(true);
        var notime = date.clearTime(true).getTime();
        if (notime == d.getTime()) {
            return 'Today ' + date.dateFormat('g:i a');
        }
        d = d.add('d', -6);
        if (d.getTime() <= notime) {
            return date.dateFormat('D g:i a');
        }
        return date.dateFormat('n/j g:i a');
    },

    formatTitle : function (value, p, record) {
        var link = record.data.link;
        var author = (Ext.isEmpty(record.data.author)) ? "" : record.data.author;
        if (link !== undefined && link !== "") {
            return String.format('<div class="topic"><a href="{0}" target="_blank"><span class="rss_feed_title">{1}</span></a><br/><span class="author">{2}</span></div>', link, value, 
                    author);
        } else {
            return String.format('<div class="topic"><span class="rss_feed_title">{0}</span><br/><span class="author">{1}</span></div>', value, author);
        }

    }, 
    imageRenderer : function (value, p, record) {
    	if (Ext.isEmpty(value) || Ext.isEmpty(record.data.imageType)) {
            return "";
        }
        if (record.data.imageType.substr(0, 5) != "image") {
        	return "";
        }
		return String.format('<img src="{0}" width="50px">', value);
    }
});
