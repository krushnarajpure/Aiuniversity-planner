"use client";

import { useMemo, useState } from "react";
import { BriefcaseBusiness, MapPin, Search, X } from "lucide-react";
import { applyToPlacementJob } from "@/actions/placement-jobs";
import { toast } from "sonner";

export type JobPortalJob = {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  location: string | null;
  jobType: string | null;
  salaryRange: string | null;
  minCgpa: number | null;
  maxCgpa: number | null;
  experienceLevel: string;
  applicationDeadline: string | null;
  companyName: string;
  organizationUserId: string;
  matchedSkills: string[];
  missingSkills: string[];
  skillMatch: number;
  cgpaEligible: boolean;
  matchScore: number;
  hasApplied: boolean;
  applicationForm?: { questions?: { label: string; type: string; required: boolean; options?: string }[] } | null;
};

export type JobPortalApplication = {
  id: string;
  status: string;
  appliedAt: string;
  interviewAt: string | null;
  job: JobPortalJob;
};

function companyInitials(name: string) {
  return name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "CO";
}

function scoreClass(score: number) {
  return score >= 70 ? "text-success" : score >= 40 ? "text-warning" : "text-slate-500";
}

function statusLabel(status: string) {
  return status === "interview" ? "interview_scheduled" : status === "selected" ? "hired" : status;
}

