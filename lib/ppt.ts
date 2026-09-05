import { z } from "zod";

export const pptElementSchema = z.object({
  id: z.string(),
  type: z.enum(["text", "shape", "image", "chart", "table", "diagram", "line", "arrow", "icon"]),
  content: z.string().default(""),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(1).max(100),
  height: z.number().min(1).max(100),
  fontSize: z.number().min(8).max(96).default(24),
  color: z.string().default("#172033"),
  background: z.string().nullable().default(null),
  bold: z.boolean().default(false),
  align: z.enum(["left", "center", "right"]).default("left"),
  variant: z.string().default("default"),
  items: z.array(z.string()).default([]),
  labels: z.array(z.string()).default([]),
  values: z.array(z.number()).default([]),
  columns: z.array(z.string()).default([]),
  rows: z.array(z.array(z.string())).default([]),
});

export const pptSlideSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  layout: z.string().default("title-content"),
  background: z.string().default("#f7f9fc"),
  notes: z.string().default(""),
  visualType: z.string().default("content"),
  elements: z.array(pptElementSchema),
});

export const presentationSchema = z.object({
  title: z.string().min(1).max(160),
  subtitle: z.string().max(240).default(""),
  theme: z.string().default("modern"),
  slides: z.array(pptSlideSchema).min(1).max(30),
});

export type PptElement = z.infer<typeof pptElementSchema>;
export type PptSlide = z.infer<typeof pptSlideSchema>;
export type PresentationDocument = z.infer<typeof presentationSchema>;

export const generationInputSchema = z.object({
  prompt: z.string().trim().min(10).max(20000),
  slideCount: z.number().int().min(5).max(30).default(10),
  audience: z.string().max(80).default("College Student"),
  language: z.string().max(40).default("English"),
  tone: z.string().max(40).default("Professional"),
  style: z.string().max(40).default("Modern"),
});

function text(id: string, content: string, x: number, y: number, width: number, height: number, fontSize: number, color = "#172033", bold = false, align: "left" | "center" | "right" = "left"): PptElement {
  return { id, type: "text", content, x, y, width, height, fontSize, color, background: null, bold, align, variant: "default", items: [], labels: [], values: [], columns: [], rows: [] };
}
function shape(id: string, x: number, y: number, width: number, height: number, background: string, variant = "card"): PptElement {
  return { id, type: "shape", content: "", x, y, width, height, fontSize: 16, color: "#172033", background, bold: false, align: "left", variant, items: [], labels: [], values: [], columns: [], rows: [] };
}
function visual(id: string, type: "diagram" | "chart" | "table", x: number, y: number, width: number, height: number, options: Partial<PptElement>): PptElement {
  return { id, type, content: "", x, y, width, height, fontSize: 16, color: "#172033", background: null, bold: false, align: "left", variant: "default", items: [], labels: [], values: [], columns: [], rows: [], ...options };
}

const visualLayouts = ["hero", "definition", "cards", "process", "architecture", "chart", "comparison", "timeline", "applications", "pros-cons", "case-study", "infographic", "revision", "references"];

