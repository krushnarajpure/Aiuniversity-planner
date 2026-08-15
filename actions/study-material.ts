"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { studyMaterialSchema, quickNoteSchema } from "@/lib/validations";

async function requireUserId() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        throw new Error("You must be logged in to do this");
    }
    return session.user.id;
}

export type StudyMaterialState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
};

function extractRaw(formData: FormData) {
    const tags = formData.get("tags");
    const tagArray = tags ? (typeof tags === "string" ? tags.split(",").map((t) => t.trim()).filter(Boolean) : []) : [];
    const fileUrl = formData.get("fileUrl");

    return {
        materialName: formData.get("materialName"),
        subject: formData.get("subject"),
        unit: formData.get("unit"),
        type: formData.get("type"),
        description: formData.get("description") || undefined,
        notesContent: formData.get("notesContent") || undefined,
        resourceUrl: formData.get("resourceUrl") || undefined,
        fileUrl: fileUrl ? (typeof fileUrl === "string" ? fileUrl : undefined) : undefined,
        tags: tagArray,
        isImportant: formData.get("isImportant") === "on",
        isFavorite: formData.get("isFavorite") === "on",
    };
}

export async function createStudyMaterial(
    _prevState: StudyMaterialState,
    formData: FormData
): Promise<StudyMaterialState> {
    const userId = await requireUserId();
    const raw = extractRaw(formData);
    const parsed = studyMaterialSchema.safeParse(raw);

    if (!parsed.success) {
        return { success: false, message: "Please fix the errors below", errors: parsed.error.flatten().fieldErrors };
    }

    try {
        await prisma.studyMaterial.create({
            data: { ...parsed.data, userId },
        });

        await prisma.notification.create({
            data: {
                userId,
                title: `Material Added: ${parsed.data.materialName}`,
                message: `${parsed.data.materialName} has been added to Study Material.`,
                type: "MATERIAL_ADDED",
            },
        });

        revalidatePath("/study-material");
        return { success: true, message: "Study material added successfully" };
    } catch (error) {
        return { success: false, message: "Failed to create material" };
    }
}

export async function createQuickNote(
    _prevState: StudyMaterialState,
    formData: FormData
): Promise<StudyMaterialState> {
    const userId = await requireUserId();
    const raw = {
        materialName: formData.get("materialName"),
        subject: formData.get("subject"),
        unit: formData.get("unit"),
        type: "NOTES" as const,
        notesContent: formData.get("notesContent"),
        description: undefined,
        resourceUrl: undefined,
        tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean) : [],
        isImportant: formData.get("isImportant") === "on",
        isFavorite: formData.get("isFavorite") === "on",
    };

    const parsed = quickNoteSchema.safeParse(raw);

    if (!parsed.success) {
        return { success: false, message: "Please fix the errors below", errors: parsed.error.flatten().fieldErrors };
    }

    try {
        await prisma.studyMaterial.create({
            data: { ...parsed.data, userId },
        });

        await prisma.notification.create({
            data: {
                userId,
                title: `Quick Note Added: ${parsed.data.materialName}`,
                message: `${parsed.data.materialName} has been added to Study Material.`,
                type: "MATERIAL_ADDED",
            },
        });

        revalidatePath("/study-material");
        return { success: true, message: "Quick note added successfully" };
    } catch (error) {
        return { success: false, message: "Failed to create note" };
    }
}

export async function updateStudyMaterial(
    materialId: string,
    _prevState: StudyMaterialState,
    formData: FormData
): Promise<StudyMaterialState> {
    const userId = await requireUserId();
    const raw = extractRaw(formData);
    const parsed = studyMaterialSchema.safeParse(raw);

    if (!parsed.success) {
        return { success: false, message: "Please fix the errors below", errors: parsed.error.flatten().fieldErrors };
    }

    try {
        const material = await prisma.studyMaterial.findUnique({ where: { id: materialId } });
        if (!material || material.userId !== userId) {
            return { success: false, message: "Material not found" };
        }

        await prisma.studyMaterial.update({
            where: { id: materialId },
            data: parsed.data,
        });

        await prisma.notification.create({
            data: {
                userId,
                title: `Material Updated: ${parsed.data.materialName}`,
                message: `${parsed.data.materialName} has been updated.`,
                type: "MATERIAL_UPDATED",
            },
        });

        revalidatePath("/study-material");
        return { success: true, message: "Study material updated successfully" };
    } catch (error) {
        return { success: false, message: "Failed to update material" };
    }
}

