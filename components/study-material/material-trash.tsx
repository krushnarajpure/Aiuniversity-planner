"use client";

import { useState, useEffect } from "react";
import { Trash2, RotateCcw, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { StudyMaterial } from "@prisma/client";
import { permanentlyDeleteStudyMaterial, restoreStudyMaterial } from "@/actions/study-material";

export function MaterialTrash({
    onBack,
}: {
    onBack: () => void;
}) {
    const [trashedMaterials, setTrashedMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(false);

    const loadTrash = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/study-material/trash");
            const data = await response.json();
            setTrashedMaterials(data);
        } catch (error) {
            toast.error("Failed to load trash");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrash();
    }, []);

    async function handleRestore(material: StudyMaterial) {
        const confirmed = window.confirm(`Restore "${material.materialName}"?`);
        if (!confirmed) return;

        try {
            await restoreStudyMaterial(material.id);
            setTrashedMaterials((m) => m.filter((x) => x.id !== material.id));
            toast.success("Material restored successfully");
        } catch {
            toast.error("Failed to restore material");
        }
    }

    async function handlePermanentDelete(material: StudyMaterial) {
        const confirmed = window.confirm(
            `Permanently delete "${material.materialName}"? This cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await permanentlyDeleteStudyMaterial(material.id);
            setTrashedMaterials((m) => m.filter((x) => x.id !== material.id));
            toast.success("Material permanently deleted");
        } catch {
            toast.error("Failed to delete material");
        }
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-subheading font-semibold">Trash</h1>
                    <p className="text-slate-600 dark:text-slate-400">Deleted materials ({trashedMaterials.length})</p>
                </div>
            </div>

            {trashedMaterials.length === 0 ? (
                <div className="card text-center py-12">
                    <Trash2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Trash is empty</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {trashedMaterials.map((material) => (
                        <div
                            key={material.id}
                            className="card flex items-center justify-between p-4"
                        >
                            <div>
                                <h3 className="text-card-title font-semibold">{material.materialName}</h3>
                                <p className="text-small text-slate-500 dark:text-slate-400">
                                    {material.subject} • {material.unit} • {material.type}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRestore(material)}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-small font-medium hover:bg-green-200 dark:hover:bg-green-800 transition"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Restore
                                </button>
                                <button
                                    onClick={() => handlePermanentDelete(material)}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-small font-medium hover:bg-red-200 dark:hover:bg-red-800 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
