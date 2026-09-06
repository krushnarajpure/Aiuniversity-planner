"use client";

import type { PptElement } from "@/lib/ppt";

export function SlideElement({ element, editing = false, onTextChange }: { element: PptElement; editing?: boolean; onTextChange?: (value: string) => void }) {
  const frame = { position: "absolute" as const, left: `${element.x}%`, top: `${element.y}%`, width: `${element.width}%`, height: `${element.height}%`, opacity: 1 };
  if (element.type === "text") {
    const style = { ...frame, color: element.color, fontSize: `${Math.max(10, element.fontSize * (editing ? 0.65 : 1.05))}px`, fontWeight: element.bold ? 700 : 400, textAlign: element.align as "left" | "center" | "right" };
    return editing ? <textarea value={element.content} onChange={(event) => onTextChange?.(event.target.value)} className="resize-none overflow-hidden bg-transparent p-1 outline-none focus:ring-2 focus:ring-cyan-400/50" style={style} /> : <p style={style}>{element.content}</p>;
  }
  if (element.type === "diagram") return <div style={{ ...frame, display: "flex", alignItems: "center", justifyContent: "space-around", gap: "2%", padding: "3%", background: element.background || "#e7f3ff", borderRadius: 14 }}>{element.items.map((item, index) => <div key={`${item}-${index}`} className="flex min-w-0 flex-1 items-center gap-1"> <span className="flex min-h-10 flex-1 items-center justify-center rounded-lg bg-white px-2 text-center text-[clamp(7px,1.2vw,14px)] font-semibold text-slate-700 shadow-sm">{item}</span>{index < element.items.length - 1 && <span className="text-lg font-bold text-cyan-600">→</span>}</div>)}</div>;
  if (element.type === "chart") {
    const maximum = Math.max(...element.values, 1);
    return <div style={{ ...frame, background: element.background || "#e7f3ff", borderRadius: 14, padding: "5% 5% 3%", display: "flex", alignItems: "end", gap: "5%" }}>{element.values.map((value, index) => <div key={`${value}-${index}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"><span className="text-[clamp(7px,1vw,12px)] font-semibold text-slate-600">{value}</span><div className="w-full rounded-t-md bg-cyan-500" style={{ height: `${Math.max(8, value / maximum * 78)}%` }} /><span className="truncate text-[clamp(7px,1vw,12px)] text-slate-500">{element.labels[index] || `S${index + 1}`}</span></div>)}</div>;
  }
  if (element.type === "table") return <div style={{ ...frame, display: "grid", gridTemplateColumns: `repeat(${Math.max(element.columns.length, 1)}, 1fr)`, gridAutoRows: "1fr", overflow: "hidden", borderRadius: 12, background: "white", border: "1px solid #cbd5e1" }}>{[...element.columns, ...element.rows.flat()].map((cell, index) => <div key={`${cell}-${index}`} className={`flex items-center border-b border-r border-slate-200 px-2 text-[clamp(7px,1vw,13px)] ${index < element.columns.length ? "bg-cyan-600 font-bold text-white" : "text-slate-700"}`}>{cell}</div>)}</div>;
  if (element.type === "line" || element.type === "arrow") return <div style={{ ...frame, height: 3, background: element.color, top: `${element.y + element.height / 2}%` }}>{element.type === "arrow" && <span className="absolute -right-1 -top-2 text-lg" style={{ color: element.color }}>›</span>}</div>;
  if (element.type === "image") return element.content ? <img src={element.content} alt="Presentation visual" style={{ ...frame, objectFit: "cover", borderRadius: 14 }} /> : <div style={{ ...frame, background: "linear-gradient(135deg,#ccfbf1,#bae6fd)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#0f766e", fontWeight: 700 }}>Visual</div>;
  return <div style={{ ...frame, background: element.background || "#dbeafe", borderRadius: element.variant === "circle" ? "999px" : 14 }} />;
}
