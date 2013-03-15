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

import java.io.Closeable;
import java.util.List;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.form.dataset.model.Form;
import fr.cnes.sitools.form.model.AbstractFormModel;

/**
 * Interface for managing Form objects persistence.
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public interface FormStore extends Closeable {
  /**
   * Method for getting all objects
   * 
   * @return Array
   */
  AbstractFormModel[] getArray();

  /**
   * Method for getting objects according to the XQuery
   * 
   * @param xquery
   *          String with XQuery syntax
   * @return Array
   */
  AbstractFormModel[] getArrayByXQuery(String xquery);

  /**
   * Method for getting forms according to the specified filter
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return Array
   */
  AbstractFormModel[] getArray(ResourceCollectionFilter filter);

  /**
   * Method for getting all form
   * 
   * @return ArrayList of form
   */
  List<Form> getList();

  /**
   * Method for getting form with specific criteria
   * 
   * @param filter
   *          criteria (pagination, ...)
   * @return ArrayList of form
   */
  List<Form> getList(ResourceCollectionFilter filter);

  /**
   * Method for getting form with XQuery request syntax
   * 
   * @param xquery
   *          String
   * @return ArrayList of form
   */
  List<Form> getListByXQuery(String xquery);
  
  /**
   * Method for getting Forms according to the pagination criteria
   * 
   * @param filter
   *          pagination
   * @param forms
   *          input
   * @return ArrayList of forms
   */
  List<Form> getPage(ResourceCollectionFilter filter, List<Form> forms);


  /**
   * Method for creating a form
   * 
   * @param form
   *          input
   * @return created form
   */
  Form create(Form form);

  /**
   * Method for retrieving a form by its id
   * 
   * @param id
   *          form identifier
   * @return retrieved form
   */
  Form retrieve(String id);

  /**
   * Method for updating a form
   * 
   * @param form
   *          input
   * @return updated form
   */
  Form update(Form form);

  /**
   * Method for deleting a form by its id
   * 
   * @param id
   *          form identifier
   * @return true if deleted
   */
  boolean delete(String id);

}
