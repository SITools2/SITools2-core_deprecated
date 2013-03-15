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
package fr.cnes.sitools;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.restlet.data.MediaType;
import org.restlet.data.Method;
import org.restlet.ext.jackson.JacksonRepresentation;
import org.restlet.ext.xstream.XstreamRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;

import com.thoughtworks.xstream.XStream;

import fr.cnes.sitools.common.XStreamFactory;
import fr.cnes.sitools.common.model.Response;
import fr.cnes.sitools.dataset.converter.dto.ConverterModelDTO;
import fr.cnes.sitools.dataset.converter.model.ConverterParameter;
import fr.cnes.sitools.dataset.converter.model.ConverterParameterType;
import fr.cnes.sitools.dataset.model.DataSet;
import fr.cnes.sitools.datasource.jdbc.model.AttributeValue;
import fr.cnes.sitools.datasource.jdbc.model.Record;
import fr.cnes.sitools.server.Consts;
import fr.cnes.sitools.util.RIAPUtils;

/**
 * Test case for dataset exploration API
 * 
 * @author m.marseille (AKKA Technologies)
 * 
 */
public abstract class AbstractDatasetExplorerTestCase extends AbstractDataSetManagerTestCase {

  /** Dataset ID for test */
  protected static final String DATASET_URL = "/fuse";

  /**
   * The sql injection string
   */
  private String sqlInjectionStr = "' OR '1' = '1";
  /**
   * The sql delete injection string
   */
  private String sqlDeleteInjectionStr = "'; DELETE from sitools.\"USERS\";--";

  /**
   * Converter classname
   */
  private String converterClassname = "fr.cnes.sitools.converter.tests.ConverterValidatorTest";

  public String getBaseUrlDataset() {
    return getHostUrl() + DATASET_URL;
  }

  /**
   * Start the server
   */
  @Before
  public void setUp() {
    try {
      super.setUp();
    }
    catch (Exception e) {
      e.printStackTrace();
    }
  }

  /**
   * Stop the server after tests
   */
  @After
  public void tearDown() {
    try {
      super.tearDown();
    }
    catch (Exception e) {
      e.printStackTrace();
    }
  }

  /**
   * Test Dataset exploration API
   */
  @Test
  public void testCRUD() {
    docAPI.setActive(false);
    DataSet ds = getDataset();
    getCount();
    getCountWithCountResource();
    getCountWithCountResourceWithRange();
    getRecordsWithCount();
    getRecordsWithNoCount();
    getRecord(ds, "A0010101A001010117");
    getRecordTrySQLInjection(ds, sqlInjectionStr);
    getRecordTrySQLInjection(ds, sqlDeleteInjectionStr);
    getRecordsWithRangeOfIndex();
    getRecordsDistinct();
    getRecordsDistinctUnknownColumn();
    getRecordsUnknownColumn();

    getRecordsWithConverterExecution(ds);

    getMonitoring();
  }

  /**
   * Test CRUD Graph with JSon format exchanges.
   */
  @Test
  public void testCRUD2docAPI() {
    docAPI.setActive(false);
    DataSet ds = getDataset();
    docAPI.setActive(true);
    docAPI.appendChapter("Working with dataset API");

    docAPI.appendSubChapter("Obtaining the total number of records in a dataset, not recommended method ", "counting");

    getCount();
    docAPI.appendSubChapter("Obtaining the total nunmber of records in a dataset, recommended method",
        "counting_recommended");
    getCountWithCountResource();

    docAPI.appendSubChapter("Obtaining a defined set of records, from 2 to 6.", "retrieving");
    docAPI.appendSection("Retrieving records from #2 to #6, hence 5 records.");
    docAPI.appendComment("NB the first records is #0");

    getRecordsWithCount();

    docAPI.appendSection("Counting the total number of records is disabled ");
    docAPI.appendComment("This option is useful with large datasets by sparing time.");

    getRecordsWithNoCount();

    docAPI.appendSubChapter("Get a particular record", "record");
    getRecord(ds, "A0010101A001010117");

    docAPI.appendSubChapter("Query a dataset with a SQL injection try", "SqlInject");
    docAPI.appendSection("Query a dataset with a SQL injection try ");
    getRecordTrySQLInjection(ds, sqlInjectionStr);

    docAPI.appendSubChapter("Query record with a range of query", "Range");
    getRecordsWithRangeOfIndex();

    docAPI.appendSubChapter(
        "Obtaining the nunmber of records in a request on a dataset with ranges parameters, recommended method",
        "counting_recommended_ranges");

    getCountWithCountResourceWithRange();

    docAPI.close();
  }

