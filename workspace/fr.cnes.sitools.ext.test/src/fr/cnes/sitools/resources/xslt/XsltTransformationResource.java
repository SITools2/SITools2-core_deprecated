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
package fr.cnes.sitools.resources.xslt;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;

import org.restlet.data.Disposition;
import org.restlet.data.MediaType;
import org.restlet.ext.wadl.MethodInfo;
import org.restlet.ext.xml.TransformRepresentation;
import org.restlet.representation.InputRepresentation;
import org.restlet.representation.Representation;

/**
 * Resource plugin for XSLT transformation
 * 
 * @author m.marseille (AKKA technologies)
 */
public class XsltTransformationResource extends RESTResource {
  
  @Override
  public void doInit() {
    super.doInit();
  }

  @Override
  public void sitoolsDescribe() {
    setName("XsltTransformationResource");
    setDescription("Resource handling XSLT transformation");
    setNegotiated(false);
  }

  @Override
  public Representation get() {

    Boolean piped = Boolean.valueOf(this.getModel().getParametersMap().get("piped").getValue());

    try {
      
      Representation inputXmlRepr = null;

      // If the resource is piped, then get the XML for service
      if (piped != null && piped) {
        this.getModel().getParametersMap().get("projectId").setValue((String) this.getRequestAttributes().get("parameter"));
        super.setModel(this.getModel());
        inputXmlRepr = super.get();
      }
      else {
        File xmlFile = new File(this.getModel().getParametersMap().get("xmlpath").getValue());
        URL xmlSystemId = xmlFile.toURI().toURL();
        inputXmlRepr = new InputRepresentation(xmlSystemId.openStream(), MediaType.APPLICATION_XML);
      }
      inputXmlRepr.setMediaType(MediaType.APPLICATION_XML);
      
      // Getting XSLT file
      File xsltFile = new File(this.getModel().getParametersMap().get("xsltpath").getValue());
      URL xsltSystemId = xsltFile.toURI().toURL();
      InputRepresentation inputXsltRepr = new InputRepresentation(xsltSystemId.openStream(),
          MediaType.APPLICATION_W3C_XSLT);
      
      // Building output
      Representation representation = new TransformRepresentation(this.getContext(), inputXmlRepr, inputXsltRepr);
      MediaType media = MediaType.valueOf((String) this.getRequestAttributes().get("outformat"));
      representation.setMediaType(media);
      Disposition disp = new Disposition();
      disp.setFilename("fatures.docx");
      disp.setType("docx");
      representation.setDisposition(disp);
      return representation;

    }
    catch (MalformedURLException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }
    catch (IOException e) {
      // TODO Auto-generated catch block
      e.printStackTrace();
    }

    return null;
  }

  @Override
  public void describeGet(MethodInfo info) {
    this.addInfo(info);
  }

}
