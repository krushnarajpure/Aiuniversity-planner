import { NextRequest, NextResponse } from "next/server";
import { updateRoadmapTask } from "@/actions/roadmap";

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        if (typeof body?.taskId !== "string" || !["PENDING", "IN_PROGRESS", "COMPLETED"].includes(body?.status)) {
            return NextResponse.json({ error: "Invalid task update" }, { status: 400 });
        }
        const task = await updateRoadmapTask(body.taskId, body.status, typeof body.notes === "string" ? body.notes : undefined);
        return NextResponse.json({ task });
    } catch {
        return NextResponse.json({ error: "Unable to update roadmap task." }, { status: 500 });
    }
}
