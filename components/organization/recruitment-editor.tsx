"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Organization = {
  companyName: string;
  description: string | null;
  website: string | null;
  industry: string | null;
  location?: string | null;
  recruiterName?: string | null;
  phone?: string | null;
};

type RecruitmentForm = {
  recruitmentTitle: string;
  title: string;
  jobCode: string;
  department: string;
  employmentType: string;
  workMode: string;
  location: string;
  openings: string;
  applicationStartDate: string;
  applicationDeadline: string;
  expectedJoiningDate: string;
  jobSummary: string;
  description: string;
  requiredQualifications: string;
  preferredQualifications: string;
  requiredSkills: string;
  preferredSkills: string;
  minCgpa: string;
  maxCgpa: string;
  graduationYear: string;
  backlogsAllowed: boolean;
  maxBacklogs: string;
  experienceRequirement: string;
  salaryRange: string;
  benefits: string;
};

type Round = { name: string; type: string; mode: string; duration: string; required: boolean };
type Question = { label: string; type: string; required: boolean; description: string; options: string };
type DocumentRequirement = { name: string; fileTypes: string; required: boolean };

const steps = ["Recruitment", "Role & eligibility", "Process & form", "Review & publish"];
const initialForm: RecruitmentForm = {
  recruitmentTitle: "", title: "", jobCode: "", department: "", employmentType: "Full Time", workMode: "On-site", location: "", openings: "1",
  applicationStartDate: "", applicationDeadline: "", expectedJoiningDate: "", jobSummary: "", description: "", requiredQualifications: "",
  preferredQualifications: "", requiredSkills: "", preferredSkills: "", minCgpa: "", maxCgpa: "", graduationYear: "", backlogsAllowed: false,
  maxBacklogs: "0", experienceRequirement: "Freshers eligible", salaryRange: "", benefits: "",
};

