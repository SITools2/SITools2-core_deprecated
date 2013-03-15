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
package fr.cnes.sitools.izpack.panel;

import java.awt.Font;
import java.awt.LayoutManager2;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Iterator;

import javax.swing.JButton;
import javax.swing.JLabel;

import com.izforge.izpack.gui.ButtonFactory;
import com.izforge.izpack.gui.IzPanelLayout;
import com.izforge.izpack.gui.LabelFactory;
import com.izforge.izpack.installer.InstallData;
import com.izforge.izpack.installer.InstallerException;
import com.izforge.izpack.installer.InstallerFrame;
import com.izforge.izpack.installer.IzPanel;
import com.izforge.izpack.installer.ScriptParser;

import fr.cnes.sitools.izpack.model.JDBCConnectionModel;

/**
 * Custom panel to create database
 * 
 * @author m.gond (AKKA Technologies)
 * 
 */
public class DatabasePanel extends IzPanel implements ActionListener {

  /**
   * serialVersionUID
   */
  private static final long serialVersionUID = 1L;
  /** List of MySQL files for user database */
  private ArrayList<String> listMySQLFiles;
  /** List of Postgresql files for user database */
  private ArrayList<String> listPostgreSQLFiles;
  /** buttonUser */
  private JButton buttonUser;

  /**
   * Default constructor
   * 
   * @param parent
   *          the parent Frame
   * @param idata
   *          the data
   */
  public DatabasePanel(InstallerFrame parent, InstallData idata) {
    this(parent, idata, new IzPanelLayout());
    // List of MySQL files for user database
    listMySQLFiles = new ArrayList<String>();
    listMySQLFiles.add("database/MYSQL_CNES/cnes_GROUPS.sql");
    listMySQLFiles.add("database/MYSQL_CNES/cnes_USER_GROUP.sql");
    listMySQLFiles.add("database/MYSQL_CNES/cnes_USER_PROPERTIES.sql");
    listMySQLFiles.add("database/MYSQL_CNES/cnes_USERS.sql");
    // List of Postgresql files for user database
    listPostgreSQLFiles = new ArrayList<String>();
    listPostgreSQLFiles.add("database/PGSQL/pgsql_sitools.sql");
    // // List of MySQL files for tests database
    // listMySQLFilesTests = new ArrayList<String>();
    // listMySQLFilesTests.add("database/MYSQL_FUSE/CREATE_TABLES/cnes-fuse_FUSE_PRG_ID.sql");
    // listMySQLFilesTests.add("database/MYSQL_FUSE/CREATE_TABLES/cnes-fuse_HEADERS.sql");
    // listMySQLFilesTests.add("database/MYSQL_FUSE/CREATE_TABLES/cnes-fuse_IAPDATASETS.sql");
    // listMySQLFilesTests.add("database/MYSQL_FUSE/CREATE_TABLES/cnes-fuse_OBJECT_CLASS.sql");
    // listMySQLFilesTests.add("database/MYSQL_TEST/CREATE_TABLES/cnes-test_TABLE_TESTS.sql");
    // listMySQLFilesTests.add("database/MYSQL_TEST/CREATE_TABLES/cnes-test_TEST_DATE.sql");
    // // List of Postgresql files for tests database
    // listPostgreSQLFilesTests = new ArrayList<String>();
    // listPostgreSQLFilesTests.add("database/PGSQL/CREATE_TABLES/pgsql_fuse.sql");
    // listPostgreSQLFilesTests.add("database/PGSQL/pgsql_test.sql");

  }

  /**
   * The constructor with Layout parameter
   * 
   * @param parent
   *          the parent panel
   * @param idata
   *          the data
   * @param layout
   *          the layout
   */
  public DatabasePanel(InstallerFrame parent, InstallData idata, LayoutManager2 layout) {
    super(parent, idata, layout);

    JLabel label = LabelFactory.create(parent.langpack.getString("panel.databasePanel.label"),
        parent.icons.getImageIcon("host"), LEADING);
    add(label, NEXT_LINE);

    add(IzPanelLayout.createVerticalStrut(15));

    buttonUser = ButtonFactory.createButton(parent.langpack.getString("panel.databasePanel.user.button"),
        parent.icons.getImageIcon("edit"), idata.buttonsHColor);
    buttonUser.setToolTipText(parent.langpack.getString("panel.databasePanel.user.button.tip"));
    buttonUser.setActionCommand("user");
    buttonUser.addActionListener(this);

    // JButton buttonTests =
    // ButtonFactory.createButton(parent.langpack.getString("panel.databasePanel.tests.button"),
    // parent.icons.getImageIcon("edit"), idata.buttonsHColor);
    // buttonTests.setToolTipText(parent.langpack.getString("panel.databasePanel.tests.button.tip"));
    // buttonTests.setActionCommand("tests");
    // buttonTests.addActionListener(this);

    add(buttonUser, NEXT_LINE);
    add(IzPanelLayout.createVerticalStrut(15));

    // add(buttonTests, NEXT_LINE);
    // add(IzPanelLayout.createVerticalStrut(15));

    JLabel labelwarning = LabelFactory.create(parent.langpack.getString("panel.databasePanel.warning"),
        parent.icons.getImageIcon("warn"), LEADING);
    labelwarning.setFont(labelwarning.getFont().deriveFont(labelwarning.getFont().getStyle() ^ Font.BOLD));
    add(labelwarning, NEXT_LINE);

    // At end of layouting we should call the completeLayout method also they do
    // nothing.
    getLayoutHelper().completeLayout();

  }

