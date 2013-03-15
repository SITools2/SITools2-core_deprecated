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
package fr.cnes.sitools.dataset.opensearch;

import java.io.Closeable;
import java.util.List;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.dataset.opensearch.model.Opensearch;

/**
 * Interface for managing OpenSearch objects persistence.
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public interface OpenSearchStore extends Closeable {
  /**
   * Method for getting all objects
   * 
   * @return Array
   */
  Opensearch[] getArray();

  /**
   * Method for getting objects according to the XQuery
   * 
   * @param xquery
   *          String with XQuery syntax
   * @return Array
   */
  Opensearch[] getArrayByXQuery(String xquery);

  /**
   * Method for getting OpenSearchs according to the specified filter
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return Array
   */
  Opensearch[] getArray(ResourceCollectionFilter filter);

  /**
   * Method for getting all OpenSearch
   * 
   * @return ArrayList of OpenSearch
   */
  List<Opensearch> getList();

  /**
   * Method for getting OpenSearch with specific criteria
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return ArrayList of OpenSearch
   */
  List<Opensearch> getList(ResourceCollectionFilter filter);

  /**
   * Method for getting OpenSearch with XQuery request syntax
   * 
   * @param xquery
   *          String
   * @return ArrayList of OpenSearch
   */
  List<Opensearch> getListByXQuery(String xquery);

  /**
   * Method for creating a OpenSearch
   * 
   * @param opensearch
   *          input OpenSearch configuration
   * @return created OpenSearch
   */
  Opensearch create(Opensearch opensearch);

  /**
   * Method for retrieving a OpenSearch by its id
   * 
   * @param id
   *          OpenSearch identifier
   * @return retrieved OpenSearch
   */
  Opensearch retrieve(String id);

  /**
   * Method for updating a OpenSearch
   * 
   * @param opensearch
   *          input
   * @return updated OpenSearch
   */
  Opensearch update(Opensearch opensearch);

  /**
   * Method for deleting a OpenSearch by its id
   * 
   * @param id
   *          OpenSearch identifier
   * @return true if deleted
   */
  boolean delete(String id);

}