export function RecruitmentEditor({ organization }: { organization: Organization | null }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [rounds, setRounds] = useState<Round[]>([{ name: "Application screening", type: "Screening", mode: "Online", duration: "", required: true }]);
  const [sections, setSections] = useState<string[]>(["Personal information", "Academic information", "Resume and documents", "Company questions", "Declaration"]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [documents, setDocuments] = useState<DocumentRequirement[]>([{ name: "Latest resume", fileTypes: "PDF, DOC, DOCX", required: true }]);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof RecruitmentForm, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const addQuestion = () => setQuestions((current) => [...current, { label: "", type: "Short Text", required: true, description: "", options: "" }]);
  const addRound = () => setRounds((current) => [...current, { name: "", type: "Technical interview", mode: "Online", duration: "", required: true }]);
  const addSection = () => setSections((current) => [...current, `Section ${current.length + 1}`]);

  async function save(status: "DRAFT" | "PUBLISHED") {
    if (!form.title || !form.description || !form.location || !form.applicationDeadline) {
      toast.error("Complete the required recruitment fields before saving.");
      setStep(0);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/organization/job", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title,
          description: `${form.jobSummary}\n\n${form.description}\n\nRequired qualifications: ${form.requiredQualifications}`,
          requiredSkills: form.requiredSkills.split(",").map((item) => item.trim()).filter(Boolean),
          preferredSkills: form.preferredSkills.split(",").map((item) => item.trim()).filter(Boolean),
          minCgpa: form.minCgpa ? Number(form.minCgpa) : null,
          maxCgpa: form.maxCgpa ? Number(form.maxCgpa) : null,
          openings: Number(form.openings),
          jobType: form.employmentType,
          salaryRange: form.salaryRange || null,
          applicationStartDate: form.applicationStartDate ? new Date(form.applicationStartDate).toISOString() : null,
          applicationDeadline: new Date(form.applicationDeadline).toISOString(),
          expectedJoiningDate: form.expectedJoiningDate ? new Date(form.expectedJoiningDate).toISOString() : null,
          status,
          eligibility: { graduationYear: form.graduationYear, backlogsAllowed: form.backlogsAllowed, maxBacklogs: form.maxBacklogs, experience: form.experienceRequirement },
          benefits: form.benefits.split(",").map((item) => item.trim()).filter(Boolean),
          recruitmentRounds: rounds,
          applicationForm: { sections, questions, documents },
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to save recruitment.");
      toast.success(status === "PUBLISHED" ? "Recruitment published." : "Recruitment saved as draft.");
      setStep(3);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save recruitment.");
    } finally { setBusy(false); }
  }

  return <div className="max-w-5xl space-y-5">
    <div className="border-b border-slate-200 pb-4 dark:border-slate-700">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Recruitment opening</p>
      <h2 className="mt-1 text-xl font-semibold">Create a structured application</h2>
      <p className="mt-1 text-small text-slate-500">Save a draft while you configure the opening, then publish only after reviewing the student experience.</p>
    </div>
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">{steps.map((label, index) => <div key={label} className={`border-t-2 pt-3 text-small ${index <= step ? "border-primary text-primary" : "border-slate-200 text-slate-400 dark:border-slate-700"}`}><span className="font-semibold">0{index + 1}</span><span className="ml-2">{label}</span></div>)}</div>

    {step === 0 && <Section title="01 Recruitment details" description="Define the opening, schedule and workplace. Fields marked with * are required."><div className="grid gap-4 sm:grid-cols-2"><Field label="Recruitment title" value={form.recruitmentTitle} onChange={(v) => set("recruitmentTitle", v)} /><Field label="Job title *" value={form.title} onChange={(v) => set("title", v)} required /><Field label="Job code / reference" value={form.jobCode} onChange={(v) => set("jobCode", v)} /><Field label="Department" value={form.department} onChange={(v) => set("department", v)} /><Select label="Employment type" value={form.employmentType} onChange={(v) => set("employmentType", v)} options={["Full Time", "Part Time", "Internship", "Apprenticeship", "Contract", "Graduate Trainee"]} /><Select label="Work mode" value={form.workMode} onChange={(v) => set("workMode", v)} options={["On-site", "Hybrid", "Remote"]} /><Field label="Location *" value={form.location} onChange={(v) => set("location", v)} required /><Field label="Number of openings" type="number" value={form.openings} onChange={(v) => set("openings", v)} required /><Field label="Application start" type="datetime-local" value={form.applicationStartDate} onChange={(v) => set("applicationStartDate", v)} /><Field label="Application deadline *" type="datetime-local" value={form.applicationDeadline} onChange={(v) => set("applicationDeadline", v)} required /><Field label="Expected joining date" type="date" value={form.expectedJoiningDate} onChange={(v) => set("expectedJoiningDate", v)} /></div></Section>}

    {step === 1 && <><Section title="02 Company details" description="These details come from the authorized organization profile."><div className="grid gap-3 sm:grid-cols-2"><ReadOnly label="Company name" value={organization?.companyName} /><ReadOnly label="Industry" value={organization?.industry} /><ReadOnly label="Website" value={organization?.website} /><ReadOnly label="Recruiter / HR" value={organization?.recruiterName} /><ReadOnly label="Company location" value={organization?.location} /><ReadOnly label="HR phone" value={organization?.phone} /></div></Section><Section title="03 Role and eligibility" description="Keep eligibility relevant to this opening and avoid unnecessary restrictions."><div className="grid gap-4 sm:grid-cols-2"><Field label="Minimum CGPA" type="number" value={form.minCgpa} onChange={(v) => set("minCgpa", v)} /><Field label="Maximum CGPA" type="number" value={form.maxCgpa} onChange={(v) => set("maxCgpa", v)} /><Field label="Graduation year" value={form.graduationYear} onChange={(v) => set("graduationYear", v)} /><Field label="Experience requirement" value={form.experienceRequirement} onChange={(v) => set("experienceRequirement", v)} /><Field label="Required skills (comma separated)" value={form.requiredSkills} onChange={(v) => set("requiredSkills", v)} /><Field label="Preferred skills (comma separated)" value={form.preferredSkills} onChange={(v) => set("preferredSkills", v)} /></div><label className="mt-4 flex items-center gap-2 text-small"><input type="checkbox" checked={form.backlogsAllowed} onChange={(e) => set("backlogsAllowed", e.target.checked)} /> Backlogs allowed</label>{form.backlogsAllowed && <div className="mt-4 max-w-xs"><Field label="Maximum active backlogs" type="number" value={form.maxBacklogs} onChange={(v) => set("maxBacklogs", v)} /></div>}</Section><Section title="04 Job description and compensation"><div className="space-y-4"><TextArea label="Job summary" value={form.jobSummary} onChange={(v) => set("jobSummary", v)} /><TextArea label="Detailed description *" value={form.description} onChange={(v) => set("description", v)} required /><TextArea label="Required qualifications" value={form.requiredQualifications} onChange={(v) => set("requiredQualifications", v)} /><TextArea label="Preferred qualifications" value={form.preferredQualifications} onChange={(v) => set("preferredQualifications", v)} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Salary / compensation" value={form.salaryRange} onChange={(v) => set("salaryRange", v)} /><Field label="Benefits (comma separated)" value={form.benefits} onChange={(v) => set("benefits", v)} /></div></div></Section></>}

    {step === 2 && <><Section title="05 Recruitment process" description="Configure the stages students should expect."><div className="space-y-3">{rounds.map((round, index) => <div key={index} className="grid gap-2 border border-slate-200 p-3 sm:grid-cols-[1.4fr_1fr_1fr_0.7fr_auto] dark:border-slate-700"><input aria-label="Round name" value={round.name} onChange={(e) => setRounds((items) => items.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} className="field" placeholder="Round name" /><input aria-label="Round type" value={round.type} onChange={(e) => setRounds((items) => items.map((item, i) => i === index ? { ...item, type: e.target.value } : item))} className="field" placeholder="Round type" /><Select label="" value={round.mode} onChange={(v) => setRounds((items) => items.map((item, i) => i === index ? { ...item, mode: v } : item))} options={["Online", "Offline", "Hybrid"]} /><input aria-label="Duration" value={round.duration} onChange={(e) => setRounds((items) => items.map((item, i) => i === index ? { ...item, duration: e.target.value } : item))} className="field" placeholder="Duration" /><button type="button" title="Remove round" onClick={() => setRounds((items) => items.filter((_, i) => i !== index))} className="icon-button"><Trash2 className="h-4 w-4" /></button></div>)}</div><button type="button" onClick={addRound} className="action-secondary mt-3"><Plus className="h-4 w-4" /> Add round</button></Section><Section title="06 Application form builder" description="Students will see these sections and questions in the same order."><div className="space-y-2">{sections.map((section, index) => <div key={index} className="flex gap-2"><span className="w-8 pt-2 text-small font-semibold text-slate-400">{String(index + 1).padStart(2, "0")}</span><input value={section} onChange={(e) => setSections((items) => items.map((item, i) => i === index ? e.target.value : item))} className="field flex-1" /><button type="button" title="Remove section" onClick={() => setSections((items) => items.filter((_, i) => i !== index))} className="icon-button"><Trash2 className="h-4 w-4" /></button></div>)}</div><button type="button" onClick={addSection} className="action-secondary mt-3"><Plus className="h-4 w-4" /> Add section</button><div className="mt-5 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">{questions.map((question, index) => <div key={index} className="grid gap-2 border border-slate-200 p-3 sm:grid-cols-[1.5fr_1fr_1fr_auto] dark:border-slate-700"><input aria-label="Question label" value={question.label} onChange={(e) => setQuestions((items) => items.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} className="field" placeholder="Question label" /><Select label="" value={question.type} onChange={(v) => setQuestions((items) => items.map((item, i) => i === index ? { ...item, type: v } : item))} options={["Short Text", "Long Text", "Email", "Phone", "Number", "Date", "Dropdown", "Multi Select", "Yes / No", "URL", "File Upload", "Resume Upload"]} /><input aria-label="Question options" value={question.options} onChange={(e) => setQuestions((items) => items.map((item, i) => i === index ? { ...item, options: e.target.value } : item))} className="field" placeholder="Options, comma separated" /><button type="button" title="Remove question" onClick={() => setQuestions((items) => items.filter((_, i) => i !== index))} className="icon-button"><Trash2 className="h-4 w-4" /></button></div>)}</div><button type="button" onClick={addQuestion} className="action-secondary mt-3"><Plus className="h-4 w-4" /> Add question</button></Section><Section title="07 Document requirements"><div className="space-y-3">{documents.map((document, index) => <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]"><input aria-label="Document name" value={document.name} onChange={(e) => setDocuments((items) => items.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} className="field" /><input aria-label="Allowed file types" value={document.fileTypes} onChange={(e) => setDocuments((items) => items.map((item, i) => i === index ? { ...item, fileTypes: e.target.value } : item))} className="field" /><label className="flex items-center gap-2 text-small"><input type="checkbox" checked={document.required} onChange={(e) => setDocuments((items) => items.map((item, i) => i === index ? { ...item, required: e.target.checked } : item))} /> Required</label><button type="button" title="Remove document" onClick={() => setDocuments((items) => items.filter((_, i) => i !== index))} className="icon-button"><Trash2 className="h-4 w-4" /></button></div>)}</div><button type="button" onClick={() => setDocuments((items) => [...items, { name: "", fileTypes: "PDF", required: false }])} className="action-secondary mt-3"><Plus className="h-4 w-4" /> Add document</button></Section></>}

    {step === 3 && <Section title="08 Review and publish" description="Confirm the public opening before publishing it to students."><div className="grid gap-3 sm:grid-cols-2"><ReadOnly label="Recruitment" value={form.recruitmentTitle || form.title} /><ReadOnly label="Job code" value={form.jobCode} /><ReadOnly label="Deadline" value={form.applicationDeadline ? new Date(form.applicationDeadline).toLocaleString() : "Not set"} /><ReadOnly label="Openings" value={form.openings} /><ReadOnly label="Eligibility" value={form.minCgpa ? `CGPA ${form.minCgpa}+` : "No CGPA cutoff"} /><ReadOnly label="Application fee" value="No fee configured" /><ReadOnly label="Form sections" value={String(sections.length)} /><ReadOnly label="Required documents" value={String(documents.filter((item) => item.required).length)} /></div><div className="mt-5 border border-amber-200 bg-amber-50 p-4 text-small text-amber-900">Publishing makes this opening visible to eligible students. Payment is not enabled by this editor; no student will be charged.</div><div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => save("DRAFT")} className="action-secondary">Save draft</button><button type="button" disabled={busy} onClick={() => save("PUBLISHED")} className="action-primary">{busy ? "Saving..." : "Publish recruitment"}</button></div></Section>}

    {step > 0 && step < 3 && <button type="button" onClick={() => setStep((value) => value - 1)} className="action-secondary"><ChevronLeft className="h-4 w-4" /> Back</button>}
    {step < 3 && <button type="button" onClick={() => setStep((value) => value + 1)} className="action-primary float-right">Continue <ChevronRight className="h-4 w-4" /></button>}
    <style jsx>{`.field{display:block;box-sizing:border-box;width:100%;min-height:2.5rem;margin-top:.4rem;border:1px solid rgb(203 213 225);border-radius:.5rem;background:transparent;padding:.6rem .75rem;font-size:.875rem;line-height:1.35}.action-primary,.action-secondary{display:inline-flex;align-items:center;gap:.45rem;border-radius:.5rem;padding:.6rem .9rem;font-size:.875rem;font-weight:600}.action-primary{background:var(--primary,#2563eb);color:white}.action-secondary{border:1px solid rgb(203 213 225);color:inherit}.icon-button{display:inline-flex;align-items:center;justify-content:center;border:1px solid rgb(203 213 225);border-radius:.5rem;padding:.55rem;color:rgb(100 116 139)}`}</style>
  </div>;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <section className="card space-y-4"><div><h3 className="text-card-title font-semibold">{title}</h3>{description && <p className="mt-1 text-small text-slate-500">{description}</p>}</div>{children}</section>; }
function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="block text-small font-medium">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="field mt-1" /></label>; }
function TextArea({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block text-small font-medium">{label}<textarea required={required} value={value} onChange={(event) => onChange(event.target.value)} className="field mt-1 min-h-24" /></label>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="block text-small font-medium">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="field mt-1">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function ReadOnly({ label, value }: { label: string; value?: string | null }) { return <div className="border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-small font-medium">{value || "Not provided"}</p></div>; }
