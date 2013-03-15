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

import fr.cnes.sitools.plugins.resources.model.ResourceModel;
import fr.cnes.sitools.plugins.resources.model.ResourceParameter;
import fr.cnes.sitools.plugins.resources.model.ResourceParameterType;

/**
 * Resource model for XSLT transformation
 * @author m.marseille (AKKA technologies)
 */
public class XsltTransformationResourceModel extends ResourceModel {

  /**
   * Constructor
   */
  public XsltTransformationResourceModel() {
    super();

    setClassAuthor("AKKA Technologies");
    setClassOwner("CNES");
    setClassVersion("0.1");
    setName("XsltTransformationResourceModel");
    setDescription("Resource model for XSLT transformation");
    setResourceClassName("fr.cnes.sitools.resources.xslt.XsltTransformationResource");

    ResourceParameter xsltFilePath = new ResourceParameter("xsltpath", "xslt file path",
        ResourceParameterType.PARAMETER_INTERN);
    ResourceParameter xmlFilePath = new ResourceParameter("xmlpath", "xml file path",
        ResourceParameterType.PARAMETER_INTERN);
    ResourceParameter piped = new ResourceParameter("piped", "true : XML from WebService / false : file",
        ResourceParameterType.PARAMETER_INTERN);

    xsltFilePath.setValue("file://"); // default value
    xmlFilePath.setValue("file://"); // default value
    piped.setValue("false");

    addParam(xsltFilePath);
    addParam(xmlFilePath);
    addParam(piped);
    
    // Do not forget this part if you have a user input parameter in the URL
    this.completeAttachUrlWith("/xslt");
  }

}
