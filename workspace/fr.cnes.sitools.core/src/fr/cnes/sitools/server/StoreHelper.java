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
package fr.cnes.sitools.server;

import java.io.File;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import fr.cnes.sitools.collections.CollectionsStoreXML;
import fr.cnes.sitools.collections.model.Collection;
import fr.cnes.sitools.common.SitoolsSettings;
import fr.cnes.sitools.common.exception.SitoolsException;
import fr.cnes.sitools.common.store.SitoolsStore;
import fr.cnes.sitools.dataset.DataSetStore;
import fr.cnes.sitools.dataset.DataSetStoreXML;
import fr.cnes.sitools.dataset.converter.ConverterStore;
import fr.cnes.sitools.dataset.converter.ConverterStoreXML;
import fr.cnes.sitools.dataset.filter.FilterStore;
import fr.cnes.sitools.dataset.filter.FilterStoreXML;
import fr.cnes.sitools.dataset.opensearch.OpenSearchStore;
import fr.cnes.sitools.dataset.opensearch.OpenSearchStoreXML;
import fr.cnes.sitools.dataset.view.DatasetViewStoreXML;
import fr.cnes.sitools.dataset.view.model.DatasetView;
import fr.cnes.sitools.datasource.jdbc.JDBCDataSourceStoreXML;
import fr.cnes.sitools.datasource.jdbc.business.SitoolsDataSource;
import fr.cnes.sitools.datasource.jdbc.business.SitoolsDataSourceFactory;
import fr.cnes.sitools.datasource.jdbc.model.JDBCDataSource;
import fr.cnes.sitools.dictionary.ConceptTemplateStoreXML;
import fr.cnes.sitools.dictionary.DictionaryStoreXML;
import fr.cnes.sitools.dictionary.model.ConceptTemplate;
import fr.cnes.sitools.dictionary.model.Dictionary;
import fr.cnes.sitools.engine.SitoolsEngine;
import fr.cnes.sitools.feeds.FeedsStoreXML;
import fr.cnes.sitools.form.components.FormComponentsStoreXML;
import fr.cnes.sitools.form.components.model.FormComponent;
import fr.cnes.sitools.form.dataset.FormStore;
import fr.cnes.sitools.form.dataset.FormStoreXML;
import fr.cnes.sitools.form.project.FormProjectStoreXML;
import fr.cnes.sitools.form.project.model.FormProject;
import fr.cnes.sitools.inscription.InscriptionStoreXML;
import fr.cnes.sitools.inscription.model.Inscription;
import fr.cnes.sitools.notification.store.NotificationStore;
import fr.cnes.sitools.notification.store.NotificationStoreXML;
import fr.cnes.sitools.order.OrderStoreXML;
import fr.cnes.sitools.order.model.Order;
import fr.cnes.sitools.plugins.applications.ApplicationPluginStore;
import fr.cnes.sitools.plugins.applications.ApplicationPluginStoreXmlImpl;
import fr.cnes.sitools.plugins.filters.FilterPluginStoreXML;
import fr.cnes.sitools.plugins.filters.model.FilterModel;
import fr.cnes.sitools.plugins.resources.ResourcePluginStoreXML;
import fr.cnes.sitools.plugins.resources.model.ResourceModel;
import fr.cnes.sitools.portal.PortalStore;
import fr.cnes.sitools.portal.PortalStoreXmlImpl;
import fr.cnes.sitools.project.ProjectStoreXML;
import fr.cnes.sitools.project.graph.GraphStoreXML;
import fr.cnes.sitools.project.graph.model.Graph;
import fr.cnes.sitools.project.model.Project;
import fr.cnes.sitools.project.modules.ProjectModuleStoreXML;
import fr.cnes.sitools.project.modules.model.ProjectModule;
import fr.cnes.sitools.registry.AppRegistryStore;
import fr.cnes.sitools.registry.AppRegistryStoreXML;
import fr.cnes.sitools.role.RoleStoreXML;
import fr.cnes.sitools.role.model.Role;
import fr.cnes.sitools.security.JDBCUsersAndGroupsStore;
import fr.cnes.sitools.security.authorization.AuthorizationStore;
import fr.cnes.sitools.security.authorization.AuthorizationStoreXML;
import fr.cnes.sitools.service.storage.DataStorageStore;
import fr.cnes.sitools.service.storage.DataStorageStoreXmlImpl;
import fr.cnes.sitools.tasks.TaskStoreXML;
import fr.cnes.sitools.tasks.model.TaskModel;
import fr.cnes.sitools.units.dimension.DimensionStoreXML;
import fr.cnes.sitools.units.dimension.model.SitoolsDimension;
import fr.cnes.sitools.userstorage.UserStorageStore;
import fr.cnes.sitools.userstorage.UserStorageStoreXML;

