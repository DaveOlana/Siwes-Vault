import {
  formatUtcDateToIso,
  generateSiwesSchedule,
  parseIsoDateStrict,
  validateStartDate,
} from "./date-engine";
import { prisma } from "./prisma";
import type { PlacementPayload } from "./validators";

export interface SerializedDaySlot {
  id: string;
  slotIndex: number;
  dayNumber: number;
  activityDate: string; // YYYY-MM-DD
  weekdayName: string;
  activitySummary: string | null;
  toolsUsed: string[];
  keyTakeaway: string | null;
  loggedAt: string | null;
}

export interface SerializedWeek {
  id: string;
  weekNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  diagramUrl: string | null;
  diagramSource: string | null;
  entries: SerializedDaySlot[];
}

export interface SerializedPlacement {
  id: string;
  studentName: string;
  matricNo: string;
  department: string;
  companyName: string;
  industrySupervisorName: string;
  startDate: string; // YYYY-MM-DD
  institutionName: string | null;
  levelOrProgramme: string | null;
  companyAddress: string | null;
  companySector: string | null;
  assignedUnit: string | null;
  institutionSupervisorName: string | null;
  loggedEntryCount: number;
  startDateLocked: boolean;
  weeks: SerializedWeek[];
}

export async function getActivePlacementWithSchedule(
  userId: string
): Promise<SerializedPlacement | null> {
  const placement = await prisma.placement.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: "desc" },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          entries: {
            orderBy: { dayNumber: "asc" },
          },
        },
      },
    },
  });

  if (!placement) return null;

  let loggedEntryCount = 0;

  const weeks: SerializedWeek[] = placement.weeks.map((week) => ({
    id: week.id,
    weekNumber: week.weekNumber,
    startDate: formatUtcDateToIso(week.startDate),
    endDate: formatUtcDateToIso(week.endDate),
    diagramUrl: week.diagramUrl,
    diagramSource: week.diagramSource,
    entries: week.entries.map((entry) => {
      if (entry.loggedAt || (entry.activitySummary && entry.activitySummary.trim())) {
        loggedEntryCount++;
      }
      return {
        id: entry.id,
        slotIndex: entry.slotIndex,
        dayNumber: entry.dayNumber,
        activityDate: formatUtcDateToIso(entry.activityDate),
        weekdayName: entry.weekdayName,
        activitySummary: entry.activitySummary,
        toolsUsed: entry.toolsUsed,
        keyTakeaway: entry.keyTakeaway,
        loggedAt: entry.loggedAt ? entry.loggedAt.toISOString() : null,
      };
    }),
  }));

  return {
    id: placement.id,
    studentName: placement.studentName,
    matricNo: placement.matricNo,
    department: placement.department,
    companyName: placement.companyName,
    industrySupervisorName: placement.industrySupervisorName,
    startDate: formatUtcDateToIso(placement.startDate),
    institutionName: placement.institutionName,
    levelOrProgramme: placement.levelOrProgramme,
    companyAddress: placement.companyAddress,
    companySector: placement.companySector,
    assignedUnit: placement.assignedUnit,
    institutionSupervisorName: placement.institutionSupervisorName,
    loggedEntryCount,
    startDateLocked: loggedEntryCount > 0,
    weeks,
  };
}

export async function createPlacementWithSchedule(
  userId: string,
  payload: PlacementPayload
): Promise<SerializedPlacement> {
  const existing = await prisma.placement.findFirst({
    where: { userId, isActive: true },
    select: { id: true },
  });

  if (existing) {
    throw new Error("ACTIVE_PLACEMENT_EXISTS");
  }

  const schedule = generateSiwesSchedule(payload.startDate);
  const startDateObj = parseIsoDateStrict(payload.startDate)!;

  const created = await prisma.$transaction(async (tx) => {
    const placement = await tx.placement.create({
      data: {
        userId,
        studentName: payload.studentName,
        matricNo: payload.matricNo,
        department: payload.department,
        companyName: payload.companyName,
        industrySupervisorName: payload.industrySupervisorName,
        startDate: startDateObj,
        institutionName: payload.institutionName ?? null,
        levelOrProgramme: payload.levelOrProgramme ?? null,
        companyAddress: payload.companyAddress ?? null,
        companySector: payload.companySector ?? null,
        assignedUnit: payload.assignedUnit ?? null,
        institutionSupervisorName: payload.institutionSupervisorName ?? null,
        isActive: true,
      },
    });

    for (const weekPlan of schedule) {
      await tx.week.create({
        data: {
          placementId: placement.id,
          weekNumber: weekPlan.weekNumber,
          startDate: parseIsoDateStrict(weekPlan.startDate)!,
          endDate: parseIsoDateStrict(weekPlan.endDate)!,
          entries: {
            create: weekPlan.days.map((day) => ({
              slotIndex: day.slotIndex,
              dayNumber: day.dayNumber,
              activityDate: parseIsoDateStrict(day.activityDate)!,
              weekdayName: day.weekdayName,
            })),
          },
        },
      });
    }

    return placement;
  });

  const hydrated = await getActivePlacementWithSchedule(userId);
  if (!hydrated || hydrated.id !== created.id) {
    throw new Error("Failed to load created placement.");
  }
  return hydrated;
}

export async function updatePlacementStartDate(
  userId: string,
  newStartDateIso: string
): Promise<
  | { ok: true; placement: SerializedPlacement }
  | { ok: false; status: number; error: string }
> {
  const validation = validateStartDate(newStartDateIso);
  if (!validation.ok) {
    return { ok: false, status: 400, error: validation.error };
  }

  const current = await getActivePlacementWithSchedule(userId);
  if (!current) {
    return { ok: false, status: 404, error: "No active placement found." };
  }

  if (current.startDateLocked) {
    return {
      ok: false,
      status: 409,
      error:
        "Start Date is locked because one or more daily entries have already been logged.",
    };
  }

  const schedule = generateSiwesSchedule(validation.isoDate);
  const startDateObj = parseIsoDateStrict(validation.isoDate)!;

  await prisma.$transaction(async (tx) => {
    await tx.placement.update({
      where: { id: current.id },
      data: { startDate: startDateObj },
    });

    for (const weekPlan of schedule) {
      const existingWeek = current.weeks.find(
        (w) => w.weekNumber === weekPlan.weekNumber
      );
      if (!existingWeek) continue;

      await tx.week.update({
        where: { id: existingWeek.id },
        data: {
          startDate: parseIsoDateStrict(weekPlan.startDate)!,
          endDate: parseIsoDateStrict(weekPlan.endDate)!,
        },
      });

      for (const dayPlan of weekPlan.days) {
        const existingEntry = existingWeek.entries.find(
          (e) => e.dayNumber === dayPlan.dayNumber
        );
        if (!existingEntry) continue;

        await tx.dailyEntry.update({
          where: { id: existingEntry.id },
          data: {
            activityDate: parseIsoDateStrict(dayPlan.activityDate)!,
            weekdayName: dayPlan.weekdayName,
          },
        });
      }
    }
  });

  const updated = await getActivePlacementWithSchedule(userId);
  if (!updated) {
    return { ok: false, status: 500, error: "Failed to reload placement." };
  }
  return { ok: true, placement: updated };
}
