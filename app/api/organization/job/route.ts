import { NextRequest, NextResponse } from "next/server";
import { createOrganizationJob } from "@/actions/organization";

export async function POST(request: NextRequest) {
    try {
        const job = await createOrganizationJob(await request.json());
        return NextResponse.json({ job }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error && error.message.includes("Organization") ? error.message : "Unable to save job. Check the required fields." }, { status: 400 });
    }
}
