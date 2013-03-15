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

import org.restlet.data.ChallengeScheme;
import org.restlet.data.MediaType;
import org.restlet.ext.wadl.MethodInfo;
import org.restlet.representation.Representation;
import org.restlet.resource.ClientResource;

import fr.cnes.sitools.common.resource.SitoolsParameterizedResource;

/**
 * Extended resource proceeding with a webservice call before sending to XSLT transformation
 * @author m.marseille (AKKA)
 *
 */
public class RESTResource extends SitoolsParameterizedResource {
  
  
  @Override
  public void sitoolsDescribe() {
    setName("RESTResource");
    setDescription("Resource handling Icescrum call");
    setNegotiated(false);
  }

  @Override
  public Representation get() {
    String username = this.getModel().getParametersMap().get("http_basic_username").getValue();
    String password = this.getModel().getParametersMap().get("http_basic_password").getValue();
    String project = this.getModel().getParametersMap().get("projectId").getValue();
    String url = this.getModel().getParametersMap().get("icescrumurl").getValue();
    
    url += "ws/p/" + project + "/project/export";
    
    ClientResource cr = new ClientResource(url);
    cr.getRequestAttributes().put("Accept", "application/xml");
    cr.setChallengeResponse(ChallengeScheme.HTTP_BASIC, username, password);
    
    Representation repr = cr.get(MediaType.APPLICATION_XML);
    
    return repr;
  }

  @Override
  public void describeGet(MethodInfo info) {
    this.addInfo(info);
  }
  
}
