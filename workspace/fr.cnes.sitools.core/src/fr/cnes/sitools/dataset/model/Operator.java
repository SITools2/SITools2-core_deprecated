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
 * Operators for the filter
 * 
 * @author c.mozdzierz
 */
public enum Operator {
  /**
   * The list of operators available
   */
  LT("<"), GT(">"), EQ(" = "), LIKE(" like "), IN(" IN "), NOTIN(" NOT IN "), GTE(">="), LTE("<=");

  /**
   * The label
   */
  private String label;

  /**
   * Constructor for build an operator
   * 
   * @param operator
   *          the label for this operator
   */
  private Operator(String operator) {
    this.label = operator;
  }

  /**
   * Get the label
   * 
   * @return the operator's label
   */
  public String value() {
    return label;
  }

}