  /**
   * Install the user databases
   * 
   * @param idata
   *          the data
   * @throws Exception
   *           if something is wrong
   */
  public void installUserDatabase(InstallData idata) throws Exception {

    JDBCConnectionModel jdbcModel = new JDBCConnectionModel(idata);

    ArrayList<String> fileList;
    if (jdbcModel.getDbType().equals("mysql")) {
      fileList = this.listMySQLFiles;
    }
    else {
      fileList = this.listPostgreSQLFiles;
    }

    installDatabase(jdbcModel, fileList);

  }

  // /**
  // * Install the user databases
  // *
  // * @param idata
  // * the data
  // * @throws Exception
  // * if something is wrong
  // */
  // private void installTestsDatabase(InstallData idata) throws Exception {
  //
  // JDBCConnectionModel jdbcModel = new JDBCConnectionModel(idata);
  //
  // ArrayList<String> fileList;
  // if (jdbcModel.getDbType().equals("mysql")) {
  // fileList = this.listMySQLFilesTests;
  // }
  // else {
  // fileList = this.listPostgreSQLFilesTests;
  // }
  //
  // installDatabase(jdbcModel, fileList);
  //
  // }

  /**
   * Install database
   * 
   * @param jdbcModel
   *          the JDBC model
   * @param fileList
   *          the file list
   * @throws Exception
   *           when occurs
   */
  private void installDatabase(JDBCConnectionModel jdbcModel, ArrayList<String> fileList) throws Exception {
    Connection cnx = null;
    Statement stat = null;
    PrintStream out = System.out;
    String installPath = idata.getVariable(ScriptParser.INSTALL_PATH);
    try {
      do {
        out.println("Test jdbc data source connection ...");

        Class.forName(jdbcModel.getDbDriverClassName());
        out.println("Load driver class : OK");

        out.println("Get connection ");

        cnx = DriverManager.getConnection(jdbcModel.getDbUrl(), jdbcModel.getDbUser(), jdbcModel.getDbPassword());

        out.println("Loop through the files");
        String ligne;
        String request;
        for (Iterator<String> iterator = fileList.iterator(); iterator.hasNext();) {

          String fileName = installPath + "/" + iterator.next();

          out.println("File :  " + fileName);

          InputStream ips = new FileInputStream(fileName);
          InputStreamReader ipsr = new InputStreamReader(ips);
          BufferedReader br = new BufferedReader(ipsr);
          request = "";

          StringBuilder stringBuilder = new StringBuilder();
          String ls = System.getProperty("line.separator");
          while ((ligne = br.readLine()) != null) {
            stringBuilder.append(ligne);
            stringBuilder.append(ls);
          }
          request = stringBuilder.toString();
          br.close();

          out.flush();
          stringBuilder = null;

          try {

            // stat = cnx.prepareStatement(request);
            cnx.setAutoCommit(false);
            stat = cnx.createStatement();
            stat.execute(request);
            // stat.execute();
            cnx.commit();
            stat.close();

          }
          catch (Exception e) {
            throw new InstallerException("Warning there was an error while installing the databases :\n "
                + e.getLocalizedMessage(), e);
          }
          out.println("Execute statement on connection : OK");
          this.emitNotification(parent.langpack.getString("database.user.create.successfully"));
          buttonUser.setEnabled(false);

        }
      } while (false);
    }
    catch (Exception e) {
      throw e;
    }
    finally {
      if (stat != null) {
        try {
          stat.close();
        }
        catch (SQLException e) {
          throw e;
        }
      }
      if (cnx != null) {
        try {
          cnx.close();
        }
        catch (SQLException e) {
          throw e;
        }
      }
    }
  }

  /*
   * (non-Javadoc)
   * 
   * @see com.izforge.izpack.installer.IzPanel#panelActivate()
   */
  @Override
  public void panelActivate() {
    // TODO Auto-generated method stub
    super.panelActivate();
    this.parent.lockPrevButton();
  }

  /**
   * Indicates wether the panel has been validated or not.
   * 
   * @return Always true.
   */
  public boolean isValidated() {
    return true;
  }

  @Override
  public void actionPerformed(ActionEvent e) {
    if (e.getActionCommand().equals("user")) {
      try {
        installUserDatabase(this.idata);
      }
      catch (Exception ex) {
        emitError("title.database.error", ex.getMessage());
      }
    }
    else {
      emitNotification("TODO");
      // try {
      // installTestsDatabase(this.idata);
      // }
      // catch (Exception ex) {
      // emitError("title.database.error", ex.getMessage());
      // }

    }
  }

}
