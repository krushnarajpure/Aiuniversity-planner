import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { presentationSchema } from "@/lib/ppt";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const presentation = await prisma.presentation.findFirst({ where: { id: (await params).id, userId: session.user.id } });
  if (!presentation) return NextResponse.json({ error: "Presentation not found." }, { status: 404 });
  const document = presentationSchema.safeParse(presentation.slides);
  if (!document.success) return NextResponse.json({ error: "Presentation data is invalid." }, { status: 422 });

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = session.user.name || "Study Planner";
  pptx.subject = presentation.prompt;
  for (const slide of document.data.slides) {
    const output = pptx.addSlide();
    output.background = { color: slide.background.replace("#", "") };
    for (const element of slide.elements) {
      const options = { x: element.x / 10, y: element.y * 0.075, w: element.width / 10, h: element.height * 0.075, fontFace: "Aptos", fontSize: element.fontSize * 0.75, color: element.color.replace("#", ""), bold: element.bold, align: element.align, margin: 0.04, breakLine: false };
      if (element.type === "shape") output.addShape(pptx.ShapeType.roundRect, { ...options, fill: { color: (element.background || "#dbeafe").replace("#", "") }, line: { color: (element.background || "#dbeafe").replace("#", "") } });
      else if (element.type === "diagram") {
        const stepWidth = element.width / Math.max(element.items.length, 1) / 10;
        element.items.forEach((item, index) => { output.addShape(pptx.ShapeType.roundRect, { x: element.x / 10 + index * stepWidth, y: element.y * 0.075, w: stepWidth - 0.12, h: element.height * 0.075, fill: { color: "FFFFFF" }, line: { color: "14B8A6" } }); output.addText(item, { x: element.x / 10 + index * stepWidth, y: element.y * 0.075 + 0.1, w: stepWidth - 0.12, h: element.height * 0.075 - 0.2, fontSize: 12, bold: true, align: "center", color: "172033", margin: 0.04 }); if (index < element.items.length - 1) output.addText("→", { x: element.x / 10 + (index + 1) * stepWidth - 0.15, y: element.y * 0.075 + element.height * 0.037, w: 0.3, h: 0.25, fontSize: 16, color: "14B8A6", align: "center", margin: 0 }); });
      } else if (element.type === "chart") {
        output.addChart(pptx.ChartType.bar, [{ name: element.content || "Example data", labels: element.labels, values: element.values }], { ...options, catAxisLabelFontSize: 10, valAxisLabelFontSize: 10, showLegend: false, chartColors: ["14B8A6"] });
      } else if (element.type === "table") {
        const rows = [element.columns, ...element.rows].map((row) => row.map((cell) => ({ text: cell, options: { fontSize: 11, color: "172033", margin: 0.05 } })));
        output.addTable(rows, { ...options, border: { type: "solid", color: "CBD5E1", pt: 1 }, fill: { color: "FFFFFF" }, color: "172033", fontFace: "Aptos", fontSize: 11 });
      } else if (element.type === "image" && element.content) {
        const imageResponse = await fetch(element.content);
        if (imageResponse.ok) {
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          output.addImage({ data: `data:${imageResponse.headers.get("content-type") || "image/jpeg"};base64,${imageBuffer.toString("base64")}`, ...options });
        }
      } else output.addText(element.content, options);
    }
    if (slide.notes) output.addNotes(slide.notes);
  }
  const buffer = await pptx.write({ outputType: "nodebuffer" }) as Buffer;
  return new NextResponse(buffer as BodyInit, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation", "Content-Disposition": `attachment; filename="${presentation.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pptx"` } });
}
