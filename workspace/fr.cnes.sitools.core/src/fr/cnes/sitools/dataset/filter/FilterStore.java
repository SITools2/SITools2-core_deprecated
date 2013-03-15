/*******************************************************************************
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
 ******************************************************************************/
package fr.cnes.sitools.dataset.filter;

import java.io.Closeable;
import java.util.List;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.dataset.filter.model.FilterChainedModel;

/**
 * Interface for managing Form objects persistence.
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public interface FilterStore extends Closeable {
  /**
   * Method for getting all objects
   * 
   * @return Array
   */
  FilterChainedModel[] getArray();

  /**
   * Method for getting objects according to the XQuery
   * 
   * @param xquery
   *          String with XQuery syntax
   * @return Array
   */
  FilterChainedModel[] getArrayByXQuery(String xquery);

  /**
   * Method for getting filters according to the specified filter
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return Array
   */
  FilterChainedModel[] getArray(ResourceCollectionFilter filter);

  /**
   * Method for getting all filter
   * 
   * @return ArrayList of filter
   */
  List<FilterChainedModel> getList();

  /**
   * Method for getting filter with specific criteria
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return ArrayList of filter
   */
  List<FilterChainedModel> getList(ResourceCollectionFilter filter);

  /**
   * Method for getting filter with XQuery request syntax
   * 
   * @param xquery
   *          String
   * @return ArrayList of filter
   */
  List<FilterChainedModel> getListByXQuery(String xquery);
  
  /**
   * Method for getting FilterChainedModels according to the pagination criteria
   * 
   * @param filter
   *          pagination
   * @param filters
   *          input
   * @return ArrayList of filters
   */
  List<FilterChainedModel> getPage(ResourceCollectionFilter filter, List<FilterChainedModel> filters);

  /**
   * Method for creating a filter
   * 
   * @param filter
   *          input
   * @return created filter
   */
  FilterChainedModel create(FilterChainedModel filter);

  /**
   * Method for retrieving a filter by its id
   * 
   * @param id
   *          filter identifier
   * @return retrieved filter
   */
  FilterChainedModel retrieve(String id);

  /**
   * Method for updating a filter
   * 
   * @param filter
   *          input
   * @return updated filter
   */
  FilterChainedModel update(FilterChainedModel filter);

  /**
   * Method for deleting a filter by its id
   * 
   * @param id
   *          filter identifier
   * @return true if deleted
   */
  boolean delete(String id);

}
