"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { jsPDF } from "jspdf";
import {
    BookOpen,
    BriefcaseBusiness,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Code2,
    Download,
    FileText,
    Github,
    Globe,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Plus,
    Rocket,
    Save,
    Sparkles,
    Star,
    Trash2,
} from "lucide-react";

const storageKey = "ai-university-planner-resume-builder";

const steps = [
    { key: "personal", label: "Personal" },
    { key: "education", label: "Education" },
    { key: "experience", label: "Experience" },
    { key: "projects", label: "Projects" },
    { key: "skills", label: "Skills" },
    { key: "finalize", label: "Finalize" },
] as const;

type StepKey = (typeof steps)[number]["key"];

type EducationEntry = {
    id: string;
    degree: string;
    institution: string;
    year: string;
    score: string;
    board: string;
};

type ExperienceEntry = {
    id: string;
    role: string;
    company: string;
    duration: string;
    location: string;
    description: string;
};

type ProjectEntry = {
    id: string;
    name: string;
    tech: string;
    link: string;
    description: string;
};

type ResumeForm = {
    name: string;
    email: string;
    phone: string;
    city: string;
    linkedin: string;
    github: string;
    website: string;
    summary: string;
    achievements: string;
    skills: string[];
    education: EducationEntry[];
    experience: ExperienceEntry[];
    projects: ProjectEntry[];
    template: "modern" | "classic" | "minimal";
};

const createId = () => Math.random().toString(36).slice(2, 9);

const defaultResume: ResumeForm = {
    name: "vishal chavan",
    email: "krushnarajpure93@gmail.com",
    phone: "+91 9876543210",
    city: "Nagpur, Maharashtra",
    linkedin: "linkedin.com/in/rahul",
    github: "github.com/rahul",
    website: "rahulverma.dev",
    summary:
        "Motivated B.Tech CS student with strong Python and React skills. Built 3 production apps with 500+ daily users. Completed SDE internship at XYZ reducing load time by 40%.",
    achievements: "AWS Certified Developer • Associate (2024)\nRanked 3rd in Hackathon 2024",
    skills: ["Python", "React", "Next.js", "TypeScript", "SQL", "Node.js"],
    education: [
        {
            id: createId(),
            degree: "B.Tech - CSE",
            institution: "RTM Nagpur University",
            year: "2025 (Expected)",
            score: "CGPA: 0.00",
            board: "RTM Nagpur University",
        },
    ],
    experience: [],
    projects: [],
    template: "modern",
};

const quickSkillOptions = [
    "Python",
    "Java",
    "C++",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "SQL",
    "MongoDB",
    "Tailwind",
    "Git",
    "Docker",
    "Kubernetes",
    "AWS",
    "ML",
    "UI/UX",
];

const templates = [
    { id: "modern", label: "Modern" },
    { id: "classic", label: "Classic" },
    { id: "minimal", label: "Minimal" },
] as const;

