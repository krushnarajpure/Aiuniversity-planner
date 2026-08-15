"use client";

import {
    Pencil,
    Trash2,
    Star,
    BookOpen,
    FileText,
    Image,
    File,
    Link as LinkIcon,
    Download,
    Copy,
    Share2,
    Eye,
    AlertCircle,
} from "lucide-react";
import type { StudyMaterial } from "@prisma/client";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { toggleFavorite, toggleImportant } from "@/actions/study-material";

const materialTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    NOTES: BookOpen,
    PDF: FileText,
    IMAGE: Image,
    DOCUMENT: File,
    LINK: LinkIcon,
};

const materialTypeColors: Record<string, string> = {
    NOTES: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    PDF: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
    IMAGE: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
    DOCUMENT: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300",
    LINK: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
};

export function StudyMaterialCard({
    material,
    onEdit,
    onDelete,
    onPreview,
}: {
    material: StudyMaterial;
    onEdit: () => void;
    onDelete: () => void;
    onPreview: () => void;
}) {
    const [isFavoriting, setIsFavoriting] = useState(false);
    const [isImportanting, setIsImportanting] = useState(false);
    const Icon = materialTypeIcons[material.type];
    const typeColor = materialTypeColors[material.type];

    async function handleToggleFavorite() {
        setIsFavoriting(true);
        try {
            await toggleFavorite(material.id);
            toast.success(material.isFavorite ? "Removed from favorites" : "Added to favorites");
        } catch {
            toast.error("Failed to update favorite");
        } finally {
            setIsFavoriting(false);
        }
    }

    async function handleToggleImportant() {
        setIsImportanting(true);
        try {
            await toggleImportant(material.id);
            toast.success(material.isImportant ? "Removed from important" : "Marked as important");
        } catch {
            toast.error("Failed to update important status");
        } finally {
            setIsImportanting(false);
        }
    }

    function handleCopyNotes() {
        if (material.notesContent) {
            navigator.clipboard.writeText(material.notesContent);
            toast.success("Notes copied to clipboard");
        }
    }

    function handleShare() {
        const url = `${window.location.origin}/study-material?material=${material.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
    }

    return (
        <div className="card hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${typeColor} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleToggleFavorite}
                        disabled={isFavoriting}
                        className={`transition ${material.isFavorite ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}`}
                        aria-label="Toggle favorite"
                        title={material.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        <Star className="w-4 h-4" fill={material.isFavorite ? "currentColor" : "none"} />
                    </button>
                    {material.isImportant && (
                        <span className="text-red-500" title="Marked as important">
                            <AlertCircle className="w-4 h-4" />
                        </span>
                    )}
                    <button
                        onClick={onEdit}
                        className="text-slate-400 hover:text-primary transition"
                        aria-label="Edit material"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="text-slate-400 hover:text-danger transition"
                        aria-label="Delete material"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <h3 className="text-card-title font-semibold mb-1 line-clamp-2">{material.materialName}</h3>

            <div className="flex flex-wrap gap-2 mb-3 text-small text-slate-500 dark:text-slate-400">
                <span>{material.subject}</span>
                <span>•</span>
                <span>{material.unit}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded ${typeColor}`}>{material.type}</span>
            </div>

            {material.description && (
                <p className="text-small text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">{material.description}</p>
            )}

            {material.tags && material.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {material.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-1 text-small rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {tag}
                        </span>
                    ))}
                    {material.tags.length > 3 && (
                        <span className="px-2 py-1 text-small rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            +{material.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="text-small text-slate-400 mb-4">{format(material.createdAt, "dd MMM yyyy")}</div>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={onPreview}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-small font-medium hover:bg-primary/20 transition"
                    title="Open material"
                >
                    <Eye className="w-3 h-3" />
                    Open
                </button>

                {material.type === "NOTES" && (
                    <button
                        onClick={handleCopyNotes}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-small font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        title="Copy notes"
                    >
                        <Copy className="w-3 h-3" />
                        Copy
                    </button>
                )}

                {(material.type === "PDF" || material.type === "IMAGE" || material.type === "DOCUMENT") && material.fileUrl && (
                    <a
                        href={material.fileUrl}
                        download
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-small font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        title="Download"
                    >
                        <Download className="w-3 h-3" />
                        Download
                    </a>
                )}

                {material.type === "LINK" && material.resourceUrl && (
                    <a
                        href={material.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-small font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                        title="Open resource"
                    >
                        <LinkIcon className="w-3 h-3" />
                        Resource
                    </a>
                )}

                <button
                    onClick={handleShare}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-small font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                    title="Share"
                >
                    <Share2 className="w-3 h-3" />
                    Share
                </button>
            </div>
        </div>
    );
}
