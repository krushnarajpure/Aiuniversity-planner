export type AvishuLiveState = "disconnected" | "connecting" | "listening" | "speaking";
type AudioHandlers = { onStateChange: (state: AvishuLiveState) => void; onTranscription: (role: "user" | "model", text: string) => void; onTurnComplete: (conversationId?: string) => void; onError: (message: string) => void };
const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;
const MIC_BUFFER_SIZE = 512;
const MAX_BACKLOG = 96 * 1024;
const BARGE_IN_RMS = 0.022;

function pcm(input: Float32Array) { const buffer = new ArrayBuffer(input.length * 2); const view = new DataView(buffer); input.forEach((value, index) => view.setInt16(index * 2, Math.max(-1, Math.min(1, value)) * (value < 0 ? 0x8000 : 0x7fff), true)); return buffer; }
function base64(buffer: ArrayBuffer) { let value = ""; for (const byte of new Uint8Array(buffer)) value += String.fromCharCode(byte); return window.btoa(value); }
function bytes(value: string) { const binary = window.atob(value); const output = new Uint8Array(binary.length); for (let index = 0; index < binary.length; index++) output[index] = binary.charCodeAt(index); return output; }
function rms(samples: Float32Array) { return Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length); }

export class AvishuAudioSession {
  private socket: WebSocket | null = null;
  private inputContext: AudioContext | null = null;
  private outputContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private keepAlive: GainNode | null = null;
  private gain: GainNode | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private nextStart = 0;
  private epoch = 0;
  private turnComplete = false;
  private speaking = false;
  private lastBargeIn = 0;
  private handlers: AudioHandlers;
  constructor(handlers: AudioHandlers) { this.handlers = handlers; }
  async connect(url: string, token: string) {
    this.handlers.onStateChange("connecting");
    const socket = new WebSocket(`${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`);
    this.socket = socket;
    socket.onopen = async () => { try { await this.startAudio(); } catch (error) { this.handlers.onError(error instanceof Error ? error.message : "Microphone setup failed."); this.disconnect(); } };
    socket.onmessage = (event) => { try { const packet = JSON.parse(String(event.data)) as { type: string; audio?: string; role?: "user" | "model"; text?: string; conversationId?: string; error?: string; status?: string }; if (packet.type === "status" && packet.status === "connected") this.handlers.onStateChange("listening"); if (packet.type === "audio" && packet.audio) this.play(packet.audio, this.epoch); if (packet.type === "interrupted") this.interrupt(); if (packet.type === "transcription" && packet.role && packet.text) this.handlers.onTranscription(packet.role, packet.text); if (packet.type === "turnComplete") { this.turnComplete = true; this.finishPlayback(); this.handlers.onTurnComplete(packet.conversationId); } if (packet.type === "error") this.handlers.onError(packet.error || "Avishu Live failed."); } catch { this.handlers.onError("Avishu Live returned an invalid response."); } };
    socket.onerror = () => this.handlers.onError("Avishu Live is unavailable. Using browser voice fallback.");
    socket.onclose = () => { if (this.socket === socket) { this.release(); this.handlers.onStateChange("disconnected"); } };
  }
  sendVideoFrame(frame: string) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || this.socket.bufferedAmount > MAX_BACKLOG) return;
    this.socket.send(JSON.stringify({ type: "video", video: frame }));
  }
  private async startAudio() {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) throw new Error("Web Audio API is unavailable.");
    this.inputContext = new AudioContextClass({ sampleRate: INPUT_RATE, latencyHint: "interactive" });
    this.outputContext = new AudioContextClass({ sampleRate: OUTPUT_RATE, latencyHint: "interactive" });
    await Promise.all([this.inputContext.resume(), this.outputContext.resume()]);
    this.gain = this.outputContext.createGain(); this.gain.connect(this.outputContext.destination);
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false, channelCount: 1 } });
    this.source = this.inputContext.createMediaStreamSource(this.stream); this.processor = this.inputContext.createScriptProcessor(MIC_BUFFER_SIZE, 1, 1); this.keepAlive = this.inputContext.createGain(); this.keepAlive.gain.value = 0; this.source.connect(this.processor); this.processor.connect(this.keepAlive); this.keepAlive.connect(this.inputContext.destination); this.processor.onaudioprocess = (event) => this.sendMic(event.inputBuffer.getChannelData(0));
  }
  private sendMic(samples: Float32Array) { if (!this.socket || this.socket.readyState !== WebSocket.OPEN || this.socket.bufferedAmount > MAX_BACKLOG) return; if (this.speaking) { if (rms(samples) < BARGE_IN_RMS) return; const now = performance.now(); if (now - this.lastBargeIn < 250) return; this.lastBargeIn = now; this.interrupt(); this.socket.send(JSON.stringify({ type: "interrupt" })); } this.socket.send(JSON.stringify({ type: "audio", audio: base64(pcm(samples)) })); }
  private play(encoded: string, epoch: number) { if (!this.outputContext || !this.gain || epoch !== this.epoch) return; const raw = bytes(encoded); const values = new Int16Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 2)); const buffer = this.outputContext.createBuffer(1, values.length, OUTPUT_RATE); const channel = buffer.getChannelData(0); values.forEach((value, index) => { channel[index] = value / 32768; }); const now = this.outputContext.currentTime; this.nextStart = Math.max(this.nextStart, now + 0.008); this.speaking = true; this.handlers.onStateChange("speaking"); this.turnComplete = false; const source = this.outputContext.createBufferSource(); source.buffer = buffer; source.connect(this.gain); source.start(this.nextStart); this.nextStart += buffer.duration; this.activeSources.push(source); source.onended = () => { this.activeSources = this.activeSources.filter((item) => item !== source); this.finishPlayback(); }; }
  private finishPlayback() { if (this.turnComplete && this.activeSources.length === 0) { this.speaking = false; this.nextStart = 0; this.handlers.onStateChange("listening"); } }
  private interrupt() { this.epoch++; this.activeSources.forEach((source) => { try { source.stop(); source.disconnect(); } catch {} }); this.activeSources = []; this.nextStart = 0; this.turnComplete = false; this.speaking = false; this.handlers.onStateChange("listening"); }
  disconnect() { this.socket?.close(); this.release(); this.handlers.onStateChange("disconnected"); }
  private release() { this.interrupt(); this.stream?.getTracks().forEach((track) => track.stop()); this.processor?.disconnect(); this.source?.disconnect(); this.keepAlive?.disconnect(); void this.inputContext?.close(); void this.outputContext?.close(); this.stream = null; this.processor = null; this.source = null; this.keepAlive = null; this.inputContext = null; this.outputContext = null; this.gain = null; this.socket = null; }
}
