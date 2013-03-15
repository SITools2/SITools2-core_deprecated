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
package fr.cnes.sitools.form.dataset;

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
import fr.cnes.sitools.form.dataset.model.Form;
import fr.cnes.sitools.form.dataset.model.SimpleParameter;
import fr.cnes.sitools.form.model.AbstractFormModel;
import fr.cnes.sitools.persistence.Paginable;

/**
 * Implementation of formStore with XStream FilePersistenceStrategy
 * 
 * @author AKKA
 * 
 */
public final class FormStoreXML extends Paginable<Form> implements FormStore {

  /** default location for file persistence */
  private static final String COLLECTION_NAME = "forms";

  /**
   * Constructor with the XML file location
   * 
   * @param location
   *          directory of FilePersistenceStrategy
   */
  public FormStoreXML(File location) {
    super(location);
  }

  /**
   * Default constructor
   */
  public FormStoreXML() {
    File defaultLocation = new File(COLLECTION_NAME);
    init(defaultLocation);
  }

  @Override
  public Form create(Form form) {
    Form result = null;

    if (form.getId() == null || "".equals(form.getId())) {
      form.setId(UUID.randomUUID().toString());
    }

    // Recherche sur l'id
    for (Iterator<Form> it = getRawList().iterator(); it.hasNext();) {
      Form current = it.next();
      if (current.getId().equals(form.getId())) {
        getLog().info("Form found");
        result = current;
        break;
      }
    }

    if (result == null) {
      getRawList().add(form);
      result = form;
    }
    return result;
  }

  @Override
  public Form retrieve(String id) {
    Form result = null;
    for (Iterator<Form> it = getRawList().iterator(); it.hasNext();) {
      Form current = it.next();
      if (current.getId().equals(id)) {
        getLog().info("Form found");
        result = current;
        break;
      }
    }
    return result;
  }

  @Override
  public Form update(Form form) {
    Form result = null;
    for (Iterator<Form> it = getRawList().iterator(); it.hasNext();) {
      Form current = it.next();
      if (current.getId().equals(form.getId())) {
        getLog().info("Updating Form");

        result = current;
        current.setName(form.getName());
        current.setDescription(form.getDescription());
        current.setParent(form.getParent());
        current.setParameters(form.getParameters());
        current.setWidth(form.getWidth());
        current.setHeight(form.getHeight());
        current.setCss(form.getCss());
        current.setParentUrl(form.getParentUrl());
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
    for (Iterator<Form> it = getRawList().iterator(); it.hasNext();) {
      Form current = it.next();
      if (current.getId().equals(id)) {
        getLog().info("Removing Form");
        it.remove();
        result = true;
        break;
      }
    }
    return result;
  }

  @Override
  public AbstractFormModel[] getArray() {
    AbstractFormModel[] result = null;
    if ((getRawList() != null) && (getRawList().size() > 0)) {
      result = getRawList().toArray(new Form[getRawList().size()]);
    }
    else {
      result = new AbstractFormModel[0];
    }
    return result;
  }

  @Override
  public AbstractFormModel[] getArray(ResourceCollectionFilter filter) {
    List<Form> resultList = getList(filter);

    AbstractFormModel[] result = null;
    if ((resultList != null) && (resultList.size() > 0)) {
      result = resultList.toArray(new Form[resultList.size()]);
    }
    else {
      result = new AbstractFormModel[0];
    }
    return result;
  }

  @Override
  public AbstractFormModel[] getArrayByXQuery(String xquery) {
    getLog().severe("getArrayByXQuery NOT IMPLEMENTED");
    return null;
  }

  @Override
  public List<Form> getList(ResourceCollectionFilter filter) {
    List<Form> result = new ArrayList<Form>();
    if ((getRawList() == null) || (getRawList().size() <= 0) || (filter.getStart() > getRawList().size())) {
      return result;
    }

    // Filtre parent en premier
    if ((filter.getParent() != null) && !filter.getParent().equals("")) {
      for (Form form : getRawList()) {
        if (null == form.getParent()) {
          continue;
        }
        if (form.getParent().equals(filter.getParent())) {
          result.add(form);
        }
      }
    }
    else {
      result.addAll(getRawList());
    }

    // Filtre Query
    if ((filter.getQuery() != null) && !filter.getQuery().equals("")) {
      for (Form form : result) {
        if (null == form.getName()) {
          result.remove(form);
        }
        if (form.getName().toLowerCase().startsWith(filter.getQuery().toLowerCase())) {
          if ((filter.getParent() != null) && !filter.getParent().equals(form.getParent())) {
            result.remove(form);
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

    return new ArrayList<Form>(result);
  }

  /**
   * Sort the list (by default on the name)
   * 
   * @param result
   *          list to be sorted
   * @param filter
   *          ResourceCollectionFilter with sort properties.
   */
  public void sort(List<Form> result, ResourceCollectionFilter filter) {
    if ((filter != null) && (filter.getSort() != null) && !filter.getSort().equals("")) {
      Collections.sort(result, new ResourceComparator<Form>(filter));
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
    aliases.put("form", Form.class);
    aliases.put("SimpleParameter", SimpleParameter.class);
    this.init(location, aliases);
  }

}
