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
package fr.cnes.sitools.util;

import java.text.ParseException;
import java.util.Date;

public class DateUtils {
  /**
   * Default date format for date exchange between the server and the client in all the Sitools2 application
   */
  public static String SITOOLS_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS";

  /**
   * Default date format for date exchange between the server and the client in all the Sitools2 application
   */
  public static String SITOOLS_TIME_FORMAT = "HH:mm:ss.SSS";

  /**
   * Formats a Date according to the default date format.
   * 
   * @param date
   *          The date to format.
   * @return The formatted date.
   */
  public static String format(final Date date) {
    return format(date, SITOOLS_DATE_FORMAT);
  }

  /**
   * Formats a Date according to the default date format.
   * 
   * @param date
   *          The date to format.
   * @return The formatted date.
   */
  public static String formatTime(final Date date) {
    return format(date, SITOOLS_TIME_FORMAT);
  }

  /**
   * Formats a Date according to the first format in the array.
   * 
   * @param date
   *          The date to format.
   * @param format
   *          The date format to use.
   * @return The formatted date.
   */
  public static String format(final Date date, final String format) {
    if (date == null) {
      throw new IllegalArgumentException("Date is null");
    }
    java.text.DateFormat formatter = null;
    formatter = new java.text.SimpleDateFormat(format, java.util.Locale.ROOT);
    
    return formatter.format(date);
  }

  /**
   * Parses a formatted date into a Date object with the default date format.
   * 
   * @param date
   *          The date to parse.
   * 
   * @return The parsed date.
   * @throws ParseException
   *           if there is an error while parsing the date
   */
  public static Date parse(String date) throws ParseException {
    return parse(date, SITOOLS_DATE_FORMAT);
  }

  /**
   * Parses a formatted date into a Date object.
   * 
   * @param date
   *          The date to parse.
   * @param format
   *          The format of the date string
   * @return The parsed date.
   * @throws ParseException
   *           if there is an error while parsing the date
   */
  public static Date parse(String date, String format) throws ParseException {
    Date result = null;

    if (date == null) {
      throw new IllegalArgumentException("Date is null");
    }

    java.text.DateFormat parser = null;

    parser = new java.text.SimpleDateFormat(format, java.util.Locale.ROOT);

    result = parser.parse(date);
    return result;
  }

}