export function fallbackPresentation(input: z.infer<typeof generationInputSchema>): PresentationDocument {
  const topic = input.prompt.replace(/^create\s+(a\s+)?\d+[- ]slide\s+(presentation|deck)\s+(on|about)\s+/i, "").slice(0, 100);
  const titles = ["Introduction", "Why it matters", "Core concepts", "How it works", "Architecture", "Applications", "Real-world examples", "Benefits", "Challenges", "Comparison", "Case study", "Future scope", "Quick revision", "Conclusion", "References"];
  const slides = Array.from({ length: input.slideCount }, (_, index) => {
    const title = index === 0 ? topic || "Student presentation" : titles[(index - 1) % titles.length];
    const visualType = visualLayouts[index % visualLayouts.length];
    const items = ["Build a clear mental model", "Connect theory with examples", "Remember the practical impact", "Review the key terminology"];
    const elements: PptElement[] = [text(`title-${index + 1}`, title, 8, 8, 84, 12, index === 0 ? 38 : 30, "#172033", true)];
    if (index === 0) {
      elements.push(text(`subtitle-${index + 1}`, `${input.audience} · ${input.tone} · ${input.language}`, 8, 24, 70, 8, 16, "#167c80"), shape(`hero-${index + 1}`, 58, 38, 30, 38, "#c8f1ee", "hero-visual"), text(`hero-label-${index + 1}`, "IDEA\n→\nIMPACT", 62, 48, 22, 18, 25, "#167c80", true, "center"), text(`hero-copy-${index + 1}`, "A visual study guide built for your seminar.", 8, 42, 42, 18, 22, "#526078"));
    } else if (visualType === "process" || visualType === "architecture") {
      elements.push(text(`copy-${index + 1}`, `Understand ${title.toLowerCase()} through a practical sequence.`, 8, 27, 36, 12, 18, "#526078"), visual(`diagram-${index + 1}`, "diagram", 48, 28, 43, 48, { variant: visualType, items: ["Input", "Process", "Model", "Outcome"], background: "#e7f3ff" }), text(`takeaway-${index + 1}`, "KEY IDEA  ·  Break complex systems into connected steps.", 8, 78, 84, 8, 15, "#167c80", true));
    } else if (visualType === "chart") {
      elements.push(text(`copy-${index + 1}`, "Use the pattern to compare change over time and explain the reason behind it.", 8, 27, 35, 15, 18, "#526078"), visual(`chart-${index + 1}`, "chart", 48, 28, 43, 42, { variant: "bar", labels: ["A", "B", "C", "D"], values: [42, 68, 54, 82], background: "#e7f3ff" }), text(`note-${index + 1}`, "Example data · replace with your verified source before submission.", 48, 73, 43, 8, 12, "#526078"));
    } else if (visualType === "comparison") {
      elements.push(text(`copy-${index + 1}`, "Compare the two approaches across the criteria students usually discuss in exams.", 8, 27, 84, 10, 18, "#526078"), visual(`table-${index + 1}`, "table", 8, 42, 84, 29, { columns: ["Criteria", "Option A", "Option B"], rows: [["Cost", "Lower", "Variable"], ["Scale", "Limited", "Flexible"], ["Best for", "Small tasks", "Large systems"]], background: "#e7f3ff" }));
    } else {
      elements.push(text(`copy-${index + 1}`, `A concise explanation of ${title.toLowerCase()} for ${input.audience.toLowerCase()}.`, 8, 26, 82, 10, 18, "#526078"), ...items.slice(0, index % 2 ? 3 : 4).map((item, itemIndex) => { const left = 8 + (itemIndex % 2) * 43; const top = 42 + Math.floor(itemIndex / 2) * 18; return [shape(`card-${index + 1}-${itemIndex}`, left, top, 37, 13, itemIndex % 2 ? "#fff4df" : "#e7f3ff"), text(`card-text-${index + 1}-${itemIndex}`, item, left + 3, top + 3, 31, 7, 15, "#172033", itemIndex === 0)] as PptElement[]; }).flat(), text(`takeaway-${index + 1}`, "KEY IDEA  ·  Link this point to a real example in your field.", 8, 82, 84, 7, 15, "#167c80", true));
    }
    return {
      id: `slide-${index + 1}`,
      title,
      description: index === 0 ? `A ${input.tone.toLowerCase()} introduction for ${input.audience}.` : `A concise ${input.style.toLowerCase()} explanation of ${title.toLowerCase()}.`,
      layout: visualType,
      background: index % 3 === 0 ? "#f1f8f7" : index % 3 === 1 ? "#f7f9fc" : "#fffaf2",
      notes: "Add your own examples and explain the key idea in your words.",
      visualType,
      elements,
    };
  });
  return { title: topic || "Untitled presentation", subtitle: `${input.audience} · ${input.style}`, theme: input.style.toLowerCase(), slides };
}

export function enrichPresentation(document: PresentationDocument): PresentationDocument {
  return { ...document, slides: document.slides.map((slide, index) => {
    if (slide.elements.length >= 4 && slide.visualType !== "content") return slide;
    const visualType = slide.visualType === "content" ? visualLayouts[index % visualLayouts.length] : slide.visualType;
    const fallback = fallbackPresentation({ prompt: `${document.title} ${slide.title}`, slideCount: 1, audience: "College Student", language: "English", tone: "Professional", style: document.theme });
    return { ...slide, layout: visualType, visualType, elements: fallback.slides[0].elements.map((element, elementIndex) => ({ ...element, id: `${slide.id}-${elementIndex}` })) };
  }) };
}
