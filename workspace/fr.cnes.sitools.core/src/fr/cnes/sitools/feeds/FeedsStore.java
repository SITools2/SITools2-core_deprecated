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
package fr.cnes.sitools.feeds;

import java.io.Closeable;
import java.util.List;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.feeds.model.FeedModel;

/**
 * Interface for managing FeedsModel objects persistence.
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public interface FeedsStore extends Closeable {
  /**
   * Method for getting all objects
   * 
   * @return Array
   */
  FeedModel[] getArray();

  /**
   * Method for getting objects according to the XQuery
   * 
   * @param xquery
   *          String with XQuery syntax
   * @return Array
   */
  FeedModel[] getArrayByXQuery(String xquery);

  /**
   * Method for getting FeedsModels according to the specified filter
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return Array
   */
  FeedModel[] getArray(ResourceCollectionFilter filter);

  /**
   * Method for getting all FeedsModel
   * 
   * @return ArrayList of FeedsModel
   */
  List<FeedModel> getList();

  /**
   * Method for getting FeedsModel with specific criteria
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return ArrayList of FeedsModel
   */
  List<FeedModel> getList(ResourceCollectionFilter filter);

  /**
   * Method for getting FeedsModel with XQuery request syntax
   * 
   * @param xquery
   *          String
   * @return ArrayList of FeedsModel
   */
  List<FeedModel> getListByXQuery(String xquery);

  /**
   * Method for creating a FeedsModel
   * 
   * @param opensearch
   *          input opensearch configuration
   * @return created FeedsModel
   */
  FeedModel create(FeedModel opensearch);

  /**
   * Method for getting projects according to the pagination criteria
   * 
   * @param filter
   *          pagination
   * @param feeds
   *          input
   * @return ArrayList of feedsModel
   */
  List<FeedModel> getPage(ResourceCollectionFilter filter, List<FeedModel> feeds);

  /**
   * Method for retrieving a FeedsModel by its id
   * 
   * @param id
   *          FeedsModel identifier
   * @return retrieved FeedsModel
   */
  FeedModel retrieve(String id);

  /**
   * Method for updating a FeedsModel
   * 
   * @param opensearch
   *          input
   * @return updated opensearch
   */
  FeedModel update(FeedModel opensearch);

  /**
   * Method for deleting a FeedsModel by its id
   * 
   * @param id
   *          FeedsModel identifier
   * @return true if deleted
   */
  boolean delete(String id);

  /**
   * Update the details of a FeedModel, not its entries
   * 
   * @param feedModel
   *          input
   * @return updated FeedModel
   */
  FeedModel updateDetails(FeedModel feedModel);

}
