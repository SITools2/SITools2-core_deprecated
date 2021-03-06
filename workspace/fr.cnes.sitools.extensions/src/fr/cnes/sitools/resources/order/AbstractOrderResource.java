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
package fr.cnes.sitools.resources.order;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.restlet.Context;
import org.restlet.Request;
import org.restlet.data.Form;
import org.restlet.data.MediaType;
import org.restlet.data.Method;
import org.restlet.data.Parameter;
import org.restlet.data.Preference;
import org.restlet.data.Reference;
import org.restlet.data.Status;
import org.restlet.engine.util.DateUtils;
import org.restlet.representation.ObjectRepresentation;
import org.restlet.representation.Representation;
import org.restlet.representation.Variant;
import org.restlet.resource.ResourceException;
import org.restlet.security.User;

import fr.cnes.sitools.common.SitoolsSettings;
import fr.cnes.sitools.common.application.ContextAttributes;
import fr.cnes.sitools.common.exception.SitoolsException;
import fr.cnes.sitools.common.model.Response;
import fr.cnes.sitools.dataset.DataSetApplication;
import fr.cnes.sitools.dataset.database.DatabaseRequest;
import fr.cnes.sitools.dataset.database.DatabaseRequestFactory;
import fr.cnes.sitools.dataset.database.DatabaseRequestParameters;
import fr.cnes.sitools.dataset.jdbc.DataSetExplorerUtil;
import fr.cnes.sitools.dataset.model.DataSet;
import fr.cnes.sitools.mail.model.Mail;
import fr.cnes.sitools.order.model.Order;
import fr.cnes.sitools.plugins.resources.model.ResourceParameter;
import fr.cnes.sitools.resources.order.utils.ListReferencesAPI;
import fr.cnes.sitools.resources.order.utils.OrderAPI;
import fr.cnes.sitools.resources.order.utils.OrderResourceUtils;
import fr.cnes.sitools.server.Consts;
import fr.cnes.sitools.tasks.TaskUtils;
import fr.cnes.sitools.tasks.business.Task;
import fr.cnes.sitools.util.RIAPUtils;
import fr.cnes.sitools.util.TemplateUtils;
import fr.cnes.sitools.util.Util;

/**
 * Abstract Resource to handle Orders
 * <p>
 * Developer must implement
 * <p>
 * public abstract ListReferencesAPI listFilesToOrder(DatabaseRequest dbRequest) throws SitoolsException;
 * </p>
 * and
 * <p>
 * public abstract Representation processOrder(ListReferencesAPI listReferences) throws SitoolsException;
 * </p>
 * 
 * 
 * @author m.gond
 */
public abstract class AbstractOrderResource extends OrderResourceFacade {

  /** The {@link DatabaseRequestParameters} of the current resource */
  protected DatabaseRequestParameters dbParams;
  /** The {@link Order} model object */
  protected Order order;
  /** The {@link Task} object */
  protected Task task;
  /** The {@link DataSet} model object */
  protected DataSet ds;
  /** The {@link SitoolsSettings} */
  protected SitoolsSettings settings;
  /** The name of the folder where the current order files will be stored */
  protected String folderName;
  /** The formated date of the task */
  protected String formatedDate;
  /** The fileName to use in all created file during the order process */
  protected String fileName;

  /** The Sitools style user details */
  private fr.cnes.sitools.security.model.User userDetails;

  @Override
  public void doInit() {
    super.doInit();
  }

  /**
   * Principal method of the OrderResource Basically calls the 3 main methods and return the result
   * 
   * @return the Representation generated by the executeOrder method
   */
  private Representation handleOrder() {
    try {
      /** create a new Order and initialize the context */
      initialiseOrder();
      /** execute the order */
      Representation result = executeOrder();
      /** terminate the order and notify administrator */
      terminateOrder();
      return result;
    }
    catch (Exception e) {
      throw new ResourceException(Status.SERVER_ERROR_INTERNAL, e.getMessage(), e);
    }
  }

