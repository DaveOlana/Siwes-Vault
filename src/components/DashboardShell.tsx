"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  Calendar,
  FileText,
  Image as ImageIcon,
  Lock,
  LogOut,
  Pencil,
  Search,
  Sparkles,
} from "lucide-react";
import { formatDisplayDate, validateStartDate } from "@/lib/date-engine";
import type { SerializedPlacement } from "@/lib/placement-service";

interface DashboardShellProps {
  initialPlacement: SerializedPlacement;
  userEmail: string;
}

export function DashboardShell({
  initialPlacement,
  userEmail,
}: DashboardShellProps) {
  const [placement, setPlacement] = useState(initialPlacement);
  const [activeWeekNumber, setActiveWeekNumber] = useState(1);
  const [editingDate, setEditingDate] = useState(false);
  const [draftStartDate, setDraftStartDate] = useState(
    initialPlacement.startDate
  );
  const [dateError, setDateError] = useState<string | null>(null);
  const [savingDate, setSavingDate] = useState(false);

  const activeWeek =
    placement.weeks.find((w) => w.weekNumber === activeWeekNumber) ??
    placement.weeks[0];

  const totalSlots = placement.weeks.reduce(
    (sum, w) => sum + w.entries.length,
    0
  );

  async function handleSaveStartDate(e: React.FormEvent) {
    e.preventDefault();
    setDateError(null);

    const check = validateStartDate(draftStartDate);
    if (!check.ok) {
      setDateError(check.error);
      return;
    }

    setSavingDate(true);
    try {
      const res = await fetch("/api/placement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: check.isoDate }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        placement?: SerializedPlacement;
        error?: string;
      };

      if (!res.ok || !data.placement) {
        setDateError(data.error ?? "Unable to update start date.");
        setSavingDate(false);
        return;
      }

      setPlacement(data.placement);
      setDraftStartDate(data.placement.startDate);
      setEditingDate(false);
    } catch {
      setDateError("Network error while updating start date.");
    } finally {
      setSavingDate(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Frosted Top Navigation */}
      <header className="crystalline-header sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0071e3] text-white shadow-sm">
              <BookOpen className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="font-semibold tracking-tight text-slate-900">
              SIWES Vault
            </span>
          </div>

          <nav
            aria-label="Primary sections"
            className="hidden md:flex items-center gap-1 rounded-full bg-slate-100/90 p-1 border border-slate-200/70"
          >
            <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-slate-900 shadow-xs">
              Logbook
            </span>
            <span
              title="Available in Milestone M2"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-400 cursor-default"
            >
              <Search className="h-3.5 w-3.5" />
              Search & Vault
              <span className="rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px]">
                M2
              </span>
            </span>
            <span
              title="Available in Milestone M3"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-400 cursor-default"
            >
              <FileText className="h-3.5 w-3.5" />
              Export Studio
              <span className="rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px]">
                M3
              </span>
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-500 truncate max-w-[180px]">
              {userEmail}
            </span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Placement Summary Glass Card */}
        <section className="crystalline-card rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#0071e3]/10 px-2.5 py-0.5 text-xs font-medium text-[#0071e3]">
                  16-Week Active Placement
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {placement.matricNo}
                </span>
              </div>
              <h1 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                {placement.companyName}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {placement.studentName} · {placement.department} · Supervisor:{" "}
                <span className="text-slate-700 font-medium">
                  {placement.industrySupervisorName}
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-left sm:text-right">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  Logbook Progress
                </p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
                  {placement.loggedEntryCount} / {totalSlots} days logged
                </p>
              </div>
            </div>
          </div>

          {/* Start Date Bar + Lock Policy (OQ-04) */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Start Date:{" "}
                <strong className="font-mono text-slate-900">
                  {formatDisplayDate(placement.startDate)}
                </strong>
              </span>
              <span className="text-slate-300">·</span>
              <span>
                Ends:{" "}
                <strong className="font-mono text-slate-900">
                  {formatDisplayDate(
                    placement.weeks[placement.weeks.length - 1]?.endDate ?? ""
                  )}
                </strong>
              </span>
            </div>

            {placement.startDateLocked ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Lock className="h-3.5 w-3.5" />
                Start Date locked (entries logged)
              </span>
            ) : !editingDate ? (
              <button
                type="button"
                onClick={() => {
                  setDraftStartDate(placement.startDate);
                  setDateError(null);
                  setEditingDate(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0071e3] hover:underline self-start sm:self-auto"
              >
                <Pencil className="h-3 w-3" />
                Edit Start Date
              </button>
            ) : (
              <form
                onSubmit={handleSaveStartDate}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  type="date"
                  value={draftStartDate}
                  onChange={(e) => setDraftStartDate(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 focus:border-[#0071e3] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={savingDate}
                  className="rounded-xl bg-[#0071e3] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0062c4] disabled:opacity-60"
                >
                  {savingDate ? "Saving..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingDate(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>

          {dateError && (
            <p className="mt-2 text-xs font-medium text-red-600">{dateError}</p>
          )}
        </section>

        {/* Horizontal 16-Week Progress Strip */}
        <section aria-label="16-week selector">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              16-Week Schedule (W1–W16)
            </h2>
            <span className="text-xs text-slate-400">
              {placement.weeks.length} weeks · {totalSlots} Mon–Sat slots
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
            {placement.weeks.map((week) => {
              const isSelected = week.weekNumber === activeWeek.weekNumber;
              return (
                <button
                  key={week.id}
                  type="button"
                  onClick={() => setActiveWeekNumber(week.weekNumber)}
                  className={`snap-start shrink-0 rounded-2xl px-3.5 py-2.5 text-left transition-all border ${
                    isSelected
                      ? "bg-[#0071e3] text-white border-[#0071e3] shadow-sm"
                      : "bg-white/85 text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="text-xs font-semibold">
                    W{week.weekNumber}
                  </div>
                  <div
                    className={`mt-0.5 font-mono text-[10px] ${
                      isSelected ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    {formatDisplayDate(week.startDate).slice(0, 6)}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Week Mon-Sat Slots */}
        {activeWeek && (
          <section className="crystalline-card rounded-3xl p-5 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  Week {activeWeek.weekNumber}
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  {formatDisplayDate(activeWeek.startDate)} —{" "}
                  {formatDisplayDate(activeWeek.endDate)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 self-start">
                <Sparkles className="h-3.5 w-3.5 text-[#0071e3]" />
                Daily logging unlocks in M2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeWeek.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900">
                      Day {entry.dayNumber} · {entry.weekdayName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      #{entry.slotIndex}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-[#0071e3]">
                    {formatDisplayDate(entry.activityDate)}
                  </p>
                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                    {entry.activitySummary
                      ? entry.activitySummary
                      : "Slot ready — daily entry editor arrives in Milestone M2."}
                  </p>
                </div>
              ))}
            </div>

            {/* Weekly Diagram Studio Preview (M2) */}
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500">
                  <ImageIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Week {activeWeek.weekNumber} Diagram / Attachment
                  </p>
                  <p className="text-xs text-slate-500">
                    Upload a phone photo or sketch directly on the HTML5 canvas (Milestone M2).
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500 shrink-0">
                M2
              </span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
