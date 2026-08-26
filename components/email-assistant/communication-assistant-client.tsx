"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Clipboard,
  Copy,
  ExternalLink,
  FileText,
  History,
  Mail,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";
import { CommunicationPdfActions } from "./communication-pdf-actions";

type Profile = {
  name: string;
  email: string;
  department: string;
  semester: string;
  university: string;
};
type EmailResult = {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  greeting: string;
  body: string;
  signature: string;
  recipientRole: string;
  category: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  confidence: "Low" | "Medium" | "High";
  attachments: string[];
  missingInformation: string[];
  recommendations: string[];
  health: {
    professionalism: number;
    clarity: number;
    grammar: number;
    tone: string;
  };
  recommendedService?: string;
  recommendedReason?: string;
  questions?: { question: string; options: string[] }[];
  channelMessages?: Record<string, string>;
};
type Action =
  | "generate"
  | "improve"
  | "shorten"
  | "expand"
  | "formalize"
  | "polite"
  | "check"
  | "translate"
  | "followup"
  | "reply"
  | "convert";
type Service = {
  name: string;
  category: string;
  url: string;
  direct: boolean;
  channel: string;
};

const roles = [
  "Professor",
  "HOD",
  "Class Teacher",
  "Department Coordinator",
  "Dean",
  "Principal",
  "Placement Officer",
  "Training & Placement Cell",
  "Exam Cell",
  "Examination Controller",
  "College Office",
  "Accounts Department",
  "Scholarship Department",
  "Internship Coordinator",
  "HR",
  "Recruiter",
  "Mentor",
  "Project Guide",
  "Lab Assistant",
  "Hostel Warden",
  "Librarian",
  "Student Coordinator",
  "Club Coordinator",
  "Hackathon Organizer",
  "Workshop Organizer",
  "Event Coordinator",
  "University Authority",
];
const tones = [
  "Very Formal",
  "Professional",
  "Respectful",
  "Polite",
  "Friendly Professional",
  "Short & Direct",
  "Detailed",
  "Urgent",
  "Apologetic",
  "Persuasive",
  "Requesting",
  "Follow-up",
  "Thank-you",
  "Complaint",
];
const lengths = ["Very Short", "Short", "Medium", "Detailed"];
const actions: { key: Action; label: string }[] = [
  { key: "improve", label: "Improve Grammar" },
  { key: "shorten", label: "Make Shorter" },
  { key: "expand", label: "Make Longer" },
  { key: "formalize", label: "More Formal" },
  { key: "polite", label: "More Respectful" },
  { key: "check", label: "Check Email" },
  { key: "translate", label: "Translate" },
];
const serviceEntries: Array<
  readonly [string, string, string, boolean, string]
