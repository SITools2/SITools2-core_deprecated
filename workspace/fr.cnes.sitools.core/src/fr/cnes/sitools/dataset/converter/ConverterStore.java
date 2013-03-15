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
package fr.cnes.sitools.dataset.converter;

import java.io.Closeable;
import java.util.List;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.dataset.converter.model.ConverterChainedModel;

/**
 * Interface for managing Form objects persistence.
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public interface ConverterStore extends Closeable {
  /**
   * Method for getting all objects
   * 
   * @return Array
   */
  ConverterChainedModel[] getArray();

  /**
   * Method for getting objects according to the XQuery
   * 
   * @param xquery
   *          String with XQuery syntax
   * @return Array
   */
  ConverterChainedModel[] getArrayByXQuery(String xquery);

  /**
   * Method for getting converters according to the specified filter
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return Array
   */
  ConverterChainedModel[] getArray(ResourceCollectionFilter filter);

  /**
   * Method for getting all converter
   * 
   * @return ArrayList of converter
   */
  List<ConverterChainedModel> getList();

  /**
   * Method for getting converter with specific criteria
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return ArrayList of converter
   */
  List<ConverterChainedModel> getList(ResourceCollectionFilter filter);

  /**
   * Method for getting converter with XQuery request syntax
   * 
   * @param xquery
   *          String
   * @return ArrayList of converter
   */
  List<ConverterChainedModel> getListByXQuery(String xquery);
  
  /**
   * Method for getting converters with pagination
   * 
   * @param filter active filter
   * @param converters list of converters
   * @return ArrayList of converter
   */
  List<ConverterChainedModel> getPage(ResourceCollectionFilter filter, List<ConverterChainedModel> converters);

  /**
   * Method for creating a converter
   * 
   * @param converter
   *          input
   * @return created converter
   */
  ConverterChainedModel create(ConverterChainedModel converter);

  /**
   * Method for retrieving a converter by its id
   * 
   * @param id
   *          converter identifier
   * @return retrieved converter
   */
  ConverterChainedModel retrieve(String id);

  /**
   * Method for updating a converter
   * 
   * @param converter
   *          input
   * @return updated converter
   */
  ConverterChainedModel update(ConverterChainedModel converter);

  /**
   * Method for deleting a converter by its id
   * 
   * @param id
   *          converter identifier
   * @return true if deleted
   */
  boolean delete(String id);

}
