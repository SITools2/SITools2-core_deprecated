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

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Logger;

import org.restlet.data.MediaType;
import org.restlet.data.Status;
import org.restlet.resource.ResourceException;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.persistence.FilePersistenceStrategy;
import com.thoughtworks.xstream.persistence.XmlArrayList;

import fr.cnes.sitools.common.XStreamFactory;
import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.common.model.ResourceComparator;
import fr.cnes.sitools.dataset.opensearch.model.Opensearch;
import fr.cnes.sitools.dataset.opensearch.model.OpensearchColumn;

/**
 * Implementation of OpenSearchStore with XStream FilePersistenceStrategy
 * 
 * @author AKKA
 * 
 */
public final class OpenSearchStoreXML implements OpenSearchStore {

  /** default location for file persistence */
  private static final String COLLECTION_NAME = "opensearch";

  /** static logger for this store implementation */
  private static Logger log = Logger.getLogger(OpenSearchStoreXML.class.getName());

  /** Directory for file persistence */
  private File location = null;

  /** XStream instance */
  private XStream xstream = null;
  /** Persistent list of OpenSearch */
  private List<Opensearch> list = null;

  /**
   * Constructor with the XML file location
   * 
   * @param location
   *          directory of FilePersistenceStrategy
   */
  public OpenSearchStoreXML(File location) {
    super();
    init(location);
  }

  /**
   * Default constructor
   */
  public OpenSearchStoreXML() {
    File defaultLocation = new File(COLLECTION_NAME);
    log.info("Store location " + defaultLocation.getAbsolutePath());
    init(defaultLocation);
  }

  @Override
  public Opensearch create(Opensearch osearch) {
    Opensearch result = null;

    if (osearch.getId() == null || "".equals(osearch.getId())) {
      throw new ResourceException(Status.CLIENT_ERROR_BAD_REQUEST, "Resource id is mandatory");
    }

    // Recherche sur l'id
    for (Iterator<Opensearch> it = list.iterator(); it.hasNext();) {
      Opensearch current = it.next();
      if (current.getId().equals(osearch.getId())) {
        log.info("Opensearch found");
        result = current;
        break;
      }
    }

    if (result == null) {
      list.add(osearch);
      result = osearch;
    }
    return result;
  }

  @Override
  public Opensearch retrieve(String id) {
    Opensearch result = null;
    for (Iterator<Opensearch> it = list.iterator(); it.hasNext();) {
      Opensearch current = it.next();
      if (current.getId().equals(id)) {
        log.info("Opensearch found");
        result = current;
        break;
      }
    }
    return result;
  }

  @Override
  public synchronized Opensearch update(Opensearch os) {
    Opensearch result = null;
    for (Iterator<Opensearch> it = list.iterator(); it.hasNext();) {
      Opensearch current = it.next();
      if (current.getId().equals(os.getId())) {
        log.info("Updating Opensearch");

        result = current;
        current.setName(os.getName());
        current.setDescription(os.getDescription());
        current.setIndexedColumns(os.getIndexedColumns());
        current.setDescriptionField(os.getDescriptionField());
        current.setPubDateField(os.getPubDateField());
        current.setLinkField(os.getLinkField());
        current.setGuidField(os.getGuidField());
        current.setTitleField(os.getTitleField());
        current.setStatus(os.getStatus());
        current.setImage(os.getImage());
        current.setDefaultSearchField(os.getDefaultSearchField());
        current.setUniqueKey(os.getUniqueKey());
        current.setKeywordColumns(os.getKeywordColumns());
        current.setLastImportDate(os.getLastImportDate());
        current.setErrorMsg(os.getErrorMsg());
        current.setParentUrl(os.getParentUrl());
        current.setLinkFieldRelative(os.isLinkFieldRelative());
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
    for (Iterator<Opensearch> it = list.iterator(); it.hasNext();) {
      Opensearch current = it.next();
      if (current.getId().equals(id)) {
        log.info("Removing Opensearch");
        it.remove();
        result = true;
        break;
      }
    }
    return result;
  }

  @Override
  public Opensearch[] getArray() {
    Opensearch[] result = null;
    if ((list != null) && (list.size() > 0)) {
      result = list.toArray(new Opensearch[list.size()]);
    }
    else {
      result = new Opensearch[0];
    }
    return result;
  }

  @Override
  public Opensearch[] getArray(ResourceCollectionFilter filter) {
    List<Opensearch> resultList = getList(filter);

    Opensearch[] result = null;
    if ((resultList != null) && (resultList.size() > 0)) {
      result = resultList.toArray(new Opensearch[resultList.size()]);
    }
    else {
      result = new Opensearch[0];
    }
    return result;
  }

  @Override
  public Opensearch[] getArrayByXQuery(String xquery) {
    log.severe("getArrayByXQuery NOT IMPLEMENTED");
    return null;
  }

  @Override
  public List<Opensearch> getList(ResourceCollectionFilter filter) {
    List<Opensearch> result = new ArrayList<Opensearch>();
    if ((list == null) || (list.size() <= 0) || (filter.getStart() > list.size())) {
      return result;
    }

    // Filtre parent en premier
    if ((filter.getParent() != null) && !filter.getParent().equals("")) {
      for (Opensearch os : list) {
        if (null == os.getParent()) {
          continue;
        }
        if (os.getParent().equals(filter.getParent())) {
          result.add(os);
        }
      }
    }
    else {
      result.addAll(list);
    }

    // Filtre Query
    if ((filter.getQuery() != null) && !filter.getQuery().equals("")) {
      for (Opensearch os : result) {
        if (null == os.getName()) {
          result.remove(os);
        }
        if (os.getName().toLowerCase().startsWith(filter.getQuery().toLowerCase())) {
          if ((filter.getParent() != null) && !filter.getParent().equals(os.getParent())) {
            result.remove(os);
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

    // Pagination
    int start = (filter.getStart() <= 0) ? 0 : filter.getStart() - 1;
    int limit = ((filter.getLimit() <= 0) || ((filter.getLimit() + start) > result.size())) ? (result.size() - start)
        : filter.getLimit();
    // subList
    // Returns a view of the portion of this list between the specified fromIndex, inclusive,
    // and toIndex, exclusive.
    List<Opensearch> page = result.subList(start, start + limit); // pas -1 puisque exclusive

    return new ArrayList<Opensearch>(page);
  }

  /*
   * (non-Javadoc)
   * 
   * @see fr.cnes.sitools.project.ProjectStore#getList()
   */
  @Override
  public List<Opensearch> getList() {
    List<Opensearch> result = new ArrayList<Opensearch>();
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
   */
  private void sort(List<Opensearch> result, ResourceCollectionFilter filter) {
    if ((filter != null) && (filter.getSort() != null) && !filter.getSort().equals("")) {
      Collections.sort(result, new ResourceComparator<Opensearch>(filter));
    }
  }

  @Override
  public List<Opensearch> getListByXQuery(String xquery) {
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
    this.location = location;
    this.xstream = XStreamFactory.getInstance().getXStream(MediaType.APPLICATION_XML);
    xstream.autodetectAnnotations(true);
    xstream.alias("opensearch", Opensearch.class);
    xstream.alias("opensearchColumn", OpensearchColumn.class);

    FilePersistenceStrategy strategy = new FilePersistenceStrategy(this.location, xstream);
    list = new XmlArrayList(strategy);
  }

  @Override
  public void close() {
    // TODO
  }

}