/**
 * Store helper
 * 
 * @author jp.boignard (AKKA Technologies)
 */
public final class StoreHelper {

  /**
   * Private constructor for this utility class
   */
  private StoreHelper() {
    super();
  }

  /**
   * Initializes the context with default stores
   * 
   * @param settings
   *          the global sitools settings
   * @return the map of initial context
   * @throws SitoolsException
   *           if an error occured while creating the stores
   */
  public static Map<String, Object> initContext(SitoolsSettings settings) throws SitoolsException {

    // init the SitoolsEngine in order to register all plugins
    // Expecialy the units
    SitoolsEngine.getInstance();

    Map<String, Object> stores = new ConcurrentHashMap<String, Object>();
    // SitoolsSettings settings = SitoolsSettings.getInstance();

    SitoolsDataSource dsSecurity = SitoolsDataSourceFactory
        .getInstance()
        .setupDataSource(
            settings.getString("Starter.DATABASE_DRIVER"), settings.getString("Starter.DATABASE_URL"), settings.getString("Starter.DATABASE_USER"), settings.getString("Starter.DATABASE_PASSWORD"), settings.getString("Starter.DATABASE_SCHEMA")); //$NON-NLS-2$ //$NON-NLS-3$ //$NON-NLS-4$

    JDBCUsersAndGroupsStore storeUandG = new JDBCUsersAndGroupsStore("SitoolsJDBCStore", dsSecurity);
    stores.put(Consts.APP_STORE_USERSANDGROUPS, storeUandG);

    SitoolsStore<Role> storeRole = new RoleStoreXML(new File(settings.getStoreDIR(Consts.APP_ROLES_STORE_DIR)));
    stores.put(Consts.APP_STORE_ROLE, storeRole);

    AppRegistryStore storeApp = new AppRegistryStoreXML(new File(
        settings.getStoreDIR(Consts.APP_APPLICATIONS_STORE_DIR)));
    stores.put(Consts.APP_STORE_REGISTRY, storeApp);

    AuthorizationStore storeAuthorization = new AuthorizationStoreXML(new File(
        settings.getStoreDIR(Consts.APP_AUTHORIZATIONS_STORE_DIR)));
    stores.put(Consts.APP_STORE_AUTHORIZATION, storeAuthorization);

    NotificationStore storeNotification = new NotificationStoreXML(new File(
        settings.getStoreDIR(Consts.APP_NOTIFICATIONS_STORE_DIR)));
    stores.put(Consts.APP_STORE_NOTIFICATION, storeNotification);

    SitoolsStore<Inscription> storeIns = new InscriptionStoreXML(new File(
        settings.getStoreDIR(Consts.APP_INSCRIPTIONS_STORE_DIR)));
    stores.put(Consts.APP_STORE_INSCRIPTION, storeIns);

    SitoolsStore<JDBCDataSource> storeDS = new JDBCDataSourceStoreXML(new File(
        settings.getStoreDIR(Consts.APP_DATASOURCES_STORE_DIR)));
    stores.put(Consts.APP_STORE_DATASOURCE, storeDS);

    SitoolsStore<Dictionary> storeDictionary = new DictionaryStoreXML(new File(
        settings.getStoreDIR(Consts.APP_DICTIONARIES_STORE_DIR)));
    stores.put(Consts.APP_STORE_DICTIONARY, storeDictionary);

    SitoolsStore<ConceptTemplate> storeConceptTemplate = new ConceptTemplateStoreXML(new File(
        settings.getStoreDIR(Consts.APP_DICTIONARIES_TEMPLATES_STORE_DIR)));
    stores.put(Consts.APP_STORE_TEMPLATE, storeConceptTemplate);

    ApplicationPluginStore storeApplicationPlugin = new ApplicationPluginStoreXmlImpl(new File(
        settings.getStoreDIR(Consts.APP_PLUGINS_APPLICATIONS_STORE_DIR)));
    stores.put(Consts.APP_STORE_PLUGINS_APPLICATIONS, storeApplicationPlugin);

    SitoolsStore<FilterModel> storeFilterPlugin = new FilterPluginStoreXML(new File(
        settings.getStoreDIR(Consts.APP_PLUGINS_FILTERS_STORE_DIR)));
    stores.put(Consts.APP_STORE_PLUGINS_FILTERS, storeFilterPlugin);

    SitoolsStore<ResourceModel> storeResourcePlugins = new ResourcePluginStoreXML(new File(
        settings.getStoreDIR(Consts.APP_PLUGINS_RESOURCES_STORE_DIR)));
    stores.put(Consts.APP_STORE_PLUGINS_RESOURCES, storeResourcePlugins);

    DataSetStore storeDataSet = new DataSetStoreXML(new File(settings.getStoreDIR(Consts.APP_DATASETS_STORE_DIR)));
    stores.put(Consts.APP_STORE_DATASET, storeDataSet);

    ConverterStore storeConv = new ConverterStoreXML(new File(
        settings.getStoreDIR(Consts.APP_DATASETS_CONVERTERS_STORE_DIR)));
    stores.put(Consts.APP_STORE_DATASETS_CONVERTERS, storeConv);

    FilterStore storeFilter = new FilterStoreXML(new File(settings.getStoreDIR(Consts.APP_DATASETS_FILTERS_STORE_DIR)));
    stores.put(Consts.APP_STORE_DATASETS_FILTERS, storeFilter);

    SitoolsStore<DatasetView> storeDsView = new DatasetViewStoreXML(new File(
        settings.getStoreDIR(Consts.APP_DATASETS_VIEWS_STORE_DIR)));
    stores.put(Consts.APP_STORE_DATASETS_VIEWS, storeDsView);

    PortalStore storePortal = new PortalStoreXmlImpl(new File(settings.getStoreDIR(Consts.APP_PORTAL_STORE_DIR)));
    stores.put(Consts.APP_STORE_PORTAL, storePortal);

    SitoolsStore<FormComponent> storefc = new FormComponentsStoreXML(new File(
        settings.getStoreDIR(Consts.APP_FORMCOMPONENTS_STORE_DIR)));
    stores.put(Consts.APP_STORE_FORMCOMPONENT, storefc);

    SitoolsStore<Collection> storeCollections = new CollectionsStoreXML(new File(
        settings.getStoreDIR(Consts.APP_COLLECTIONS_STORE_DIR)));
    stores.put(Consts.APP_STORE_COLLECTIONS, storeCollections);

    SitoolsStore<FormProject> storeFormProject = new FormProjectStoreXML(new File(
        settings.getStoreDIR(Consts.APP_FORMPROJECT_STORE_DIR)));
    stores.put(Consts.APP_STORE_FORMPROJECT, storeFormProject);

    SitoolsStore<Project> storePrj = new ProjectStoreXML(new File(settings.getStoreDIR(Consts.APP_PROJECTS_STORE_DIR)));
    stores.put(Consts.APP_STORE_PROJECT, storePrj);

    SitoolsStore<Graph> storeGraph = new GraphStoreXML(new File(settings.getStoreDIR(Consts.APP_GRAPHS_STORE_DIR)));
    stores.put(Consts.APP_STORE_GRAPH, storeGraph);

    FormStore storeForm = new FormStoreXML(new File(settings.getStoreDIR(Consts.APP_FORMS_STORE_DIR)));
    stores.put(Consts.APP_STORE_FORM, storeForm);

    FeedsStoreXML storeFeeds = new FeedsStoreXML(new File(settings.getStoreDIR(Consts.APP_FEEDS_STORE_DIR)));
    stores.put(Consts.APP_STORE_FEED, storeFeeds);

    OpenSearchStore storeOS = new OpenSearchStoreXML(new File(settings.getStoreDIR(Consts.APP_OPENSEARCH_STORE_DIR)));
    stores.put(Consts.APP_STORE_OPENSEARCH, storeOS);

    SitoolsStore<Order> storeOrd = new OrderStoreXML(new File(settings.getStoreDIR(Consts.APP_ORDERS_STORE_DIR)));
    stores.put(Consts.APP_STORE_ORDER, storeOrd);

    UserStorageStore storeUserStorage = new UserStorageStoreXML(new File(
        settings.getStoreDIR(Consts.APP_USERSTORAGE_STORE_DIR)));
    stores.put(Consts.APP_STORE_USERSTORAGE, storeUserStorage);

    DataStorageStore storeDataStorage = new DataStorageStoreXmlImpl(new File(
        settings.getStoreDIR(Consts.APP_DATASTORAGE_STORE_DIR)));
    stores.put(Consts.APP_STORE_DATASTORAGE, storeDataStorage);

    SitoolsStore<SitoolsDimension> storeDimensions = new DimensionStoreXML(new File(
        settings.getStoreDIR(Consts.APP_DIMENSION_STORE_DIR)));
    stores.put(Consts.APP_STORE_DIMENSION, storeDimensions);

    SitoolsStore<TaskModel> storeTaskModel = new TaskStoreXML(new File(settings.getStoreDIR(Consts.APP_TASK_STORE_DIR)));
    stores.put(Consts.APP_STORE_TASK, storeTaskModel);

    SitoolsStore<ProjectModule> storeProjectModule = new ProjectModuleStoreXML(new File(
        settings.getStoreDIR(Consts.APP_PROJECTS_MODULES_STORE_DIR)));
    stores.put(Consts.APP_STORE_PROJECTS_MODULES, storeProjectModule);

    return stores;
  }

}
