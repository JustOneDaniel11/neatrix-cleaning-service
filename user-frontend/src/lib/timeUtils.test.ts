/**
 * Test file for time utility functions
 * Run this in the browser console to verify functionality
 */

import { convertTo24Hour, convertTo12Hour, isValid24HourTime } from './timeUtils';

// Test cases for convertTo24Hour
console.log('Testing convertTo24Hour function:');
console.log('8:00 AM ->', convertTo24Hour('8:00 AM')); // Should be 08:00
console.log('12:00 PM ->', convertTo24Hour('12:00 PM')); // Should be 12:00
console.log('2:00 PM ->', convertTo24Hour('2:00 PM')); // Should be 14:00
console.log('12:00 AM ->', convertTo24Hour('12:00 AM')); // Should be 00:00
console.log('8:00 AM - 10:00 AM ->', convertTo24Hour('8:00 AM - 10:00 AM')); // Should be 08:00

// Test cases for convertTo12Hour
console.log('\nTesting convertTo12Hour function:');
console.log('08:00 ->', convertTo12Hour('08:00')); // Should be 8:00 AM
console.log('12:00 ->', convertTo12Hour('12:00')); // Should be 12:00 PM
console.log('14:00 ->', convertTo12Hour('14:00')); // Should be 2:00 PM
console.log('00:00 ->', convertTo12Hour('00:00')); // Should be 12:00 AM

// Test cases for isValid24HourTime
console.log('\nTesting isValid24HourTime function:');
console.log('08:00 ->', isValid24HourTime('08:00')); // Should be true
console.log('14:30 ->', isValid24HourTime('14:30')); // Should be true
console.log('25:00 ->', isValid24HourTime('25:00')); // Should be false
console.log('8:00 AM ->', isValid24HourTime('8:00 AM')); // Should be false

export {};