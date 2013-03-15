/*******************************************************************************
 * Copyright 2012 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
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
package fr.cnes.sitools.security.filter;

import org.restlet.Context;
import org.restlet.Request;
import org.restlet.Response;
import org.restlet.data.Status;

/**
 * Filter to abort request of black listed client IP
 * 
 * sitools.properties contains a Security.IPBlackList String of IP addresses separated with |
 * 
 * @author jp.boignard (AKKA Technologies)
 */
public class IPBlackListFilter extends SecurityFilter {

  /** Container of banished IP addresses */
  private StringContainer ipContainer = null;

  /**
   * Constructor
   * 
   * @param context
   *          Context
   */
  public IPBlackListFilter(Context context) {
    super(context);

    ipContainer = (StringContainer) (context.getAttributes().get("Security.filter.blacklist.Container"));
    if (ipContainer == null) {
      ipContainer = (StringContainer) getSettings().getStores().get("Security.filter.blacklist.Container");

      if (ipContainer == null) {
        ipContainer = new IPBlackListTreeSet(context);
        getSettings().getStores().put("Security.filter.blacklist.Container", ipContainer);
      }
    }
  }

  @Override
  protected int beforeHandle(Request request, Response response) {
    int status = STOP;

    String clientip = request.getClientInfo().getAddress();
    status = ((ipContainer != null) && ipContainer.contains(clientip)) ? STOP : super.beforeHandle(request, response);
    if (status == STOP) {
      response.setStatus(Status.CLIENT_ERROR_FORBIDDEN, "Your IP address was blacklisted");
      getContext().getLogger().info("Security.filter.blacklist : " + clientip);
    }
    return status;
  }

  /**
   * Getter of ipContainer
   * 
   * @return StringContainer
   */
  public StringContainer getIpContainer() {
    return ipContainer;
  }

  /**
   * Setter of ipContainer
   * 
   * @param ipContainer
   *          StringContainer
   */
  public void setIpContainer(StringContainer ipContainer) {
    this.ipContainer = ipContainer;
  }

}