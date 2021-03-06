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

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.util.Locale;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.restlet.data.MediaType;
import org.restlet.data.Preference;
import org.restlet.engine.Engine;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;

import fr.cnes.sitools.common.SitoolsSettings;
import fr.cnes.sitools.server.Starter;
import fr.cnes.sitools.util.RIAPUtils;

/**
 * Test case for CSV export
 * 
 * @author m.marseille (AKKA Technologies)
 */
public class DataSetCsvExportTestCase extends AbstractSitoolsServerTestCase {

  @Before
  @Override
  public void setUp() throws Exception {
    super.setUp();
  }

  @After
  @Override
  public void tearDown() throws Exception {
    super.tearDown();
  }

  /**
   * Executed once before all test methods
   */
  @BeforeClass
  public static void before() {
    Engine.clearThreadLocalVariables();

    SitoolsSettings settings = SitoolsSettings.getInstance("sitools", Starter.class.getClassLoader(), Locale.FRANCE,
        true);

    String source = settings.getRootDirectory() + TEST_FILES_REFERENCE_REPOSITORY;
    String cible = settings.getRootDirectory() + TEST_FILES_REPOSITORY;

    LOGGER.info("COPY SOURCE:" + source + " CIBLE:" + cible);

    setUpDataDirectory(source, cible);
    try {
      settings.setStoreDIR(TEST_FILES_REPOSITORY);
      Starter.start("localhost", 1337, "http://localhost:1337");
    }
    catch (Exception e) {
      e.printStackTrace();
    }
  }

  /**
   * Test the dataset export
   */
  @Test
  public void testExport() {
    getCount();
    export();
  }

  /**
   * Get the total number of records with limit=0
   */
  private void getCount() {
    ClientResource cr = new ClientResource("http://localhost:" + getTestPort() + "/fuse/records");
    cr.getRequest().getClientInfo().getAcceptedMediaTypes().add(new Preference<MediaType>(MediaType.TEXT_CSV));
    cr.getRequest().getResourceRef().addQueryParameter("limit", "0");
    Representation rep = cr.get(MediaType.TEXT_CSV);
    try {
      String res = rep.getText();
      assertNotNull(res);
      assertTrue(res.matches("(.*\\n)*#NRECORDS : [0-9]*\\n(.*\\n)*"));
    }
    catch (IOException e) {
      e.printStackTrace();
    }
    cr.release();
    RIAPUtils.exhaust(rep);
  }

  /**
   * Export the item in CSV format
   * 
   */
  protected void export() {
    ClientResource cr = new ClientResource("http://localhost:" + getTestPort() + "/fuse/records");
    cr.getRequest().getClientInfo().getAcceptedMediaTypes().add(new Preference<MediaType>(MediaType.TEXT_CSV));
    cr.getRequest().getAttributes().put("start", 0);
    cr.getRequest().getAttributes().put("limit", 2);
    Representation rep = cr.get(MediaType.TEXT_CSV);
    try {
      String res = rep.getText();
      assertNotNull(res);
      assertTrue(res.startsWith("#"));
    }
    catch (IOException e) {
      e.printStackTrace();
    }
    RIAPUtils.exhaust(rep);
    cr.release();
  }

}