  /**
   * Retrieve the dataset object
   * 
   * @return the dataset tested
   */
  private DataSet getDataset() {
    DataSet ds = null;
    ClientResource cr = new ClientResource(getBaseUrlDataset());
    Representation rep = cr.get(getMediaTest());
    Response response = getResponse(getMediaTest(), rep, DataSet.class, false);
    assertNotNull(response);
    assertTrue(response.getSuccess());
    ds = (DataSet) response.getItem();
    return ds;
  }

  /**
   * Test the limit=0 parameter to get the number of records
   */
  private void getCount() {
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      parameters.put("limit", "0");
      String uri = getBaseUrlDataset();
      this.retrieveDocAPI(uri + "/records?limit=0", "", parameters,
          String.format(getBaseUrlDataset(), "/records?limit=0"));
    }
    else {
      ClientResource cr = new ClientResource(getBaseUrlDataset() + "/records");
      cr.getRequest().getResourceRef().addQueryParameter("limit", "0");
      docAPI.appendRequest(Method.GET, cr);
      Representation rep = cr.get(getMediaTest());
      assertTrue(cr.getStatus().isSuccess());
      assertNotNull(rep);
      Response response = getResponseRecord(getMediaTest(), rep, Record.class);
      assertNotNull(response);
      assertEquals(Integer.valueOf(4689), response.getTotal());

      RIAPUtils.exhaust(rep);
    }
  }

  /**
   * Test the limit=0 parameter to get the number of records
   */
  private void getCountWithCountResource() {
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      String uri = getBaseUrlDataset();
      this.retrieveDocAPI(uri + "/count", "", parameters, String.format(getBaseUrlDataset(), "/count"));
    }
    else {
      ClientResource cr = new ClientResource(getBaseUrlDataset() + "/count");
      docAPI.appendRequest(Method.GET, cr);
      Representation rep = cr.get(getMediaTest());
      assertTrue(cr.getStatus().isSuccess());
      assertNotNull(rep);
      Response response = getResponseRecord(getMediaTest(), rep, Record.class);
      assertNotNull(response);
      assertEquals(Integer.valueOf(4689), response.getTotal());

      RIAPUtils.exhaust(rep);
    }
  }

  /**
   * Test the limit=0 parameter to get the number of records
   */
  private void getCountWithCountResourceWithRange() {
    String url = getBaseUrlDataset() + "/count?ranges=[[0,150]]";
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      parameters.put("ranges", "The list of range to select");
      this.retrieveDocAPI(url, "", parameters, url);
    }
    else {
      ClientResource cr = new ClientResource(url);
      docAPI.appendRequest(Method.GET, cr);
      Representation rep = cr.get(getMediaTest());
      assertTrue(cr.getStatus().isSuccess());
      assertNotNull(rep);
      Response response = getResponseRecord(getMediaTest(), rep, Record.class);
      assertNotNull(response);
      assertEquals(Integer.valueOf(151), response.getTotal());

      RIAPUtils.exhaust(rep);
    }
  }

  /**
   * Get a set of records with a start and a limit
   */
  private void getRecordsWithCount() {
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      parameters.put("start", "start record number");
      parameters.put("limit", "number of records to send, including the starting one");
      String uri = getBaseUrlDataset();
      this.retrieveDocAPI(uri + "/records?start=2&limit=5", "", parameters,
          String.format(getBaseUrlDataset(), "/records?start=2&limit=5"));
    }
    else {
      queryDatasetRequestUrl(DATASET_URL + "/records", "?start=2&limit=5", 5);

    }
  }

  /**
   * Get a set of records without counting
   */
  private void getRecordsWithNoCount() {
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      parameters.put("start", "start record number");
      parameters.put("limit", "number of records to send, including the starting one");
      parameters.put("nocount", "true indicates that counting before request is disabled");
      String uri = getBaseUrlDataset();
      this.retrieveDocAPI(uri + "/records?start=2&limit=5&nocount=true", "", parameters,
          String.format(getBaseUrlDataset(), "/records?start=2&limit=5&nocount=true"));
    }
    else {
      queryDatasetRequestUrl(DATASET_URL + "/records", "?start=2&limit=5&nocount=true", 5);

    }
  }

  /**
   * Get a single record by ID
   * 
   * @param ds
   *          the dataset to search for
   * @param recordId
   *          the ID of the record
   */
  private void getRecord(DataSet ds, String recordId) {
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      parameters.put("recordId", "The id of the record");
      String uri = getBaseUrlDataset();
      this.retrieveDocAPI(uri + "/records/" + recordId, "", parameters,
          String.format(getBaseUrlDataset(), "/records/%recordId%"));
    }
    else {
      queryDataset(DATASET_URL, recordId, null);
    }

  }

  /**
   * Get a single record by ID, but try to inject SQL string
   * 
   * @param ds
   *          the dataset
   * @param sqlInjectionStr
   *          the request to execute
   */
  private void getRecordTrySQLInjection(DataSet ds, String sqlInjectionStr) {
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      String uri = getBaseUrlDataset();
      this.retrieveDocAPI(uri + "/records/" + sqlInjectionStr, "", parameters,
          String.format(getBaseUrlDataset(), "/records/" + sqlInjectionStr));
    }
    else {
      ClientResource cr = new ClientResource(getBaseUrlDataset() + "/records/" + sqlInjectionStr);
      Representation rep = cr.get(getMediaTest());
      assertTrue(cr.getStatus().isSuccess());
      Response response = getResponseRecord(getMediaTest(), rep, Response.class, false);
      assertNotNull(response);
      assertFalse(response.getSuccess());
      RIAPUtils.exhaust(rep);
    }

  }

  private void getRecordsWithRangeOfIndex() {
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      parameters.put("ranges", "Array of ranges to query");
      String uri = getBaseUrlDataset();
      this.retrieveDocAPI(uri + "/records?ranges=[[2,5],[1,1],[6,8]]", "", parameters,
          String.format(getBaseUrlDataset(), "/records?ranges=[[2,5],[1,1],[6,8"));
    }
    else {
      queryDatasetRequestUrl(DATASET_URL + "/records", "?ranges=[[2,5],[1,1],[6,8]]", 8);

    }
  }

  /**
   * Test a distinct request
   */
  private void getRecordsDistinct() {
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      parameters.put("ranges", "Array of ranges to query");
      String uri = getBaseUrlDataset();
      this.retrieveDocAPI(uri + "/records?distinct=true&colModel=cycle", "", parameters,
          String.format(getBaseUrlDataset(), "/records?distinct=true&colModel=cycle"));
    }
    else {
      queryDatasetRequestUrl(DATASET_URL + "/records", "?distinct=true&colModel=aperture", 4);

    }
  }

  /**
   * Test a distinct request with a column which is not in the dataset The expected result is a normal result with no
   * records in it
   */
  private void getRecordsDistinctUnknownColumn() {
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      parameters.put("ranges", "Array of ranges to query");
      String uri = getBaseUrlDataset();
      this.retrieveDocAPI(uri + "/records?distinct=true&colModel=testtest", "", parameters,
          String.format(getBaseUrlDataset(), "/records?distinct=true&colModel=testtest"));
    }
    else {
      queryDatasetRequestUrl(DATASET_URL + "/records", "?distinct=true&colModel=testtest", 0);

    }
  }

  /**
   * Test a distinct request with a column which is not in the dataset The expected result is a normal result with no
   * records in it
   */
  private void getRecordsUnknownColumn() {
    if (docAPI.isActive()) {
      Map<String, String> parameters = new LinkedHashMap<String, String>();
      parameters.put("ranges", "Array of ranges to query");
      String uri = getBaseUrlDataset();
      this.retrieveDocAPI(uri + "/records?colModel=\"testtest, aperture\"&start=2&limit=5", "", parameters,
          String.format(getBaseUrlDataset(), "?colModel=\"testtest, aperture\"&start=2&limit=5"));
    }
    else {
      List<Record> records = queryDatasetRequestUrl(DATASET_URL + "/records",
          "?colModel=\"testtest, aperture\"&start=2&limit=5");

      assertNotNull(records);
      assertEquals(5, records.size());

      Record rec = records.get(0);
      assertNotNull(rec);
      List<AttributeValue> attr = rec.getAttributeValues();
      List<String> columnNames = new ArrayList<String>();
      for (AttributeValue attributeValue : attr) {
        columnNames.add(attributeValue.getName());
      }
      assertTrue(columnNames.contains("aperture"));
      assertFalse(columnNames.contains("testtest"));

    }
  }

  /**
   * Execute a query on the dataset with a converter attached to it
   * 
   * @param dataset
   *          the DataSet
   */
  private void getRecordsWithConverterExecution(DataSet dataset) {
    createConverterObject(dataset.getDescription(), dataset.getId());
    queryDatasetRequestUrl(DATASET_URL + "/records", "?start=2&limit=5", 5);
    deleteConverters(dataset.getId());
  }

  private void deleteConverters(String id) {
    ClientResource cr = new ClientResource(getBaseUrl() + settings.getString(Consts.APP_DATASETS_URL) + "/" + id
        + settings.getString(Consts.APP_DATASETS_CONVERTERS_URL));
    Representation result = cr.delete(getMediaTest());
    assertNotNull(result);
    assertTrue(cr.getStatus().isSuccess());
    RIAPUtils.exhaust(result);

  }

  /**
   * Create a ConverterModelDTO object with the specified description and identifier
   * 
   * @param description
   *          the description
   * @param id
   *          the ConverterModelDTO identifier
   */
  public void createConverterObject(String description, String id) {
    ConverterModelDTO conv = new ConverterModelDTO();

    conv.setClassName(converterClassname);
    conv.setDescriptionAction(description);
    conv.setName("TestConverter");
    conv.setClassAuthor("AKKA/CNES");
    conv.setClassVersion("1.0");
    conv.setDescription("FOR TEST PURPOSE ONLY, DON'T USE IT, IT DOESN'T DO ANYTHING");
    conv.setId(id);

    ConverterParameter param1 = new ConverterParameter("1", "1", ConverterParameterType.CONVERTER_PARAMETER_INTERN);
    param1.setValue("param1_value");
    ConverterParameter param2 = new ConverterParameter("2", "2", ConverterParameterType.CONVERTER_PARAMETER_INTERN);
    param2.setValue("param2_value");

    ConverterParameter paramColIn = new ConverterParameter("colIn", "colIn",
        ConverterParameterType.CONVERTER_PARAMETER_IN);
    paramColIn.setAttachedColumn("ra_targ");
    ConverterParameter paramColOut = new ConverterParameter("colOut", "colOut",
        ConverterParameterType.CONVERTER_PARAMETER_OUT);
    paramColOut.setAttachedColumn("ra_targ");
    ConverterParameter paramColInOut = new ConverterParameter("colInOut", "colInOut",
        ConverterParameterType.CONVERTER_PARAMETER_INOUT);
    paramColInOut.setAttachedColumn("ra_targ");

    conv.getParameters().add(param1);
    conv.getParameters().add(param2);
    conv.getParameters().add(paramColIn);
    conv.getParameters().add(paramColOut);
    conv.getParameters().add(paramColInOut);

    Representation rep = getRepresentationConverter(conv, getMediaTest());
    ClientResource cr = new ClientResource(getBaseUrl() + settings.getString(Consts.APP_DATASETS_URL) + "/" + id
        + settings.getString(Consts.APP_DATASETS_CONVERTERS_URL));
    Representation result = cr.post(rep, getMediaTest());
    assertNotNull(result);
    assertTrue(cr.getStatus().isSuccess());
    RIAPUtils.exhaust(result);

    this.changeStatus(id, "/stop");
    this.changeStatus(id, "/start");

  }

  /**
   * Call the monitoring resource
   */
  private void getMonitoring() {
    ClientResource cr = new ClientResource(getBaseUrlDataset() + "/monitoring");
    Representation rep = cr.get(getMediaTest());
    assertTrue(cr.getStatus().isSuccess());
    RIAPUtils.exhaust(rep);
  }

  /**
   * Builds XML or JSON Representation of Project for Create and Update methods.
   * 
   * @param item
   *          Project
   * @param media
   *          APPLICATION_XML or APPLICATION_JSON
   * @return XML or JSON Representation
   */
  public static Representation getRepresentationConverter(ConverterModelDTO item, MediaType media) {
    if (media.equals(MediaType.APPLICATION_JSON)) {
      return new JacksonRepresentation<ConverterModelDTO>(item);
    }
    else if (media.equals(MediaType.APPLICATION_XML)) {
      XStream xstream = XStreamFactory.getInstance().getXStreamWriter(media, false);
      XstreamRepresentation<ConverterModelDTO> rep = new XstreamRepresentation<ConverterModelDTO>(media, item);
      configureConverter(xstream);
      rep.setXstream(xstream);
      return rep;
    }
    else {
      Logger.getLogger(AbstractSitoolsTestCase.class.getName()).warning("Only JSON or XML supported in tests");
      return null; // TODO complete test with ObjectRepresentation
    }
  }

  /**
   * Configures XStream mapping of Response object with ConverterModelDTO content.
   * 
   * @param xstream
   *          XStream
   */
  private static void configureConverter(XStream xstream) {
    xstream.autodetectAnnotations(false);
    xstream.alias("response", Response.class);

    // Parce que les annotations ne sont apparemment prises en compte
    xstream.omitField(Response.class, "itemName");
    xstream.omitField(Response.class, "itemClass");
  }

}
