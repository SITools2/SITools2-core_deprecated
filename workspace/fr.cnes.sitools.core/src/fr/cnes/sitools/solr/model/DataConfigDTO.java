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
package fr.cnes.sitools.solr.model;

import java.io.Serializable;
import java.util.List;

import fr.cnes.sitools.datasource.jdbc.model.JDBCDataSource;

/**
 * 
 * Configuration Data Code SOLR
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public final class DataConfigDTO implements Serializable {

  /**
   * serialVersionUID
   */
  private static final long serialVersionUID = 270639430113244255L;
  /**
   * document name
   */
  private String document = null;
  /**
   * data source definition
   */
  private JDBCDataSource datasource = null;
  /**
   * EntitityDTO list
   */
  private List<EntityDTO> entities = null;

  /**
   * Default constructor
   */
  public DataConfigDTO() {
    super();
  }

  /**
   * Gets the document value
   * 
   * @return the document
   */
  public String getDocument() {
    return document;
  }

  /**
   * Sets the value of document
   * 
   * @param document
   *          the document to set
   */
  public void setDocument(String document) {
    this.document = document;
  }

  /**
   * Gets the data source value
   * 
   * @return the data source
   */
  public JDBCDataSource getDatasource() {
    return datasource;
  }

  /**
   * Sets the value of data source
   * 
   * @param datasource
   *          the data source to set
   */
  public void setDatasource(JDBCDataSource datasource) {
    this.datasource = datasource;
  }

  /**
   * Gets the entities value
   * 
   * @return the entities
   */
  public List<EntityDTO> getEntities() {
    return entities;
  }

  /**
   * Sets the value of entities
   * 
   * @param entities
   *          the entities to set
   */
  public void setEntities(List<EntityDTO> entities) {
    this.entities = entities;
  }

}
