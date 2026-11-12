/**
 * Date and calendar utilities for Dual Calendar Date Range Picker.
 * Zero external dependencies, pure TypeScript date arithmetic.
 */

export const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const DAY_NAMES_ID = ['M', 'S', 'S', 'R', 'K', 'J', 'S']; // Minggu, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu

/**
 * Format Date or string to ISO 'YYYY-MM-DD'
 */
export function toISODateString(year: number, monthIndex: number, day: number): string {
  const y = year.toString().padStart(4, '0');
  const m = (monthIndex + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format 'YYYY-MM-DD' to 'DD/MM/YYYY' for display/inputs
 */
export function formatToDisplayDate(isoString?: string): string {
  if (!isoString || !/^\d{4}-\d{2}-\d{2}$/.test(isoString)) return '';
  const [y, m, d] = isoString.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Parse 'DD/MM/YYYY' into 'YYYY-MM-DD' or null if invalid
 */
export function parseDisplayDateToISO(displayString: string): string | null {
  const parts = displayString.trim().split('/');
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);

  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  if (m < 1 || m > 12 || y < 1900 || y > 2100) return null;

  const daysInM = getDaysInMonth(y, m - 1);
  if (d < 1 || d > daysInM) return null;

  return toISODateString(y, m - 1, d);
}

/**
 * Get number of days in a given year and month (0-11)
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Get the day of the week for the 1st of the month (0 = Sunday, 6 = Saturday)
 */
export function getFirstDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex, 1).getDay();
}

/**
 * Compare two 'YYYY-MM-DD' strings.
 * Returns negative if a < b, 0 if a == b, positive if a > b
 */
export function compareDates(a: string, b: string): number {
  return a.localeCompare(b);
}

/**
 * Check if a date string is between start and end (inclusive)
 */
export function isDateInRange(target: string, start?: string, end?: string): boolean {
  if (!start && !end) return false;
  if (start && end) {
    const [min, max] = start <= end ? [start, end] : [end, start];
    return target >= min && target <= max;
  }
  return false;
}

/**
 * Calculate difference in days between two 'YYYY-MM-DD' dates
 */
export function getDaysDifference(start: string, end: string): number {
  const [min, max] = start <= end ? [start, end] : [end, start];
  const t1 = new Date(min).getTime();
  const t2 = new Date(max).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((t2 - t1) / oneDay) + 1;
}