export function ResumeBuilderClient() {
    const { data: session } = useSession();
    const [step, setStep] = useState<number>(0);
    const [resume, setResume] = useState<ResumeForm>(defaultResume);
    const [status, setStatus] = useState("Draft saved locally");

    useEffect(() => {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as ResumeForm;
                setResume({ ...defaultResume, ...parsed, skills: parsed.skills?.length ? parsed.skills : defaultResume.skills });
            } catch {
                setResume(defaultResume);
            }
        } else {
            // Initialize with user's session data if available
            if (session?.user?.name || session?.user?.email) {
                setResume((current) => ({
                    ...current,
                    name: session.user.name || current.name,
                    email: session.user.email || current.email,
                }));
            }
        }
    }, [session]);

    useEffect(() => {
        window.localStorage.setItem(storageKey, JSON.stringify(resume));
    }, [resume]);

    const currentStep = steps[step];

    const atsPercent = useMemo(() => {
        const checks = [
            !!resume.name,
            !!resume.email,
            !!resume.phone,
            !!resume.linkedin,
            !!resume.github,
            !!resume.summary,
            resume.education.length > 0,
            resume.skills.length > 0,
            resume.projects.length > 0,
            !!resume.achievements,
        ];
        const completed = checks.filter(Boolean).length;
        return Math.min(100, Math.round((completed / checks.length) * 100));
    }, [resume]);

    const updateField = <K extends keyof ResumeForm>(key: K, value: ResumeForm[K]) => {
        setResume((current) => ({ ...current, [key]: value }));
    };

    const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
        setResume((current) => ({
            ...current,
            education: current.education.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
        }));
    };

    const updateExperience = (id: string, field: keyof ExperienceEntry, value: string) => {
        setResume((current) => ({
            ...current,
            experience: current.experience.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
        }));
    };

    const updateProject = (id: string, field: keyof ProjectEntry, value: string) => {
        setResume((current) => ({
            ...current,
            projects: current.projects.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
        }));
    };

    const addEducation = () => {
        setResume((current) => ({
            ...current,
            education: [
                ...current.education,
                { id: createId(), degree: "", institution: "", year: "", score: "", board: "" },
            ],
        }));
    };

    const addExperience = () => {
        setResume((current) => ({
            ...current,
            experience: [
                ...current.experience,
                { id: createId(), role: "", company: "", duration: "", location: "", description: "" },
            ],
        }));
    };

    const addProject = () => {
        setResume((current) => ({
            ...current,
            projects: [
                ...current.projects,
                { id: createId(), name: "", tech: "", link: "", description: "" },
            ],
        }));
    };

    const removeEducation = (id: string) => {
        setResume((current) => ({ ...current, education: current.education.filter((entry) => entry.id !== id) }));
    };

    const removeExperience = (id: string) => {
        setResume((current) => ({ ...current, experience: current.experience.filter((entry) => entry.id !== id) }));
    };

    const removeProject = (id: string) => {
        setResume((current) => ({ ...current, projects: current.projects.filter((entry) => entry.id !== id) }));
    };

    const addSkill = (skill: string) => {
        const normalized = skill.trim();
        if (!normalized) return;
        setResume((current) => ({
            ...current,
            skills: current.skills.includes(normalized) ? current.skills : [...current.skills, normalized],
        }));
    };

    const removeSkill = (skill: string) => {
        setResume((current) => ({ ...current, skills: current.skills.filter((item) => item !== skill) }));
    };

    const goNext = () => setStep((value) => Math.min(value + 1, steps.length - 1));
    const goBack = () => setStep((value) => Math.max(value - 1, 0));

    const downloadPdf = () => {
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const width = doc.internal.pageSize.getWidth();
        const margin = 40;
        let y = 48;

        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, width, 92, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.text(resume.name || "Your Name", margin, 40);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const contact = [resume.email, resume.phone, resume.city].filter(Boolean).join("    •    ");
        doc.text(contact, margin, 62);

        const social = [resume.linkedin, resume.github, resume.website].filter(Boolean).join("    •    ");
        doc.text(social, margin, 78);

        y = 120;
        doc.setTextColor(17, 24, 39);

        if (resume.summary) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("SUMMARY", margin, y);
            y += 18;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(resume.summary, width - margin * 2);
            doc.text(lines, margin, y);
            y += lines.length * 12 + 18;
        }

        if (resume.education.length) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text("EDUCATION", margin, y);
            y += 18;
            resume.education.forEach((entry) => {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.text(entry.degree || "Degree", margin, y);
                y += 14;
                doc.setFont("helvetica", "normal");
                doc.text(`${entry.institution || "Institution"} | ${entry.year || "Year"}`, margin, y);
                y += 14;
                if (entry.score) doc.text(entry.score, margin, y);
                y += 16;
            });
        }

        doc.save(`${(resume.name || "resume").toLowerCase().replace(/\s+/g, "-")}.pdf`);
        setStatus("PDF downloaded successfully");
    };

    const renderStepPanel = () => {
        switch (currentStep.key) {
            case "personal":
                return (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600"><FileText className="h-5 w-5" /></div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">Personal Information</h3>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 text-sm text-slate-700">
                                <span>Full Name *</span>
                                <input value={resume.name} onChange={(e) => updateField("name", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                                <span>Email *</span>
                                <input value={resume.email} onChange={(e) => updateField("email", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                                <span>Phone Number *</span>
                                <input value={resume.phone} onChange={(e) => updateField("phone", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                                <span>City / Location</span>
                                <input value={resume.city} onChange={(e) => updateField("city", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                                <span>LinkedIn URL</span>
                                <input value={resume.linkedin} onChange={(e) => updateField("linkedin", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700">
                                <span>GitHub URL</span>
                                <input value={resume.github} onChange={(e) => updateField("github", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
                                <span>Portfolio / Website</span>
                                <input value={resume.website} onChange={(e) => updateField("website", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                            </label>
                        </div>
                        <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700">
                            Add LinkedIn + GitHub to boost ATS score by 15 points. Recruiters verify profiles before shortlisting.
                        </div>
                    </section>
                );
            case "education":
                return (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><BookOpen className="h-5 w-5" /></div>
                                <h3 className="text-xl font-semibold text-slate-900">Education</h3>
                            </div>
                            <button type="button" onClick={addEducation} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                                <Plus className="h-4 w-4" /> Add Entry
                            </button>
                        </div>

                        <div className="space-y-4">
                            {resume.education.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                                    No education added yet.
                                </div>
                            ) : (
                                resume.education.map((entry, index) => (
                                    <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Entry {index + 1}</span>
                                            {resume.education.length > 1 && (
                                                <button type="button" onClick={() => removeEducation(entry.id)} className="inline-flex items-center gap-1 text-xs text-red-600">
                                                    <Trash2 className="h-3.5 w-3.5" /> Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <label className="space-y-2 text-sm text-slate-700">
                                                <span>Degree / Course *</span>
                                                <input value={entry.degree} onChange={(e) => updateEducation(entry.id, "degree", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
                                            </label>
                                            <label className="space-y-2 text-sm text-slate-700">
                                                <span>Institution *</span>
                                                <input value={entry.institution} onChange={(e) => updateEducation(entry.id, "institution", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
                                            </label>
                                            <label className="space-y-2 text-sm text-slate-700">
                                                <span>Passing Year</span>
                                                <input value={entry.year} onChange={(e) => updateEducation(entry.id, "year", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
                                            </label>
                                            <label className="space-y-2 text-sm text-slate-700">
                                                <span>CGPA / Percentage</span>
                                                <input value={entry.score} onChange={(e) => updateEducation(entry.id, "score", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
                                            </label>
                                            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
                                                <span>Board / University</span>
                                                <input value={entry.board} onChange={(e) => updateEducation(entry.id, "board", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" />
                                            </label>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                );
            case "experience":
                return (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><BriefcaseBusiness className="h-5 w-5" /></div>
                                <h3 className="text-xl font-semibold text-slate-900">Work Experience</h3>
                            </div>
                            <button type="button" onClick={addExperience} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                                <Plus className="h-4 w-4" /> Add Experience
                            </button>
                        </div>
                        {resume.experience.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600"><BriefcaseBusiness className="h-7 w-7" /></div>
                                <p className="text-lg font-semibold text-slate-700">No experience added yet</p>
                                <p className="mt-2 text-sm text-slate-500">Add internships, part-time roles, or freelance projects.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {resume.experience.map((entry, index) => (
                                    <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Role {index + 1}</span>
                                            {resume.experience.length > 1 && (
                                                <button type="button" onClick={() => removeExperience(entry.id)} className="inline-flex items-center gap-1 text-xs text-red-600">
                                                    <Trash2 className="h-3.5 w-3.5" /> Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <label className="space-y-2 text-sm text-slate-700"><span>Role</span><input value={entry.role} onChange={(e) => updateExperience(entry.id, "role", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>
                                            <label className="space-y-2 text-sm text-slate-700"><span>Company</span><input value={entry.company} onChange={(e) => updateExperience(entry.id, "company", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>
                                            <label className="space-y-2 text-sm text-slate-700"><span>Duration</span><input value={entry.duration} onChange={(e) => updateExperience(entry.id, "duration", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>
                                            <label className="space-y-2 text-sm text-slate-700"><span>Location</span><input value={entry.location} onChange={(e) => updateExperience(entry.id, "location", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>
                                            <label className="space-y-2 text-sm text-slate-700 md:col-span-2"><span>Description</span><textarea value={entry.description} onChange={(e) => updateExperience(entry.id, "description", e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700">
                            Use bullet points starting with strong verbs. Quantify impact with numbers.</div>
                    </section>
                );
            case "projects":
                return (
                    <section className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><Rocket className="h-5 w-5" /></div>
                                <h3 className="text-xl font-semibold text-slate-900">Projects</h3>
                            </div>
                            <button type="button" onClick={addProject} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                                <Plus className="h-4 w-4" /> Add Project
                            </button>
                        </div>
                        {resume.projects.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600"><Rocket className="h-7 w-7" /></div>
                                <p className="text-lg font-semibold text-slate-700">No projects added yet</p>
                                <p className="mt-2 text-sm text-slate-500">Projects are your #1 asset as a fresher — add at least 2.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {resume.projects.map((entry, index) => (
                                    <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Project {index + 1}</span>
                                            {resume.projects.length > 1 && (
                                                <button type="button" onClick={() => removeProject(entry.id)} className="inline-flex items-center gap-1 text-xs text-red-600">
                                                    <Trash2 className="h-3.5 w-3.5" /> Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <label className="space-y-2 text-sm text-slate-700 md:col-span-2"><span>Project Name</span><input value={entry.name} onChange={(e) => updateProject(entry.id, "name", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>
                                            <label className="space-y-2 text-sm text-slate-700"><span>Technologies</span><input value={entry.tech} onChange={(e) => updateProject(entry.id, "tech", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>
                                            <label className="space-y-2 text-sm text-slate-700"><span>Project URL</span><input value={entry.link} onChange={(e) => updateProject(entry.id, "link", e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>
                                            <label className="space-y-2 text-sm text-slate-700 md:col-span-2"><span>Description</span><textarea value={entry.description} onChange={(e) => updateProject(entry.id, "description", e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" /></label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                );
            case "skills":
                return (
                    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600"><Code2 className="h-5 w-5" /></div>
                            <h3 className="text-xl font-semibold text-slate-900">Technical Skills</h3>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <label className="block text-sm text-slate-700">Skills (Enter or comma to add)</label>
                            <input value={resume.skills.join(", ")} onChange={(e) => updateField("skills", e.target.value.split(",").map((value) => value.trim()).filter(Boolean))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm" placeholder="Python, React, SQL..." />
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-3 text-sm font-medium text-slate-700">Quick add</p>
                            <div className="flex flex-wrap gap-2">
                                {quickSkillOptions.map((skill) => (
                                    <button key={skill} type="button" onClick={() => addSkill(skill)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-violet-300 hover:text-violet-700">
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-3 text-sm font-medium text-slate-700">Selected skills</p>
                            <div className="flex flex-wrap gap-2">
                                {resume.skills.length === 0 ? (
                                    <span className="text-sm text-slate-500">No skills selected yet.</span>
                                ) : (
                                    resume.skills.map((skill) => (
                                        <button key={skill} type="button" onClick={() => removeSkill(skill)} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
                                            {skill} ×
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </section>
                );
            case "finalize":
                return (
                    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600"><Sparkles className="h-5 w-5" /></div>
                            <h3 className="text-xl font-semibold text-slate-900">Template & Color</h3>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {templates.map((template) => (
                                <button
                                    type="button"
                                    key={template.id}
                                    onClick={() => updateField("template", template.id)}
                                    className={`rounded-2xl border p-3 text-left transition ${resume.template === template.id ? "border-violet-500 bg-violet-50" : "border-slate-200 bg-slate-50"}`}
                                >
                                    <div className="h-16 rounded-xl bg-gradient-to-r from-violet-400 to-blue-500" />
                                    <div className="mt-3 text-sm font-medium text-slate-700">{template.label}</div>
                                </button>
                            ))}
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <h4 className="mb-3 text-sm font-semibold text-slate-800">Resume Checklist</h4>
                            <div className="space-y-2 text-sm text-slate-700">
                                {["Contact info complete", "LinkedIn profile", "GitHub link", "Education details filled", "CGPA / marks included", "Work experience added", "2+ projects listed", "Technical skills covered", "Professional summary written"].map((item) => (
                                    <div key={item} className="flex items-center gap-2">
                                        <CheckCircle2 className={`h-4 w-4 ${item ? "text-emerald-600" : "text-slate-300"}`} />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-violet-200 bg-violet-50 p-5 text-center">
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600"><Sparkles className="h-6 w-6" /></div>
                            <p className="text-xl font-semibold text-slate-800">Your resume is ready!</p>
                            <p className="mt-2 text-sm text-slate-600">Preview on the right, download as PDF, or edit and save.</p>
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    const previewLabel = resume.template === "classic" ? "Classic" : resume.template === "minimal" ? "Minimal" : "Modern";

    return (
        <div className="space-y-6 p-6">
            <div className="mb-4">
                <h1 className="text-3xl font-semibold text-slate-900">Resume Builder</h1>
                <p className="mt-1 text-sm text-slate-500">Build an ATS-optimized resume with live preview & 3 professional templates</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">ATS Score</span>
                    <div className="text-right">
                        <div className="text-3xl font-black text-violet-600">{atsPercent}%</div>
                        <div className="text-[10px] text-slate-500">Needs Work</div>
                    </div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500" style={{ width: `${atsPercent}%` }} />
                </div>
                <div className="mt-4 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                    {[
                        "Full name (+5)",
                        "Phone number (+5)",
                        "GitHub profile (+7)",
                        "Education filled (+8)",
                        "Email address (+5)",
                        "LinkedIn profile (+8)",
                        "Summary (60+ chars) (+10)",
                        "CGPA / marks (+5)",
                    ].map((item) => (
                        <div key={item} className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                    {steps.map((item, index) => {
                        const active = index === step;
                        const done = index < step;
                        return (
                            <div key={item.key} className="flex grow items-center gap-2">
                                <button type="button" onClick={() => setStep(index)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${active ? "border-violet-500 bg-violet-50 text-violet-700" : done ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${active ? "bg-violet-600 text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-700"}`}>{done ? "✓" : index + 1}</span>
                                    {item.label}
                                </button>
                                {index < steps.length - 1 && <span className="h-px w-3 bg-slate-200" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
                <div className="space-y-5">
                    {renderStepPanel()}

                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                        <button type="button" onClick={goBack} disabled={step === 0} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
                            <ChevronLeft className="h-4 w-4" /> Back
                        </button>
                        <button type="button" onClick={step === steps.length - 1 ? downloadPdf : goNext} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm">
                            {step === steps.length - 1 ? <Download className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {step === steps.length - 1 ? "Download PDF" : "Next"}
                        </button>
                    </div>
                </div>

                <aside className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <button type="button" className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">Preview</button>
                        <button type="button" className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700">Design</button>
                        <button type="button" onClick={downloadPdf} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white">
                            <Download className="h-3.5 w-3.5" /> Download PDF
                        </button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-5 text-center text-white">
                            <h3 className="text-2xl font-bold tracking-tight">{resume.name || "Your Name"}</h3>
                            <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-blue-100">
                                <Mail className="h-3 w-3" />
                                <span>{resume.email || "your.email@example.com"}</span>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 text-slate-700">
                            {resume.summary && (
                                <div>
                                    <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Summary</h4>
                                    <p className="text-[12px] leading-5">{resume.summary}</p>
                                </div>
                            )}

                            {resume.education.length > 0 && (
                                <div>
                                    <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Education</h4>
                                    {resume.education.map((entry) => (
                                        <div key={entry.id} className="mb-2">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="text-[12px] font-semibold text-slate-800">{entry.degree || "B.Tech - CSE"}</p>
                                                    <p className="text-[11px] text-slate-600">{entry.institution || "RTM Nagpur University"}</p>
                                                </div>
                                                <span className="text-[10px] text-slate-500">{entry.year || "2025"}</span>
                                            </div>
                                            <p className="mt-1 text-[11px] text-slate-600">{entry.score || "CGPA: 0.00"}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {resume.skills.length > 0 && (
                                <div>
                                    <h4 className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {resume.skills.slice(0, 8).map((skill) => (
                                            <span key={skill} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-700">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
