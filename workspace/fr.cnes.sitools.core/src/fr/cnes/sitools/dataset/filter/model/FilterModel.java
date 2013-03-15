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
package fr.cnes.sitools.dataset.filter.model;

import java.io.Serializable;
import java.util.HashMap;

import com.thoughtworks.xstream.annotations.XStreamAlias;

import fr.cnes.sitools.common.model.ExtensionModel;

/**
 * Class bean to store filter definition.
 * 
 * @author m.marseille (AKKA Technologies)
 */
@SuppressWarnings("serial")
@XStreamAlias("filterModel")
public final class FilterModel extends ExtensionModel<FilterParameter> implements Serializable {

  /**
   * The status of the Filter
   */
  private String status;

  /**
   * Constructor.
   */
  public FilterModel() {
    this.setName("NullFilter");
    this.setDescription("Filter with no action.");
    this.setParametersMap(new HashMap<String, FilterParameter>());
    this.setClassVersion("");
    this.setClassAuthor("");
  }

  /**
   * Sets the value of status
   * 
   * @param status
   *          the status to set
   */
  public void setStatus(String status) {
    this.status = status;
  }

  /**
   * Gets the status value
   * 
   * @return the status
   */
  public String getStatus() {
    return status;
  }

}