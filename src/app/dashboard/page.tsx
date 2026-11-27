import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActivePlacementWithSchedule } from "@/lib/placement-service";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const placement = await getActivePlacementWithSchedule(session.user.id);
  if (!placement) {
    redirect("/setup");
  }

  return (
    <DashboardShell
      initialPlacement={placement}
      userEmail={session.user.email ?? ""}
    />
  );
}
