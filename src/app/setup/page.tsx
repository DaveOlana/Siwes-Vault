import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { getActivePlacementWithSchedule } from "@/lib/placement-service";
import { PlacementSetupForm } from "@/components/PlacementSetupForm";

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const existing = await getActivePlacementWithSchedule(session.user.id);
  if (existing) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(0,113,227,0.06),_transparent_55%)] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0071e3] text-white shadow-sm">
            <BookOpen className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#0071e3]">
              SIWES Vault · Onboarding
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Set up your 16-week placement
            </h1>
          </div>
        </div>

        <PlacementSetupForm defaultStudentName={session.user.name ?? ""} />
      </div>
    </div>
  );
}