export function JobsPortalClient({
  jobs,
  recommendations,
  applications,
}: {
  jobs: JobPortalJob[];
  recommendations: JobPortalJob[];
  applications: JobPortalApplication[];
}) {
  const [tab, setTab] = useState<"browse" | "matches" | "applications">("browse");
  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [details, setDetails] = useState<JobPortalJob | null>(null);
  const [applyJob, setApplyJob] = useState<JobPortalJob | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    coverLetter: "",
    portfolioUrl: "",
    phone: "",
    noticePeriod: "Immediate",
    expectedSalary: "",
    availability: "Available to join immediately",
    source: "Campus placement portal",
    customAnswers: {} as Record<string, string>,
  });

  const filtered = useMemo(
    () =>
      jobs.filter((job) => {
        const haystack = [job.title, job.companyName, job.location, ...job.requiredSkills]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return (
          (!search || haystack.includes(search.toLowerCase())) &&
          (!experience || job.experienceLevel === experience) &&
          (!cgpa || (job.minCgpa ?? 0) <= Number(cgpa))
        );
      }),
    [jobs, search, experience, cgpa],
  );

  const visibleJobs = tab === "browse" ? filtered : recommendations;

  async function confirmApplication() {
    if (!applyJob) return;
    setBusy(true);
    try {
      const result = await applyToPlacementJob(applyJob.id, applicationForm);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setSuccess(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Application failed");
    } finally {
      setBusy(false);
    }
  }

  function closeApply() {
    setApplyJob(null);
    setSuccess(false);
    setApplicationForm({ coverLetter: "", portfolioUrl: "", phone: "", noticePeriod: "Immediate", expectedSalary: "", availability: "Available to join immediately", source: "Campus placement portal", customAnswers: {} });
  }

  return (
    <div className="jobs-portal p-6 space-y-6">
      <header>
        <p className="text-small text-primary font-medium">Placement</p>
        <h1 className="text-subheading font-semibold">🏢 Job Portal</h1>
        <p className="text-small text-slate-500 dark:text-slate-400 mt-1">
          Browse verified openings · Check eligibility · Apply directly — no middlemen
        </p>
      </header>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-700">
        <Tab active={tab === "browse"} onClick={() => setTab("browse")}>
          🔍 Browse All
        </Tab>
        <Tab active={tab === "matches"} onClick={() => setTab("matches")}>
          ⭐ Best Matches
        </Tab>
        <Tab active={tab === "applications"} onClick={() => setTab("applications")}>
          📋 My Applications
        </Tab>
      </div>

      {tab === "browse" && (
        <section className="card grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="text-small text-slate-500 dark:text-slate-400">
            Search
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Role, company, skill…"
                className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-9 pr-3 dark:border-slate-700"
              />
            </div>
          </label>

          <label className="text-small text-slate-500 dark:text-slate-400">
            Experience
            <select
              value={experience}
              onChange={(event) => setExperience(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent p-2 dark:border-slate-700"
            >
              <option value="">All Levels</option>
              <option>Entry</option>
              <option>Mid</option>
              <option>Senior</option>
            </select>
          </label>

          <label className="text-small text-slate-500 dark:text-slate-400">
            Min CGPA
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={cgpa}
              onChange={(event) => setCgpa(event.target.value)}
              placeholder="e.g. 7.0"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent p-2 dark:border-slate-700"
            />
          </label>
        </section>
      )}

      {tab === "applications" ? (
        <Applications applications={applications} onDetails={setDetails} />
      ) : visibleJobs.length === 0 ? (
        <EmptyState filtered={tab === "browse" && Boolean(search || experience || cgpa)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              recommended={tab === "matches"}
              onDetails={() => setDetails(job)}
              onApply={() => setApplyJob(job)}
            />
          ))}
        </div>
      )}

      {details && <DetailsModal job={details} onClose={() => setDetails(null)} onApply={() => { setApplyJob(details); setDetails(null); }} />}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          busy={busy}
          success={success}
          form={applicationForm}
          onChange={setApplicationForm}
          onClose={closeApply}
          onConfirm={confirmApplication}
        />
      )}
    </div>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 px-4 py-3 text-small font-medium ${
        active ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function JobCard({
  job,
  recommended,
  onDetails,
  onApply,
}: {
  job: JobPortalJob;
  recommended: boolean;
  onDetails: () => void;
  onApply: () => void;
}) {
  return (
    <article className="job-card card flex flex-col p-0">
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
            {companyInitials(job.companyName)}
          </div>
          <div>
            <h2 className="text-[15px] font-bold">{job.title}</h2>
            <p className="text-small font-medium text-primary">{job.companyName}</p>
          </div>
        </div>
        <div className={`text-center ${scoreClass(recommended ? job.matchScore : job.skillMatch)}`}>
          <strong className="block text-lg">{recommended ? job.matchScore : job.skillMatch}%</strong>
          <span className="text-[10px] font-semibold">MATCH</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-5 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="rounded-full border px-2 py-1">{job.experienceLevel || "Entry"}</span>
        <span className="rounded-full border px-2 py-1">
          {job.cgpaEligible ? "✓ CGPA eligible" : `⚠ Need ${job.minCgpa ?? 0}+ CGPA`}
        </span>
        {job.location && (
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 px-5 py-4">
        {job.requiredSkills.slice(0, 5).map((skill) => {
          const matched = job.matchedSkills.includes(skill.toLowerCase());
          return (
            <span
              key={skill}
              className={`rounded-full border px-2 py-1 text-[11px] ${
                matched ? "border-success/40 bg-success/10 text-success" : "text-slate-500"
              }`}
            >
              {matched ? "✓ " : ""}
              {skill}
            </span>
          );
        })}
      </div>

      {job.salaryRange && <p className="px-5 pb-4 text-small font-bold text-success">₹ {job.salaryRange}</p>}

      <div className="mt-auto flex gap-2 border-t border-slate-200 p-4 dark:border-slate-700">
        <button
          type="button"
          onClick={onApply}
          disabled={job.hasApplied}
          className="flex-1 rounded-lg bg-primary px-3 py-2 text-small font-medium text-primary-foreground disabled:opacity-50"
        >
          {job.hasApplied ? "Applied" : "Apply"}
        </button>
        <button
          type="button"
          onClick={onDetails}
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-small font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Details
        </button>
      </div>
    </article>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <section className="card py-12 text-center">
      <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-400" />
      <h2 className="mt-3 font-semibold">{filtered ? "No jobs found" : "No jobs listed yet"}</h2>
      <p className="mt-1 text-small text-slate-500 dark:text-slate-400">
        {filtered
          ? "Try adjusting your filters"
          : "No verified companies have posted jobs yet. Check back soon or ask your admin to verify organizations."}
      </p>
    </section>
  );
}

function DetailsModal({ job, onClose, onApply }: { job: JobPortalJob; onClose: () => void; onApply: () => void }) {
  return (
    <Modal title={`${job.title} — ${job.companyName}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3 text-small">
        <Info label="Salary" value={job.salaryRange ?? "Not specified"} green />
        <Info label="Location" value={job.location ?? "Not specified"} />
        <Info label="Min CGPA" value={job.minCgpa === null ? "No cutoff" : String(job.minCgpa)} />
        <Info label="Job Type" value={job.jobType ?? "Full-time"} />
      </div>

      <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-100 p-3 text-small dark:bg-slate-700">
        {job.description || "No description provided."}
      </p>

      <h3 className="mt-4 text-small font-semibold uppercase text-slate-500">Required Skills</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {job.requiredSkills.map((skill) => (
          <span key={skill} className="rounded-full bg-primary/10 px-2 py-1 text-small text-primary">
            {skill}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={onApply}
        disabled={job.hasApplied}
        className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground disabled:opacity-50"
      >
        {job.hasApplied ? "Already Applied" : "Apply Now"}
      </button>
    </Modal>
  );
}

function ApplyModal({
  job,
  busy,
  success,
  form,
  onChange,
  onClose,
  onConfirm,
}: {
  job: JobPortalJob;
  busy: boolean;
  success: boolean;
  form: { coverLetter: string; portfolioUrl: string; phone: string; noticePeriod: string; expectedSalary: string; availability: string; source: string; customAnswers: Record<string, string> };
  onChange: (next: { coverLetter: string; portfolioUrl: string; phone: string; noticePeriod: string; expectedSalary: string; availability: string; source: string; customAnswers: Record<string, string> }) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal title={`Apply — ${job.title} at ${job.companyName}`} onClose={onClose}>
      {success ? (
        <div className="py-5 text-center">
          <p className="text-3xl">🎉</p>
          <h3 className="mt-3 text-card-title font-semibold">Application submitted successfully!</h3>
          <button type="button" onClick={onClose} className="mt-5 rounded-lg bg-primary px-5 py-2 text-small text-primary-foreground">
            Done
          </button>
        </div>
      ) : (
        <>
          <p className="rounded-lg bg-primary/10 p-3 text-small">
            Complete the application form below. This data is sent with your application and helps the employer evaluate your profile accurately.
          </p>

          <div className="my-5 space-y-3 text-small">
            <Info label="Role" value={job.title} />
            <Info label="Package" value={job.salaryRange ?? "Not specified"} green />
            <Info label="Location" value={job.location ?? "Not specified"} />
            <Info label="Min CGPA" value={job.minCgpa === null ? "No cutoff" : String(job.minCgpa)} />
          </div>

          <div className="space-y-4">
            <label className="block text-small font-medium">Phone number<input value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small dark:border-slate-600" placeholder="+91 98765 43210" /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-small font-medium">Notice period<select value={form.noticePeriod} onChange={(event) => onChange({ ...form, noticePeriod: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small dark:border-slate-600"><option>Immediate</option><option>15 days</option><option>30 days</option><option>45 days</option><option>60+ days</option></select></label>
              <label className="block text-small font-medium">Expected salary<input value={form.expectedSalary} onChange={(event) => onChange({ ...form, expectedSalary: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small dark:border-slate-600" placeholder="₹ 8 LPA" /></label>
            </div>
            <label className="block text-small font-medium">Portfolio / LinkedIn<input value={form.portfolioUrl} onChange={(event) => onChange({ ...form, portfolioUrl: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small dark:border-slate-600" placeholder="https://linkedin.com/in/your-profile" /></label>
            <label className="block text-small font-medium">Availability<select value={form.availability} onChange={(event) => onChange({ ...form, availability: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small dark:border-slate-600"><option>Available to join immediately</option><option>Available in 15 days</option><option>Available in 30 days</option><option>Available after internship</option></select></label>
            <label className="block text-small font-medium">Application source<input value={form.source} onChange={(event) => onChange({ ...form, source: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small dark:border-slate-600" placeholder="Campus placement / referral / LinkedIn" /></label>
            <label className="block text-small font-medium">Motivation / cover letter<textarea value={form.coverLetter} onChange={(event) => onChange({ ...form, coverLetter: event.target.value })} rows={6} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small dark:border-slate-600" placeholder="Describe your interest in this role, your strengths, and why you are a good fit." /></label>
            {(job.applicationForm?.questions ?? []).map((question, index) => <label key={`${question.label}-${index}`} className="block text-small font-medium">{question.label || `Question ${index + 1}`}{question.required && <span className="text-red-600"> *</span>}{question.type === "Long Text" ? <textarea required={question.required} value={form.customAnswers[question.label] ?? ""} onChange={(event) => onChange({ ...form, customAnswers: { ...form.customAnswers, [question.label]: event.target.value } })} className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small dark:border-slate-600" /> : question.type === "Dropdown" || question.type === "Yes / No" ? <select required={question.required} value={form.customAnswers[question.label] ?? ""} onChange={(event) => onChange({ ...form, customAnswers: { ...form.customAnswers, [question.label]: event.target.value } })} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small dark:border-slate-600"><option value="">Select an answer</option>{(question.type === "Yes / No" ? ["Yes", "No"] : (question.options ?? "").split(",").map((option) => option.trim()).filter(Boolean)).map((option) => <option key={option}>{option}</option>)}</select> : <input required={question.required} value={form.customAnswers[question.label] ?? ""} onChange={(event) => onChange({ ...form, customAnswers: { ...form.customAnswers, [question.label]: event.target.value } })} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-small dark:border-slate-600" />}</label>)}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-small font-medium text-primary-foreground"
          >
            {busy ? "Submitting…" : "Submit application"}
          </button>
        </>
      )}
    </Modal>
  );
}

function Info({ label, value, green = false }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-700">
      <span className="block text-[11px] uppercase text-slate-500">{label}</span>
      <strong className={green ? "text-success" : ""}>{value}</strong>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-card-light shadow-2xl dark:border-slate-700 dark:bg-card-dark"
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-portal-modal-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-700">
          <h2 id="job-portal-modal-title" className="text-card-title font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Applications({
  applications,
  onDetails,
}: {
  applications: JobPortalApplication[];
  onDetails: (job: JobPortalJob) => void;
}) {
  if (!applications.length)
    return (
      <section className="card py-12 text-center">
        <h2 className="font-semibold">No applications yet</h2>
        <p className="mt-1 text-small text-slate-500">Browse jobs and apply to get started!</p>
      </section>
    );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {applications.map((application) => (
        <article key={application.id} className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">{application.job.title}</h2>
              <p className="text-small text-primary">{application.job.companyName}</p>
              <p className="text-small text-slate-500">Applied {new Date(application.appliedAt).toLocaleDateString()}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-small text-primary">
              {statusLabel(application.status.toLowerCase())}
            </span>
          </div>

          {application.interviewAt && (
            <p className="mt-3 rounded-lg bg-primary/10 p-2 text-small">
              📅 Interview: {new Date(application.interviewAt).toLocaleString()}
            </p>
          )}

          <button
            type="button"
            onClick={() => onDetails(application.job)}
            className="mt-4 text-small text-primary hover:underline"
          >
            View job details
          </button>
        </article>
      ))}
    </div>
  );
}