> = [
  [
    "Gmail",
    "Email",
    "https://mail.google.com/mail/?view=cm&fs=1",
    true,
    "Email",
  ],
  [
    "Outlook",
    "Email",
    "https://outlook.live.com/mail/0/deeplink/compose",
    true,
    "Email",
  ],
  [
    "Microsoft 365",
    "Email",
    "https://outlook.office.com/mail/deeplink/compose",
    true,
    "Email",
  ],
  ["Yahoo Mail", "Email", "https://compose.mail.yahoo.com/", true, "Email"],
  ["Proton Mail", "Email", "https://mail.proton.me/", false, "Email"],
  ["Apple Mail", "Email", "mailto:", true, "Email"],
  ["iCloud Mail", "Email", "https://www.icloud.com/mail/", false, "Email"],
  ["Zoho Mail", "Email", "https://mail.zoho.com/", false, "Email"],
  ["WhatsApp", "Messaging", "https://wa.me/", true, "WhatsApp"],
  ["WhatsApp Web", "Messaging", "https://web.whatsapp.com/", false, "WhatsApp"],
  ["Telegram", "Messaging", "https://web.telegram.org/", false, "Telegram"],
  ["Signal", "Messaging", "https://signal.org/", false, "Signal"],
  ["Discord", "Messaging", "https://discord.com/app", false, "Discord"],
  ["Messenger", "Messaging", "https://www.messenger.com/", false, "Messenger"],
  [
    "Google Chat",
    "Messaging",
    "https://mail.google.com/chat/",
    false,
    "Google Chat",
  ],
  ["Microsoft Teams", "Work", "https://teams.microsoft.com/", false, "Teams"],
  ["Slack", "Work", "https://app.slack.com/client/", false, "Slack"],
  ["Zoom", "Work", "https://zoom.us/meeting/schedule", false, "Zoom"],
  ["Google Meet", "Work", "https://meet.google.com/", false, "Google Meet"],
  ["Webex", "Work", "https://web.webex.com/", false, "Webex"],
  [
    "Google Classroom",
    "Education",
    "https://classroom.google.com/",
    false,
    "Google Classroom",
  ],
  ["Moodle", "Education", "https://moodle.org/", false, "Moodle"],
  ["Canvas", "Education", "https://canvas.instructure.com/", false, "Canvas"],
  [
    "Blackboard",
    "Education",
    "https://www.blackboard.com/",
    false,
    "Blackboard",
  ],
  ["Notion", "Documents", "https://www.notion.so/", false, "Notion"],
  [
    "Google Drive",
    "Documents",
    "https://drive.google.com/",
    false,
    "Google Drive",
  ],
  [
    "Google Docs",
    "Documents",
    "https://docs.google.com/",
    false,
    "Google Docs",
  ],
  ["OneDrive", "Documents", "https://onedrive.live.com/", false, "OneDrive"],
  ["Dropbox", "Documents", "https://www.dropbox.com/", false, "Dropbox"],
  [
    "Google Calendar",
    "Productivity",
    "https://calendar.google.com/",
    false,
    "Google Calendar",
  ],
  [
    "Outlook Calendar",
    "Productivity",
    "https://outlook.live.com/calendar/",
    false,
    "Outlook Calendar",
  ],
  ["Todoist", "Productivity", "https://todoist.com/app", false, "Todoist"],
  ["Trello", "Productivity", "https://trello.com/", false, "Trello"],
  ["Asana", "Productivity", "https://app.asana.com/", false, "Asana"],
  ["ClickUp", "Productivity", "https://app.clickup.com/", false, "ClickUp"],
  [
    "Jira",
    "Productivity",
    "https://www.atlassian.com/software/jira",
    false,
    "Jira",
  ],
  [
    "LinkedIn",
    "Career",
    "https://www.linkedin.com/messaging/",
    false,
    "LinkedIn",
  ],
  ["Naukri", "Career", "https://www.naukri.com/", false, "Naukri"],
  ["Indeed", "Career", "https://www.indeed.com/", false, "Indeed"],
  ["Internshala", "Career", "https://internshala.com/", false, "Internshala"],
  ["GitHub", "Career", "https://github.com/", false, "GitHub"],
  ["GitLab", "Career", "https://gitlab.com/", false, "GitLab"],
  ["HackerRank", "Career", "https://www.hackerrank.com/", false, "HackerRank"],
  ["LeetCode", "Career", "https://leetcode.com/", false, "LeetCode"],
  ["Kaggle", "Career", "https://www.kaggle.com/", false, "Kaggle"],
];
const services: Service[] = serviceEntries.map(
  ([name, category, url, direct, channel]) => ({
    name,
    category,
    url,
    direct,
    channel,
  }),
);

