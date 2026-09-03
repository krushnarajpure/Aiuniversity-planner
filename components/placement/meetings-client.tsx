"use client";

import "@livekit/components-styles";
import { useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import { LiveMeeting } from "./live-meeting-room";
import { ArrowRight, CalendarDays, Clock3, Headphones, Info, Plus, Search, Sparkles, Users, Video, X } from "lucide-react";
import { toast } from "sonner";

type MeetingMode = "create" | "join" | null;
type Connection = { serverUrl: string; participantToken: string; meetingId: string };

async function readApiResponse(response: Response): Promise<Record<string, unknown>> {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(`Meeting service returned an empty response (${response.status}).`);
  }

  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    throw new Error(`Meeting service returned an invalid response (${response.status}).`);
  }
}

export function MeetingsClient({ userName, initialMeetingId = "" }: { userName: string; initialMeetingId?: string }) {
  const [mode, setMode] = useState<MeetingMode>(initialMeetingId ? "join" : null);
  const [title, setTitle] = useState("");
  const [meetingId, setMeetingId] = useState(initialMeetingId);
  const [password, setPassword] = useState("");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryMeeting = new URLSearchParams(window.location.search).get("meeting");
    if (queryMeeting) { setMeetingId(queryMeeting); setMode("join"); }
  }, []);

  async function createMeeting() {
    setLoading(true);
    try {
      const response = await fetch("/api/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, type: "PLACEMENT", maxParticipants: 25, waitingRoom: true }) });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Unable to create meeting.");
      const meeting = result.meeting as { id: string; password: string } | undefined;
      if (!meeting?.id || !meeting.password) throw new Error("Meeting service returned incomplete meeting credentials.");
      setMeetingId(meeting.id); setPassword(meeting.password); setMode("join");
      await joinMeeting(meeting.id, meeting.password);
      toast.success("Meeting created");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create meeting."); }
    finally { setLoading(false); }
  }

  async function joinMeeting(joinId = meetingId, joinPassword = password) {
    setLoading(true);
    try {
      const response = await fetch("/api/meetings/token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingId: joinId.trim(), password: joinPassword, participantName: userName }) });
      const result = await readApiResponse(response);
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Unable to join meeting.");
      if (typeof result.serverUrl !== "string" || typeof result.participantToken !== "string") throw new Error("Meeting service returned incomplete connection details.");
      setConnection(result as unknown as Connection); setMode(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to join meeting."); }
    finally { setLoading(false); }
  }

  if (connection) return <LiveMeeting connection={connection} userName={userName} onLeave={() => setConnection(null)} />;

  return <div className="min-h-[calc(100vh-73px)] bg-slate-50/70 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-small font-medium text-primary"><Video className="h-4 w-4" /> Placement collaboration</div><h1 className="text-3xl font-semibold tracking-tight">AI Student Meetings</h1><p className="mt-1 text-small text-slate-500 dark:text-slate-400">Connect, collaborate and grow together.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setMode("join")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-small font-medium shadow-sm transition hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-900"><ArrowRight className="h-4 w-4" />Join meeting</button><button onClick={() => setMode("create")} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-small font-medium text-white shadow-sm transition hover:opacity-90"><Plus className="h-4 w-4" />Start meeting</button></div></div><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric icon={CalendarDays} label="Today's meetings" value="0" /><Metric icon={Clock3} label="Upcoming meetings" value="0" /><Metric icon={Users} label="Meetings attended" value="0" /><Metric icon={Headphones} label="Total meeting hours" value="0h" /></div><div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]"><section className="card"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-card-title font-semibold">Upcoming meetings</h2><p className="mt-1 text-small text-slate-500 dark:text-slate-400">Scheduled rooms will appear here after they are created.</p></div><CalendarDays className="h-5 w-5 text-primary" /></div><EmptyState onClick={() => setMode("create")} /></section><section className="card"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-card-title font-semibold">Quick join</h2><p className="mt-1 text-small text-slate-500 dark:text-slate-400">Use an invite from another student.</p></div><ArrowRight className="h-5 w-5 text-secondary" /></div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={meetingId} onChange={(event) => setMeetingId(event.target.value)} placeholder="Meeting ID" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-small outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800" /></div><button onClick={() => setMode("join")} className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-small font-medium text-white dark:bg-white dark:text-slate-900">Continue to join</button><p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500"><Info className="h-3.5 w-3.5" />Rooms use encrypted LiveKit media.</p></section></div><section className="card"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></span><div><h2 className="text-card-title font-semibold">Meeting AI</h2><p className="text-small text-slate-500 dark:text-slate-400">AI notes and action items become available inside an active room.</p></div></div></section></div>{mode && <MeetingDialog mode={mode} title={title} meetingId={meetingId} password={password} setTitle={setTitle} setMeetingId={setMeetingId} setPassword={setPassword} loading={loading} onClose={() => setMode(null)} onCreate={createMeeting} onJoin={() => void joinMeeting()} />}</div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { return <div className="card p-4 sm:p-5"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-small text-slate-500 dark:text-slate-400">{label}</p></div>; }
function EmptyState({ onClick }: { onClick: () => void }) { return <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center dark:border-slate-700 dark:bg-slate-800/40"><p className="font-medium">No upcoming meetings</p><p className="mt-1 text-small text-slate-500 dark:text-slate-400">Create a secure room for a mock interview, study group, or recruiter conversation.</p><button onClick={onClick} className="mt-4 text-small font-medium text-primary hover:underline">Start a meeting</button></div>; }

function MeetingDialog({ mode, title, meetingId, password, setTitle, setMeetingId, setPassword, loading, onClose, onCreate, onJoin }: { mode: Exclude<MeetingMode, null>; title: string; meetingId: string; password: string; setTitle: (value: string) => void; setMeetingId: (value: string) => void; setPassword: (value: string) => void; loading: boolean; onClose: () => void; onCreate: () => void; onJoin: () => void }) { const creating = mode === "create"; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"><div className="flex items-start justify-between"><div><p className="text-small font-medium text-primary">{creating ? "Create meeting" : "Join meeting"}</p><h2 className="mt-1 text-xl font-semibold">{creating ? "Start a secure room" : "Enter meeting credentials"}</h2></div><button onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button></div><div className="mt-6 space-y-4">{creating ? <label className="block text-small font-medium">Meeting name<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Technical interview practice" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-small outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800" /></label> : <><label className="block text-small font-medium">Meeting ID<input autoFocus value={meetingId} onChange={(event) => setMeetingId(event.target.value)} placeholder="PL-XXXXXXXX" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-small outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800" /></label><label className="block text-small font-medium">Password<input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Meeting password" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-small outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800" /></label></>}<p className="text-xs text-slate-500">Your browser will ask for camera and microphone access when you join.</p></div><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-lg px-4 py-2 text-small font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button><button onClick={creating ? onCreate : onJoin} disabled={loading || (creating ? !title.trim() : !meetingId.trim() || !password)} className="rounded-lg bg-primary px-4 py-2 text-small font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Connecting..." : creating ? "Create & start" : "Join meeting"}</button></div></div></div>; }

function LegacyLiveMeeting({ connection, onLeave }: { connection: Connection; onLeave: () => void }) { return <div className="fixed inset-0 z-40 bg-[#10131a] text-white"><LiveKitRoom token={connection.participantToken} serverUrl={connection.serverUrl} connect audio video onDisconnected={onLeave} className="h-full"><VideoConference /><RoomAudioRenderer /></LiveKitRoom></div>; }
