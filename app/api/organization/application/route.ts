import { NextRequest, NextResponse } from "next/server";
import { updateOrganizationApplication } from "@/actions/organization";

const statuses = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "APTITUDE", "INTERVIEW", "SELECTED", "REJECTED"] as const;

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        if (typeof body?.applicationId !== "string" || !statuses.includes(body.status)) return NextResponse.json({ error: "Invalid application update" }, { status: 400 });
        const application = await updateOrganizationApplication(body.applicationId, body.status);
        return NextResponse.json({ application });
    } catch {
        return NextResponse.json({ error: "Unable to update application." }, { status: 400 });
    }
}
