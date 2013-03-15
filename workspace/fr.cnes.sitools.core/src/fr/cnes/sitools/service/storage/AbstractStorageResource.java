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
package fr.cnes.sitools.service.storage;

import org.restlet.data.MediaType;
import org.restlet.ext.jackson.JacksonRepresentation;
import org.restlet.ext.xstream.XstreamRepresentation;
import org.restlet.representation.ObjectRepresentation;
import org.restlet.representation.Representation;
import org.restlet.representation.Variant;

import com.thoughtworks.xstream.XStream;

import fr.cnes.sitools.common.SitoolsResource;
import fr.cnes.sitools.common.XStreamFactory;
import fr.cnes.sitools.common.model.Response;
import fr.cnes.sitools.service.storage.model.StorageDirectory;

/**
 * Abstract class for common properties of Storage resources
 * 
 * @author m.marseille (AKKA Technologies)
 * 
 */
public abstract class AbstractStorageResource extends SitoolsResource {

  /** Application associated */
  private StorageAdministration app;

  /** Id of the directory */
  private String directoryId;

  /** Store of the application */
  private DataStorageStore store;

  /**
   * Initialize the resource
   */
  @Override
  protected void doInit() {
    super.doInit();
    getVariants().add(new Variant(MediaType.APPLICATION_XML));
    getVariants().add(new Variant(MediaType.APPLICATION_JSON));
    app = (StorageAdministration) this.getApplication();
    store = app.getStore();
    directoryId = (String) this.getRequest().getAttributes().get("directoryId");
  }

  /**
   * Indicates if an attachment is already present (root comparison)
   * 
   * @param input
   *          the directory to compare
   * @return true if already attached
   */
  public final boolean isAlreadyAttached(StorageDirectory input) {
    String inputAttachRoot = input.getAttachUrl();
    boolean alreadyAttached = false;
    for (StorageDirectory dir : store.getList()) {
      String dirAttachRoot = dir.getAttachUrl();
      if (dirAttachRoot.equals(inputAttachRoot) && !dir.getId().equals(input.getId())) {
        alreadyAttached = true;
        break;
      }
    }
    return alreadyAttached;
  }

  /**
   * Gets representation according to the specified MediaType.
   * 
   * @param response
   *          : The response to get the representation from
   * @param media
   *          : The MediaType asked
   * @return The Representation of the response with the selected mediaType
   */
  public Representation getRepresentation(Response response, MediaType media) {
    getLogger().info(media.toString());
    if (media.isCompatible(MediaType.APPLICATION_JAVA_OBJECT)) {
      return new ObjectRepresentation<Response>(response);
    }

    XStream xstream = XStreamFactory.getInstance().getXStream(media);
    configure(xstream, response);
    xstream.alias("directory", StorageDirectory.class);

    XstreamRepresentation<Response> rep = new XstreamRepresentation<Response>(media, response);
    rep.setXstream(xstream);
    return rep;
  }

  /**
   * Instantiate a StorageDirectory object from representation
   * 
   * @param representation
   *          the representation sent
   * @return a StorageDirectory corresponding to the representation
   */
  public final StorageDirectory getStorageDirectory(Representation representation) {

    StorageDirectory outDirectory = null;

    if (MediaType.APPLICATION_XML.isCompatible(representation.getMediaType())) {
      outDirectory = new XstreamRepresentation<StorageDirectory>(representation).getObject();
    }
    if (MediaType.APPLICATION_JSON.isCompatible(representation.getMediaType())) {
      outDirectory = new JacksonRepresentation<StorageDirectory>(representation, StorageDirectory.class).getObject();
    }
    return outDirectory;
  }

  /**
   * Get the store associated to the application
   * 
   * @return the store
   */
  public final DataStorageStore getStore() {
    return this.store;
  }

  /**
   * Get the directory ID found in the API
   * 
   * @return the ID
   */
  public final String getDirectoryId() {
    return this.directoryId;
  }

  /**
   * Get the application associated to the resource
   * 
   * @return the application
   */
  public final StorageAdministration getStorageAdministration() {
    return this.app;
  }

  /**
   * Get the application associated to the resource
   * 
   * @return the application
   */
  public final StorageApplication getStorageApplication() {
    return this.app.getStorageApplication();
  }

}
