import { NextRequest, NextResponse } from "next/server";
import { updateOrganizationVerification } from "@/actions/organization-admin";

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        if (typeof body?.organizationId !== "string" || !["APPROVED", "REJECTED", "SUSPENDED"].includes(body.status)) {
            return NextResponse.json({ error: "Invalid approval update" }, { status: 400 });
        }
        const organization = await updateOrganizationVerification(body.organizationId, body.status, body.message);
        return NextResponse.json({ organization });
    } catch (error) {
        console.error("Organization approval error:", error);
        const message = error instanceof Error ? error.message : "Unable to update organization status.";
        return NextResponse.json({ error: message }, { status: 403 });
    }
}