  @Override
  public final Representation orderPost(Representation represent, Variant variant) {
    return handleOrder();
  }

  @Override
  public final Representation orderGet(Variant variant) {
    return handleOrder();
  }

  /**
   * First step of the order, Initialize it
   * 
   * @throws Exception
   *           if there is any error
   */
  public void initialiseOrder() throws Exception {
    task = (Task) getContext().getAttributes().get(TaskUtils.TASK);
    ds = ((DataSetApplication) getApplication()).getDataSet();
    settings = (SitoolsSettings) getContext().getAttributes().get(ContextAttributes.SETTINGS);
    checkUser();

    fileName = getRequest().getResourceRef().getQueryAsForm().getFirstValue("fileName");
    if (fileName == null || "".equals(fileName)) {
      // if it is not in the request parameters, let's get from the model
      fileName = getParameterValue("fileName");
    }

    dbParams = prepareRequest();
    doInitialiseOrder();

  }

  /**
   * Execute the order
   * 
   * @return a {@link Representation} result of the order or null if the result is stored on the server
   * @throws SitoolsException
   *           if there is any error
   */
  public Representation executeOrder() throws SitoolsException {
    OrderAPI.activateOrder(order, getContext());
    DatabaseRequest dbRequest = null;
    ListReferencesAPI listFile = null;
    try {
      dbRequest = executeRequest(dbParams);
      listFile = listFilesToOrder(dbRequest);
      // copy the listFile to admin storage
      String orderFileListName = fileName;
      if (orderFileListName == null || "".equals(orderFileListName)) {
        orderFileListName = OrderResourceUtils.FILE_LIST_PATTERN.replace("{datasetName}", ds.getName());
        orderFileListName = orderFileListName.replace("{timestamp}", formatedDate);
      }

      try {
        Reference urlAdminIndex = listFile.copyToAdminStorage(getContext(), folderName, orderFileListName, getRequest()
            .getClientInfo());

        ArrayList<String> orderedAdminResource = new ArrayList<String>();
        orderedAdminResource.add(settings.getPublicHostDomain() + settings.getString(Consts.APP_URL) + urlAdminIndex);
        order.setAdminResourceCollection(orderedAdminResource);
        order = OrderAPI.updateOrder(order, getContext());

        Representation result = processOrder(listFile);
        return result;
      }
      catch (IOException e) {
        throw new SitoolsException("Error while creating the file index in the admin storage", e);
      }
    }

    finally {
      if (dbRequest != null) {
        dbRequest.close();
      }
    }

  }

  /**
   * Last step of the order, terminate it and notify the administrator
   * 
   * @throws SitoolsException
   *           if there is any error
   */
  public void terminateOrder() throws SitoolsException {
    doTerminateOrder();
    notifyAdminEnd();
  }

  /**
   * Actual method to initialize the order. This method can be overridden to change the order initialisation
   * 
   * @throws SitoolsException
   *           if there is an error while creating the order
   */
  public void doInitialiseOrder() throws SitoolsException {
    task.setCustomStatus("CREATING ORDER MODEL OBJECT");
    Date startDate = task.getStartDate();
    formatedDate = DateUtils.format(startDate, TaskUtils.getTimestampPattern());
    String orderDescription = "ORDER_" + ds.getName() + "_" + formatedDate;
    order = OrderAPI.createOrder(task.getUserId(), getContext(), orderDescription);

    // folderName = OrderResourceUtils.DIRECTORY_PATTERN.replace("{datasetName}", ds.getName());
    // folderName = folderName.replace("{timestamp}", formatedDate);
    folderName = "/" + getFileName();

  }

