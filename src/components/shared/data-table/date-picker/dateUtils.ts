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

/**
 * Parse 'YYYY-MM-DD' into local Date at start or end of day
 */
export function parseLocalISODate(isoString: string, endOfDay = false): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoString.trim());
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const monthIndex = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  if (endOfDay) {
    return new Date(year, monthIndex, day, 23, 59, 59, 999);
  }
  return new Date(year, monthIndex, day, 0, 0, 0, 0);
}

/**
 * Convert a Date object into local 'YYYY-MM-DD'
 */
export function dateToLocalISO(date: Date): string {
  return toISODateString(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Compute dynamic start/end ISO strings for quick date presets relative to referenceDate (defaults to today)
 */
export function getPresetDateRange(
  presetKey: string,
  referenceDate: Date = new Date()
): { from?: string; to?: string } {
  const base = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  if (presetKey === 'today') {
    const iso = dateToLocalISO(base);
    return { from: iso, to: iso };
  }

  if (presetKey === 'this_week') {
    const dayOfWeek = base.getDay(); // 0 = Sun, 1 = Mon...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const start = new Date(base);
    start.setDate(base.getDate() + diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { from: dateToLocalISO(start), to: dateToLocalISO(end) };
  }

  if (presetKey === 'last_week') {
    const dayOfWeek = base.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const thisMonday = new Date(base);
    thisMonday.setDate(base.getDate() + diffToMonday);
    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() - 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { from: dateToLocalISO(start), to: dateToLocalISO(end) };
  }

  if (presetKey === 'last_7_days' || presetKey === '7days') {
    const start = new Date(base);
    start.setDate(base.getDate() - 6);
    return { from: dateToLocalISO(start), to: dateToLocalISO(base) };
  }

  if (presetKey === 'current_month' || presetKey === 'month') {
    const year = base.getFullYear();
    const month = base.getMonth();
    const days = getDaysInMonth(year, month);
    return {
      from: toISODateString(year, month, 1),
      to: toISODateString(year, month, days),
    };
  }

  return { from: undefined, to: undefined };
}

/**
 * Check if a timestamp/ISO date falls within a DateRangeValue
 */
export function isTimestampInDateRange(
  timestamp: string | undefined,
  range?: { preset?: string; from?: string; to?: string }
): boolean {
  if (!range || !range.preset || range.preset === 'all') return true;
  if (!timestamp) return false;

  const targetTime = new Date(timestamp).getTime();
  if (Number.isNaN(targetTime)) return false;

  // Prefer explicit from/to if available; fall back to preset bounds if only preset was passed
  const effectiveBounds =
    range.from || range.to
      ? { from: range.from, to: range.to }
      : getPresetDateRange(range.preset);

  if (effectiveBounds.from) {
    const fromDate = parseLocalISODate(effectiveBounds.from, false);
    if (fromDate && targetTime < fromDate.getTime()) return false;
  }

  if (effectiveBounds.to) {
    const toDate = parseLocalISODate(effectiveBounds.to, true);
    if (toDate && targetTime > toDate.getTime()) return false;
  }

  return true;
}

