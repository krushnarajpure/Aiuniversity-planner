"use client";

import { useActionState, useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createQuickNote, type StudyMaterialState } from "@/actions/study-material";

const initialState: StudyMaterialState = { success: false, message: "" };

export function QuickNoteModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [state, formAction, isPending] = useActionState(createQuickNote, initialState);
    const [tags, setTags] = useState("");

    useEffect(() => {
        if (state.message && state.success) {
            toast.success(state.message);
            onClose();
        } else if (state.message && !state.success) {
            toast.error(state.message);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4 py-6 overflow-y-auto">
            <div className="card w-full max-w-lg relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-card-title font-semibold mb-6">Quick Note</h2>

                <form action={formAction} className="space-y-4">
                    {/* Note Title */}
                    <div>
                        <label className="text-small font-medium block mb-1">Note Title *</label>
                        <input
                            name="materialName"
                            required
                            placeholder="e.g., CSS Flexbox Quick Notes"
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

                    {/* Notes Content */}
                    <div>
                        <label className="text-small font-medium block mb-1">Note Content *</label>
                        <textarea
                            name="notesContent"
                            required
                            placeholder="Write your quick note here..."
                            rows={5}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                        {state.errors?.notesContent && (
                            <p className="text-danger text-small mt-1">{state.errors.notesContent[0]}</p>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-small font-medium block mb-1">Tags (comma-separated)</label>
                        <input
                            name="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., Quick, Important, Revision"
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent px-3 py-2 text-body focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                name="isImportant"
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600"
                            />
                            <span className="text-small">Mark as Important</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                name="isFavorite"
                                type="checkbox"
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
                            {isPending ? "Saving..." : "Save Note"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
