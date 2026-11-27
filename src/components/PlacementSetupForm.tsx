"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  UserCheck,
} from "lucide-react";
import {
  formatDisplayDate,
  generateSiwesSchedule,
  validateStartDate,
} from "@/lib/date-engine";

interface PlacementSetupFormProps {
  defaultStudentName: string;
}

export function PlacementSetupForm({
  defaultStudentName,
}: PlacementSetupFormProps) {
  const router = useRouter();

  const [studentName, setStudentName] = useState(defaultStudentName);
  const [matricNo, setMatricNo] = useState("");
  const [department, setDepartment] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industrySupervisorName, setIndustrySupervisorName] = useState("");
  const [startDate, setStartDate] = useState("");

  // Optional M3-ready fields (OQ-03)
  const [showOptional, setShowOptional] = useState(false);
  const [institutionName, setInstitutionName] = useState("");
  const [levelOrProgramme, setLevelOrProgramme] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companySector, setCompanySector] = useState("");
  const [assignedUnit, setAssignedUnit] = useState("");
  const [institutionSupervisorName, setInstitutionSupervisorName] =
    useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dateValidation = useMemo(() => {
    if (!startDate) return null;
    return validateStartDate(startDate);
  }, [startDate]);

  const schedulePreview = useMemo(() => {
    if (!dateValidation?.ok) return null;
    const weeks = generateSiwesSchedule(dateValidation.isoDate);
    return {
      firstDay: weeks[0].startDate,
      lastDay: weeks[15].endDate,
      w1Days: weeks[0].days.map((d) => d.weekdayName.slice(0, 3)).join(" · "),
    };
  }, [dateValidation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const check = validateStartDate(startDate);
    if (!check.ok) {
      setError(check.error);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/placement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          matricNo,
          department,
          companyName,
          industrySupervisorName,
          startDate,
          institutionName,
          levelOrProgramme,
          companyAddress,
          companySector,
          assignedUnit,
          institutionSupervisorName,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save placement setup.");
        setSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error while saving your placement. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Core Placement Details */}
      <div className="crystalline-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <UserCheck className="h-4.5 w-4.5 text-[#0071e3]" />
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            Student & Placement Details
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor="studentName"
              className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Student Full Name *
            </label>
            <input
              id="studentName"
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Chukwudi Ozioma Gospel"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
            />
          </div>

          <div>
            <label
              htmlFor="matricNo"
              className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Matriculation Number *
            </label>
            <input
              id="matricNo"
              type="text"
              required
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value)}
              placeholder="e.g. F/ND/24/3210044"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
            />
          </div>

          <div>
            <label
              htmlFor="department"
              className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Department *
            </label>
            <input
              id="department"
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
            />
          </div>

          <div>
            <label
              htmlFor="companyName"
              className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Company / Organization *
            </label>
            <input
              id="companyName"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Interswitch Group"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
            />
          </div>

          <div>
            <label
              htmlFor="industrySupervisorName"
              className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
            >
              Industry Supervisor *
            </label>
            <input
              id="industrySupervisorName"
              type="text"
              required
              value={industrySupervisorName}
              onChange={(e) => setIndustrySupervisorName(e.target.value)}
              placeholder="e.g. Engr. Tunde Bakare"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="startDate"
              className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
            >
              SIWES Start Date (Mon–Sat) *
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
              />
            </div>

            {dateValidation && !dateValidation.ok && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {dateValidation.error}
              </p>
            )}

            {schedulePreview && (
              <div className="mt-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-900 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">
                    16 weeks · 96 working days ({formatDisplayDate(schedulePreview.firstDay)} →{" "}
                    {formatDisplayDate(schedulePreview.lastDay)})
                  </p>
                  <p className="mt-0.5 text-emerald-700">
                    Week 1 rolling pattern: {schedulePreview.w1Days} (Sundays skipped automatically)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional M3 Report & Institution Profile */}
      <div className="crystalline-card rounded-3xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowOptional((prev) => !prev)}
          className="w-full px-6 py-4 sm:px-8 flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4.5 w-4.5 text-slate-500" />
            <div>
              <span className="text-sm font-medium text-slate-900">
                Organization Profile & Institution Details
              </span>
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                Optional · Used in Final Report
              </span>
            </div>
          </div>
          {showOptional ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </button>

        {showOptional && (
          <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="institutionName"
                className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Institution Name
              </label>
              <input
                id="institutionName"
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. Yaba College of Technology"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
              />
            </div>

            <div>
              <label
                htmlFor="levelOrProgramme"
                className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Level / Programme
              </label>
              <input
                id="levelOrProgramme"
                type="text"
                value={levelOrProgramme}
                onChange={(e) => setLevelOrProgramme(e.target.value)}
                placeholder="e.g. ND II / 300 Level"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
              />
            </div>

            <div>
              <label
                htmlFor="companySector"
                className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Industry Sector
              </label>
              <input
                id="companySector"
                type="text"
                value={companySector}
                onChange={(e) => setCompanySector(e.target.value)}
                placeholder="e.g. FinTech / Software Engineering"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
              />
            </div>

            <div>
              <label
                htmlFor="assignedUnit"
                className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Assigned Unit / Team
              </label>
              <input
                id="assignedUnit"
                type="text"
                value={assignedUnit}
                onChange={(e) => setAssignedUnit(e.target.value)}
                placeholder="e.g. Core Infrastructure"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="companyAddress"
                className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Company Address
              </label>
              <input
                id="companyAddress"
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="e.g. 1648C Oko Awo Street, Victoria Island, Lagos"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="institutionSupervisorName"
                className="block text-xs font-medium uppercase tracking-wider text-slate-500 mb-1.5"
              >
                Institution Supervisor Name
              </label>
              <input
                id="institutionSupervisorName"
                type="text"
                value={institutionSupervisorName}
                onChange={(e) => setInstitutionSupervisorName(e.target.value)}
                placeholder="e.g. Dr. K. Adeyemi"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0071e3] focus:outline-none focus:ring-4 focus:ring-[#0071e3]/10 transition"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || (dateValidation !== null && !dateValidation.ok)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0071e3] px-6 py-3.5 text-sm font-medium text-white shadow-sm hover:bg-[#0062c4] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#0071e3]/20 transition"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating 16-week logbook...</span>
          </>
        ) : (
          <>
            <span>Generate My 16-Week Logbook</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
