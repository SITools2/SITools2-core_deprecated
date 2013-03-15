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
package fr.cnes.sitools.dataset;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.logging.Level;

import org.restlet.ext.wadl.MethodInfo;
import org.restlet.ext.wadl.ParameterInfo;
import org.restlet.ext.wadl.ParameterStyle;
import org.restlet.representation.Representation;
import org.restlet.representation.Variant;
import org.restlet.resource.Put;

import fr.cnes.sitools.common.model.Response;
import fr.cnes.sitools.dataset.jdbc.RequestFactory;
import fr.cnes.sitools.dataset.jdbc.RequestSql;
import fr.cnes.sitools.dataset.model.Column;
import fr.cnes.sitools.dataset.model.DataSet;
import fr.cnes.sitools.dataset.model.Predicat;
import fr.cnes.sitools.dataset.model.structure.SitoolsStructure;
import fr.cnes.sitools.datasource.jdbc.business.SitoolsDataSource;
import fr.cnes.sitools.datasource.jdbc.business.SitoolsDataSourceFactory;
import fr.cnes.sitools.datasource.jdbc.model.Structure;
import fr.cnes.sitools.notification.model.Notification;

/**
 * Class for management of specific actions on a DataSet
 * 
 * @author jp.boignard (AKKA Technologies)
 */
public final class ActivationDataSetResource extends AbstractDataSetResource {

  @Override
  public void sitoolsDescribe() {
    setName("ActivationDataSetResource");
    setDescription("Resource to perform several actions on a dataset, in order to activating the linked DatasetApplication.");
    setNegotiated(false);
  }

  /**
   * Actions on PUT
   * 
   * @param representation
   *          could be null.
   * @param variant
   *          MediaType of response
   * @return Representation response
   */
  @Put
  public Representation action(Representation representation, Variant variant) {
    Response response = null;
    Representation rep = null;
    try {
      do {

        // on charge le dataset
        DataSet ds = store.retrieve(datasetId);
        if (ds == null) {
          response = new Response(false, "DATASET_NOT_FOUND");
          break;
        }

        if (this.getReference().toString().endsWith("start")) {
          if ("ACTIVE".equals(ds.getStatus())) {
            response = new Response(true, "dataset.update.blocked");
            break;
          }

          try {
            // get total results
            List<Column> columns = ds.getColumnModel();
            List<Predicat> predicats = ds.getPredicat();
            List<Structure> structures = ds.getStructures();

            String sql = null;
            try {
              sql = getSqlString(ds);
              if (testRequest(ds) < 0) {
                response = new Response(false, "dataset.sql.error : " + sql);
                break;
              }

              int nbTotalResults = getTotalResults(ds, structures, columns, predicats);
              ds.setNbRecords(nbTotalResults);
            }
            catch (Exception e) {
              getLogger().warning(e.getMessage());
              response = new Response(false, "dataset.sql.error : " + sql);
              break;
            }

            ds.setStatus("ACTIVE"); // TODO dans le start application.

            ds.setExpirationDate(new Date(new GregorianCalendar().getTime().getTime()));

            DataSet dsResult = store.update(ds);

            application.attachDataSet(dsResult);

            response = new Response(true, dsResult, DataSet.class, "dataset");
            response.setMessage("dataset.update.success");

            // Notify observers
            Notification notification = new Notification();
            notification.setObservable(dsResult.getId());
            notification.setStatus(dsResult.getStatus());
            notification.setEvent("DATASET_STATUS_CHANGED");
            notification.setMessage("dataset.update.success");
            getResponse().getAttributes().put(Notification.ATTRIBUTE, notification);

          }
          catch (Exception e) {
            e.printStackTrace();
            response = new Response(false, "dataset.update.error");
          }
          break;
        }

        if (this.getReference().toString().endsWith("stop")) {
          if (!"ACTIVE".equals(ds.getStatus())) {

            // Par mesure de securite
            try {
              application.detachDataSet(ds);
              ds.setStatus("INACTIVE"); // TODO dans le stop application.
              store.update(ds);
            }
            catch (Exception e) {
              e.printStackTrace();
            }

            response = new Response(true, "dataset.stop.blocked");
            break;
          }

          try {
            application.detachDataSet(ds);
            ds.setStatus("INACTIVE"); // TODO dans le stop application.
            DataSet dsResult = store.update(ds);

            response = new Response(true, dsResult, DataSet.class, "dataset");
            response.setMessage("dataset.stop.success");

            // Notify observers
            Notification notification = new Notification();
            notification.setObservable(dsResult.getId());
            notification.setStatus(dsResult.getStatus());
            notification.setEvent("DATASET_STATUS_CHANGED");
            notification.setMessage("dataset.stop.success");
            getResponse().getAttributes().put(Notification.ATTRIBUTE, notification);
          }
          catch (Exception e) {
            e.printStackTrace();
            response = new Response(false, "dataset.stop.error");
          }
          break;
        }

        if (this.getReference().toString().endsWith("getSqlString")) {
          try {
            response = new Response(true, getSqlString(ds));

          }
          catch (Exception e) {
            e.printStackTrace();
            response = new Response(false, "dataset.stop.error");
          }
          break;
        }
        if (this.getReference().toString().endsWith("refreshNotion")) {
          try {
            if (ds.getDirty()) {
//              ds.refreshNotion(getContext(), getSitoolsSetting(Consts.APP_DICTIONARIES_URL));
              store.update(ds);
              response = new Response(true, ds, DataSet.class, "dataset");
            }
            else {
              response = new Response(false, "dataset.not.dirty");
            }

          }
          catch (Exception e) {
            e.printStackTrace();
            response = new Response(false, "dataset.stop.error");
          }
          break;
        }

      } while (false);

      // Response
      if (response == null) {
        response = new Response(false, "dataset.action.error");
      }
    }
    finally {
      rep = getRepresentation(response, variant);
    }
    
    return rep;
  }

