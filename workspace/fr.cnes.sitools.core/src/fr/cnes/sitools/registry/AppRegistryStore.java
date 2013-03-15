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
package fr.cnes.sitools.registry;

import java.io.Closeable;
import java.util.List;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.registry.model.AppRegistry;

/**
 * Interface for managing ResourceManager objects persistence.
 * 
 * @author jp.boignard (AKKA Technologies)
 * TODO refactoring with generics 
 */
public interface AppRegistryStore extends Closeable {
  /**
   * Method for getting all objects
   * 
   * @return Array
   */
  AppRegistry[] getArray();

  /**
   * Method for getting objects according to the XQuery
   * 
   * @param xquery
   *          String with XQuery syntax
   * @return Array
   */
  AppRegistry[] getArrayByXQuery(String xquery);

  /**
   * Method for getting applications according to the specified filter
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return Array
   */
  AppRegistry[] getArray(ResourceCollectionFilter filter);

  /**
   * Method for getting all application
   * 
   * @return ArrayList of application
   */
  List<AppRegistry> getList();

  /**
   * Method for getting application with specific criteria
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return ArrayList of application
   */
  List<AppRegistry> getList(ResourceCollectionFilter filter);

  /**
   * Method for getting application with XQuery request syntax
   * 
   * @param xquery
   *          String
   * @return ArrayList of application
   */
  List<AppRegistry> getListByXQuery(String xquery);

  /**
   * Method for creating a ResourceManager
   * 
   * @param application
   *          input
   * @return created ResourceManager
   */
  AppRegistry create(AppRegistry application);

  /**
   * Method for retrieving a application by its id
   * 
   * @param id
   *          application identifier
   * @return retrieved application
   */
  AppRegistry retrieve(String id);

  /**
   * Method for updating a application
   * 
   * @param application
   *          input
   * @return updated application
   */
  fr.cnes.sitools.registry.model.AppRegistry update(AppRegistry application);

  /**
   * Method for deleting a ResourceManager by its id
   * 
   * @param id
   *          application identifier
   * @return true if deleted
   */
  boolean delete(String id);

}
