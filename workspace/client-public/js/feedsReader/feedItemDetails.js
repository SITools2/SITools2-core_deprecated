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
/*global Ext, sitools, i18n,document*/
Ext.namespace('sitools.widget');

/**
 * @param urlFeed :
 *            The feed URL
 */
sitools.widget.feedItemDetails = Ext.extend(Ext.Panel, {

    initComponent : function () {

        this.layout = "fit";

        var record = this.record;
        if (!Ext.isEmpty(record)) {

            this.formPanel = new Ext.FormPanel({
                frame : true,
                autoScroll : true,
                labelAlign : "top"

            });

            var itemsForm = [];

            Ext.iterate(record.data, function (name, value) {
                var item;
                if (value !== null && value.length > 100) {

                    item = new Ext.form.TextArea({
                        fieldLabel : name,
                        value : value,
                        anchor : "90%",
                        readOnly : true
                    });
                } else {
                    item = new Ext.form.TextField({
                        fieldLabel : name,
                        value : value,
                        anchor : "90%",
                        readOnly : true
                    });
                    if (name == 'link') {
                    	Ext.apply(item, {
                    		overCls : "x-mouse-link"
                    	});
                    	item.addListener ('render', 
                			function (cmp) {
                				cmp.getEl().on('click', function () {
                					window.open(cmp.value);
                				});
                			});
                    }
                }

                itemsForm.push(item);

            });
            this.formPanel.removeAll();
            this.formPanel.add(itemsForm);
            this.formPanel.doLayout();

            this.componentType = 'feedDetails';
            this.items = [ this.formPanel ];
        }

        sitools.widget.feedItemDetails.superclass.initComponent.call(this);
    }
});
