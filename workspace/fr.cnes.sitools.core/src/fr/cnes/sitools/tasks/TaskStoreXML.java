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
package fr.cnes.sitools.tasks;

import java.io.File;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import fr.cnes.sitools.common.store.SitoolsSynchronizedStoreXML;
import fr.cnes.sitools.tasks.model.TaskModel;

/**
 * Implementation of TaskModelStore with XStream FilePersistenceStrategy
 * 
 * @author AKKA
 * 
 */
public final class TaskStoreXML extends SitoolsSynchronizedStoreXML<TaskModel> {

  /** default location for file persistence */
  private static final String COLLECTION_NAME = "tasks";

  /**
   * Constructor with the XML file location
   * 
   * @param location
   *          directory of FilePersistenceStrategy
   */
  public TaskStoreXML(File location) {
    super(TaskModel.class, location);
  }

  /**
   * Default constructor
   */
  public TaskStoreXML() {
    super(TaskModel.class);
    File defaultLocation = new File(COLLECTION_NAME);
    init(defaultLocation);
  }

  @Override
  public TaskModel update(TaskModel taskModel) {
    TaskModel result = null;

    List<TaskModel> rawList = getRawList();
    synchronized (rawList) {
      for (Iterator<TaskModel> it = getRawList().iterator(); it.hasNext();) {
        TaskModel current = it.next();
        if (current.getId().equals(taskModel.getId())) {
          getLog().info("Updating TaskModel");

          result = current;
          current.setName(taskModel.getName());
          current.setDescription(taskModel.getDescription());
          current.setStatus(taskModel.getStatus());

          current.setCustomStatus(taskModel.getCustomStatus());
          current.setStartDate(taskModel.getStartDate());
          current.setEndDate(taskModel.getEndDate());
          current.setModelId(taskModel.getModelId());
          current.setRunTypeAdministration(taskModel.getRunTypeAdministration());
          current.setRunTypeUserInput(taskModel.getRunTypeUserInput());

          current.setStatusUrl(taskModel.getStatusUrl());
          current.setModelName(taskModel.getModelName());
          current.setTimestamp(taskModel.getTimestamp());
          current.setUrlResult(taskModel.getUrlResult());
          current.setUserId(taskModel.getUserId());

          it.remove();

          break;
        }
      }
      if (result != null) {
        getRawList().add(result);
      }
    }
    return result;
  }

  /*
   * (non-Javadoc)
   * 
   * @see fr.cnes.sitools.common.store.SitoolsStoreXML#create(fr.cnes.sitools.common.model.IResource)
   */
  @Override
  public TaskModel create(TaskModel resource) {

    return super.create(resource);
  }

  /**
   * XStream FilePersistenceStrategy initialization
   * 
   * @param location
   *          Directory
   */
  public void init(File location) {
    Map<String, Class<?>> aliases = new ConcurrentHashMap<String, Class<?>>();
    aliases.put("TaskModel", TaskModel.class);

    this.init(location, aliases);

    /**
     * FIXME alias xstream XStream xstream = getXstream(); xstream.omitField(DatabaseRequestParameters.class, "db");
     * xstream.omitField(DatabaseRequestParameters.class, "dataset"); xstream.omitField(DatabaseRequestParameters.class,
     * "baseRef");
     */

  }

  @Override
  public List<TaskModel> retrieveByParent(String id) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public String getCollectionName() {
    return COLLECTION_NAME;
  }

}
