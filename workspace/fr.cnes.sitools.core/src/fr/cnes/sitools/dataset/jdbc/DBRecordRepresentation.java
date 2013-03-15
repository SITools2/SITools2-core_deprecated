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
package fr.cnes.sitools.dataset.jdbc;

import java.io.IOException;
import java.io.OutputStream;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.Context;
import org.restlet.data.MediaType;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.ext.xstream.XstreamRepresentation;
import org.restlet.representation.OutputRepresentation;

import com.thoughtworks.xstream.XStream;

import fr.cnes.sitools.common.XStreamFactory;
import fr.cnes.sitools.common.model.Response;
import fr.cnes.sitools.dataset.converter.business.ConverterChained;
import fr.cnes.sitools.dataset.filter.business.FilterChained;
import fr.cnes.sitools.dataset.model.Column;
import fr.cnes.sitools.dataset.model.Predicat;
import fr.cnes.sitools.dataset.model.structure.SitoolsStructure;
import fr.cnes.sitools.datasource.jdbc.business.SitoolsDataSource;
import fr.cnes.sitools.datasource.jdbc.model.Record;
import fr.cnes.sitools.util.SQLUtils;

/**
 * Representation of a record
 * 
 * @author jp.boignard (AKKA Technologies)
 */
public final class DBRecordRepresentation extends OutputRepresentation {

  /** Parent resource */
  private DataSetExplorerUtil res = null;

  /** SQL DataSource */
  private SitoolsDataSource db = null;

  /** Primary key columns */
  private List<String> primaryKeys = null;

  /**
   * Chain of converters
   */
  private ConverterChained converterChained = null;

  /**
   * Chain of filters
   */
  private FilterChained filterChained = null;

  /**
   * basic join predicate
   */
  private String basicJoin = null;

  /** Resource logger Context / Application ? OK */
  private Logger logger = Context.getCurrentLogger();

  /**
   * SQL table Representation
   * 
   * @param mediaType
   *          media type to use
   * @param res
   *          resource to associate
   */
  public DBRecordRepresentation(MediaType mediaType, DataSetExplorerUtil res) {
    super(mediaType);
    this.res = res;
    db = res.getDataSource();
    primaryKeys = getPrimaryKeys();
    RequestSql request = RequestFactory.getRequest(res.getDataSource().getDsModel().getDriverClass());
    List<Column> columns = res.getApplication().getDataSet().getColumnModel();
    List<Predicat> predicats = res.getPredicats();
    String sql = "";
    if ("S".equals(res.getApplication().getDataSet().getQueryType())) {
      sql += " " + res.getApplication().getDataSet().getSqlQuery();
    }
    else {
      sql += " FROM " + getFromClause();
      sql += " WHERE 1=1 " + request.getWhereClause(predicats, columns);
    }

    this.basicJoin = sql;
    this.converterChained = res.getApplication().getConverterChained();
    this.setFilterChained(res.getApplication().getFilterChained());
  }

