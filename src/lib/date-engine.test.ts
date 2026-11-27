import { describe, expect, it } from "vitest";
import {
  SIWES_DAYS_PER_WEEK,
  SIWES_TOTAL_DAYS,
  SIWES_TOTAL_WEEKS,
  formatDisplayDate,
  generateSiwesSchedule,
  isSundayIsoDate,
  parseIsoDateStrict,
  validateStartDate,
} from "./date-engine";

function assertScheduleInvariants(startIsoDate: string) {
  const weeks = generateSiwesSchedule(startIsoDate);
  expect(weeks).toHaveLength(SIWES_TOTAL_WEEKS);

  const allDays = weeks.flatMap((w) => w.days);
  expect(allDays).toHaveLength(SIWES_TOTAL_DAYS);

  // First slot must match startIsoDate exactly (no pre-commencement dead days)
  expect(allDays[0].activityDate).toBe(startIsoDate);
  expect(allDays[0].slotIndex).toBe(1);
  expect(allDays[0].weekNumber).toBe(1);
  expect(allDays[0].dayNumber).toBe(1);

  for (let i = 0; i < allDays.length; i++) {
    const slot = allDays[i];
    const parsed = parseIsoDateStrict(slot.activityDate);
    expect(parsed).not.toBeNull();
    // Zero Sundays
    expect(parsed!.getUTCDay()).not.toBe(0);
    expect(slot.slotIndex).toBe(i + 1);
    expect(slot.weekNumber).toBe(Math.floor(i / SIWES_DAYS_PER_WEEK) + 1);
    expect(slot.dayNumber).toBe((i % SIWES_DAYS_PER_WEEK) + 1);

    if (i > 0) {
      expect(slot.activityDate > allDays[i - 1].activityDate).toBe(true);
    }
  }

  for (const week of weeks) {
    expect(week.days).toHaveLength(SIWES_DAYS_PER_WEEK);
    expect(week.startDate).toBe(week.days[0].activityDate);
    expect(week.endDate).toBe(week.days[5].activityDate);
  }

  return weeks;
}

describe("SIWES 16-week Mon-Sat date engine", () => {
  it("generates exact Mon-Sat weeks when starting on a Monday", () => {
    const weeks = assertScheduleInvariants("2026-11-30"); // Monday
    expect(weeks[0].days.map((d) => d.activityDate)).toEqual([
      "2026-11-30",
      "2026-12-01",
      "2026-12-02",
      "2026-12-03",
      "2026-12-04",
      "2026-12-05",
    ]);
    // Sunday 2026-12-06 skipped -> Week 2 starts Monday 2026-12-07
    expect(weeks[1].days[0].activityDate).toBe("2026-12-07");
    expect(weeks[15].endDate).toBe("2027-03-20");
  });

  it("handles mid-week Wednesday start with rolling 6-working-day blocks and skips Sundays", () => {
    const weeks = assertScheduleInvariants("2026-12-02"); // Wednesday
    expect(weeks[0].days.map((d) => d.activityDate)).toEqual([
      "2026-12-02", // Wed
      "2026-12-03", // Thu
      "2026-12-04", // Fri
      "2026-12-05", // Sat
      // 2026-12-06 Sun skipped
      "2026-12-07", // Mon
      "2026-12-08", // Tue
    ]);
    expect(weeks[1].startDate).toBe("2026-12-09");
  });

  it("handles Saturday start without pre-commencement days", () => {
    const weeks = assertScheduleInvariants("2026-12-05"); // Saturday
    expect(weeks[0].days[0].activityDate).toBe("2026-12-05");
    expect(weeks[0].days[0].weekdayName).toBe("Saturday");
    // Next slot skips Sunday 2026-12-06 -> Monday 2026-12-07
    expect(weeks[0].days[1].activityDate).toBe("2026-12-07");
    expect(weeks[0].days[1].weekdayName).toBe("Monday");
  });

  it("handles year-end and leap-year Feb 29 boundaries accurately", () => {
    const yearEnd = assertScheduleInvariants("2026-12-28"); // Monday across 2026->2027
    expect(yearEnd[0].days[4].activityDate).toBe("2027-01-01");

    const leapYear = assertScheduleInvariants("2024-02-26"); // 2024 is leap year
    expect(leapYear[0].days.map((d) => d.activityDate)).toContain("2024-02-29");
  });

  it("rejects Sunday start dates and invalid calendar dates", () => {
    expect(isSundayIsoDate("2026-11-29")).toBe(true);
    const sun = validateStartDate("2026-11-29");
    expect(sun.ok).toBe(false);
    if (!sun.ok) {
      expect(sun.error).toContain("Monday–Saturday");
    }
    expect(() => generateSiwesSchedule("2026-11-29")).toThrow();

    expect(validateStartDate("2026-02-30").ok).toBe(false);
    expect(validateStartDate("not-a-date").ok).toBe(false);
    expect(validateStartDate("").ok).toBe(false);
  });

  it("formats display dates cleanly without timezone drift", () => {
    expect(formatDisplayDate("2026-11-30")).toBe("30 Nov 2026");
  });
});
