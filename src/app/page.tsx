import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  FileSpreadsheet,
  PenTool,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getActivePlacementWithSchedule } from "@/lib/placement-service";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.id) {
    const placement = await getActivePlacementWithSchedule(session.user.id);
    redirect(placement ? "/dashboard" : "/setup");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_rgba(0,113,227,0.07),_transparent_60%)]">
      <header className="crystalline-header">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0071e3] text-white shadow-sm">
              <BookOpen className="h-4 w-4" strokeWidth={2.2} />
            </span>
            <span className="font-semibold tracking-tight text-slate-900">
              SIWES Vault
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-xl px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#0071e3] px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#0062c4] transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl flex-1 px-4 sm:px-6 py-16 sm:py-24 flex flex-col justify-center">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-[#0071e3]/20 bg-[#0071e3]/8 px-3 py-1 text-xs font-medium text-[#0071e3]">
            Built for Nigerian Tertiary SIWES Students
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-[1.12]">
            Your 16-week SIWES logbook, crystal clear from day one.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed">
            Log daily activities on your phone, attach or sketch weekly
            diagrams, search past entries, and export a print-ready A4 official
            logbook PDF and Final Report starter in one click.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0071e3] px-6 py-3.5 text-sm font-medium text-white shadow-sm hover:bg-[#0062c4] transition"
            >
              <span>Create Student Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <span>Sign In</span>
            </Link>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="crystalline-card rounded-3xl p-6">
            <CalendarCheck2 className="h-5 w-5 text-[#0071e3]" />
            <h2 className="mt-3 text-sm font-semibold text-slate-900">
              Dynamic 96-Day Engine
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Set your exact Start Date and get 16 rolling Monday–Saturday weeks
              with zero Sundays and zero dead days.
            </p>
          </div>
          <div className="crystalline-card rounded-3xl p-6">
            <PenTool className="h-5 w-5 text-[#0071e3]" />
            <h2 className="mt-3 text-sm font-semibold text-slate-900">
              Weekly Diagram Studio
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Upload site photos or draw block diagrams directly on the built-in
              HTML5 sketchpad at the end of every week.
            </p>
          </div>
          <div className="crystalline-card rounded-3xl p-6">
            <FileSpreadsheet className="h-5 w-5 text-[#0071e3]" />
            <h2 className="mt-3 text-sm font-semibold text-slate-900">
              Print PDF & Report Starter
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Export pure black-on-white A4 logbook sheets with sign-off boxes
              plus compiled Chapters 2–4 for your final report.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
