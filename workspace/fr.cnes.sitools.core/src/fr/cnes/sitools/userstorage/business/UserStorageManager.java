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
package fr.cnes.sitools.userstorage.business;

import java.io.File;
import java.io.IOException;

import fr.cnes.sitools.userstorage.model.UserStorage;
import fr.cnes.sitools.userstorage.model.UserStorageStatus;
import fr.cnes.sitools.util.FileUtils;

/**
 * static functions on UserStorage
 * 
 * @author jp.boignard (AKKA Technologies)
 * 
 */
public final class UserStorageManager {
  /**
   * Private constructor for utility class
   */
  private UserStorageManager() {
    super();
  }

  /**
   * Checks  if quota exceeded
   * @param storage UserStorage
   * @return boolean true if quota exceeded.
   */
  public static boolean checkDiskSpace(UserStorage storage) {
    return (storage.getStorage().getQuota() == null)
        || FileUtils.getFileSize(new File(storage.getStorage().getUserStoragePath())) > storage.getStorage().getQuota();
  }

  /**
   * Builds user directory
   * @param storage UserStorage
   */
  public static void build(UserStorage storage) {
    if (storage.getStorage() != null) {
      File userDir = new File(storage.getStorage().getUserStoragePath());
      if (!userDir.exists()) {
        userDir.mkdirs();
        // else warning
      }
    }
    // mk others sub directories.
    storage.setStatus(UserStorageStatus.ACTIVE);
  }

  /**
   * Refresh UserStorage definition according to the physical user directory
   * @param storage
   *          UserStorage to refresh
   */
  public static void refresh(UserStorage storage) {

    if (storage.getStorage() != null) {
      File userDir = new File(storage.getStorage().getUserStoragePath());
      if (userDir.exists() && userDir.isDirectory()) {
        long size = FileUtils.getFileSize(new File(storage.getStorage().getUserStoragePath()));
        storage.getStorage().setBusyUserSpace(size);
        storage.getStorage().setFreeUserSpace(
            (storage.getStorage().getQuota() == null ? 0 : storage.getStorage().getQuota()) - size);
      }
      else {
        storage.getStorage().setBusyUserSpace(new Long(0));
      }
    }
  }

  /**
   * Delete recursively all files except config files.
   * 
   * @param storage
   *          UserStorage to clean
   */
  public static void clean(UserStorage storage) {
    if (storage.getStorage() != null) {
      File userDir = new File(storage.getStorage().getUserStoragePath());
      if (userDir.exists() && userDir.isDirectory()) {
        try {
          FileUtils.cleanDirectory(userDir);
        }
        catch (IOException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        } // "*.*"
      }
      userDir.mkdir();
    }
  }
}
