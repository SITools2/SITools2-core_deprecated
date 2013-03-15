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

/**
 * Sort Definition on a DatasetColumn. 
 * Basic Definition used to serialize multiSort on a DataSet. 
 * 
 * @author d.arpin (AKKA Technologies)
 * 
 */
public final class Sort {
  /**
   * Mapping with the DatasetColumn : columnAlias
   */
  private String field;
  /**
   * Sort Direction : "ASC" or "DESC"
   */
  private String direction;

  /**
   * Complete constructor
   * 
   * @param field
   *          field
   * @param direction
   *          direction
   */
  private Sort(String field, String direction) {
    this.field = field;
    this.direction = direction;
  }
  /**
   *  Default constructor
   * 
   */
  private Sort() {
  }
  /**
   * Gets the value of field
   * @return the field
   */
  public String getField() {
    return field;
  }

  /**
   * Sets the value of field
   * @param field
   *          the field to set
   */
  public void setField(String field) {
    this.field = field;
  }

  /**
   * Gets the value of direction
   * @return the direction
   */
  public String getDirection() {
    return direction;
  }

  /**
   * Sets the value of direction
   * @param direction
   *          the direction to set
   */
  public void setDirection(String direction) {
    this.direction = direction;
  }
}


