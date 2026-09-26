import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import { getCopilotContext } from "./lib/copilot";
import { prisma } from "./lib/prisma";
import { verifyAvishuLiveToken, type AvishuLiveClaims } from "./lib/avishu-live-token";

dotenv.config({ path: ".env.local" });

const port = Number(process.env.AVISHU_LIVE_PORT || 8787);
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.AVISHU_GEMINI_MODEL || "gemini-2.5-flash-native-audio-latest";
const server = createServer((_request, response) => { response.writeHead(404); response.end(); });
const wss = new WebSocketServer({ noServer: true });

function send(socket: WebSocket, packet: unknown) {
  if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(packet));
}

function textFromParts(parts: unknown) {
  if (!Array.isArray(parts)) return "";
  return parts.map((part) => typeof part === "object" && part && typeof (part as { text?: unknown }).text === "string" ? (part as { text: string }).text : "").join("");
}

async function saveTurn(claims: AvishuLiveClaims, userText: string, modelText: string) {
  if (userText.trim()) await prisma.copilotMessage.create({ data: { conversationId: claims.conversationId, role: "user", content: userText.trim() } });
  if (modelText.trim()) await prisma.copilotMessage.create({ data: { conversationId: claims.conversationId, role: "assistant", content: modelText.trim() } });
}

wss.on("connection", async (socket, claims: AvishuLiveClaims) => {
  if (!apiKey) {
    send(socket, { type: "error", error: "Avishu Live is unavailable until GEMINI_API_KEY is configured on the server." });
    socket.close(1011);
    return;
  }

  let session: any = null;
  let userText = "";
  let modelText = "";
  try {
    const [context, history] = await Promise.all([
      getCopilotContext(claims.sub),
      prisma.copilotMessage.findMany({ where: { conversationId: claims.conversationId }, orderBy: { createdAt: "asc" }, take: 12, select: { role: true, content: true } }),
    ]);
    const ai = new GoogleGenAI({ apiKey });
    const handleGeminiMessage = (message: unknown) => {
      const data = message as { serverContent?: { modelTurn?: { parts?: unknown[] }; userTurn?: { parts?: unknown[] }; inputTranscription?: { text?: string }; outputTranscription?: { text?: string }; interrupted?: boolean; turnComplete?: boolean } };
      const content = data.serverContent;
      const audio = (content?.modelTurn?.parts || []).find((part) => typeof part === "object" && part && "inlineData" in part) as { inlineData?: { data?: string } } | undefined;
      if (audio?.inlineData?.data) send(socket, { type: "audio", audio: audio.inlineData.data });
      const inputText = content?.inputTranscription?.text || textFromParts(content?.userTurn?.parts);
      const outputText = content?.outputTranscription?.text || textFromParts(content?.modelTurn?.parts);
      if (inputText) { userText += inputText; send(socket, { type: "transcription", role: "user", text: inputText }); }
      if (outputText) { modelText += outputText; send(socket, { type: "transcription", role: "model", text: outputText }); }
      if (content?.interrupted) { userText = ""; modelText = ""; send(socket, { type: "interrupted" }); }
      if (content?.turnComplete) { void saveTurn(claims, userText, modelText); send(socket, { type: "turnComplete", conversationId: claims.conversationId }); userText = ""; modelText = ""; }
    };
    session = await ai.live.connect({
      model,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        realtimeInputConfig: { automaticActivityDetection: { disabled: false }, activityHandling: "START_OF_ACTIVITY_INTERRUPTS" as any },
        systemInstruction: `You are Myraa, a helpful university voice assistant. Understand Marathi, Hindi, and English, and answer naturally in the language the student uses. Never claim an external action was completed unless this app confirms it. Use the authenticated user's planner context only for recommendations. Context: ${JSON.stringify(context)}`,
      },
      callbacks: { onmessage: handleGeminiMessage },
    });
    send(socket, { type: "status", status: "connected" });
    socket.on("message", (raw) => {
      try {
        const message = JSON.parse(raw.toString()) as { type?: string; audio?: string; video?: string };
        if (message.type === "interrupt") {
          userText = "";
          modelText = "";
          send(socket, { type: "interrupted" });
          return;
        }
        if (message.type === "audio" && message.audio) session?.sendRealtimeInput({ media: { data: message.audio, mimeType: "audio/pcm;rate=16000" } });
        if (message.type === "video" && message.video) session?.sendRealtimeInput({ media: { data: message.video, mimeType: "image/jpeg" } });
      } catch { send(socket, { type: "error", error: "Invalid Avishu Live packet." }); }
    });
    socket.on("close", () => session?.close());

    for (const item of history) session.sendRealtimeInput({ text: `${item.role === "assistant" ? "Avishu" : "Student"}: ${item.content}` });
  } catch (error) {
    send(socket, { type: "error", error: error instanceof Error ? error.message : "Avishu Live could not connect." });
    socket.close(1011);
  }
});

server.on("upgrade", (request, socket, head) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  if (url.pathname !== "/live") { socket.destroy(); return; }
  const claims = verifyAvishuLiveToken(url.searchParams.get("token") || "");
  if (!claims) { socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n"); socket.destroy(); return; }
  wss.handleUpgrade(request, socket, head, (client) => wss.emit("connection", client, claims));
});

server.listen(port, "127.0.0.1", () => console.log(`Avishu Live listening on ws://127.0.0.1:${port}/live`));
