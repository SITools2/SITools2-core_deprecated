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
package fr.cnes.sitools.dataset.model;

import com.thoughtworks.xstream.annotations.XStreamAlias;

/**
 * Class for definition of a grid
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
@XStreamAlias("grid")
public class Grid {

  /**
   * Object identifier
   */
  private String id;

  /**
   * Object name
   */
  private String name;

  /**
   * Object description
   */
  private String description;

  /**
   * Array of DataSet columns
   */
  private Column[] columns;

  /**
   * Default constructor
   */
  public Grid() {
    super();
  }

  /**
   * Gets the id value
   * 
   * @return the id
   */
  public final String getId() {
    return id;
  }

  /**
   * Sets the value of id
   * 
   * @param id
   *          the id to set
   */
  public final void setId(String id) {
    this.id = id;
  }

  /**
   * Gets the name value
   * 
   * @return the name
   */
  public final String getName() {
    return name;
  }

  /**
   * Sets the value of name
   * 
   * @param name
   *          the name to set
   */
  public final void setName(String name) {
    this.name = name;
  }

  /**
   * Gets the description value
   * 
   * @return the description
   */
  public final String getDescription() {
    return description;
  }

  /**
   * Sets the value of description
   * 
   * @param description
   *          the description to set
   */
  public final void setDescription(String description) {
    this.description = description;
  }

  /**
   * Gets the columns value
   * 
   * @return the columns
   */
  public final Column[] getColumns() {
    return columns;
  }

  /**
   * Sets the value of columns
   * 
   * @param columns
   *          the columns to set
   */
  public final void setColumns(Column[] columns) {
    if (columns != null) {
      this.columns = columns.clone();
    }
  }

}
