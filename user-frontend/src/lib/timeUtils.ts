/**
 * Utility functions for time format conversion
 */

/**
 * Converts 12-hour time format to 24-hour format
 * @param time12h - Time in 12-hour format (e.g., "8:00 AM", "2:00 PM")
 * @returns Time in 24-hour format (e.g., "08:00", "14:00")
 */
export function convertTo24Hour(time12h: string): string {
  // Handle time ranges by taking the start time
  if (time12h.includes(' - ')) {
    time12h = time12h.split(' - ')[0];
  }

  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier === 'PM') {
    hours = (parseInt(hours, 10) + 12).toString();
  }
  
  // Ensure two-digit format
  hours = hours.padStart(2, '0');
  minutes = minutes.padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Converts 24-hour time format to 12-hour format for display
 * @param time24h - Time in 24-hour format (e.g., "08:00", "14:00")
 * @returns Time in 12-hour format (e.g., "8:00 AM", "2:00 PM")
 */
export function convertTo12Hour(time24h: string): string {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const modifier = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  return `${displayHour}:${minutes} ${modifier}`;
}

/**
 * Validates if a time string is in valid 24-hour format
 * @param time - Time string to validate
 * @returns Boolean indicating if the time is valid
 */
export function isValid24HourTime(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Gets the current time in 24-hour format
 * @returns Current time as HH:MM string
 */
export function getCurrentTime24h(): string {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}