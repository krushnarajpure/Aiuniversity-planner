"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Trash2, BookOpen, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { StudyMaterial } from "@prisma/client";
import { StudyMaterialCard } from "./study-material-card";
import { StudyMaterialModal } from "./study-material-modal";
import { QuickNoteModal } from "./quick-note-modal";
import { MaterialPreview } from "./material-preview";
import { MaterialTrash } from "./material-trash";
import { EmptyState } from "@/components/ui/empty-state";
import { deleteStudyMaterial } from "@/actions/study-material";

export function StudyMaterialClient({
    initialMaterials,
    subjects,
    stats,
}: {
    initialMaterials: StudyMaterial[];
    subjects: string[];
    stats: {
        total: number;
        notes: number;
        pdfs: number;
        images: number;
        documents: number;
        links: number;
        important: number;
        favorites: number;
    };
}) {
    const [materials, setMaterials] = useState(initialMaterials);
    const [search, setSearch] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("all");
    const [selectedUnit, setSelectedUnit] = useState("all");
    const [selectedType, setSelectedType] = useState("all");
    const [showImportant, setShowImportant] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "a-z" | "recent-viewed">("newest");
    const [modalOpen, setModalOpen] = useState(false);
    const [quickNoteModalOpen, setQuickNoteModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
    const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
    const [showTrash, setShowTrash] = useState(false);
    const [activeView, setActiveView] = useState<"all" | "continue" | "recent">("all");

    const filtered = useMemo(() => {
        let result = materials;

        // Search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (m) =>
                    m.materialName.toLowerCase().includes(q) ||
                    m.subject.toLowerCase().includes(q) ||
                    m.unit.toLowerCase().includes(q) ||
                    m.description?.toLowerCase().includes(q) ||
                    m.tags?.some((t) => t.toLowerCase().includes(q))
            );
        }

        // Filters
        if (selectedSubject !== "all") {
            result = result.filter((m) => m.subject === selectedSubject);
        }
        if (selectedUnit !== "all") {
            result = result.filter((m) => m.unit === selectedUnit);
        }
        if (selectedType !== "all") {
            result = result.filter((m) => m.type === selectedType);
        }
        if (showImportant) {
            result = result.filter((m) => m.isImportant);
        }
        if (showFavorites) {
            result = result.filter((m) => m.isFavorite);
        }

        // Sorting
        if (sortBy === "newest") {
            result = [...result].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } else if (sortBy === "oldest") {
            result = [...result].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        } else if (sortBy === "a-z") {
            result = [...result].sort((a, b) => a.materialName.localeCompare(b.materialName));
        } else if (sortBy === "recent-viewed") {
            result = [...result].sort((a, b) => {
                if (!a.lastViewedAt) return 1;
                if (!b.lastViewedAt) return -1;
                return b.lastViewedAt.getTime() - a.lastViewedAt.getTime();
            });
        }

        return result;
    }, [materials, search, selectedSubject, selectedUnit, selectedType, showImportant, showFavorites, sortBy]);

    function openAdd() {
        setEditingMaterial(null);
        setModalOpen(true);
    }

    function openEdit(material: StudyMaterial) {
        setEditingMaterial(material);
        setModalOpen(true);
    }

    function openPreview(material: StudyMaterial) {
        const viewedAt = new Date();
        setMaterials((current) => current.map((item) => (
            item.id === material.id ? { ...item, lastViewedAt: viewedAt } : item
        )));
        setPreviewMaterial({ ...material, lastViewedAt: viewedAt });
    }

    async function handleDelete(material: StudyMaterial) {
        const confirmed = window.confirm(`Delete "${material.materialName}"? It will be moved to trash.`);
        if (!confirmed) return;

        const previous = materials;
        setMaterials((m) => m.filter((x) => x.id !== material.id));

        try {
            await deleteStudyMaterial(material.id);
            toast.success("Material moved to trash");
        } catch {
            setMaterials(previous);
            toast.error("Failed to delete material");
        }
    }

    function handleModalClose() {
        setModalOpen(false);
        window.location.reload();
    }

    function handleQuickNoteClose() {
        setQuickNoteModalOpen(false);
        window.location.reload();
    }

    // Calculate subject-aware statistics
    const subjectStats = useMemo(() => {
        const subjectFiltered = selectedSubject !== "all" 
            ? materials.filter((m) => m.subject === selectedSubject)
            : materials;
        
        return {
            total: subjectFiltered.length,
            notes: subjectFiltered.filter((m) => m.type === "NOTES").length,
            pdfs: subjectFiltered.filter((m) => m.type === "PDF").length,
            images: subjectFiltered.filter((m) => m.type === "IMAGE").length,
            documents: subjectFiltered.filter((m) => m.type === "DOCUMENT").length,
            links: subjectFiltered.filter((m) => m.type === "LINK").length,
            important: subjectFiltered.filter((m) => m.isImportant).length,
            favorites: subjectFiltered.filter((m) => m.isFavorite).length,
        };
    }, [materials, selectedSubject]);

    // Get recently viewed for current subject
    const recentlyViewed = useMemo(() => {
        let result = materials
            .filter((m) => m.lastViewedAt !== null)
            .sort((a, b) => (b.lastViewedAt?.getTime() || 0) - (a.lastViewedAt?.getTime() || 0));
        
        // Filter by selected subject if applicable
        if (selectedSubject !== "all") {
            result = result.filter((m) => m.subject === selectedSubject);
        }
        
        return result.slice(0, 5);
    }, [materials, selectedSubject]);

    // Get the last opened material for "Continue Studying"
    const lastOpenedMaterial = useMemo(() => {
        const lastViewed = materials
            .filter((m) => m.lastViewedAt !== null)
            .sort((a, b) => (b.lastViewedAt?.getTime() || 0) - (a.lastViewedAt?.getTime() || 0))
            [0];
        
        // Only show if it matches the current subject filter
        if (selectedSubject !== "all") {
            return lastViewed?.subject === selectedSubject ? lastViewed : null;
        }
        return lastViewed || null;
    }, [materials, selectedSubject]);

    if (showTrash) {
        return (
            <MaterialTrash
                onBack={() => setShowTrash(false)}
            />
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-subheading font-semibold mb-2">Study Material</h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Organize your notes, PDFs, documents and study resources in one place.
                </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <div className="card text-center">
                    <div className="text-3xl font-bold text-primary">{subjectStats.total}</div>
                    <div className="text-small text-slate-500 dark:text-slate-400">Total Materials</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl font-bold text-blue-500">{subjectStats.notes}</div>
                    <div className="text-small text-slate-500 dark:text-slate-400">Notes</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl font-bold text-red-500">{subjectStats.pdfs}</div>
                    <div className="text-small text-slate-500 dark:text-slate-400">PDFs</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl font-bold text-amber-500">{subjectStats.important}</div>
                    <div className="text-small text-slate-500 dark:text-slate-400">Important</div>
                </div>
                <div className="card text-center">
                    <div className="text-3xl font-bold text-amber-400">{subjectStats.favorites}</div>
                    <div className="text-small text-slate-500 dark:text-slate-400">Favorites</div>
                </div>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search materials..."
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-body focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="flex gap-2 flex-shrink-0">
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition whitespace-nowrap text-small"
                    >
                        <Plus className="w-4 h-4" />
                        Add Material
                    </button>
                    <button
                        onClick={() => setQuickNoteModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:opacity-90 transition whitespace-nowrap text-small"
                    >
                        <Plus className="w-4 h-4" />
                        Quick Note
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-small focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">All Subjects</option>
                    {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                            {subject}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-small focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">All Units</option>
                    {["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5"].map((unit) => (
                        <option key={unit} value={unit}>
                            {unit}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-small focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">All Types</option>
                    <option value="NOTES">Notes</option>
                    <option value="PDF">PDF</option>
                    <option value="IMAGE">Image</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="LINK">Link</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-small focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="a-z">A–Z</option>
                    <option value="recent-viewed">Recently Viewed</option>
                </select>

                <button
                    onClick={() => setShowImportant(!showImportant)}
                    className={`px-3 py-2 rounded-lg text-small font-medium transition ${showImportant
                            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                >
                    ⭐ Important
                </button>

                <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`px-3 py-2 rounded-lg text-small font-medium transition ${showFavorites
                            ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                        }`}
                >
                    ♥ Favorites
                </button>

                <button
                    onClick={() => setShowTrash(true)}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-small font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
                >
                    <Trash2 className="w-4 h-4" />
                    Trash
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Study material views">
                {([
                    ["all", `All Materials (${filtered.length})`],
                    ["continue", "Continue Studying"],
                    ["recent", `Recently Viewed (${recentlyViewed.length})`],
                ] as const).map(([view, label]) => (
                    <button
                        key={view}
                        type="button"
                        role="tab"
                        aria-selected={activeView === view}
                        onClick={() => setActiveView(view)}
                        className={`px-4 py-2 rounded-lg text-small font-medium transition ${activeView === view
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeView === "continue" && (
                <div className="mb-8">
                    <h2 className="text-card-title font-semibold mb-4">Continue Studying</h2>
                    {lastOpenedMaterial ? (
                        <div className="max-w-sm">
                            <StudyMaterialCard
                                material={lastOpenedMaterial}
                                onEdit={() => openEdit(lastOpenedMaterial)}
                                onDelete={() => handleDelete(lastOpenedMaterial)}
                                onPreview={() => openPreview(lastOpenedMaterial)}
                            />
                        </div>
                    ) : (
                        <EmptyState
                            icon={BookOpen}
                            title="Nothing to continue yet"
                            subtitle="Open a material and it will appear here for quick access."
                            actionLabel="Browse All Materials"
                            onAction={() => setActiveView("all")}
                        />
                    )}
                </div>
            )}

            {activeView === "recent" && (
                <div className="mb-8">
                    <h2 className="text-card-title font-semibold mb-4">
                        Recently Viewed {selectedSubject !== "all" && `(${selectedSubject})`}
                    </h2>
                    {recentlyViewed.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentlyViewed.map((material) => (
                                <StudyMaterialCard
                                    key={material.id}
                                    material={material}
                                    onEdit={() => openEdit(material)}
                                    onDelete={() => handleDelete(material)}
                                    onPreview={() => openPreview(material)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={BookOpen}
                            title="No recently viewed materials"
                            subtitle="Open any material to build your recent study list."
                            actionLabel="Browse All Materials"
                            onAction={() => setActiveView("all")}
                        />
                    )}
                </div>
            )}

            {activeView === "all" && (filtered.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title={
                        materials.length === 0 
                            ? "No study materials yet"
                            : selectedSubject !== "all"
                            ? `No study materials for ${selectedSubject} yet`
                            : "No materials match your search"
                    }
                    subtitle={
                        selectedSubject !== "all"
                            ? `Add your first material for ${selectedSubject}.`
                            : "Add your notes, PDFs, images and resources to start building your study library."
                    }
                    actionLabel="+ Add Material"
                    onAction={openAdd}
                />
            ) : (
                <>
                    <h2 className="text-card-title font-semibold mb-4">
                        {selectedSubject !== "all" ? selectedSubject : "All Materials"} ({filtered.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((material) => (
                            <StudyMaterialCard
                                key={material.id}
                                material={material}
                                onEdit={() => openEdit(material)}
                                onDelete={() => handleDelete(material)}
                                onPreview={() => openPreview(material)}
                            />
                        ))}
                    </div>
                </>
            ))}

            {/* Modals */}
            <StudyMaterialModal
                open={modalOpen}
                onClose={handleModalClose}
                material={editingMaterial}
            />

            <QuickNoteModal
                open={quickNoteModalOpen}
                onClose={handleQuickNoteClose}
            />

            {previewMaterial && (
                <MaterialPreview
                    material={previewMaterial}
                    onClose={() => setPreviewMaterial(null)}
                />
            )}
        </div>
    );
}
