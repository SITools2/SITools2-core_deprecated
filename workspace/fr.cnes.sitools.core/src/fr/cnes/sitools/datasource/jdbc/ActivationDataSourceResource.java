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
package fr.cnes.sitools.datasource.jdbc;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;

import org.restlet.ext.wadl.MethodInfo;
import org.restlet.ext.wadl.ParameterInfo;
import org.restlet.ext.wadl.ParameterStyle;
import org.restlet.representation.Representation;
import org.restlet.representation.Variant;
import org.restlet.resource.Put;

import fr.cnes.sitools.common.SitoolsRepresentations;
import fr.cnes.sitools.common.model.Response;
import fr.cnes.sitools.datasource.jdbc.model.JDBCDataSource;

/**
 * Actions on DataSource : testConnection activation / disable of the associated Application(s)
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public final class ActivationDataSourceResource extends AbstractDataSourceResource {

  @Override
  public void sitoolsDescribe() {
    setName("ActivationDataSourceResource");
    setDescription("Resource to perform several actions on a datasource.");
  }

  /**
   * PUT to activate DataSource
   * 
   * @param representation
   *          the representation sent
   * @param variant
   *          the variant sent
   * @return Representation
   */
  @Put
  public Representation action(Representation representation, Variant variant) {
    Response response = null;

    do {
      // on accepte de faire un test avec la representation fournie
      // même si la datasource id n'existe pas.
      if (this.getReference().toString().endsWith("test")) {
        if (representation != null) {
          JDBCDataSource dsInput = getObject(representation);
          return testDataSourceConnection(dsInput, variant);
        }
      }

      // on charge la datasource
      JDBCDataSource ds = getStore().retrieve(getDatasourceId());
      if (ds == null) {
        response = new Response(false, "DATASOURCE_NOT_FOUND");
        break;
      }

      // on fait le test avec la datasource
      if (this.getReference().toString().endsWith("test")) {
        return testDataSourceConnection(ds, variant);
      }

      if (this.getReference().toString().endsWith("start")) {
        if ("ACTIVE".equals(ds.getStatus())) {
          JDBCDataSource dsResult = getStore().update(ds);
          response = new Response(true, dsResult, JDBCDataSource.class);
          response.setMessage("datasource.update.blocked");
          break;
        }

        try {
          if (!testDataSourceConnection(ds)) {
            response = new Response(false, ds, JDBCDataSource.class);
            response.setMessage("datasource.connection.error");
            break;
          }

          getJDBCDataSourceAdministration().attachDataSource(ds);
          ds.setStatus("ACTIVE");
          JDBCDataSource dsResult = getStore().update(ds);
          response = new Response(true, dsResult, JDBCDataSource.class); // TODO API ajouter ,"datasource"
          response.setMessage("datasource.update.success");
        }
        catch (Exception e) {
          response = new Response(false, "datasource.update.error");
        }
        break;
      }

      if (this.getReference().toString().endsWith("stop")) {
        if (!"ACTIVE".equals(ds.getStatus())) {
          JDBCDataSource dsResult = getStore().update(ds);
          response = new Response(true, dsResult, JDBCDataSource.class);
          response.setMessage("datasource.stop.blocked");
          break;
        }

        try {
          getJDBCDataSourceAdministration().detachDataSource(ds);
          ds.setStatus("INACTIVE");
          JDBCDataSource dsResult = getStore().update(ds);
          response = new Response(true, dsResult, JDBCDataSource.class);
          response.setMessage("datasource.stop.success");
        }
        catch (Exception e) {
          response = new Response(false, "datasource.stop.error");
        }
        break;
      }

    } while (false);

    // Response
    return getRepresentation(response, variant);
  }

  /**
   * Describe the GET method
   * 
   * @param info
   *          WADL method information
   * @param path
   *          url attachment of the resource
   */
  public void describePut(MethodInfo info, String path) {
    if (path.endsWith("start")) {
      info.setDocumentation(" PUT /"
          + path
          + " : starts a JDBC datasource, making available a connection pool and making a linked DBExplorerApplication ACTIVE.");
    }
    else if (path.endsWith("stop")) {
      info.setDocumentation(" PUT /"
          + path
          + " : stops a JDBC datasource, making unavailable a connection pool and making a linked DBExplorerApplication INACTIVE.");
    }
    else if (path.endsWith("test")) {
      info.setDocumentation(" PUT /" + path
          + " : checks a datasource by executing an SQL request on a JDBC connection.");
    }

    // info.setDocumentation("Method to test/start/stop one/all JDBC datasource(s).");
    this.addStandardPostOrPutRequestInfo(info);
    ParameterInfo param = new ParameterInfo("datasourceId", false, "xs:string", ParameterStyle.TEMPLATE,
        "datasourceId to retrieve a single datasource definition.");
    info.getRequest().getParameters().add(param);
    this.addStandardResponseInfo(info);
  }

  /**
   * Testing connections
   * 
   * @param ds
   *          the DataSource to test
   * @param variant
   *          client preferred media type
   * @return Representation results of the connection test.
   */
  public Representation testDataSourceConnection(JDBCDataSource ds, Variant variant) {
    Boolean result = Boolean.TRUE;
    ArrayList<String> trace = new ArrayList<String>();

    Connection cnxUsr = null;
    Statement statUsr = null;

    boolean isDriverClassLoaded = false;
    try {
      do {
        trace.add("Test jdbc data source connection for user ...");
        try {
          Class.forName(ds.getDriverClass());
          trace.add("Load driver class : OK");
          isDriverClassLoaded = true;
        }
        catch (Exception e) {
          result = false;
          getJDBCDataSourceAdministration().getLogger().info(e.getMessage());
          trace.add("Load driver class failed. Cause: " + e.getMessage());
          break;
        }

        try {
          cnxUsr = DriverManager.getConnection(ds.getUrl(), ds.getUserLogin(), ds.getUserPassword());
          trace.add("Get connection for user : OK");
        }
        catch (Exception e) {
          result = false;
          getJDBCDataSourceAdministration().getLogger().info(e.getMessage());
          trace.add("Get connection for user failed. Cause: " + e.getMessage());
          break;
        }

        if (result) {
          try {
            statUsr = cnxUsr.createStatement();
            /* ResultSet result = */statUsr.executeQuery("SELECT 1");
            trace.add("Execute statement on connection user : OK");
          }
          catch (Exception e) {
            result = false;
            getJDBCDataSourceAdministration().getLogger().info(e.getMessage());
            trace.add("Execute statement on connection user failed. Cause: " + e.getMessage());
            break;
          }
        }
      } while (false);

    }
    finally {
      if (statUsr != null) {
        try {
          statUsr.close();
        }
        catch (SQLException e) {
          getLogger().warning(e.getMessage());
        }
      }
      if (cnxUsr != null) {
        try {
          cnxUsr.close();
        }
        catch (SQLException e) {
          getLogger().warning(e.getMessage());
        }
      }
    }

    Connection cnxAdm = null;
    Statement statAdm = null;
    if (isDriverClassLoaded) {

      try {
        do {
          trace.add("_____________________________________________");
          trace.add("Test jdbc data source connection for admin...");
          try {
            cnxAdm = DriverManager.getConnection(ds.getUrl(), ds.getUserLogin(), ds.getUserPassword());
            trace.add("Get connection for admin : OK");
          }
          catch (Exception e) {
            result = false;
            getJDBCDataSourceAdministration().getLogger().info(e.getMessage());
            trace.add("Get connection for admin failed. Cause: " + e.getMessage());
            break;
          }

          if (cnxAdm != null) {
            try {
              statAdm = cnxAdm.createStatement();
              /* ResultSet result = */statAdm.executeQuery("SELECT 1");
              trace.add("Execute statement on connection admin : OK");
            }
            catch (Exception e) {
              result = false;
              getJDBCDataSourceAdministration().getLogger().info(e.getMessage());
              trace.add("Execute statement on connection admin failed. Cause: " + e.getMessage());
              break;
            }
          }
        } while (false);
      }
      finally {

        if (statAdm != null) {
          try {
            statAdm.close();
          }
          catch (SQLException e) {
            getLogger().warning(e.getMessage());
          }
        }
        if (cnxAdm != null) {
          try {
            cnxAdm.close();
          }
          catch (SQLException e) {
            getLogger().warning(e.getMessage());
          }
        }
      }
    }

    Response response = new Response(result, trace, String.class, "logs");

    return SitoolsRepresentations.getRepresentation(response, variant);
  }

  /**
   * Testing connections
   * 
   * @param ds
   *          the datasource to test
   * @return Boolean results of the connection test.
   */
  public Boolean testDataSourceConnection(JDBCDataSource ds) {
    Boolean result = Boolean.TRUE;
    ArrayList<String> trace = new ArrayList<String>();

    Connection cnxUsr = null;
    Statement statUsr = null;

    boolean isDriverClassLoaded = false;
    try {
      do {
        trace.add("Test jdbc data source connection for user ...");
        try {
          Class.forName(ds.getDriverClass());
          isDriverClassLoaded = true;
        }
        catch (Exception e) {
          result = false;
          getApplication().getLogger().info(e.getMessage());
          break;
        }

        try {
          cnxUsr = DriverManager.getConnection(ds.getUrl(), ds.getUserLogin(), ds.getUserPassword());
        }
        catch (Exception e) {
          result = false;
          getApplication().getLogger().info(e.getMessage());
          break;
        }

        if (result) {
          try {
            statUsr = cnxUsr.createStatement();
            statUsr.executeQuery("SELECT 1");
          }
          catch (Exception e) {
            result = false;
            getApplication().getLogger().info(e.getMessage());
            break;
          }
        }
      } while (false);

    }
    finally {
      if (statUsr != null) {
        try {
          statUsr.close();
        }
        catch (SQLException e) {
          getLogger().warning(e.getMessage());
        }
      }
      if (cnxUsr != null) {
        try {
          cnxUsr.close();
        }
        catch (SQLException e) {
          getLogger().warning(e.getMessage());
        }
      }
    }

    Connection cnxAdm = null;
    Statement statAdm = null;
    if (isDriverClassLoaded) {

      try {
        do {
          try {
            cnxAdm = DriverManager.getConnection(ds.getUrl(), ds.getUserLogin(), ds.getUserPassword());
          }
          catch (Exception e) {
            result = false;
            getJDBCDataSourceAdministration().getLogger().info(e.getMessage());
            break;
          }

          if (cnxAdm != null) {
            try {
              statAdm = cnxAdm.createStatement();
              statAdm.executeQuery("SELECT 1");
            }
            catch (Exception e) {
              result = false;
              getJDBCDataSourceAdministration().getLogger().info(e.getMessage());
              break;
            }
          }
        } while (false);
      }
      finally {

        if (statAdm != null) {
          try {
            statAdm.close();
          }
          catch (SQLException e) {
            getLogger().warning(e.getMessage());
          }
        }
        if (cnxAdm != null) {
          try {
            cnxAdm.close();
          }
          catch (SQLException e) {
            getLogger().warning(e.getMessage());
          }
        }
      }
    }
    return result;
  }

}
