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

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.common.model.ResourceComparator;
import fr.cnes.sitools.dataset.filter.model.FilterChainedModel;
import fr.cnes.sitools.dataset.filter.model.FilterModel;
import fr.cnes.sitools.dataset.filter.model.FilterParameter;
import fr.cnes.sitools.persistence.Paginable;

/**
 * Implementation of filterStore with XStream FilePersistenceStrategy
 * 
 * @author AKKA
 * 
 */
public final class FilterStoreXML extends Paginable<FilterChainedModel> implements FilterStore {

  /** default location for file persistence */
  private static final String COLLECTION_NAME = "filters";

  /**
   * Constructor with the XML file location
   * 
   * @param location
   *          directory of FilePersistenceStrategy
   */
  public FilterStoreXML(File location) {
    super(location);
  }

  /**
   * Default constructor
   */
  public FilterStoreXML() {
    File defaultLocation = new File(COLLECTION_NAME);
    init(defaultLocation);
  }

  /*
   * (non-Javadoc)
   * 
   * @see fr.cnes.sitools.filter.filterStore#create(fr.cnes.sitools.filter .model.filter)
   */
  @Override
  public FilterChainedModel create(FilterChainedModel filter) {
    FilterChainedModel result = null;

    if (filter.getId() == null || "".equals(filter.getId())) {
      filter.setId(UUID.randomUUID().toString());
    }

    // Recherche sur l'id
    for (Iterator<FilterChainedModel> it = getRawList().iterator(); it.hasNext();) {
      FilterChainedModel current = it.next();
      if (current != null && current.getId().equals(filter.getId())) {
        getLog().info("FilterChainedModel found");
        result = current;
        break;
      }
    }

    // ajout d'un id pour les objets filterModel
    // ajout des filterParameter dans le hashMap (parametersMap) et clean du
    // arrayList (parameters)
    if (filter.getFilters() != null) {
      for (Iterator<FilterModel> it = filter.getFilters().iterator(); it.hasNext();) {
        FilterModel convModel = it.next();
        if (convModel.getId() == null || "".equals(convModel.getId())) {
          convModel.setId(UUID.randomUUID().toString());
        }
      }
    }

    if (result == null) {
      getRawList().add(filter);
      result = filter;
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * 
   * @see fr.cnes.sitools.filter.filterStore#retrieve(java.lang.String)
   */
  @Override
  public FilterChainedModel retrieve(String id) {
    FilterChainedModel result = null;
    for (Iterator<FilterChainedModel> it = getRawList().iterator(); it.hasNext();) {
      FilterChainedModel current = it.next();
      if (current != null && current.getId().equals(id)) {
        getLog().info("FilterChainedModel found");
        result = current;
        break;
      }
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * 
   * @see fr.cnes.sitools.project.ProjectStore#update(fr.cnes.sitools.project.model .Project)
   */
  @Override
  public FilterChainedModel update(FilterChainedModel filter) {
    FilterChainedModel result = null;
    for (Iterator<FilterChainedModel> it = getRawList().iterator(); it.hasNext();) {
      FilterChainedModel current = it.next();
      if (current != null && current.getId().equals(filter.getId())) {
        getLog().info("Updating FilterChainedModel");

        result = current;
        current.setDescription(filter.getDescription());
        current.setName(filter.getName());
        current.setParent(filter.getParent());

        // generate ids for filters if new filter have been added
        // ajout des filterParameter dans le hashMap (parametersMap) et clean
        // du
        // arrayList (parameters)
        if (filter.getFilters() != null) {
          FilterModel filterModel;
          for (Iterator<FilterModel> itConv = filter.getFilters().iterator(); itConv.hasNext();) {
            // generate Ids
            filterModel = itConv.next();
            if (filterModel.getId() == null || "".equals(filterModel.getId())) {
              filterModel.setId(UUID.randomUUID().toString());
            }
          }
        }
        current.setFilters(filter.getFilters());

        it.remove();

        break;
      }
    }
    if (result != null) {
      getRawList().add(result);
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * 
   * @see fr.cnes.sitools.project.ProjectStore#delete(long)
   */
  @Override
  public boolean delete(String id) {
    boolean result = false;
    for (Iterator<FilterChainedModel> it = getRawList().iterator(); it.hasNext();) {
      FilterChainedModel current = it.next();
      if (current != null && current.getId().equals(id)) {
        getLog().info("Removing FilterChainedModel");
        it.remove();
        result = true;
        break;
      }
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * 
   * @see fr.cnes.sitools.project.ProjectStore#getArray()
   */
  @Override
  public FilterChainedModel[] getArray() {
    FilterChainedModel[] result = null;
    if ((getRawList() != null) && (getRawList().size() > 0)) {
      result = getRawList().toArray(new FilterChainedModel[getRawList().size()]);
    }
    else {
      result = new FilterChainedModel[0];
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * 
   * @see fr.cnes.sitools.project.ProjectStore#getArray(fr.cnes.sitools.common.model .ResourceCollectionFilter)
   */
  @Override
  public FilterChainedModel[] getArray(ResourceCollectionFilter filter) {
    List<FilterChainedModel> resultList = getList(filter);

    FilterChainedModel[] result = null;
    if ((resultList != null) && (resultList.size() > 0)) {
      result = resultList.toArray(new FilterChainedModel[resultList.size()]);
    }
    else {
      result = new FilterChainedModel[0];
    }
    return result;
  }

  @Override
  public FilterChainedModel[] getArrayByXQuery(String xquery) {
    getLog().severe("getArrayByXQuery NOT IMPLEMENTED");
    return null;
  }

  /*
   * (non-Javadoc)
   * 
   * @see fr.cnes.sitools.project.ProjectStore#getList(fr.cnes.sitools.common.model .ResourceCollectionFilter)
   */
  @Override
  public List<FilterChainedModel> getList(ResourceCollectionFilter filter) {
    List<FilterChainedModel> result = new ArrayList<FilterChainedModel>();
    if ((getRawList() == null) || (getRawList().size() <= 0) || (filter.getStart() > getRawList().size())) {
      return result;
    }

    // Filtre parent en premier
    if ((filter.getParent() != null) && !filter.getParent().equals("")) {
      for (FilterChainedModel filterPlugin : getRawList()) {
        if (null == filterPlugin.getParent()) {
          continue;
        }
        if (filterPlugin.getParent().equals(filter.getParent())) {
          result.add(filterPlugin);
        }
      }
    }
    else {
      result.addAll(getRawList());
    }

    // Filtre Query
    if ((filter.getQuery() != null) && !filter.getQuery().equals("")) {
      for (FilterChainedModel filterPlugin : result) {
        if (null == filterPlugin.getName()) {
          result.remove(filterPlugin);
        }
        if (filterPlugin.getName().toLowerCase().startsWith(filter.getQuery().toLowerCase())) {
          if ((filter.getParent() != null) && !filter.getParent().equals(filterPlugin.getParent())) {
            result.remove(filterPlugin);
          }
        }
      }
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
  public void sort(List<FilterChainedModel> result, ResourceCollectionFilter filter) {
    if ((filter != null) && (filter.getSort() != null) && !filter.getSort().equals("")) {
      Collections.sort(result, new ResourceComparator<FilterChainedModel>(filter));
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
    aliases.put("filterChainedModel", FilterChainedModel.class);
    aliases.put("filterModel", FilterModel.class);
    aliases.put("filterParameter", FilterParameter.class);
    this.init(location, aliases);

  }

}
