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
package fr.cnes.sitools.dataset;

import java.io.Closeable;
import java.util.List;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.dataset.model.DataSet;

/**
 * Interface for managing DataSet objects persistence.
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public interface DataSetStore extends Closeable {

  /**
   * Method for creating a DataSet
   * 
   * @param dataSet
   *          input
   * @return created DataSet
   */
  DataSet create(DataSet dataSet);

  /**
   * Method for retrieving a DataSet by its id
   * 
   * @param id
   *          DataSet identifier
   * @return retrieved DataSet
   */
  DataSet retrieve(String id);

  /**
   * Method for updating a DataSet
   * 
   * @param dataSet
   *          input
   * @return updated DataSet
   */
  DataSet update(DataSet dataSet);

  /**
   * Method for deleting a DataSet by its id
   * 
   * @param id
   *          DataSet identifier
   * @return true if deleted
   */
  boolean delete(String id);

  /**
   * Method for getting all objects
   * 
   * @return Array
   */
  DataSet[] getArray();

  /**
   * Method for getting objects according to the XQuery
   * 
   * @param xquery
   *          String with XQuery syntax
   * @return Array
   */
  DataSet[] getArrayByXQuery(String xquery);

  /**
   * Method for getting DataSets according to the specified filter
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return Array
   */
  DataSet[] getArray(ResourceCollectionFilter filter);

  /**
   * Method for getting all DataSet
   * 
   * @return ArrayList of DataSet
   */
  List<DataSet> getList();

  /**
   * Method for getting DataSets with specific criteria
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return ArrayList of DataSet
   */
  List<DataSet> getList(ResourceCollectionFilter filter);

  /**
   * Method for getting DataSet with XQuery request syntax
   * 
   * @param xquery
   *          String
   * @return ArrayList of DataSet
   */
  List<DataSet> getListByXQuery(String xquery);
  
  /**
   * Method for getting DataSets according to the pagination criteria
   * 
   * @param filter
   *          pagination
   * @param datasets
   *          input
   * @return ArrayList of DataSets
   */
  List<DataSet> getPage(ResourceCollectionFilter filter, List<DataSet> datasets);  

}
