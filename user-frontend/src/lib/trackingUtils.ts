/**
 * Utility functions for generating and managing tracking codes
 */

/**
 * Generates a unique tracking code for dry cleaning orders
 * Format: DC-YYYYMMDD-XXXX (e.g., DC-20241201-A7B3)
 * @returns A unique tracking code string
 */
export function generateTrackingCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  
  // Generate a random 4-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomCode = '';
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `DC-${year}${month}${day}-${randomCode}`;
}

/**
 * Validates if a tracking code follows the correct format
 * @param trackingCode - The tracking code to validate
 * @returns Boolean indicating if the tracking code is valid
 */
export function isValidTrackingCode(trackingCode: string): boolean {
  const trackingRegex = /^DC-\d{8}-[A-Z0-9]{4}$/;
  return trackingRegex.test(trackingCode);
}

/**
 * Extracts the date from a tracking code
 * @param trackingCode - The tracking code to extract date from
 * @returns Date object or null if invalid
 */
export function getDateFromTrackingCode(trackingCode: string): Date | null {
  if (!isValidTrackingCode(trackingCode)) {
    return null;
  }
  
  const datePart = trackingCode.split('-')[1];
  const year = parseInt(datePart.substring(0, 4));
  const month = parseInt(datePart.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(datePart.substring(6, 8));
  
  return new Date(year, month, day);
}

/**
 * Formats a tracking code for display with proper spacing
 * @param trackingCode - The tracking code to format
 * @returns Formatted tracking code string
 */
export function formatTrackingCodeDisplay(trackingCode: string): string {
  if (!isValidTrackingCode(trackingCode)) {
    return trackingCode;
  }
  
  const parts = trackingCode.split('-');
  return `${parts[0]} - ${parts[1]} - ${parts[2]}`;
}