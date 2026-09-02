import { NextRequest, NextResponse } from "next/server";
import { getOrganizationApprovals } from "@/actions/organization-admin";

export async function GET(request: NextRequest) {
  try {
    const organizations = await getOrganizationApprovals();
    
    // Set proper cache headers for real-time updates
    const response = NextResponse.json({ organizations });
    response.headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=120");
    return response;
  } catch (error) {
    console.error("Organizations fetch error:", error);
    const message = error instanceof Error ? error.message : "Unable to fetch organizations.";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
