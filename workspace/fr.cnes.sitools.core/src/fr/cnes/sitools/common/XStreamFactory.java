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
package fr.cnes.sitools.common;

import java.io.Writer;

import org.restlet.data.MediaType;
import org.restlet.data.Status;
import org.restlet.resource.ResourceException;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.HierarchicalStreamWriter;
import com.thoughtworks.xstream.io.json.JettisonMappedXmlDriver;
import com.thoughtworks.xstream.io.json.JsonHierarchicalStreamDriver;
import com.thoughtworks.xstream.io.json.JsonWriter;
import com.thoughtworks.xstream.io.xml.DomDriver;

/**
 * TODO rendre les drivers XML / JSon pour XStream() configurables au lieu de ceux par defaut
 * 
 * TODO representation JSON du recordSet - streaming Json ?
 * 
 * TODO OSGi >> XStreamFactory service.
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public final class XStreamFactory {

  /** singleton */
  private static XStreamFactory instance = null;

  /**
   * Private Constructor for utility class
   */
  private XStreamFactory() {
    super();
  }

  /**
   * Gets singleton instance
   * @return XStreamFactory
   */
  public static synchronized XStreamFactory getInstance() {
    if (instance == null) {
      instance = new XStreamFactory();
    }
    return instance;
  }

  /**
   * Default XStream factory with media type
   * 
   * @param media
   *          RESTlet MediaType
   * @return XStream
   */
  public XStream getXStream(MediaType media) {
    return getXStream(media, false);
  }

  /**
   * XStream factory with root node configuration used for JSON media type
   * 
   * @param media
   *          RESTlet MediaType
   * @param dropRootMode
   *          if true response has no root node
   * @return XStream instance
   */
  public XStream getXStream(MediaType media, boolean dropRootMode) {
    return getXStreamWriter(media, dropRootMode);
  }

  /**
   * Customize XStream serializer DROP ROOT NODE IN JSON Representation UTF8 encoding in XML serialization
   * 
   * @param media
   *          RESTlet MediaType
   * @param dropRootMode
   *          if true response has no root node
   * @return customized XStream instance
   * @throws ResourceException
   */
  public XStream getXStreamWriter(MediaType media, boolean dropRootMode) {
    if (media.isCompatible(MediaType.APPLICATION_JSON)) {
      XStream jsonXstream = null;
      if (dropRootMode) {
        jsonXstream = new XStream(new JsonHierarchicalStreamDriver() {
          @Override
          public HierarchicalStreamWriter createWriter(Writer writer) {
            return new JsonWriter(writer, JsonWriter.DROP_ROOT_MODE);
          }
        });
      }
      else {
        jsonXstream = new XStream(new JsonHierarchicalStreamDriver() {
          @Override
          public HierarchicalStreamWriter createWriter(Writer writer) {
            return new JsonWriter(writer, XStream.NO_REFERENCES);
          }
        });
      }
      jsonXstream.autodetectAnnotations(true);
      // OSGi
      jsonXstream.setClassLoader(getClass().getClassLoader());
      return jsonXstream;
    }
    else if (media.isCompatible(MediaType.APPLICATION_XML) || media.isCompatible(MediaType.TEXT_XML)
        || media.isCompatible(MediaType.APPLICATION_ALL_XML)) {
      // default mode for xml
      // TODO Utiliser le bon driver avec le bon encodage UTF-8

      // XStream xstream = new XStream(new XppDriver(new XmlFriendlyReplacer()));
      XStream xstream = new XStream(new DomDriver("UTF-8"));
      // OSGi
      xstream.setClassLoader(getClass().getClassLoader());
      return xstream;
    }
    else {
      throw new ResourceException(Status.CLIENT_ERROR_UNSUPPORTED_MEDIA_TYPE);
    }
  }

  /**
   * Customize XStream parser
   * 
   * @param media
   *          RESTlet MediaType
   * @return customized XStream instance
   * @throws ResourceException
   */
  public XStream getXStreamReader(MediaType media) {
    if (media.isCompatible(MediaType.APPLICATION_JSON)) {
      XStream jsonXstream = null;
      JettisonMappedXmlDriver driver = new JettisonMappedXmlDriver();
      jsonXstream = new XStream(driver);
      jsonXstream.autodetectAnnotations(false);
      // OSGi
      jsonXstream.setClassLoader(getClass().getClassLoader());
      return jsonXstream;
    }
    else if (media.isCompatible(MediaType.APPLICATION_XML)) {
      // if found in the classpath XppDriver is used by default for xml
      XStream xstream = new XStream();
      xstream.autodetectAnnotations(true);
      // OSGi
      xstream.setClassLoader(getClass().getClassLoader());
      return xstream;
    }
    else {
      throw new ResourceException(Status.CLIENT_ERROR_UNSUPPORTED_MEDIA_TYPE);
    }
  }

}
