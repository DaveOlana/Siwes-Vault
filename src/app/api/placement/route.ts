import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createPlacementWithSchedule,
  getActivePlacementWithSchedule,
  updatePlacementStartDate,
} from "@/lib/placement-service";
import { validatePlacementInput } from "@/lib/validators";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const placement = await getActivePlacementWithSchedule(session.user.id);
  return NextResponse.json({ placement });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  const parsed = validatePlacementInput(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, field: parsed.field },
      { status: 400 }
    );
  }

  try {
    const placement = await createPlacementWithSchedule(
      session.user.id,
      parsed.data
    );
    return NextResponse.json({ placement }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ACTIVE_PLACEMENT_EXISTS") {
      return NextResponse.json(
        { error: "An active SIWES placement already exists for this account." },
        { status: 409 }
      );
    }
    console.error("[POST /api/placement] error:", error);
    return NextResponse.json(
      { error: "Unable to create SIWES placement. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  const startDate =
    body && typeof body.startDate === "string" ? body.startDate : "";

  const result = await updatePlacementStartDate(session.user.id, startDate);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  return NextResponse.json({ placement: result.placement });
}
