export const SIWES_TOTAL_WEEKS = 16;
export const SIWES_DAYS_PER_WEEK = 6;
export const SIWES_TOTAL_DAYS = SIWES_TOTAL_WEEKS * SIWES_DAYS_PER_WEEK; // 96

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export interface SiwesDaySlot {
  slotIndex: number; // 1..96
  weekNumber: number; // 1..16
  dayNumber: number; // 1..6 within the rolling week
  activityDate: string; // YYYY-MM-DD
  weekdayName: Exclude<(typeof WEEKDAY_NAMES)[number], "Sunday">;
}

export interface SiwesWeekPlan {
  weekNumber: number; // 1..16
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  days: SiwesDaySlot[];
}

export type StartDateValidation =
  | { ok: true; isoDate: string }
  | { ok: false; error: string };

/** Parse a strict YYYY-MM-DD calendar string into a UTC midnight Date, or null if invalid. */
export function parseIsoDateStrict(isoDate: string): Date | null {
  const match = ISO_DATE_RE.exec(isoDate.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));

  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return utc;
}

/** Format a UTC Date into YYYY-MM-DD without local timezone shift. */
export function formatUtcDateToIso(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Format a YYYY-MM-DD string into a crisp human label (e.g. "30 Nov 2026"). */
export function formatDisplayDate(isoDate: string): string {
  const parsed = parseIsoDateStrict(isoDate);
  if (!parsed) return isoDate;
  const day = parsed.getUTCDate();
  const month = SHORT_MONTHS[parsed.getUTCMonth()];
  const year = parsed.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

/** Return true when the given valid YYYY-MM-DD date falls on a Sunday. */
export function isSundayIsoDate(isoDate: string): boolean {
  const parsed = parseIsoDateStrict(isoDate);
  if (!parsed) return false;
  return parsed.getUTCDay() === 0;
}

/** Validate a SIWES Start Date: must be a valid calendar YYYY-MM-DD and Mon-Sat (not Sunday). */
export function validateStartDate(isoDate: string): StartDateValidation {
  if (typeof isoDate !== "string" || !isoDate.trim()) {
    return { ok: false, error: "Please select your SIWES start date." };
  }
  const normalized = isoDate.trim();
  const parsed = parseIsoDateStrict(normalized);
  if (!parsed) {
    return { ok: false, error: "Enter a valid calendar date (YYYY-MM-DD)." };
  }
  if (parsed.getUTCDay() === 0) {
    return {
      ok: false,
      error:
        "SIWES working days run Monday–Saturday. Please choose a Monday–Saturday start date.",
    };
  }
  return { ok: true, isoDate: normalized };
}

/**
 * Generate 16 rolling 6-working-day weeks (96 Mon-Sat slots) starting directly on startIsoDate.
 * Skips all Sundays and inserts zero pre-commencement dead days.
 */
export function generateSiwesSchedule(startIsoDate: string): SiwesWeekPlan[] {
  const validation = validateStartDate(startIsoDate);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const cursor = parseIsoDateStrict(validation.isoDate)!;
  const allSlots: SiwesDaySlot[] = [];

  while (allSlots.length < SIWES_TOTAL_DAYS) {
    const dow = cursor.getUTCDay();
    if (dow !== 0) {
      const slotIndex = allSlots.length + 1;
      const weekNumber = Math.floor(allSlots.length / SIWES_DAYS_PER_WEEK) + 1;
      const dayNumber = (allSlots.length % SIWES_DAYS_PER_WEEK) + 1;
      const weekdayName = WEEKDAY_NAMES[dow] as SiwesDaySlot["weekdayName"];

      allSlots.push({
        slotIndex,
        weekNumber,
        dayNumber,
        activityDate: formatUtcDateToIso(cursor),
        weekdayName,
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const weeks: SiwesWeekPlan[] = [];
  for (let w = 0; w < SIWES_TOTAL_WEEKS; w++) {
    const slice = allSlots.slice(
      w * SIWES_DAYS_PER_WEEK,
      (w + 1) * SIWES_DAYS_PER_WEEK
    );
    weeks.push({
      weekNumber: w + 1,
      startDate: slice[0].activityDate,
      endDate: slice[slice.length - 1].activityDate,
      days: slice,
    });
  }

  return weeks;
}
