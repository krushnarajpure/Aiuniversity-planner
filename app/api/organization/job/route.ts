import { NextRequest, NextResponse } from "next/server";
import { createOrganizationJob, deleteOrganizationJob } from "@/actions/organization";

export async function POST(request: NextRequest) {
    try {
        const job = await createOrganizationJob(await request.json());
        return NextResponse.json({ job }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error && error.message.includes("Organization") ? error.message : "Unable to save job. Check the required fields." }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        if (!body?.jobId || typeof body.jobId !== "string") {
            return NextResponse.json({ error: "Job id is required" }, { status: 400 });
        }
        await deleteOrganizationJob(body.jobId);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete job." }, { status: 400 });
    }
}
