import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFileToSupabase } from "@/lib/storage";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const subject = formData.get("subject") as string;
        const materialId = formData.get("materialId") as string;

        if (!file || !subject || !materialId) {
            return NextResponse.json(
                { error: "Missing required fields: file, subject, materialId" },
                { status: 400 }
            );
        }

        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File size must be less than 50MB" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedMimeTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/webp",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedMimeTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `File type ${file.type} not allowed` },
                { status: 400 }
            );
        }

        // Upload to Supabase Storage
        const fileUrl = await uploadFileToSupabase(
            file,
            session.user.id,
            subject,
            materialId
        );

        return NextResponse.json({
            success: true,
            fileUrl,
            fileName: file.name,
            fileSize: file.size,
            message: "File uploaded successfully to Supabase Storage",
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to upload file" },
            { status: 500 }
        );
    }
}