  @Override
  public void write(OutputStream arg0) throws IOException {
    Record record = null;
    ResultSet rs = null;
    try {
      RequestSql request = RequestFactory.getRequest(res.getDataSource().getDsModel().getDriverClass());
      String query = "SELECT " + request.getAttributes(res.getColumnFromDataset()) + " " + this.basicJoin + " "
          + buildConstraints(res.getRecordName().split(";"));
      this.logger.log(Level.INFO, "SQL = " + query);

      rs = db.basicQuery(query, res.getMaxrows(), res.getFetchSize());
      // Only one
      while (rs.next()) {
        record = new Record(res.getBaseRef()); // , buildURI(rs));
        setAttributeValues(record, rs);
      }

    }
    catch (SQLException ex) {
      Logger.getLogger(DataSetExplorerResource.class.getName()).log(Level.SEVERE, null, ex);
    }
    finally {
      if (rs != null) {
        try {
          rs.close();
        }
        catch (SQLException e) {
          Logger.getLogger(DataSetExplorerResource.class.getName()).log(Level.SEVERE, null, e);
        }
      }
    }

    if (this.getMediaType().isCompatible(MediaType.APPLICATION_JSON)) {
      // Response response = new Response(true, record, Record.class, "record");
      JSONObject root = new JSONObject();
      try {
        if (record != null) {
          root.put("success", true);
          // application du convertisseur en sortie
          if (converterChained != null) {
            record = converterChained.getConversionOf(record);
          }
          JSONObject jo = new JSONObject(record);
          root.put("record", jo);

        }
        else {
          root.put("success", false);
        }
        JsonRepresentation jr = new JsonRepresentation(root);
        arg0.write(jr.getText().getBytes());
      }
      catch (JSONException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }

    }
    else if (this.getMediaType().isCompatible(MediaType.APPLICATION_XML)
        || this.getMediaType().isCompatible(MediaType.TEXT_XML)) {

      boolean success = (record == null) ? false : true;

      if (success && converterChained != null) {
        // application du convertisseur en sortie
        record = converterChained.getConversionOf(record);
      }

      Response response = new Response(success, record, Record.class, "record");
      XstreamRepresentation<Response> innerRepresentation = new XstreamRepresentation<Response>(this.getMediaType(),
          response);

      XStream xstream = XStreamFactory.getInstance().getXStream(this.getMediaType());
      innerRepresentation.setXstream(xstream);

      // ALIAS
      xstream.autodetectAnnotations(true);

      // xstream.addImplicitCollection(Record.class, "attributeValues");
      // pour supprimer @class sur l'objet data
      if (response.getItemClass() != null) {
        xstream.alias("item", Object.class, response.getItemClass());
      }
      if (response.getItemName() != null) {
        xstream.aliasField(response.getItemName(), Response.class, "item");
      }

      innerRepresentation.write(arg0);
    }
  }

  /**
   * Build of constrains
   * 
   * @param keys
   *          keys to use
   * @return String the final string for constrains
   */
  private String buildConstraints(String[] keys) {
    String constraints = "";
    try {
      for (int i = 0; i < primaryKeys.size(); i++) {
        if (i == primaryKeys.size() - 1) {
          constraints += " " + primaryKeys.get(i) + " ='" + SQLUtils.escapeString(keys[i]) + "'";
        }
        else {
          constraints += " " + primaryKeys.get(i) + "='" + SQLUtils.escapeString(keys[i]) + "' and";
        }
      }
      if (!"".equals(constraints)) {
        constraints = " AND " + constraints;
      }
    }
    catch (Exception e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    return constraints;
  }

  /**
   * Set the attribute values for the record
   * 
   * @param record
   *          the record to set
   * @param rs
   *          the result set to apply
   * @throws SQLException
   *           when request fails
   */
  private void setAttributeValues(Record record, ResultSet rs) throws SQLException {
    SQLDatabaseRequest.setAttributeValues(record, rs);
  }

  /**
   * Get the list of primary keys
   * 
   * @return a list of keys
   */
  public List<String> getPrimaryKeys() {
    List<String> pKeys = new ArrayList<String>();
    List<Column> columns = res.getApplication().getDataSet().getColumnModel();
    RequestSql request = RequestFactory.getRequest(db.getDsModel().getDriverClass());
    for (Column column : columns) {
      if (column.isPrimaryKey()) {
        String attribute = request.convertColumnToString(column);
        pKeys.add(attribute);
      }
    }
    return pKeys;
  }

  /**
   * Get the result from clause
   * 
   * @return the request result
   */
  public String getFromClause() {
    // List<Structure> structures = res.getStructures();
    SitoolsStructure structure = res.getDataSet().getStructure();
    RequestSql request = RequestFactory.getRequest(db.getDsModel().getDriverClass());
    return request.getFromClauseAdvanced(structure);
  }

  /**
   * Set the chain of filters
   * 
   * @param filterChained
   *          the chain of filters
   */
  public void setFilterChained(FilterChained filterChained) {
    this.filterChained = filterChained;
  }

  /**
   * Get the chain of filters
   * 
   * @return the chain of filters
   */
  public FilterChained getFilterChained() {
    return filterChained;
  }

}
