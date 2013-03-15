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
/** 
 * @class sitools.widget.FiltersCollection
 * @extends Ext.util.MixedCollection
 * Class for sitoolsFilter.getValue() collections.
 */

Ext.ns("sitools.widget");

sitools.widget.FiltersCollection = Ext.extend(Ext.util.MixedCollection, {
    
    constructor : function (config) {
        sitools.widget.FiltersCollection.superclass.constructor.call(this);
        this.addAll(config.filters);
    },

    
    getFilterData : function(){
        var filters = [];
        this.each(function (filter, index, length) {
            filters.push(filter);            
        });
        return filters;
    }
    
});