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

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.common.model.ResourceComparator;
import fr.cnes.sitools.feeds.model.FeedAuthorModel;
import fr.cnes.sitools.feeds.model.FeedEntryModel;
import fr.cnes.sitools.feeds.model.FeedModel;
import fr.cnes.sitools.feeds.model.FeedSource;
import fr.cnes.sitools.persistence.Paginable;

/**
 * Implementation of FeedsModelStore with XStream FilePersistenceStrategy
 * 
 * @author m.gond (AKKA Technologies)
 * 
 */
public final class FeedsStoreXML extends Paginable<FeedModel> implements FeedsStore {

  /** default location for file persistence */
  private static final String COLLECTION_NAME = "feeds";

  /** static logger for this store implementation */
  private static Logger log = Logger.getLogger(FeedsStoreXML.class.getName());

  /**
   * Constructor with the XML file location
   * 
   * @param location
   *          directory of FilePersistenceStrategy
   */
  public FeedsStoreXML(File location) {
    super(location);
  }

  /**
   * Default constructor
   */
  public FeedsStoreXML() {
    File defaultLocation = new File(COLLECTION_NAME);
    log.info("Store location " + defaultLocation.getAbsolutePath());
    init(defaultLocation);
  }

  @Override
  public FeedModel create(FeedModel feed) {
    FeedModel result = null;

    if (feed.getId() == null || "".equals(feed.getId())) {
      feed.setId(UUID.randomUUID().toString());
    }

    if (feed.getFeedSource() == null || "".equals(feed.getFeedSource())) {
      feed.setFeedSource(FeedSource.CLASSIC);
    }

    // Recherche sur l'id
    for (FeedModel current : getRawList()) {
      if (current.getId().equals(feed.getId())) {
        log.info("FeedsModel found");
        result = current;
        break;
      }
    }

    if (result == null) {
      getRawList().add(feed);
      result = feed;
    }
    return result;
  }

  @Override
  public FeedModel retrieve(String id) {
    FeedModel result = null;
    for (Iterator<FeedModel> it = getRawList().iterator(); it.hasNext();) {
      FeedModel current = it.next();
      if (current.getId().equals(id)) {
        log.info("FeedsModel found");
        result = current;
        break;
      }
    }
    return result;
  }

  @Override
  public FeedModel update(FeedModel feed) {
    FeedModel result = null;
    for (Iterator<FeedModel> it = getRawList().iterator(); it.hasNext();) {
      FeedModel current = it.next();
      if (current.getId().equals(feed.getId())) {
        log.info("Updating FeedsModel");

        result = current;
        current.setEntries(feed.getEntries());
        current.setId(feed.getId());
        current.setDescription(feed.getDescription());
        current.setEncoding(feed.getEncoding());
        current.setFeedType(feed.getFeedType());
        current.setImage(feed.getImage());
        current.setLink(feed.getLink());
        current.setLinks(feed.getLinks());
        current.setTitle(feed.getTitle());
        current.setUri(feed.getUri());
        current.setVisible(feed.isVisible());
        current.setName(feed.getName());

        current.setAuthor(feed.getAuthor());
        current.setExternalUrl(feed.getExternalUrl());

        it.remove();

        break;
      }
    }
    if (result != null) {
      getRawList().add(result);
    }
    return result;
  }

  @Override
  public boolean delete(String id) {
    boolean result = false;
    for (Iterator<FeedModel> it = getRawList().iterator(); it.hasNext();) {
      FeedModel current = it.next();
      if (current.getId().equals(id)) {
        log.info("Removing FeedsModel");
        it.remove();
        result = true;
        break;
      }
    }
    return result;
  }

  @Override
  public FeedModel[] getArray() {
    FeedModel[] result = null;
    if ((getRawList() != null) && (getRawList().size() > 0)) {
      result = getRawList().toArray(new FeedModel[getRawList().size()]);
    }
    else {
      result = new FeedModel[0];
    }
    return result;
  }

  @Override
  public FeedModel[] getArray(ResourceCollectionFilter filter) {
    List<FeedModel> resultList = getList(filter);

    FeedModel[] result = null;
    if ((resultList != null) && (resultList.size() > 0)) {
      result = resultList.toArray(new FeedModel[resultList.size()]);
    }
    else {
      result = new FeedModel[0];
    }
    return result;
  }

  @Override
  public FeedModel[] getArrayByXQuery(String xquery) {
    log.severe("getArrayByXQuery NOT IMPLEMENTED");
    return null;
  }

  @Override
  public List<FeedModel> getList(ResourceCollectionFilter filter) {
    List<FeedModel> result = new ArrayList<FeedModel>();
    if ((getRawList() == null) || (getRawList().size() <= 0) || (filter.getStart() > getRawList().size())) {
      return result;
    }

    // Filtre
    if ((filter.getQuery() != null) && !filter.getQuery().equals("")) {
      for (FeedModel feed : getRawList()) {
        if (null == feed.getName()) {
          continue;
        }
        if ("strict".equals(filter.getMode())) {
          if (feed.getName().equals(filter.getQuery())) {
            result.add(feed);
          }
        }
        else {
          if (feed.getName().toLowerCase().startsWith(filter.getQuery().toLowerCase())) {
            result.add(feed);
          }
        }
      }
    }
    else {
      result.addAll(getRawList());
    }

    // Si index premier element > nombre d'elements filtres => resultat vide
    if (filter.getStart() > result.size()) {
      result.clear();
      return result;
    }

    // Tri
    sort(result, filter);

    return result;
  }

  /**
   * Sort the list (by default on the name)
   * 
   * @param result
   *          list to be sorted
   * @param filter
   *          ResourceCollectionFilter with sort properties.
   */
  public void sort(List<FeedModel> result, ResourceCollectionFilter filter) {
    if ((filter != null) && (filter.getSort() != null) && !filter.getSort().equals("")) {
      Collections.sort(result, new ResourceComparator<FeedModel>(filter));
    }
  }

  /**
   * XStream FilePersistenceStrategy initialization
   * 
   * @param location
   *          Directory
   */
  public void init(File location) {
    Map<String, Class<?>> aliases = new ConcurrentHashMap<String, Class<?>>();
    aliases.put("FeedModel", FeedModel.class);
    aliases.put("FeedEntryModel", FeedEntryModel.class);
    aliases.put("author", FeedAuthorModel.class);
    this.init(location, aliases);
  }

  @Override
  public FeedModel updateDetails(FeedModel feed) {
    FeedModel result = null;
    for (Iterator<FeedModel> it = getRawList().iterator(); it.hasNext();) {
      FeedModel current = it.next();
      if (current.getId().equals(feed.getId())) {
        log.info("Updating FeedsModel details");

        result = current;
        current.setId(feed.getId());
        current.setDescription(feed.getDescription());
        current.setEncoding(feed.getEncoding());
        current.setFeedType(feed.getFeedType());
        current.setImage(feed.getImage());
        current.setLink(feed.getLink());
        current.setLinks(feed.getLinks());
        current.setTitle(feed.getTitle());
        current.setUri(feed.getUri());
        current.setVisible(feed.isVisible());

        current.setAuthor(feed.getAuthor());
        
        current.setExternalUrl(feed.getExternalUrl());

        it.remove();

        break;
      }
    }
    if (result != null) {
      getRawList().add(result);
    }
    return result;
  }

}
