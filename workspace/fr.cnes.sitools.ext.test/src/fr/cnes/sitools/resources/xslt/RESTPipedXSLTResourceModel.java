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

import fr.cnes.sitools.plugins.resources.model.ResourceParameter;
import fr.cnes.sitools.plugins.resources.model.ResourceParameterType;

/**
 * Extended XSLT with REST call before
 * @author m.marseille (AKKA)
 *
 */
public class RESTPipedXSLTResourceModel extends XsltTransformationResourceModel {
  
  /**
   * Constructor
   */
  public RESTPipedXSLTResourceModel() {
    super();
    
    setName("RESTPipedXSLTResourceModel");
    setDescription("Resource model for XSLT transformation after a REST call sending XML");
    setResourceClassName("fr.cnes.sitools.resources.xslt.XsltTransformationResource");

    ResourceParameter xsltFilePath = new ResourceParameter("http_basic_username", "HTTP BASIC username for service",
        ResourceParameterType.PARAMETER_INTERN);
    ResourceParameter xmlFilePath = new ResourceParameter("http_basic_password", "HTTP BASIC password for service",
        ResourceParameterType.PARAMETER_INTERN);
    ResourceParameter piped = new ResourceParameter("piped", "true : XML from WebService / false : file",
        ResourceParameterType.PARAMETER_INTERN);
    ResourceParameter wsurl = new ResourceParameter("icescrumurl", "Web service URL",
        ResourceParameterType.PARAMETER_INTERN);
    ResourceParameter parameter = new ResourceParameter("projectId", "Project ID for the export",
        ResourceParameterType.PARAMETER_USER_INPUT);
    ResourceParameter outformat = new ResourceParameter("outformat", "Output format for XSLT transformation",
        ResourceParameterType.PARAMETER_USER_INPUT);
    
    // default values
    xsltFilePath.setValue("file://"); 
    xmlFilePath.setValue("file://");
    piped.setValue("true");
    wsurl.setValue("http://localhost:8080/icescrum/");
    parameter.setValue("1");
    outformat.setValue("APPLICATION_MSOFFICE_DOCX");

    addParam(xsltFilePath);
    addParam(xmlFilePath);
    addParam(piped);
    addParam(wsurl);
    addParam(parameter);
    addParam(outformat);

    // Do not forget this part if you have a user input parameter in the URL
    this.completeAttachUrlWith("/webservice/{parameter}/{outformat}");
    
  }

}
