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
package fr.cnes.sitools.project.modules;

import java.util.List;
import java.util.logging.Level;

import org.restlet.data.Status;
import org.restlet.ext.wadl.MethodInfo;
import org.restlet.representation.Representation;
import org.restlet.representation.Variant;
import org.restlet.resource.Get;
import org.restlet.resource.Post;
import org.restlet.resource.ResourceException;

import fr.cnes.sitools.common.model.ResourceCollectionFilter;
import fr.cnes.sitools.common.model.Response;
import fr.cnes.sitools.project.modules.model.ProjectModule;

/**
 * Class Resource for managing ProjectModule Collection (GET, POST)
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public class ProjectModuleCollectionResource extends AbstractProjectModuleResource {
  
  @Override
  public void sitoolsDescribe() {
    setName("ProjectModuleCollectionResource");
    setDescription("Resource for managing ProjectModule collection");
    setNegotiated(false);
  }

  /**
   * Update / Validate existing ProjectModule
   * 
   * @param representation
   *          ProjectModule representation
   * @param variant
   *          client preferred media type
   * @return Representation
   */
  @Post
  public Representation newProjectModule(Representation representation, Variant variant) {
    if (representation == null) {
      throw new ResourceException(Status.CLIENT_ERROR_BAD_REQUEST, "PROJECT_MODULE_REPRESENTATION_REQUIRED");
    }
    try {
      // Parse object representation
      ProjectModule projectModuleInput = getObject(representation, variant);

      // Business service
      ProjectModule projectModuleOutput = getStore().create(projectModuleInput);

      // Response
      Response response = new Response(true, projectModuleOutput, ProjectModule.class, "projectModule");
      Representation rep = getRepresentation(response, variant);
      return rep;

    }
    catch (ResourceException e) {
      getLogger().log(Level.INFO, null, e);
      throw e;
    }
    catch (Exception e) {
      getLogger().log(Level.SEVERE, null, e);
      throw new ResourceException(Status.SERVER_ERROR_INTERNAL, e);
    }
  }
  
  @Override
  public final void describePost(MethodInfo info) {
    info.setDocumentation("Method to create a new ProjectModule sending its representation.");
    this.addStandardPostOrPutRequestInfo(info);
    this.addStandardResponseInfo(info);
    this.addStandardInternalServerErrorInfo(info);
  }

  /**
   * get all ProjectModule
   * 
   * @param variant
   *          client preferred media type
   * @return Representation
   */
  @Get
  public Representation retrieveProjectModule(Variant variant) {
    try {

      if (getProjectModuleId() != null) {
        ProjectModule projectModule = getStore().retrieve(getProjectModuleId());
        Response response = new Response(true, projectModule, ProjectModule.class, "projectModule");
        Representation rep = getRepresentation(response, variant);
        return rep;
      }
      else {
        ResourceCollectionFilter filter = new ResourceCollectionFilter(this.getRequest());
        List<ProjectModule> projectModules = getStore().getList(filter);
        int total = projectModules.size();
        projectModules = getStore().getPage(filter, projectModules);
        Response response = new Response(true, projectModules, ProjectModule.class, "projectModules");
        response.setTotal(total);
        Representation rep = getRepresentation(response, variant);
        return rep;
      }
    }
    catch (ResourceException e) {
      getLogger().log(Level.INFO, null, e);
      throw e;
    }
    catch (Exception e) {
      getLogger().log(Level.SEVERE, null, e);
      throw new ResourceException(Status.SERVER_ERROR_INTERNAL, e);
    }
  }
  
  @Override
  public final void describeGet(MethodInfo info) {
    info.setDocumentation("Method to retrieve the list of ProjectModule available on the server.");
    this.addStandardGetRequestInfo(info);
    this.addStandardResponseInfo(info);
    this.addStandardInternalServerErrorInfo(info);
    this.addStandardResourceCollectionFilterInfo(info);
  }

}
