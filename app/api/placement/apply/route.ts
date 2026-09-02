import { NextRequest, NextResponse } from "next/server";
import { applyToPlacementJob } from "@/actions/placement-jobs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.jobId || typeof body.jobId !== "string") {
      return NextResponse.json({ error: "Job id is required." }, { status: 400 });
    }

    const result = await applyToPlacementJob(body.jobId, body.applicationForm ?? {});
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    console.error("Placement application error:", error);
    const message = error instanceof Error ? error.message : "Unable to submit application.";
    const status = message.includes("logged in") ? 401 : message.includes("Only students") ? 403 : 500;
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}