  /**
   * Prepare the database request. This method can be overridden in order to change the database request
   * 
   * @return a {@link DatabaseRequestParameters} representing the database request parameters
   * @throws Exception
   *           if there is an error while preparing the request
   */
  public DatabaseRequestParameters prepareRequest() throws Exception {
    task.setCustomStatus("CREATING REQUEST");
    // create the DataSet request
    DataSetApplication datasetApp = (DataSetApplication) getContext().getAttributes().get(TaskUtils.PARENT_APPLICATION);
    DataSetExplorerUtil dsExplorerUtil = new DataSetExplorerUtil(datasetApp, getRequest(), getContext());
    // Get request parameters
    if (datasetApp.getConverterChained() != null) {
      datasetApp.getConverterChained().getContext().getAttributes().put("REQUEST", getRequest());
    }
    DatabaseRequestParameters params = dsExplorerUtil.getDatabaseParams();

    // parameter too_many_selected_threshold is used as a limit max for the number of records
    ResourceParameter maxRowsParam = this.getModel().getParameterByName("too_many_selected_threshold");
    String maxRowsStr = maxRowsParam.getValue();
    int maxRows;
    try {
      maxRows = Integer.valueOf(maxRowsStr);
    }
    catch (NumberFormatException e) {
      throw new SitoolsException("too_many_selected_threshold parameter must be a number", e);
    }
    catch (Exception e) {
      throw new SitoolsException("too_many_selected_threshold parameter canno't be empty", e);
    }

    String requestQuery = getRequest().getResourceRef().getQuery();
    Form bodyForm = (Form) getContext().getAttributes().get(TaskUtils.BODY_CONTENT);
    int count = getCountOnDataset(ds, requestQuery, bodyForm);
    if (maxRows == -1 || count <= maxRows) {
      params.setPaginationExtend(count);
      params.setCountDone(false);
      params.setMaxrows(count);
    }
    else {
      ResourceParameter errorTextParam = getModel().getParameterByName("too_many_selected_threshold_text");
      String errorText = (errorTextParam != null && !"".equals(errorTextParam.getValue())) ? errorTextParam.getValue()
          : "Too many file selected";
      throw new ResourceException(Status.CLIENT_ERROR_BAD_REQUEST, errorText);
    }

    return params;
  }

  /**
   * Execute the request
   * 
   * @param params
   *          the a {@link DatabaseRequestParameters} representing the database request parameters
   * @return a {@link DatabaseRequest}
   * @throws SitoolsException
   *           if there is an error while creating the request
   */
  public DatabaseRequest executeRequest(DatabaseRequestParameters params) throws SitoolsException {
    DatabaseRequest databaseRequest = DatabaseRequestFactory.getDatabaseRequest(params);
    if (params.getDistinct()) {
      databaseRequest.createDistinctRequest();
    }
    else {
      databaseRequest.createRequest();
    }
    return databaseRequest;
  }

  /**
   * Abstract method to list all the files to order.
   * 
   * @param dbRequest
   *          the {@link DatabaseRequest} containing the request to the database
   * @return a {@link ListReferencesAPI} containing the list of Reference to order
   * @throws SitoolsException
   *           if there is any error
   */
  public abstract ListReferencesAPI listFilesToOrder(DatabaseRequest dbRequest) throws SitoolsException;

  /**
   * Process the list of files to order
   * 
   * @param listReferences
   *          the {@link ListReferencesAPI} containing the list of Reference to order
   * @return a {@link Representation} or null if the response is stored on the server
   * @throws SitoolsException
   *           if there is any error
   */
  public abstract Representation processOrder(ListReferencesAPI listReferences) throws SitoolsException;

  /**
   * Terminate the order. This method can be overridden in order to change the last step of the order
   * 
   * @throws SitoolsException
   *           is there is any error
   */
  public void doTerminateOrder() throws SitoolsException {
    OrderAPI.updateOrder(order, getContext());
    OrderAPI.terminateOrder(order, getContext());
  }

