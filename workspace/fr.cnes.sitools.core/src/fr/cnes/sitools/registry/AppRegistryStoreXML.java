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

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

import org.restlet.data.MediaType;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.persistence.FilePersistenceStrategy;
import com.thoughtworks.xstream.persistence.XmlArrayList;

import fr.cnes.sitools.common.XStreamFactory;
import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.common.model.ResourceComparator;
import fr.cnes.sitools.registry.model.AppRegistry;

/**
 * Implementation of ResourceManagerStore with XStream FilePersistenceStrategy
 * 
 * @author AKKA
 * 
 */
public final class AppRegistryStoreXML implements AppRegistryStore {

  /** default location for file persistence */
  private static final String COLLECTION_NAME = "applications";

  /** static logger for this store implementation */
  private static Logger log = Logger.getLogger(AppRegistryStoreXML.class.getName());

  
  /** Persistent list of projects */
  private List<AppRegistry> list = null;

  /**
   * Constructor with the XML file location
   * 
   * @param location
   *          directory of FilePersistenceStrategy
   */
  public AppRegistryStoreXML(File location) {
    super();
    init(location);
  }

  /**
   * Default constructor
   */
  public AppRegistryStoreXML() {
    File defaultLocation = new File(COLLECTION_NAME);
    init(defaultLocation);
  }

  @Override
  public AppRegistry create(AppRegistry project) {
    AppRegistry result = null;

    if (project.getId() == null || "".equals(project.getId())) {
      project.setId(UUID.randomUUID().toString());
    }

    // Recherche sur l'id
    for (Iterator<AppRegistry> it = list.iterator(); it.hasNext();) {
      AppRegistry current = it.next();
      if (current.getId().equals(project.getId())) {
        log.info("ResourceManager found");
        result = current;
        break;
      }
    }

    if (result == null) {
      list.add(project);
      result = project;
    }
    return result;
  }

  @Override
  public AppRegistry retrieve(String id) {
    AppRegistry result = null;
    for (Iterator<AppRegistry> it = list.iterator(); it.hasNext();) {
      AppRegistry current = it.next();
      if (current.getId().equals(id)) {
        log.info("ResourceManager found");
        result = current;
        break;
      }
    }
    return result;
  }

  @Override
  public AppRegistry update(AppRegistry manager) {
    AppRegistry result = null;
    for (Iterator<AppRegistry> it = list.iterator(); it.hasNext();) {
      AppRegistry current = it.next();
      if (null == current) {
        log.warning(" AppRegistry.update. it is null.");
        continue;
      }

      if (current.getId().equals(manager.getId())) {
        log.fine("Updating ResourceManager");

        result = current;
        current.setName(manager.getName());
        current.setDescription(manager.getDescription());
        current.setLastUpdate(manager.getLastUpdate());
        current.setResources(manager.getResources());
        it.remove();

        break;
      }
    }
    if (result != null) {
      list.add(result);
    }
    return result;
  }

  @Override
  public boolean delete(String id) {
    boolean result = false;
    for (Iterator<AppRegistry> it = list.iterator(); it.hasNext();) {
      AppRegistry current = it.next();
      if (current.getId().equals(id)) {
        log.info("Removing ResourceManager");
        it.remove();
        result = true;
        break;
      }
    }
    return result;
  }

  @Override
  public AppRegistry[] getArray() {
    AppRegistry[] result = null;
    if ((list != null) && (list.size() > 0)) {
      result = list.toArray(new AppRegistry[list.size()]);
    }
    else {
      result = new AppRegistry[0];
    }
    return result;
  }

  @Override
  public AppRegistry[] getArray(ResourceCollectionFilter filter) {
    List<AppRegistry> resultList = getList(filter);

    AppRegistry[] result = null;
    if ((resultList != null) && (resultList.size() > 0)) {
      result = resultList.toArray(new AppRegistry[resultList.size()]);
    }
    else {
      result = new AppRegistry[0];
    }
    return result;
  }

  @Override
  public AppRegistry[] getArrayByXQuery(String xquery) {
    log.severe("getArrayByXQuery NOT IMPLEMENTED");
    return null;
  }

  @Override
  public List<AppRegistry> getList(ResourceCollectionFilter filter) {
    List<AppRegistry> result = new ArrayList<AppRegistry>();
    if ((list == null) || (list.size() <= 0) || (filter.getStart() > list.size())) {
      return result;
    }

    // Filtre
    if ((filter.getQuery() != null) && !filter.getQuery().equals("")) {
      for (AppRegistry item : list) {
        if (null == item.getName()) {
          continue;
        }
        if (item.getName().toLowerCase().startsWith(filter.getQuery().toLowerCase())) {
          result.add(item);
        }
      }
    }
    else {
      result.addAll(list);
    }

    // Si index premier element > nombre d'elements filtres => resultat vide
    if (filter.getStart() > result.size()) {
      result.clear();
      return result;
    }

    // Tri
    sort(result, filter);

    // Pagination
    int start = (filter.getStart() <= 0) ? 0 : filter.getStart() - 1;
    int limit = ((filter.getLimit() <= 0) || ((filter.getLimit() + start) > result.size())) ? (result.size() - start)
        : filter.getLimit();
    // subList
    // Returns a view of the portion of this list between the specified fromIndex, inclusive,
    // and toIndex, exclusive.
    List<AppRegistry> page = result.subList(start, start + limit); // pas -1 puisque exclusive

    return new ArrayList<AppRegistry>(page);
  }

  @Override
  public List<AppRegistry> getList() {
    List<AppRegistry> result = new ArrayList<AppRegistry>();
    if ((list != null) || (list.size() > 0)) {
      result.addAll(list);
    }

    // Tri
    sort(result, null);

    return result;
  }

  /**
   * Sort the list (by default on the name)
   * 
   * @param result
   *          list to be sorted
   * @param filter
   *          ResourceCollectionFilter with sort properties.
   * 
   *          TODO Prendre en compte les paramètres de Tri du filter (sort, order)
   */
  private void sort(List<AppRegistry> result, ResourceCollectionFilter filter) {
    if ((filter != null) && (filter.getSort() != null) && !filter.getSort().equals("")) {
      Collections.sort(result, new ResourceComparator<AppRegistry>(filter));
    }
  }

  @Override
  public List<AppRegistry> getListByXQuery(String xquery) {
    log.warning("getListByXQuery DEFAULT IMPLEMENTATION : getList");
    return getList();
  }

  /**
   * XStream FilePersistenceStrategy initialization
   * 
   * @param location
   *          Directory
   */
  @SuppressWarnings("unchecked")
  private void init(File location) {
    log.info("Store location " + location.getAbsolutePath());
    XStream xstream = XStreamFactory.getInstance().getXStream(MediaType.APPLICATION_XML);

    xstream.autodetectAnnotations(true);
    xstream.alias("manager", AppRegistry.class);

    FilePersistenceStrategy strategy = new FilePersistenceStrategy(location, xstream);
    list = new XmlArrayList(strategy);
  }

  @Override
  public void close() {
    // TODO
  }

}
