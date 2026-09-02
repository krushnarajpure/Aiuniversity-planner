import { NextRequest, NextResponse } from "next/server";
import { deleteOrganization, updateOrganizationVerification } from "@/actions/organization-admin";

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

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        if (typeof body?.organizationId !== "string") {
            return NextResponse.json({ error: "Organization id is required" }, { status: 400 });
        }
        const result = await deleteOrganization(body.organizationId);
        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to delete organization.";
        return NextResponse.json({ error: message }, { status: 400 });
    }
}