  /**
   * Notify the administrator. Can be overridden to change default behaviour
   * 
   * @throws SitoolsException
   *           if here is any error
   */
  public void notifyAdminEnd() throws SitoolsException {
    try {
      this.sendMail(order, getContext(), userDetails, task);
    }
    catch (SitoolsException e) {
      // ne rien faire si le mail n'est pas parti
      OrderAPI.createEvent(order, getContext(), "MAIL_NOT_SEND_TO_USER");
    }
  }

  /**
   * Check that the user is allowed to do the order Throw a ResourceException to stop the order execution Can be
   * overridden to change default behaviour
   */
  public void checkUser() {
    // *******************************************************
    // Getting the user, if there is no user we raise an error

    User user = getClientInfo().getUser();
    if (user == null) {
      throw new ResourceException(Status.CLIENT_ERROR_FORBIDDEN, "USER MUST BE LOGGED");
    }

    // getting user details
    try {
      userDetails = this.getUserDetails(user.getIdentifier(), getContext());
      if (userDetails == null) {
        throw new ResourceException(Status.CLIENT_ERROR_FORBIDDEN, "USER MUST BE LOGGED can't find User details ");
      }
    }
    catch (SitoolsException e) {
      throw new ResourceException(Status.CLIENT_ERROR_FORBIDDEN, "USER MUST BE LOGGED can't find User details ");
    }
  }

  /**
   * Gets the user details from its id
   * 
   * @param id
   *          the id of the user
   * @param context
   *          the context
   * @return a User object with full details
   * @throws SitoolsException
   *           when an error append
   */
  protected fr.cnes.sitools.security.model.User getUserDetails(String id, Context context) throws SitoolsException {
    DataSetApplication datasetApp = (DataSetApplication) context.getAttributes().get(TaskUtils.PARENT_APPLICATION);
    return RIAPUtils.getObject(id, datasetApp.getSettings().getString(Consts.APP_SECURITY_URL) + "/users", context);
  }

  /**
   * Send a mail to inform the user that the order is finished
   * 
   * @param order
   *          the order
   * @param context
   *          the context
   * @param user
   *          the user
   * @param task
   *          the Task
   * @throws SitoolsException
   *           if something goes wrong
   */
  protected void sendMail(Order order, Context context, fr.cnes.sitools.security.model.User user, Task task)
    throws SitoolsException {

    List<String> toList = new ArrayList<String>();
    String userAdd = user.getEmail();
    if (userAdd != null && !userAdd.equals("")) {
      // System.out.println("EMAIL ADDRESS = " + userAdd);
      toList.add(userAdd);
      Mail mailToUser = new Mail();
      mailToUser.setToList(toList);

      // TODO EVOL : email subject should be a parameter
      mailToUser.setSubject("Sitools order system : order completed");

      // default body
      mailToUser.setBody("Your command is complete \n" + "Name : " + order.getName() + "\n" + "Description : "
          + order.getDescription() + "\n" + "Check the status at :" + task.getStatusUrl() + "\n"
          + "Get the result at :" + task.getUrlResult());

      // use a freemarker template for email body with Mail object
      String templatePath = settings.getRootDirectory() + settings.getString(Consts.TEMPLATE_DIR)
          + "mail.order.complete.ftl";
      Map<String, Object> root = new HashMap<String, Object>();
      root.put("mail", mailToUser);
      root.put("order", order);

      TemplateUtils.describeObjectClassesForTemplate(templatePath, root);

      root.put("context", getContext());

      String body = TemplateUtils.toString(templatePath, root);
      if (Util.isNotEmpty(body)) {
        mailToUser.setBody(body);
      }

      org.restlet.Response sendMailResponse = null;
      try {
        // riap request to MailAdministration application
        Request request = new Request(Method.POST, RIAPUtils.getRiapBase()
            + settings.getString(Consts.APP_MAIL_ADMIN_URL), new ObjectRepresentation<Mail>(mailToUser));

        sendMailResponse = getContext().getClientDispatcher().handle(request);
      }
      catch (Exception e) {
        getLogger().warning("SERVER ERROR SENDING EMAIL TO USER");
        throw new ResourceException(Status.SERVER_ERROR_INTERNAL, e);
      }
      if (sendMailResponse.getStatus().isError()) {
        throw new SitoolsException("SERVER ERROR SENDING EMAIL TO USER");
      }

      // OK
    }
    else {
      throw new SitoolsException("NO EMAIL ADDRESS DEFINED");
    }
  }