  @Override
  public void describePut(MethodInfo info, String path) {

    if (path.endsWith("start")) {
      info.setIdentifier("start");
      info.setDocumentation(" PUT /" + path
          + " : Performs a start action on the dataset making the related DatasetApplication ACTIVE.");
    }
    else if (path.endsWith("stop")) {
      info.setIdentifier("stop");
      info.setDocumentation(" PUT /" + path
          + " : Performs a stop action on the dataset making the related DatasetApplication INACTIVE.");
    }
    else if (path.endsWith("getSqlString")) {
      info.setIdentifier("getSqlString");
      info.setDocumentation(" PUT /" + path
          + " : Builds and returns the underlying datasource SQL request string for the dataset.");
    }
    else if (path.endsWith("refreshNotion")) {
      info.setIdentifier("refreshNotion");
      info.setDocumentation(" PUT /"
          + path
          + " : If dataset is dirty, updates the mapping of dataset columns with dictionary notions and sets dirty status to false. This action is performed automatically when activating the dataset (start action).");
    }

    addStandardGetRequestInfo(info);
    ParameterInfo pic = new ParameterInfo("datasetId", true, "xs:string", ParameterStyle.TEMPLATE,
        "Identifier of the dataset");
    info.getRequest().getParameters().add(pic);
    addStandardSimpleResponseInfo(info);
  }

  /**
   * Execute a select count(*) request with the predicates filter.
   * 
   * @param ds
   *          DataSet
   * @param structures
   *          ArrayList<Structure>
   * @param columns
   *          ArrayList<Column>
   * @param predicats
   *          ArrayList<Predicat>
   * @return total count of records according to the predicates filter.
   * @throws SQLException
   *           if error when executing the query
   */
  protected int getTotalResults(DataSet ds, List<Structure> structures, List<Column> columns, List<Predicat> predicats)
    throws SQLException {

    ResultSet resultSet = null;
    try {
      SitoolsDataSource datasource = SitoolsDataSourceFactory.getDataSource(ds.getDatasource().getId());
      RequestSql request = RequestFactory.getRequest(datasource.getDsModel().getDriverClass());
      if (structures.size() == 0) {
        return -1;
      }
      String sql = "SELECT count(1) ";

      if ("S".equals(ds.getQueryType())) {
        sql += " " + ds.getSqlQuery();
      }
      else {
        sql += " FROM " + request.getFromClauseAdvanced(ds.getStructure());
        sql += " WHERE 1=1 " + request.getWhereClause(predicats, columns);
      }

      int nbTotalResults = 0;
      resultSet = datasource.limitedQuery(sql, 1, 0);
      if (resultSet != null) {
        if (resultSet.next()) {
          nbTotalResults = resultSet.getInt(1);
        }
      }
      return nbTotalResults;
    }
    finally {
      if (resultSet != null) {
        try {
          resultSet.close();
        }
        catch (Exception e) {

          e.printStackTrace();
        }
      }
    }
  }

  /**
   * Gets a SQL String for validating the DataSet definition
   * 
   * @param ds
   *          DataSet
   * @return String
   */
  protected String getSqlString(DataSet ds) {
    List<Column> columns = ds.getColumnModel();
    List<Predicat> predicats = ds.getPredicat();
    List<Structure> structures = ds.getStructures();
    SitoolsStructure structure = ds.getStructure();
    
    SitoolsDataSource datasource = SitoolsDataSourceFactory.getDataSource(ds.getDatasource().getId());
    RequestSql request = RequestFactory.getRequest(datasource.getDsModel().getDriverClass());
    if (structures.size() == 0) {
      return null;
    }
    String sql = "SELECT " + request.getAttributes(ds.getDefaultColumnVisible());
    if ("S".equals(ds.getQueryType())) {
      sql += " " + ds.getSqlQuery();
    }
    else {
      sql += " FROM " + request.getFromClauseAdvanced(structure);
      sql += " WHERE 1=1 " + request.getWhereClause(predicats, columns);
    }
    // ORDER BY parameter is the first primary key by default
    sql += request.getOrderBy(ds);

    return sql;
  }

  /**
   * test the SQL request generated by the DataSet
   * 
   * @param ds
   *          DataSet
   * @return 1 if request is correct else -1
   * @throws SQLException
   *           if error when executing the query
   */
  protected int testRequest(DataSet ds) throws SQLException {
    ResultSet resultSet = null;
    try {

      SitoolsDataSource datasource = SitoolsDataSourceFactory.getDataSource(ds.getDatasource().getId());

      String sql = getSqlString(ds);
      getLogger().log(Level.INFO, "TEST SQL : " + sql);
      resultSet = datasource.limitedQuery(sql, 0, 0);
      if (resultSet != null) {
        return 1;
      }
      return -1;
    }
    finally {
      if (resultSet != null) {
        try {
          resultSet.close();
        }
        catch (Exception e) {

          e.printStackTrace();
        }
      }
    }
  }

  /**
   * Get the list of primary key in the dataset
   * 
   * @param ds
   *          the dataset to search in
   * @return primary keys
   */
  public List<String> getPrimaryKeys(DataSet ds) {
    List<String> pks = new ArrayList<String>();
    List<Column> columns = ds.getColumnModel();
    for (Column column : columns) {
      if (column.isPrimaryKey()) {
        pks.add(column.getColumnAlias());
      }
    }
    return pks;
  }

}
