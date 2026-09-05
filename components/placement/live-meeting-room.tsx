"use client";

import {
  LiveKitRoom,
  PreJoin,
  RoomAudioRenderer,
  VideoTrack,
  useChat,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import type { TrackReference } from "@livekit/components-core";
import type { LocalUserChoices } from "@livekit/components-core";
import { ConnectionState, LocalParticipant, Participant, Track } from "livekit-client";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Camera, CameraOff, Check, Link2, Mic, MicOff, MonitorUp, MoreVertical, PanelRight, Send, ShieldCheck, Users, Video, X } from "lucide-react";
import { toast } from "sonner";

type Connection = { serverUrl: string; participantToken: string; meetingId: string; role?: "HOST" | "STUDENT" };
type Drawer = "chat" | "participants" | null;

export function LiveMeeting({ connection, userName, onLeave }: { connection: Connection; userName: string; onLeave: () => void }) {
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [secureContext, setSecureContext] = useState<boolean | null>(null);

  useEffect(() => { setSecureContext(window.isSecureContext); }, []);

  if (!choices) {
    if (secureContext !== true) return <SecureMediaNotice loading={secureContext === null} />;
    return <div className="flex min-h-full items-center justify-center overflow-y-auto bg-[#080c13] p-4 text-white sm:p-8"><div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-[#111824] p-4 shadow-2xl sm:p-7"><div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Placement meeting</p><h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Ready to join?</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Check your real camera and microphone before entering the room.</p></div><div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300 sm:flex sm:items-center sm:gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Encrypted media</div></div><PreJoin defaults={{ username: userName, videoEnabled: true, audioEnabled: true }} onSubmit={setChoices} onError={(error) => toast.error(error.message)} joinLabel="Join meeting" className="lk-prejoin" /></div></div>;
  }

  return <div className="fixed inset-0 z-40 bg-[#080c13] text-white"><LiveKitRoom token={connection.participantToken} serverUrl={connection.serverUrl} connect audio={choices.audioEnabled} video={choices.videoEnabled} options={{ audioCaptureDefaults: { deviceId: choices.audioDeviceId }, videoCaptureDefaults: { deviceId: choices.videoDeviceId } }} onDisconnected={onLeave} onError={(error) => toast.error(error.message)} className="h-full"><MeetingWorkspace meetingId={connection.meetingId} isHost={connection.role === "HOST"} onLeave={onLeave} /><RoomAudioRenderer /></LiveKitRoom></div>;
}

function MeetingWorkspace({ meetingId, isHost, onLeave }: { meetingId: string; isHost: boolean; onLeave: () => void }) {
  const participants = useParticipants();
  const cameraTracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const screenTracks = useTracks([Track.Source.ScreenShare], { onlySubscribed: true });
  const { localParticipant } = useLocalParticipant();
  const state = useConnectionState();
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [elapsed, setElapsed] = useState(0);
  const activeScreen = screenTracks[0];
  const cameraByParticipant = useMemo(() => new Map(cameraTracks.map((track) => [track.participant.identity, track])), [cameraTracks]);
  const solo = participants.length <= 1;

  useEffect(() => { const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000); return () => window.clearInterval(timer); }, []);

  const connectionLabel = state === ConnectionState.Connected ? "Connected" : state === ConnectionState.Reconnecting ? "Reconnecting" : state === ConnectionState.Connecting ? "Connecting" : "Connection lost";
  return <div className="flex h-full min-h-0 flex-col bg-[radial-gradient(circle_at_top,#172235_0%,#0b1019_42%,#080c13_100%)]">
    <header className="z-20 flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0b111b]/85 px-4 py-3 backdrop-blur-xl sm:px-6"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300"><Video className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate text-sm font-semibold">Placement Meeting</p><p className="flex items-center gap-2 text-[11px] text-slate-400"><span className={`h-1.5 w-1.5 rounded-full ${state === ConnectionState.Connected ? "bg-emerald-400" : state === ConnectionState.Reconnecting ? "bg-amber-400" : "bg-red-400"}`} />{connectionLabel}<span className="text-slate-600">/</span>{formatDuration(elapsed)}</p></div></div><div className="flex items-center gap-2 text-xs text-slate-300"><span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 sm:flex"><Users className="h-3.5 w-3.5 text-cyan-300" />{participants.length}</span><span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 md:flex"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />Secure</span><button title="More meeting options" aria-label="More meeting options" className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"><MoreVertical className="h-4 w-4" /></button></div></header>
    <main className="relative min-h-0 flex-1 overflow-hidden"><section className="h-full overflow-y-auto p-3 pb-24 sm:p-5 sm:pb-28">{activeScreen && <div className="relative mb-3 aspect-video max-h-[42vh] overflow-hidden rounded-2xl border border-cyan-300/30 bg-[#111a27] shadow-2xl"><VideoTrack trackRef={activeScreen} className="h-full w-full object-contain" /><span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-xs font-medium backdrop-blur">Screen share</span></div>}{solo ? <div className="relative mx-auto min-h-[min(72vh,680px)] max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#111a27]/80 shadow-2xl"><ParticipantTile participant={localParticipant} trackRef={cameraByParticipant.get(localParticipant.identity)} largeView /><div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/75 to-transparent px-6 pb-8 pt-20"><div className="pointer-events-auto text-center"><h2 className="text-xl font-semibold">You&apos;re the only one here</h2><p className="mt-2 text-sm text-slate-400">Share the meeting link to invite others.</p><CopyMeetingLink meetingId={meetingId} /></div></div></div> : <div className="grid min-h-full auto-rows-[minmax(160px,1fr)] gap-3 sm:auto-rows-[minmax(210px,1fr)]" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" }}>{participants.map((participant) => <ParticipantTile key={participant.identity} participant={participant} trackRef={cameraByParticipant.get(participant.identity)} />)}</div>}</section>{drawer && <RoomDrawer drawer={drawer} participants={participants} onClose={() => setDrawer(null)} />}</main>
    <MeetingControls meetingId={meetingId} isHost={isHost} localParticipant={localParticipant} drawer={drawer} setDrawer={setDrawer} onLeave={onLeave} />
  </div>;
}

function ParticipantTile({ participant, trackRef, selfView = false, largeView = false }: { participant: Participant; trackRef?: TrackReference; selfView?: boolean; largeView?: boolean }) {
  const speaking = useIsSpeaking(participant);
  const local = participant instanceof LocalParticipant;
  const cameraOn = Boolean(trackRef?.publication?.track);
  return <div className={`${selfView ? "absolute bottom-5 right-4 z-10 aspect-video w-[min(34vw,260px)] sm:bottom-6 sm:right-7" : largeView ? "relative h-full min-h-[min(72vh,680px)]" : "relative min-h-[210px]"} overflow-hidden rounded-2xl border bg-[#151f2d] shadow-2xl transition-all ${speaking ? "border-cyan-300 shadow-[0_0_0_2px_rgba(103,232,249,0.45),0_12px_40px_rgba(8,12,19,0.45)]" : "border-white/10"}`}><div className="absolute inset-0">{cameraOn ? <VideoTrack trackRef={trackRef} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_center,#26364c,#151f2d)]"><ParticipantAvatar participant={participant} large={largeView} /><CameraOff className="h-4 w-4 text-slate-500" /></div>}</div>{!largeView && <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pb-3 pt-10"><span className="flex min-w-0 items-center gap-2 text-xs font-medium"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${speaking ? "bg-cyan-300" : "bg-slate-500"}`} /><span className="truncate">{participant.name || participant.identity}{local ? " (You)" : ""}</span></span><span className="rounded-lg border border-white/10 bg-black/40 p-1.5 backdrop-blur">{participant.isMicrophoneEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5 text-red-300" />}</span></div>}</div>;
}

function ParticipantAvatar({ participant, large = false }: { participant?: Participant; large?: boolean }) { const label = participant?.name || participant?.identity || "You"; return <div className={`flex items-center justify-center rounded-full bg-cyan-400/20 font-semibold text-cyan-100 ring-1 ring-cyan-200/20 ${large ? "h-24 w-24 text-3xl" : "h-16 w-16 text-xl"}`}>{label.slice(0, 1).toUpperCase()}</div>; }

function MeetingControls({ meetingId, isHost, localParticipant, drawer, setDrawer, onLeave }: { meetingId: string; isHost: boolean; localParticipant: LocalParticipant; drawer: Drawer; setDrawer: (value: Drawer) => void; onLeave: () => void }) {
  const [busy, setBusy] = useState(false);
  async function toggle(kind: "camera" | "microphone" | "screen") {
    if ((kind === "camera" || kind === "microphone") && !hasMediaCapture()) {
      toast.error(`${kind === "camera" ? "Camera" : "Microphone"} access requires HTTPS or localhost. This LAN address is not a secure browser context.`);
      return;
    }
    setBusy(true);
    try {
      if (kind === "camera") await localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
      if (kind === "microphone") await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
      if (kind === "screen") await localParticipant.setScreenShareEnabled(!localParticipant.isScreenShareEnabled);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Device permission is unavailable.";
      toast.error(kind === "camera" ? `Camera access is blocked: ${message}` : kind === "microphone" ? `Microphone access is blocked: ${message}` : message);
    } finally { setBusy(false); }
  }
  async function endMeeting() {
    if (!window.confirm("End this meeting for everyone?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/meetings/${encodeURIComponent(meetingId)}`, { method: "DELETE" });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || "Unable to end the meeting.");
      toast.success("Meeting ended for everyone");
      onLeave();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to end the meeting.");
    } finally { setBusy(false); }
  }
  const control = (label: string, icon: ReactNode, active: boolean, action: () => void) => <button disabled={busy} onClick={action} title={label} aria-label={label} className={`flex h-12 w-12 items-center justify-center rounded-full border transition hover:-translate-y-0.5 disabled:opacity-50 sm:h-14 sm:w-14 ${active ? "border-white/10 bg-white/[0.08] text-white hover:bg-white/[0.15]" : "border-red-400/25 bg-red-500/15 text-red-200 hover:bg-red-500/25"}`}>{icon}</button>;
  return <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4 sm:pb-5"><div className="pointer-events-auto flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#111a27]/90 p-2 shadow-2xl backdrop-blur-xl sm:gap-3 sm:px-3"><div className="flex items-center gap-2">{control(localParticipant.isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone", localParticipant.isMicrophoneEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />, localParticipant.isMicrophoneEnabled, () => void toggle("microphone"))}{control(localParticipant.isCameraEnabled ? "Turn off camera" : "Turn on camera", localParticipant.isCameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />, localParticipant.isCameraEnabled, () => void toggle("camera"))}{control(localParticipant.isScreenShareEnabled ? "Stop sharing screen" : "Share screen", <MonitorUp className="h-5 w-5" />, localParticipant.isScreenShareEnabled, () => void toggle("screen"))}</div><div className="mx-1 hidden h-8 w-px bg-white/10 sm:block" /><div className="flex items-center gap-2">{control("Open participants", <Users className="h-5 w-5" />, drawer !== "participants", () => setDrawer(drawer === "participants" ? null : "participants"))}{control("Open chat", <PanelRight className="h-5 w-5" />, drawer !== "chat", () => setDrawer(drawer === "chat" ? null : "chat"))}</div>{isHost ? <button onClick={() => void endMeeting()} disabled={busy} title="End meeting for everyone" aria-label="End meeting for everyone" className="ml-1 shrink-0 rounded-full bg-red-500 px-4 py-3 text-xs font-semibold transition hover:bg-red-400 disabled:opacity-50 sm:ml-2 sm:px-5">End for everyone</button> : <button onClick={onLeave} title="Leave meeting" aria-label="Leave meeting" className="ml-1 shrink-0 rounded-full bg-red-500 px-4 py-3 text-xs font-semibold transition hover:bg-red-400 sm:ml-2 sm:px-5">Leave</button>}</div></footer>;
}

function RoomDrawer({ drawer, participants, onClose }: { drawer: Exclude<Drawer, null>; participants: Participant[]; onClose: () => void }) { return <aside className="absolute inset-y-0 right-0 z-30 flex w-full max-w-sm animate-[slide-in_180ms_ease-out] flex-col border-l border-white/10 bg-[#111a27]/95 shadow-2xl backdrop-blur-xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="font-semibold">{drawer === "chat" ? "Room chat" : "Participants"}</h2><p className="mt-1 text-[11px] text-slate-400">{drawer === "chat" ? "Messages shared with everyone" : `${participants.length} in this meeting`}</p></div><button onClick={onClose} title="Close panel" aria-label="Close panel" className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button></div>{drawer === "chat" ? <ChatPanel /> : <ParticipantPanel participants={participants} />}</aside>; }

function ParticipantPanel({ participants }: { participants: Participant[] }) { return <div className="flex-1 space-y-2 overflow-y-auto p-4">{participants.map((participant) => <ParticipantPanelItem key={participant.identity} participant={participant} />)}</div>; }
function ParticipantPanelItem({ participant }: { participant: Participant }) { const speaking = useIsSpeaking(participant); return <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.035] p-3"><ParticipantAvatar participant={participant} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{participant.name || participant.identity}{participant instanceof LocalParticipant ? " (You)" : ""}</p><p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400"><span className={`h-1.5 w-1.5 rounded-full ${speaking ? "bg-cyan-300" : "bg-slate-600"}`} />{speaking ? "Speaking" : "In the room"}</p></div>{participant.isMicrophoneEnabled ? <Mic className="h-4 w-4 text-slate-300" /> : <MicOff className="h-4 w-4 text-red-300" />}{participant.isCameraEnabled ? <Camera className="h-4 w-4 text-slate-300" /> : <CameraOff className="h-4 w-4 text-slate-500" />}</div>; }

function ChatPanel() { const { chatMessages, send, isSending } = useChat(); const [message, setMessage] = useState(""); async function submit(event: React.FormEvent) { event.preventDefault(); if (!message.trim()) return; await send(message.trim()); setMessage(""); } return <><div className="flex-1 space-y-3 overflow-y-auto p-4">{chatMessages.length === 0 ? <div className="flex h-full items-center justify-center text-center text-xs text-slate-400">No messages yet.<br />Start the conversation.</div> : chatMessages.map((item) => <div key={`${item.timestamp}-${item.from?.identity}`}><p className="text-[11px] font-medium text-cyan-300">{item.from?.name || item.from?.identity || "Participant"}</p><p className="mt-1 rounded-xl bg-white/[0.06] px-3 py-2 text-sm text-slate-200">{item.message}</p></div>)}</div><form onSubmit={(event) => void submit(event)} className="flex gap-2 border-t border-white/10 p-3"><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Type a message..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm outline-none focus:border-cyan-300/60" /><button disabled={isSending || !message.trim()} title="Send message" aria-label="Send message" className="rounded-xl bg-cyan-400 px-3 text-slate-950 disabled:opacity-40"><Send className="h-4 w-4" /></button></form></>; }

function CopyMeetingLink({ meetingId }: { meetingId: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const link = `${window.location.origin}/placement/ai-student-meeting/join?meeting=${meetingId}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copiedWithFallback = document.execCommand("copy");
        textArea.remove();
        if (!copiedWithFallback) throw new Error("Copy command was rejected.");
      }
      setCopied(true);
      toast.success("Meeting link copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Unable to copy meeting link. Select and copy the URL from the address bar.");
    }
  }

  return <button onClick={() => void copy()} className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">{copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}{copied ? "Copied" : "Copy meeting link"}</button>;
}

function formatDuration(seconds: number) { const minutes = Math.floor(seconds / 60).toString().padStart(2, "0"); return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`; }

function hasMediaCapture() { return typeof window !== "undefined" && window.isSecureContext && Boolean(navigator.mediaDevices?.getUserMedia); }

function SecureMediaNotice({ loading }: { loading: boolean }) {
  const secureUrl = typeof window === "undefined" ? "https://<your-lan-ip>:3001" : `https://${window.location.hostname}:3001`;
  return <div className="flex min-h-full items-center justify-center bg-[#080c13] p-6 text-center text-white"><div className="max-w-lg rounded-3xl border border-amber-300/20 bg-[#111824] p-8 shadow-2xl"><ShieldCheck className="mx-auto h-10 w-10 text-amber-300" /><h1 className="mt-5 text-xl font-semibold">Secure connection required</h1><p className="mt-3 text-sm leading-6 text-slate-400">{loading ? "Checking browser security..." : "Camera and microphone access is available only over HTTPS or localhost. Restart the development server with the HTTPS command, then open:"}</p>{!loading && <p className="mt-4 break-all rounded-xl bg-black/30 px-4 py-3 text-sm font-medium text-cyan-300">{secureUrl}</p>}</div></div>;
}