  /**
   * Get the fileName from the request or the model.
   * 
   * @return the fileName from the request or the model.
   */
  public String getFileName() {
    String fileName;
    Parameter fileNameUserInput = getRequest().getResourceRef().getQueryAsForm().getFirst("fileName");
    if (fileNameUserInput != null && !"".equals(fileNameUserInput.getValue())) {
      fileName = fileNameUserInput.getValue();
    }
    else {
      fileName = getParameterValue("fileName");
      if (fileName == null || "".equals(fileName)) {
        fileName = "defaultFileName";
      }
    }
    return fileName;
  }

  /**
   * Get the number of records in result of a search on the specified dataset with the specified requestQuery or a Form
   * containing the url of a file on the server
   * 
   * @param ds
   *          the DataSet
   * @param requestQuery
   *          the query request
   * @param form
   *          the form containing the url of a file on the server
   * @return the number of records in result of a search, 0 if there is an error
   * @throws Exception
   *           if there are some errors
   */
  @SuppressWarnings("unchecked")
  public int getCountOnDataset(DataSet ds, String requestQuery, Form form) throws Exception {

    Request reqGET = getCountRequest(ds, requestQuery, form);
    ArrayList<Preference<MediaType>> objectMediaType = new ArrayList<Preference<MediaType>>();
    objectMediaType.add(new Preference<MediaType>(MediaType.APPLICATION_JAVA_OBJECT));
    reqGET.getClientInfo().setAcceptedMediaTypes(objectMediaType);
    org.restlet.Response response = null;

    response = getContext().getClientDispatcher().handle(reqGET);

    if (response == null || Status.isError(response.getStatus().getCode())) {
      RIAPUtils.exhaust(response);
      throw new SitoolsException(response.getStatus().getName() + " // " + response.getStatus().getDescription());
    }

    ObjectRepresentation<Response> or = (ObjectRepresentation<Response>) response.getEntity();
    try {
      Response resp = or.getObject();
      // check if there is an object in the response, if not return null
      if (resp == null) {
        throw new SitoolsException("Expected Response from the count call was null");
      }
      return resp.getTotal();
    }
    catch (Exception e) {
      // if the cause of the error is a SitoolsException, let's get it to send a more understandable error message
      if (e.getCause() != null && e.getCause().getClass().equals(SitoolsException.class)) {
        SitoolsException se = (SitoolsException) e.getCause();
        throw new SitoolsException(e.getMessage() + " // " + se.getMessage());
      }
      else {
        throw e;
      }
    }
  }

  /**
   * Get the {@link Request} Object to query to have the count on a dataset with either a request query or a
   * {@link Form} containing the url of a file on the server
   * 
   * @param ds
   *          the {@link DataSet}
   * @param requestQuery
   *          a full http query
   * @param form
   *          a {@link Form} containing the url of a file on the server
   * 
   * @return a {@link Request} to query to have the count on a dataset
   */
  private Request getCountRequest(DataSet ds, String requestQuery, Form form) {
    String url = ds.getSitoolsAttachementForUsers() + "/count";
    Reference ref = new Reference(url);
    Request request;
    if (form != null) {
      request = new Request(Method.POST, RIAPUtils.getRiapBase() + ref, form.getWebRepresentation());
    }
    else {
      ref.setQuery(requestQuery);
      request = new Request(Method.GET, RIAPUtils.getRiapBase() + ref);
    }
    return request;

  }

}
