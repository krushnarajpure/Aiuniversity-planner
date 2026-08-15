"use client";

import { useState, useEffect } from "react";
import { X, Copy, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import type { StudyMaterial } from "@prisma/client";
import { updateLastViewed } from "@/actions/study-material";

export function MaterialPreview({
    material,
    onClose,
}: {
    material: StudyMaterial;
    onClose: () => void;
}) {
    const [copiedSection, setCopiedSection] = useState<string | null>(null);

    useEffect(() => {
        updateLastViewed(material.id).catch(() => { });
    }, [material.id]);

    function copyToClipboard(text: string, section: string) {
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedSection(null), 2000);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4 py-6 overflow-y-auto">
            <div className="card w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card-light dark:bg-card-dark z-10 flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-card-title font-semibold">{material.materialName}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Metadata */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-small text-slate-500 dark:text-slate-400 mb-1">Subject</p>
                            <p className="text-body font-medium">{material.subject}</p>
                        </div>
                        <div>
                            <p className="text-small text-slate-500 dark:text-slate-400 mb-1">Unit</p>
                            <p className="text-body font-medium">{material.unit}</p>
                        </div>
                        <div>
                            <p className="text-small text-slate-500 dark:text-slate-400 mb-1">Type</p>
                            <p className="text-body font-medium">{material.type}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {material.description && (
                        <div>
                            <p className="text-small text-slate-500 dark:text-slate-400 mb-2">Description</p>
                            <p className="text-body text-slate-700 dark:text-slate-300">{material.description}</p>
                        </div>
                    )}

                    {/* Notes Content */}
                    {material.type === "NOTES" && material.notesContent && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-card-title font-semibold">Notes Content</h3>
                                <button
                                    onClick={() => copyToClipboard(material.notesContent || "", "notes")}
                                    className="flex items-center gap-1 px-3 py-1 text-small bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                                >
                                    <Copy className="w-4 h-4" />
                                    {copiedSection === "notes" ? "Copied" : "Copy"}
                                </button>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600 text-body text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                                {material.notesContent}
                            </div>
                        </div>
                    )}

                    {/* PDF Preview */}
                    {material.type === "PDF" && material.fileUrl && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-card-title font-semibold">PDF Document</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.open(material.fileUrl, "_blank")}
                                        className="flex items-center gap-1 px-3 py-1 text-small bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium"
                                    >
                                        Open PDF
                                    </button>
                                    <a
                                        href={material.fileUrl}
                                        download={`${material.materialName}.pdf`}
                                        className="flex items-center gap-1 px-3 py-1 text-small bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:opacity-90 transition font-medium"
                                    >
                                        Download
                                    </a>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600 text-center text-slate-600 dark:text-slate-400">
                                <p className="text-small">PDF preview not available</p>
                            </div>
                        </div>
                    )}

                    {/* Image Preview */}
                    {material.type === "IMAGE" && material.fileUrl && (
                        <div>
                            <h3 className="text-card-title font-semibold mb-3">Image Preview</h3>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                <img
                                    src={material.fileUrl}
                                    alt={material.materialName}
                                    className="max-w-full h-auto rounded-lg"
                                />
                            </div>
                        </div>
                    )}

                    {/* Document */}
                    {material.type === "DOCUMENT" && material.fileUrl && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-card-title font-semibold">Document</h3>
                                <a
                                    href={material.fileUrl}
                                    download
                                    className="flex items-center gap-1 px-3 py-1 text-small bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                                >
                                    Download
                                </a>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600 text-center text-slate-600 dark:text-slate-400">
                                <p className="text-small">Document download available</p>
                            </div>
                        </div>
                    )}

                    {/* Link */}
                    {material.type === "LINK" && material.resourceUrl && (
                        <div>
                            <h3 className="text-card-title font-semibold mb-3">Resource Link</h3>
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                <a
                                    href={material.resourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline break-all text-small"
                                >
                                    {material.resourceUrl}
                                </a>
                                <a
                                    href={material.resourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition mt-3 w-fit"
                                >
                                    Open Resource
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {material.tags && material.tags.length > 0 && (
                        <div>
                            <p className="text-small text-slate-500 dark:text-slate-400 mb-2">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {material.tags.map((tag) => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-small font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
