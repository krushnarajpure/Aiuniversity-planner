"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { X, Bold, Italic, Underline, Heading2, List, ListOrdered, Code, Copy, RotateCcw, Upload, FileText, Image, File } from "lucide-react";
import { toast } from "sonner";
import { createStudyMaterial, updateStudyMaterial, type StudyMaterialState } from "@/actions/study-material";
import type { StudyMaterial } from "@prisma/client";

const initialState: StudyMaterialState = { success: false, message: "" };

export function StudyMaterialModal({
    open,
    onClose,
    material,
}: {
    open: boolean;
    onClose: () => void;
    material?: StudyMaterial | null;
}) {
    const isEditing = !!material;
    const action = isEditing ? updateStudyMaterial.bind(null, material!.id) : createStudyMaterial;
    const [state, formAction, isPending] = useActionState(action, initialState);
    const [materialType, setMaterialType] = useState<string>(material?.type || "NOTES");
    const [notesContent, setNotesContent] = useState(material?.notesContent || "");
    const [tags, setTags] = useState(material?.tags?.join(", ") || "");
    const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(material?.fileUrl || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.message && state.success) {
            toast.success(state.message);
            onClose();
        } else if (state.message && !state.success) {
            toast.error(state.message);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const isAllowed =
            (materialType === "PDF" && (file.type === "application/pdf" || fileName.endsWith(".pdf"))) ||
            (materialType === "IMAGE" && (file.type.startsWith("image/") || [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) => fileName.endsWith(ext)))) ||
            (materialType === "DOCUMENT" && (file.type === "text/plain" || file.type === "application/msword" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || [".txt", ".doc", ".docx"].some((ext) => fileName.endsWith(ext))));

        if (!isAllowed) {
            toast.error(`Please select a valid ${materialType.toLowerCase()} file.`);
            e.target.value = "";
            return;
        }

        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error("File size must be less than 50MB");
            e.target.value = "";
            return;
        }

        setUploading(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            const fileDataUrl = event.target?.result as string;
            setFilePreview(fileDataUrl);
            setUploadedFile({
                name: file.name,
                size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
            });
            setUploading(false);
            toast.success(`File "${file.name}" selected`);
        };

        reader.onerror = () => {
            setUploading(false);
            toast.error("Failed to read file.");
        };

        reader.readAsDataURL(file);
    }

    function handleRemoveFile() {
        setUploadedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.success("File removed");
    }

    if (!open) return null;

    function applyFormatting(before: string, after: string = "") {
        const textarea = document.getElementById("notesContent") as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = notesContent.substring(start, end);

        const newContent = notesContent.substring(0, start) + before + selected + after + notesContent.substring(end);
        setNotesContent(newContent);

        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = start + before.length;
            textarea.selectionEnd = start + before.length + selected.length;
        }, 0);
    }

    function clearFormatting() {
        const textarea = document.getElementById("notesContent") as HTMLTextAreaElement;
        setNotesContent("");
        textarea.focus();
    }

    function copyNotesContent() {
        navigator.clipboard.writeText(notesContent);
        toast.success("Notes content copied");
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4 py-6 overflow-y-auto">
            <div className="card w-full max-w-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-card-title font-semibold mb-6">{isEditing ? "Edit Material" : "Add Study Material"}</h2>

                <form ref={formRef} action={formAction} className="space-y-4 max-h-[80vh] overflow-y-auto">
                    {/* Hidden file input for file selection */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        style={{ display: "none" }}
                        accept={
                            materialType === "PDF"
                                ? ".pdf"
                                : materialType === "IMAGE"
                                    ? "image/*"
                                    : materialType === "DOCUMENT"
                                        ? ".doc,.docx,.txt"
                                        : ""
                        }
                    />
                    {/* Material Name */}
                    <div>
                        <label className="text-small font-medium block mb-1">Material Name *</label>
                        <input
                            name="materialName"
                            defaultValue={material?.materialName}
                            required
                            placeholder="e.g., CSS Flexbox Notes"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        {state.errors?.materialName && (
                            <p className="text-danger text-small mt-1">{state.errors.materialName[0]}</p>
                        )}
                    </div>

                    {/* Subject and Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-small font-medium block mb-1">Subject *</label>
                            <input
                                name="subject"
                                defaultValue={material?.subject}
                                required
                                placeholder="e.g., CSS"
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {state.errors?.subject && (
                                <p className="text-danger text-small mt-1">{state.errors.subject[0]}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-small font-medium block mb-1">Unit *</label>
                            <select
                                name="unit"
                                defaultValue={material?.unit}
                                required
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select Unit</option>
                                <option value="Unit 1">Unit 1</option>
                                <option value="Unit 2">Unit 2</option>
                                <option value="Unit 3">Unit 3</option>
                                <option value="Unit 4">Unit 4</option>
                                <option value="Unit 5">Unit 5</option>
                            </select>
                            {state.errors?.unit && (
                                <p className="text-danger text-small mt-1">{state.errors.unit[0]}</p>
                            )}
                        </div>
                    </div>

                    {/* Material Type */}
                    <div>
                        <label className="text-small font-medium block mb-1">Material Type *</label>
                        <select
                            name="type"
                            value={materialType}
                            onChange={(e) => setMaterialType(e.target.value)}
                            required
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="NOTES">Notes</option>
                            <option value="PDF">PDF</option>
                            <option value="IMAGE">Image</option>
                            <option value="DOCUMENT">Document</option>
                            <option value="LINK">Link</option>
                        </select>
                        {state.errors?.type && (
                            <p className="text-danger text-small mt-1">{state.errors.type[0]}</p>
                        )}
                    </div>

                    {/* File Upload Section for PDF, Image, Document */}
                    {(materialType === "PDF" || materialType === "IMAGE" || materialType === "DOCUMENT") && (
                        <div>
                            <label className="text-small font-medium block mb-2">
                                Upload {materialType} *
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                            >
                                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-small font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Click to select file or drag & drop
                                </p>
                                <p className="text-small text-slate-500 dark:text-slate-400">
                                    {materialType === "PDF" && "PDF files up to 50MB"}
                                    {materialType === "IMAGE" && "JPG, PNG, GIF, WebP up to 50MB"}
                                    {materialType === "DOCUMENT" && "DOC, DOCX, TXT up to 50MB"}
                                </p>
                            </div>

                            {/* File Preview */}
                            {uploadedFile && (
                                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {materialType === "PDF" && <FileText className="w-5 h-5 text-red-500" />}
                                        {materialType === "IMAGE" && <Image className="w-5 h-5 text-blue-500" />}
                                        {materialType === "DOCUMENT" && <File className="w-5 h-5 text-orange-500" />}
                                        <div>
                                            <p className="text-small font-medium text-slate-700 dark:text-slate-300">
                                                {uploadedFile.name}
                                            </p>
                                            <p className="text-small text-slate-500 dark:text-slate-400">
                                                {uploadedFile.size}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleRemoveFile}
                                        className="text-danger hover:text-danger/70 transition text-small font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}

                            {/* Image Preview */}
                            {materialType === "IMAGE" && filePreview && (
                                <div className="mt-3">
                                    <img
                                        src={filePreview}
                                        alt="Preview"
                                        className="max-w-full max-h-48 rounded-lg mx-auto"
                                    />
                                </div>
                            )}

                            {/* Hidden file URL field */}
                            {filePreview && (
                                <input type="hidden" name="fileUrl" value={filePreview} />
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="text-small font-medium block mb-1">Description</label>
                        <textarea
                            name="description"
                            defaultValue={material?.description || ""}
                            placeholder="Add a brief description of the material"
                            rows={2}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                        {state.errors?.description && (
                            <p className="text-danger text-small mt-1">{state.errors.description[0]}</p>
                        )}
                    </div>

                    {/* Notes Content Editor */}
                    {materialType === "NOTES" && (
                        <div>
                            <label className="text-small font-medium block mb-2">Notes Content</label>
                            <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
                                <div className="bg-slate-100 dark:bg-slate-700 p-2 flex flex-wrap gap-1 border-b border-slate-300 dark:border-slate-600">
                                    <button
                                        type="button"
                                        onClick={() => applyFormatting("**", "**")}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                                        title="Bold"
                                    >
                                        <Bold className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyFormatting("*", "*")}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                                        title="Italic"
                                    >
                                        <Italic className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyFormatting("<u>", "</u>")}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                                        title="Underline"
                                    >
                                        <Underline className="w-4 h-4" />
                                    </button>
                                    <div className="w-px bg-slate-300 dark:bg-slate-600" />
                                    <button
                                        type="button"
                                        onClick={() => applyFormatting("# ")}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition text-small"
                                        title="Heading"
                                    >
                                        <Heading2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyFormatting("- ")}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                                        title="Bullet List"
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyFormatting("1. ")}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                                        title="Numbered List"
                                    >
                                        <ListOrdered className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyFormatting("```\n", "\n```")}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                                        title="Code Block"
                                    >
                                        <Code className="w-4 h-4" />
                                    </button>
                                    <div className="w-px bg-slate-300 dark:bg-slate-600" />
                                    <button
                                        type="button"
                                        onClick={copyNotesContent}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                                        title="Copy"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={clearFormatting}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition"
                                        title="Clear"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>
                                <textarea
                                    id="notesContent"
                                    name="notesContent"
                                    value={notesContent}
                                    onChange={(e) => setNotesContent(e.target.value)}
                                    placeholder="Write your notes here. Supports markdown formatting."
                                    rows={6}
                                    className="w-full bg-transparent px-3 py-2 text-body focus:outline-none resize-none"
                                />
                            </div>
                            {state.errors?.notesContent && (
                                <p className="text-danger text-small mt-1">{state.errors.notesContent[0]}</p>
                            )}
                        </div>
                    )}

                    {/* Resource URL */}
                    {materialType === "LINK" && (
                        <div>
                            <label className="text-small font-medium block mb-1">Resource URL *</label>
                            <input
                                name="resourceUrl"
                                type="url"
                                defaultValue={material?.resourceUrl || ""}
                                placeholder="https://example.com"
                                required={materialType === "LINK"}
                                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {state.errors?.resourceUrl && (
                                <p className="text-danger text-small mt-1">{state.errors.resourceUrl[0]}</p>
                            )}
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                        <label className="text-small font-medium block mb-1">Tags (comma-separated)</label>
                        <input
                            name="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., CSS, Flexbox, Revision, Important"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                name="isImportant"
                                type="checkbox"
                                defaultChecked={material?.isImportant}
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                            />
                            <span className="text-small">Mark as Important</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                name="isFavorite"
                                type="checkbox"
                                defaultChecked={material?.isFavorite}
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                            />
                            <span className="text-small">Add to Favorites</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-body font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition"
                        >
                            {isPending ? "Saving..." : isEditing ? "Update Material" : "Save Material"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