export async function deleteStudyMaterial(materialId: string) {
    const userId = await requireUserId();

    const material = await prisma.studyMaterial.findUnique({ where: { id: materialId } });
    if (!material || material.userId !== userId) {
        throw new Error("Material not found");
    }

    // Soft delete - move to trash
    await prisma.studyMaterial.update({
        where: { id: materialId },
        data: { isDeleted: true },
    });

    revalidatePath("/study-material");
}

export async function restoreStudyMaterial(materialId: string) {
    const userId = await requireUserId();

    const material = await prisma.studyMaterial.findUnique({ where: { id: materialId } });
    if (!material || material.userId !== userId) {
        throw new Error("Material not found");
    }

    await prisma.studyMaterial.update({
        where: { id: materialId },
        data: { isDeleted: false },
    });

    await prisma.notification.create({
        data: {
            userId,
            title: `Material Restored: ${material.materialName}`,
            message: `${material.materialName} has been restored.`,
            type: "MATERIAL_RESTORED",
        },
    });

    revalidatePath("/study-material");
}

export async function permanentlyDeleteStudyMaterial(materialId: string) {
    const userId = await requireUserId();

    const material = await prisma.studyMaterial.findUnique({ where: { id: materialId } });
    if (!material || material.userId !== userId) {
        throw new Error("Material not found");
    }

    await prisma.studyMaterial.delete({ where: { id: materialId } });

    revalidatePath("/study-material");
}

export async function toggleFavorite(materialId: string) {
    const userId = await requireUserId();

    const material = await prisma.studyMaterial.findUnique({ where: { id: materialId } });
    if (!material || material.userId !== userId) {
        throw new Error("Material not found");
    }

    await prisma.studyMaterial.update({
        where: { id: materialId },
        data: { isFavorite: !material.isFavorite },
    });

    revalidatePath("/study-material");
}

export async function toggleImportant(materialId: string) {
    const userId = await requireUserId();

    const material = await prisma.studyMaterial.findUnique({ where: { id: materialId } });
    if (!material || material.userId !== userId) {
        throw new Error("Material not found");
    }

    await prisma.studyMaterial.update({
        where: { id: materialId },
        data: { isImportant: !material.isImportant },
    });

    revalidatePath("/study-material");
}

export async function updateLastViewed(materialId: string) {
    const userId = await requireUserId();

    const material = await prisma.studyMaterial.findUnique({ where: { id: materialId } });
    if (!material || material.userId !== userId) {
        throw new Error("Material not found");
    }

    await prisma.studyMaterial.update({
        where: { id: materialId },
        data: { lastViewedAt: new Date() },
    });

    revalidatePath("/study-material");
}

export async function getStudyMaterials() {
    const userId = await requireUserId();
    return prisma.studyMaterial.findMany({
        where: { userId, isDeleted: false },
        orderBy: { createdAt: "desc" },
    });
}

export async function getTrashedMaterials() {
    const userId = await requireUserId();
    return prisma.studyMaterial.findMany({
        where: { userId, isDeleted: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function getRecentlyViewed() {
    const userId = await requireUserId();
    return prisma.studyMaterial.findMany({
        where: { userId, isDeleted: false, lastViewedAt: { not: null } },
        orderBy: { lastViewedAt: "desc" },
        take: 10,
    });
}

export async function getStatistics() {
    const userId = await requireUserId();
    const materials = await prisma.studyMaterial.findMany({
        where: { userId, isDeleted: false },
    });

    const stats = {
        total: materials.length,
        notes: materials.filter((m) => m.type === "NOTES").length,
        pdfs: materials.filter((m) => m.type === "PDF").length,
        images: materials.filter((m) => m.type === "IMAGE").length,
        documents: materials.filter((m) => m.type === "DOCUMENT").length,
        links: materials.filter((m) => m.type === "LINK").length,
        important: materials.filter((m) => m.isImportant).length,
        favorites: materials.filter((m) => m.isFavorite).length,
    };

    return stats;
}

export async function getSubjects() {
    const userId = await requireUserId();
    const materials = await prisma.studyMaterial.findMany({
        where: { userId, isDeleted: false },
        select: { subject: true },
        distinct: ["subject"],
    });

    return materials.map((m) => m.subject).sort();
}
