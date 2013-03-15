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
package fr.cnes.sitools.project.modules;

import java.io.File;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.common.model.ResourceComparator;
import fr.cnes.sitools.common.store.SitoolsStoreXML;
import fr.cnes.sitools.project.modules.model.ProjectModule;

/**
 * Implementation of ProjectModuleStore with XStream FilePersistenceStrategy
 * 
 * @author AKKA Technologies
 * 
 */
public final class ProjectModuleStoreXML extends SitoolsStoreXML<ProjectModule> {

  /** default location for file persistence */
  private static final String COLLECTION_NAME = "ProjectModules";

  /**
   * Constructor with the XML file location
   * 
   * @param location
   *          directory of FilePersistenceStrategy
   */
  public ProjectModuleStoreXML(File location) {
    super(ProjectModule.class, location);
  }

  /**
   * Default constructor
   */
  public ProjectModuleStoreXML() {
    super(ProjectModule.class);
    File defaultLocation = new File(COLLECTION_NAME);
    init(defaultLocation);
  }

  @Override
  public ProjectModule update(ProjectModule module) {
    ProjectModule result = null;
    for (Iterator<ProjectModule> it = getRawList().iterator(); it.hasNext();) {
      ProjectModule current = it.next();
      if (current.getId().equals(module.getId())) {
        getLog().info("Updating ProjectModule");

        result = current;
        current.setId(module.getId());
        current.setName(module.getName());
        current.setDescription(module.getDescription());
        current.setTitle(module.getTitle());

        current.setUrl(module.getUrl());
        current.setImagePath(module.getImagePath());
        current.setIcon(module.getIcon());

        current.setX(module.getX());
        current.setY(module.getY());
        current.setDefaultHeight(module.getDefaultHeight());
        current.setDefaultWidth(module.getDefaultWidth());

        current.setAuthor(module.getAuthor());
        current.setVersion(module.getVersion());

        current.setXtype(module.getXtype());
        current.setSpecificType(module.getSpecificType());

        current.setPriority(module.getPriority());

        current.setDependencies(module.getDependencies());

        it.remove();

        break;
      }
    }
    if (result != null) {
      getRawList().add(result);
    }
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
  public void sort(List<ProjectModule> result, ResourceCollectionFilter filter) {
    if ((filter != null) && (filter.getSort() != null) && !filter.getSort().equals("")) {
      Collections.sort(result, new ResourceComparator<ProjectModule>(filter) {
        @Override
        public int compare(ProjectModule arg0, ProjectModule arg1) {
          if (arg0.getName() == null) {
            return 1;
          }
          if (arg1.getName() == null) {
            return -1;
          }
          String s1 = (String) arg0.getName();
          String s2 = (String) arg1.getName();

          return super.compare(s1, s2);
        }
      });
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
    aliases.put("projectModule", ProjectModule.class);
    this.init(location, aliases);
  }

  @Override
  public List<ProjectModule> retrieveByParent(String id) {
    return null;
  }

  @Override
  public String getCollectionName() {
    return COLLECTION_NAME;
  }

}