function channelText(result: EmailResult, channel: string) {
  return (
    result.channelMessages?.[channel] || `${result.body}\n\n${result.signature}`
  );
}
function emailUrl(result: EmailResult, service: string) {
  const body = `${result.greeting}\n\n${result.body}\n\n${result.signature}`;
  if (service === "Apple Mail")
    return `mailto:${encodeURIComponent(result.to)}?subject=${encodeURIComponent(result.subject)}&body=${encodeURIComponent(body)}${result.cc ? `&cc=${encodeURIComponent(result.cc)}` : ""}${result.bcc ? `&bcc=${encodeURIComponent(result.bcc)}` : ""}`;
  const query = new URLSearchParams({ subject: result.subject, body });
  if (result.cc) query.set("cc", result.cc);
  if (result.bcc) query.set("bcc", result.bcc);
  return service === "Gmail"
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(result.to)}&${query.toString()}`
    : `${services.find((item) => item.name === service)?.url || ""}?${query.toString()}`;
}

export function CommunicationAssistantClient({
  profile,
}: {
  profile: Profile;
}) {
  const [situation, setSituation] = useState("");
  const [role, setRole] = useState("Professor");
  const [customRole, setCustomRole] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [email, setEmail] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [inputLanguage, setInputLanguage] = useState("English");
  const [result, setResult] = useState<EmailResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [versions, setVersions] = useState<EmailResult[]>([]);
  const [restored, setRestored] = useState(false);
  const [channel, setChannel] = useState("Email");
  const [service, setService] = useState("Gmail");
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategory, setServiceCategory] = useState("All");
  const [favorites, setFavorites] = useState<string[]>(["Gmail"]);
  const [recent, setRecent] = useState<string[]>([]);
  const [channelMessages, setChannelMessages] = useState<
    Record<string, string>
  >({});
  const [activity, setActivity] = useState<Record<string, number>>({});
  useEffect(() => {
    setRestored(Boolean(localStorage.getItem("uni-email-draft")));
    setFavorites(
      JSON.parse(localStorage.getItem("uni-email-favorites") || '["Gmail"]'),
    );
    setRecent(JSON.parse(localStorage.getItem("uni-email-recent") || "[]"));
    setActivity(JSON.parse(localStorage.getItem("uni-email-activity") || "{}"));
  }, []);
  function track(action: string, targetChannel = channel) {
    const key = `${targetChannel}:${action}`;
    setActivity((current) => {
      const next = { ...current, [key]: (current[key] || 0) + 1 };
      localStorage.setItem("uni-email-activity", JSON.stringify(next));
      return next;
    });
  }
  function saveDraft(nextResult = result) {
    localStorage.setItem(
      "uni-email-draft",
      JSON.stringify({
        situation,
        role,
        customRole,
        recipientName,
        email,
        cc,
        bcc,
        tone,
        length,
        language,
        inputLanguage,
        result: nextResult,
        channelMessages,
      }),
    );
  }
  function restoreDraft() {
    const raw = localStorage.getItem("uni-email-draft");
    if (!raw) return;
    const draft = JSON.parse(raw) as Record<string, unknown>;
    setSituation(String(draft.situation || ""));
    setRole(String(draft.role || "Professor"));
    setCustomRole(String(draft.customRole || ""));
    setRecipientName(String(draft.recipientName || ""));
    setEmail(String(draft.email || ""));
    setCc(String(draft.cc || ""));
    setBcc(String(draft.bcc || ""));
    setTone(String(draft.tone || "Professional"));
    setLength(String(draft.length || "Medium"));
    setLanguage(String(draft.language || "English"));
    setInputLanguage(String(draft.inputLanguage || "English"));
    setResult((draft.result as EmailResult) || null);
    setChannelMessages((draft.channelMessages as Record<string, string>) || {});
    setRestored(false);
  }
  async function generate(
    action: Action = "generate",
    targetChannel = channel,
  ) {
    if (!situation.trim() && !result) {
      setError("Tell AI what happened and what you want to communicate.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: situation || result?.body,
          action,
          recipientRole: customRole || role,
          recipientName,
          recipientEmail: email,
          name: profile.name,
          tone,
          length,
          language,
          inputLanguage,
          targetChannel,
          details: {
            department: profile.department,
            semester: profile.semester,
            college: profile.university,
            cc,
            bcc,
          },
          currentEmail: result
            ? {
                to: result.to,
                cc: result.cc,
                bcc: result.bcc,
                subject: result.subject,
                body: result.body,
              }
            : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(
          data.error || "We couldn't generate the communication right now.",
        );
      const next = data.result as EmailResult;
      setVersions((current) =>
        result ? [...current, result].slice(-5) : current,
      );
      setResult(next);
      setChannelMessages(next.channelMessages || {});
      saveDraft(next);
      track("Generated", targetChannel);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We couldn't generate the communication right now.",
      );
    } finally {
      setLoading(false);
    }
  }
  function update(field: keyof EmailResult, value: string) {
    if (!result) return;
    const next = { ...result, [field]: value };
    setResult(next);
    saveDraft(next);
    track("Edited");
  }
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      track("Copied");
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setError("Clipboard access failed. Please copy the text manually.");
    }
  }
  function chooseService(next: Service) {
    setService(next.name);
    setRecent((current) => {
      const values = [
        next.name,
        ...current.filter((item) => item !== next.name),
      ].slice(0, 5);
      localStorage.setItem("uni-email-recent", JSON.stringify(values));
      return values;
    });
  }
  function toggleFavorite(name: string) {
    setFavorites((current) => {
      const values = current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name];
      localStorage.setItem("uni-email-favorites", JSON.stringify(values));
      return values;
    });
  }
  const selectedService =
    services.find((item) => item.name === service) || services[0];
  const filteredServices = services.filter(
    (item) =>
      (serviceCategory === "All" || item.category === serviceCategory) &&
      item.name.toLowerCase().includes(serviceSearch.toLowerCase()),
  );
  const complete = result
    ? `${result.greeting}\n\n${result.body}\n\n${result.signature}`
    : "";
  function openGmail() {
    if (!result) return;
    window.open(emailUrl(result, "Gmail"), "_blank", "noopener,noreferrer");
    track("Gmail Opened");
    window.alert("PDF ready — attach the generated PDF before sending.");
  }
  function openPrimary() {
    if (!result) return;
    if (channel === "Email" || channel === "Formal Application") {
      openGmail();
      return;
    }
    const targetService = services.find((item) => item.channel === channel && item.direct) || selectedService;
    const target = targetService.url;
    window.open(target, "_blank", "noopener,noreferrer");
    track(`${channel} Opened`);
  }
  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-small font-medium text-primary">
            <Mail className="h-4 w-4" /> AI EMAIL & COMMUNICATION ASSISTANT
          </div>
          <h1 className="text-subheading font-semibold sm:text-heading">
            AI College Email & Communication Assistant
          </h1>
          <p className="mt-2 text-small text-slate-500 dark:text-slate-400">
            Describe what you need to say. AI writes it, adapts it, checks it,
            and lets you choose where to use it.
          </p>
        </div>
        {restored && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-primary/10 px-4 py-3 text-small">
            <span>Restore your previous email draft?</span>
            <button
              type="button"
              onClick={restoreDraft}
              className="font-semibold text-primary"
            >
              Restore
            </button>
          </div>
        )}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <section className="card h-fit space-y-4">
            <h2 className="flex items-center gap-2 text-card-title font-semibold">
              <Sparkles className="h-5 w-5 text-primary" /> What do you want to
              communicate?
            </h2>
            <div>
              <label
                htmlFor="situation"
                className="mb-1 block text-small font-medium"
              >
                Situation / request
              </label>
              <textarea
                id="situation"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                rows={7}
                maxLength={10000}
                placeholder="Write in English, Marathi, Hindi, or mixed language."
                className="w-full resize-y rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-body outline-none focus:ring-2 focus:ring-primary dark:border-slate-600"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-small font-medium">
                Input language
                <select
                  value={inputLanguage}
                  onChange={(e) => setInputLanguage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-2 py-2 font-normal dark:border-slate-600"
                >
                  <option>English</option>
                  <option>Marathi</option>
                  <option>Hindi</option>
                  <option>Mixed</option>
                </select>
              </label>
              <label className="text-small font-medium">
                Output language
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-2 py-2 font-normal dark:border-slate-600"
                >
                  <option>English</option>
                  <option>Marathi</option>
                  <option>Hindi</option>
                </select>
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-small font-medium">
                Recipient role
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-2 py-2 font-normal dark:border-slate-600"
                >
                  {roles.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                  <option>Custom Recipient</option>
                </select>
              </label>
              <label className="text-small font-medium">
                Recipient name
                <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal dark:border-slate-600"
                />
              </label>
            </div>
            {role === "Custom Recipient" && (
              <label className="block text-small font-medium">
                Custom recipient role
                <input
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Student Section"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal dark:border-slate-600"
                />
              </label>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-small font-medium">
                Tone
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-2 py-2 font-normal dark:border-slate-600"
                >
                  {tones.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-small font-medium">
                Length
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-2 py-2 font-normal dark:border-slate-600"
                >
                  {lengths.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="text-small font-medium">
                To email
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-2 py-2 font-normal dark:border-slate-600"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-small font-medium">
                CC
                <input
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal dark:border-slate-600"
                />
              </label>
              <label className="text-small font-medium">
                BCC
                <input
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal dark:border-slate-600"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => void generate()}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <WandSparkles className="h-4 w-4" />
              {loading
                ? "Writing your communication..."
                : "Generate Communication"}
            </button>
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-danger/10 p-3 text-small text-danger"
              >
                {error}
              </p>
            )}
            <p className="text-xs text-slate-400">
              Profile used: {profile.name || "[Student Name]"}
              {profile.department ? ` · ${profile.department}` : ""}. Missing
              facts become placeholders.
            </p>
          </section>
          {result ? (
            <section className="space-y-4">
              <div className="card">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-card-title font-semibold">
                    Generated Communication
                  </h2>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                      {result.category}
                    </span>
                    <span className="rounded-full bg-warning/10 px-2 py-1 text-warning">
                      {result.priority}
                    </span>
                    <span className="rounded-full bg-success/10 px-2 py-1 text-success">
                      Confidence: {result.confidence}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 text-small">
                  <label className="block">
                    To
                    <input
                      value={result.to}
                      onChange={(e) => update("to", e.target.value)}
                      className="mt-1 w-full border-b border-slate-200 bg-transparent py-1 outline-none focus:border-primary dark:border-slate-700"
                    />
                  </label>
                  <label className="block">
                    CC
                    <input
                      value={result.cc}
                      onChange={(e) => {
                        setCc(e.target.value);
                        update("cc", e.target.value);
                      }}
                      className="mt-1 w-full border-b border-slate-200 bg-transparent py-1 outline-none focus:border-primary dark:border-slate-700"
                    />
                  </label>
                  <label className="block">
                    BCC
                    <input
                      value={result.bcc}
                      onChange={(e) => {
                        setBcc(e.target.value);
                        update("bcc", e.target.value);
                      }}
                      className="mt-1 w-full border-b border-slate-200 bg-transparent py-1 outline-none focus:border-primary dark:border-slate-700"
                    />
                  </label>
                  <label className="block">
                    Subject
                    <input
                      value={result.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      className="mt-1 w-full border-b border-slate-200 bg-transparent py-1 outline-none focus:border-primary dark:border-slate-700"
                    />
                  </label>
                  <label className="block">
                    Greeting
                    <input
                      value={result.greeting}
                      onChange={(e) => update("greeting", e.target.value)}
                      className="mt-1 w-full border-b border-slate-200 bg-transparent py-1 outline-none focus:border-primary dark:border-slate-700"
                    />
                  </label>
                  <label className="block">
                    Body
                    <textarea
                      value={result.body}
                      onChange={(e) => update("body", e.target.value)}
                      rows={9}
                      className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-transparent p-3 leading-6 outline-none focus:border-primary dark:border-slate-700"
                    />
                  </label>
                  <label className="block">
                    Closing / signature
                    <textarea
                      value={result.signature}
                      onChange={(e) => update("signature", e.target.value)}
                      rows={3}
                      className="mt-1 w-full resize-y border-b border-slate-200 bg-transparent py-1 outline-none focus:border-primary dark:border-slate-700"
                    />
                  </label>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={emailUrl(result, "Gmail")}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => {
                      event.preventDefault();
                      chooseService(services[0]);
                      openGmail();
                    }}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-small font-medium text-white"
                  >
                    <ExternalLink className="h-4 w-4" /> Open in Gmail
                  </a>
                  <button
                    type="button"
                    onClick={() => void copy(complete, "email")}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"
                  >
                    <Copy className="h-4 w-4" />
                    {copied === "email" ? "Copied" : "Copy Email"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void copy(result.subject, "subject")}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"
                  >
                    <Clipboard className="h-4 w-4" />
                    {copied === "subject" ? "Copied" : "Copy Subject"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void copy(
                        `To: ${result.to}\nCC: ${result.cc}\nBCC: ${result.bcc}\nSubject: ${result.subject}\n\n${complete}`,
                        "all",
                      )
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"
                  >
                    {copied === "all" ? "Copied" : "Copy All"}
                  </button>
                </div>
                <CommunicationPdfActions
                  result={result}
                  channel={channel}
                  profile={profile}
                  onActivity={track}
                  onPrimary={openPrimary}
                />
                <p className="mt-3 text-xs text-slate-400">
                  Review before sending. External services open separately and
                  never send automatically. Attach the generated PDF manually
                  in Gmail.
                </p>
              </div>
              {result.questions && result.questions.length > 0 && (
                <div className="card">
                  <h3 className="mb-3 font-semibold">
                    A quick question before you send
                  </h3>
                  {result.questions.map((item) => (
                    <div key={item.question} className="mb-3">
                      <p className="mb-2 text-small">{item.question}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setSituation(
                                (current) => `${current}\nReason: ${option}`,
                              )
                            }
                            className="rounded-full border border-slate-300 px-3 py-1.5 text-small dark:border-slate-600"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => void generate()}
                    className="rounded-lg bg-primary px-3 py-2 text-small font-medium text-white"
                  >
                    Generate with this detail
                  </button>
                </div>
              )}
              <div className="card">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Send className="h-4 w-4 text-primary" /> Communication Hub
                </h3>
                <p className="mb-3 text-small text-slate-500 dark:text-slate-400">
                  Recommended: {result.recommendedService || "Gmail"}.{" "}
                  {result.recommendedReason ||
                    "Formal requests are best reviewed in email."}
                </p>
                <div className="mb-3 flex flex-wrap gap-2">
                  {[
                    "Email",
                    "WhatsApp",
                    "Teams",
                    "LinkedIn",
                    "SMS",
                    "Formal Application",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setChannel(item);
                        void generate("convert", item);
                      }}
                      className={`rounded-lg px-3 py-2 text-small font-medium ${channel === item ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {recent.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setService(item)}
                      className="text-xs text-primary"
                    >
                      Recent: {item}
                    </button>
                  ))}
                </div>
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search services"
                    className="min-w-0 flex-1 bg-transparent text-small outline-none"
                  />
                </div>
                <div className="mb-3 flex gap-2 overflow-x-auto">
                  {[
                    "All",
                    "Email",
                    "Messaging",
                    "Work",
                    "Education",
                    "Documents",
                    "Productivity",
                    "Career",
                  ].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setServiceCategory(item)}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs ${serviceCategory === item ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500 dark:bg-slate-700"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {filteredServices.slice(0, 8).map((item) => (
                    <div
                      key={item.name}
                      className={`flex items-center gap-2 rounded-lg border p-2 ${service === item.name ? "border-primary" : "border-slate-200 dark:border-slate-700"}`}
                    >
                      <button
                        type="button"
                        onClick={() => chooseService(item)}
                        className="min-w-0 flex-1 text-left text-small font-medium"
                      >
                        {item.name}
                        <span className="ml-2 text-xs text-slate-400">
                          {item.direct ? "Open / Prefill" : "Copy & Open"}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Favorite ${item.name}`}
                        onClick={() => toggleFavorite(item.name)}
                        className="text-slate-400"
                      >
                        <Star
                          className={`h-4 w-4 ${favorites.includes(item.name) ? "fill-warning text-warning" : ""}`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void copy(channelText(result, channel), "message")
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-small dark:border-slate-600"
                  >
                    {copied === "message" ? "Copied" : `Copy ${channel}`}
                  </button>
                  <a
                    href={
                      selectedService.direct
                        ? selectedService.category === "Email"
                          ? emailUrl(result, selectedService.name)
                          : selectedService.url
                        : selectedService.url
                    }
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => chooseService(selectedService)}
                    className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-small font-medium text-white"
                  >
                    <ExternalLink className="h-4 w-4" />{" "}
                    {selectedService.direct
                      ? `Open ${selectedService.name}`
                      : `Copy → Open ${selectedService.name}`}
                  </a>
                </div>
              </div>
              <div className="card">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Check className="h-4 w-4 text-success" /> Email Health
                </h3>
                <div className="grid grid-cols-2 gap-2 text-small sm:grid-cols-4">
                  <span>Professionalism: {result.health.professionalism}</span>
                  <span>Clarity: {result.health.clarity}</span>
                  <span>Grammar: {result.health.grammar}</span>
                  <span>Tone: {result.health.tone}</span>
                </div>
                {result.missingInformation.length > 0 && (
                  <div className="mt-3 rounded-lg bg-warning/10 p-3 text-small">
                    <strong>Missing information</strong>
                    {result.missingInformation.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                    <button
                      type="button"
                      onClick={() => void generate("improve")}
                      className="mt-2 font-semibold text-primary"
                    >
                      Fix with AI
                    </button>
                  </div>
                )}
                {result.attachments.length > 0 && (
                  <p className="mt-3 text-small">
                    Suggested attachments: {result.attachments.join(", ")}
                  </p>
                )}
              </div>
              <div className="card">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <WandSparkles className="h-4 w-4 text-primary" /> AI Actions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {actions.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => void generate(item.key)}
                      disabled={loading}
                      className="rounded-lg bg-slate-100 px-3 py-2 text-small text-slate-600 hover:bg-primary/10 hover:text-primary dark:bg-slate-700 dark:text-slate-300"
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => void generate()}
                    className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-small dark:bg-slate-700"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </button>
                </div>
              </div>
              <div className="card">
                <h3 className="mb-3 font-semibold">Communication Activity</h3>
                <div className="grid grid-cols-2 gap-2 text-small sm:grid-cols-5">
                  <span>Generated: {activity[`${channel}:Generated`] || 0}</span>
                  <span>PDF Downloads: {activity[`${channel}:PDF Downloaded`] || 0}</span>
                  <span>PDF Shares: {activity[`${channel}:PDF Shared`] || 0}</span>
                  <span>Gmail Opened: {activity[`${channel}:Gmail Opened`] || 0}</span>
                  <span>Copied: {activity[`${channel}:Copied`] || 0}</span>
                </div>
              </div>
              {versions.length > 0 && (
                <div className="card">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <History className="h-4 w-4 text-primary" /> Versions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {versions.map((version, index) => (
                      <button
                        key={`${version.subject}-${index}`}
                        type="button"
                        onClick={() => setResult(version)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-small dark:border-slate-700"
                      >
                        Version {index + 1}: {version.subject}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ) : (
            <div className="card flex min-h-[420px] flex-col items-center justify-center text-center">
              <FileText className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-body font-medium">
                Your editable communication will appear here
              </p>
              <p className="mt-2 max-w-md text-small text-slate-500 dark:text-slate-400">
                AI detects intent, recipient role, category, priority, language,
                missing details, and the best service from your actual request.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
