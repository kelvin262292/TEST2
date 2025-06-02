/**
 * Utility functions for formatting data in the UI
 */

/**
 * Format a number as currency
 * 
 * @param value - The number to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 * 
 * @example
 * // Returns "$1,234.56"
 * formatCurrency(1234.56)
 * 
 * @example
 * // Returns "1.234,56 €"
 * formatCurrency(1234.56, 'EUR', 'de-DE')
 */
export const formatCurrency = (
  value: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number with thousands separators
 * 
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted number string
 * 
 * @example
 * // Returns "1,234.56"
 * formatNumber(1234.56)
 */
export const formatNumber = (
  value: number,
  locale = 'en-US'
): string => {
  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Format a number as a percentage
 * 
 * @param value - The number to format (0-1)
 * @param locale - The locale to use for formatting (default: en-US)
 * @param digits - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 * 
 * @example
 * // Returns "75%"
 * formatPercent(0.75)
 */
export const formatPercent = (
  value: number,
  locale = 'en-US',
  digits = 0
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

/**
 * Format a date in the specified format
 * 
 * @param date - The date to format
 * @param format - The format style (default: 'medium')
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted date string
 * 
 * @example
 * // Returns "Jan 5, 2025"
 * formatDate(new Date(2025, 0, 5))
 */
export const formatDate = (
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale = 'en-US'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }[format];
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format a date and time
 * 
 * @param date - The date to format
 * @param format - The format style (default: 'medium')
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted date and time string
 * 
 * @example
 * // Returns "Jan 5, 2025, 3:30 PM"
 * formatDateTime(new Date(2025, 0, 5, 15, 30))
 */
export const formatDateTime = (
  date: Date | string | number,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale = 'en-US'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' },
    long: { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      second: 'numeric' 
    },
  }[format];
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format a date as a relative time (e.g., "2 days ago")
 * 
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Relative time string
 * 
 * @example
 * // Returns "2 days ago" (if current date is Jan 7, 2025)
 * formatRelativeTime(new Date(2025, 0, 5))
 */
export const formatRelativeTime = (
  date: Date | string | number,
  locale = 'en-US'
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  // Define time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  // Format the relative time based on the difference
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (diffInSeconds < minute) {
    return rtf.format(-Math.floor(diffInSeconds), 'second');
  } else if (diffInSeconds < hour) {
    return rtf.format(-Math.floor(diffInSeconds / minute), 'minute');
  } else if (diffInSeconds < day) {
    return rtf.format(-Math.floor(diffInSeconds / hour), 'hour');
  } else if (diffInSeconds < week) {
    return rtf.format(-Math.floor(diffInSeconds / day), 'day');
  } else if (diffInSeconds < month) {
    return rtf.format(-Math.floor(diffInSeconds / week), 'week');
  } else if (diffInSeconds < year) {
    return rtf.format(-Math.floor(diffInSeconds / month), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / year), 'year');
  }
};

/**
 * Format a file size in bytes to a human-readable string
 * 
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 * 
 * @example
 * // Returns "1.5 MB"
 * formatFileSize(1500000)
 */
export const formatFileSize = (
  bytes: number,
  decimals = 2
): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format a phone number to a standard format
 * 
 * @param phone - The phone number to format
 * @param format - The format to use (default: '(xxx) xxx-xxxx')
 * @returns Formatted phone number
 * 
 * @example
 * // Returns "(123) 456-7890"
 * formatPhone('1234567890')
 */
export const formatPhone = (
  phone: string,
  format = '(xxx) xxx-xxxx'
): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Return original if not enough digits
  if (cleaned.length < 10) return phone;
  
  // Replace x with digits
  let result = format;
  let charIndex = 0;
  
  for (let i = 0; i < result.length; i++) {
    if (result[i] === 'x') {
      if (charIndex < cleaned.length) {
        result = result.substring(0, i) + cleaned[charIndex] + result.substring(i + 1);
        charIndex++;
      }
    }
  }
  
  return result;
};

/**
 * Truncate text to a specified length and add ellipsis
 * 
 * @param text - The text to truncate
 * @param length - Maximum length (default: 50)
 * @param ellipsis - String to add at the end (default: '...')
 * @returns Truncated text
 * 
 * @example
 * // Returns "This is a long text that will be..."
 * truncateText('This is a long text that will be truncated', 30)
 */
export const truncateText = (
  text: string,
  length = 50,
  ellipsis = '...'
): string => {
  if (text.length <= length) return text;
  return text.substring(0, length - ellipsis.length) + ellipsis;
};

/**
 * Convert a string to title case
 * 
 * @param text - The text to convert
 * @returns Title case text
 * 
 * @example
 * // Returns "Hello World"
 * toTitleCase('hello world')
 */
export const toTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
