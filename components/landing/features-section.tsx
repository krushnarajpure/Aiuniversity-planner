"use client";

import { motion } from "framer-motion";
import { Brain, ClipboardList, BookOpen, CalendarClock, BarChart3, Lock, FileText, ScanText, MessagesSquare, FilePenLine, Bot, Presentation, BriefcaseBusiness, Table2 } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI Academic Assistant",
    desc: "Tell the AI what you need in natural language. Route timetable, exam, course, assignment, and study-material updates to the right place.",
  },
  {
    icon: MessagesSquare,
    title: "AI Copilot",
    desc: "Ask questions, analyze images, switch between study and general modes, and use voice in the language that feels natural.",
  },
  {
    icon: Brain,
    title: "AI Study Planner",
    desc: "Personalized daily and weekly study plans, generated from your real deadlines — never invented.",
  },
  {
    icon: ClipboardList,
    title: "Assignment Tracker",
    desc: "Every assignment across every course, tracked with deadlines, difficulty, and status.",
  },
  {
    icon: BookOpen,
    title: "Course Management",
    desc: "Add, edit, and organize all your courses with instructor, credit hours, and grades in one place.",
  },
  {
    icon: CalendarClock,
    title: "Exam Countdown",
    desc: "Live countdowns on every exam card, so you always know exactly how much time you have left.",
  },
  {
    icon: Table2,
    title: "College Timetable",
    desc: "Import lecture schedules from an image and keep actual college classes separate from your personal study timetable.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Visualize study hours, completion rate, and course progress across your whole semester.",
  },
  {
    icon: Lock,
    title: "Secure Authentication",
    desc: "Passwords hashed with bcrypt, protected routes, and data scoped only to you.",
  },
  {
    icon: FileText,
    title: "Document Workspace",
    desc: "Create applications, letters, reports, and communication drafts in one focused workspace.",
  },
  {
    icon: ScanText,
    title: "Use Your College Format",
    desc: "Upload a PDF, DOCX, image, or text template. Keep the original protected while you work on an editable copy.",
  },
  {
    icon: MessagesSquare,
    title: "Write for Every Channel",
    desc: "Turn one request into a reviewed Gmail, Outlook, WhatsApp, SMS, or Teams-ready message.",
  },
  {
    icon: FilePenLine,
    title: "Editable Document Output",
    desc: "Review AI output, edit every field manually, preview a print-friendly PDF, and export only when it is ready.",
  },
  {
    icon: Presentation,
    title: "AI PPT Generator",
    desc: "Create editable presentations with structured content, visual layouts, real images, emojis, and export-ready slides.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Career Workspace",
    desc: "Prepare for interviews, discover eligible jobs, build a resume, and follow a practical career roadmap from one dashboard.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-background-light dark:bg-background-dark py-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-primary text-small font-medium uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3">Everything your semester needs</h2>
          <p className="text-small text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
            From study planning to polished college documents, keep the work that matters in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="group card hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-card-title font-semibold mb-2">{f.title}</h3>
              <p className="text-small text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
