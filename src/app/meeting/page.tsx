'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Upload, Sparkles, CheckSquare, Users, ArrowRight, Clock, Mic, Clipboard } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface MeetingSummary {
  id: string; title: string; date: Date; duration: string;
  summary: string; tasks: string[]; actionItems: string[]; followUps: string[];
}

const SAMPLE: MeetingSummary = {
  id: '1', title: 'Q3 Product Roadmap Review', date: new Date('2025-06-05'), duration: '52 min',
  summary: 'The team reviewed Q3 objectives, aligning on the AI feature rollout timeline. Main discussion points included NVIDIA NIM integration progress, knowledge vault semantic search improvements, and voice assistant deployment. Engineering confirmed a 3-week sprint for voice features. Design presented updated dashboard mockups with strong positive reception.',
  tasks: [
    'Complete NVIDIA NIM API integration by June 15',
    'Deploy knowledge vault semantic search to staging',
    'Finalize voice assistant UX by June 12',
    'Update onboarding flow with new dashboard design',
  ],
  actionItems: [
    'Alex: Set up NVIDIA API credentials and test streaming',
    'Sarah: Finalize dashboard mockups and share in Figma by EOD Friday',
    'Dev Team: Complete code review for voice assistant PR #147',
    'PM: Update roadmap doc with revised timelines',
  ],
  followUps: [
    'Schedule deep-dive on agent hub architecture — next Tuesday',
    'Review Cloudinary storage limits with DevOps',
    'Present voice demo to stakeholders — June 18',
  ],
};

export default function MeetingPage() {
  const [summaries, setSummaries] = useState<MeetingSummary[]>([SAMPLE]);
  const [selected, setSelected] = useState<MeetingSummary>(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [tab, setTab] = useState<'upload' | 'live'>('upload');
  const [recording, setRecording] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function processFile(file: File) {
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setTranscript(text.slice(0, 500));
    };
    reader.readAsText(file);
    setTimeout(() => {
      const newSummary: MeetingSummary = {
        id: Date.now().toString(), title: `Meeting — ${file.name.replace(/\.[^.]+$/, '')}`,
        date: new Date(), duration: 'Unknown',
        summary: `AI-processed meeting from ${file.name}. Connect NVIDIA_API_KEY to enable full transcript analysis, speaker identification, and action item extraction. The AI will analyze the full transcript and generate a structured summary with tasks, action items, and follow-ups.`,
        tasks: ['Review generated summary', 'Assign action items', 'Schedule follow-ups'],
        actionItems: ['Team: Review AI-generated summary for accuracy', 'Lead: Distribute action items to assignees'],
        followUps: ['Schedule next meeting', 'Review progress on action items'],
      };
      setSummaries(prev => [newSummary, ...prev]);
      setSelected(newSummary);
      setLoading(false);
    }, 2000);
  }

  function copySection(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleRecording() {
    setRecording(r => !r);
    if (recording) {
      // Stop — simulate processing
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    }
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black font-display mb-2">AI Meeting Assistant</h1>
          <p className="text-white/40 text-sm">Upload transcripts or record live — get summaries, tasks, and action items via NVIDIA NIM</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload + History */}
          <div className="space-y-5">
            {/* Mode tabs */}
            <div className="flex p-1 rounded-xl gap-1" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
              {[['upload','Upload File'],['live','Live Record']].map(([t,l]) => (
                <button key={t} onClick={() => setTab(t as 'upload'|'live')}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab===t?'text-white':'text-white/40 hover:text-white/70'}`}
                  style={tab===t?{background:'linear-gradient(135deg,#4F46E5,#7C3AED)'}:{}}>
                  {l}
                </button>
              ))}
            </div>

            {/* Upload area */}
            {tab === 'upload' ? (
              <div
                onClick={() => fileRef.current?.click()}
                className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all border-white/10 hover:border-violet-500/30 hover:bg-white/[0.02]">
                <input ref={fileRef} type="file" className="hidden" accept=".txt,.pdf,.docx,.md"
                  onChange={e => e.target.files?.[0] && processFile(e.target.files[0])} />
                <Upload className="size-8 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/50 mb-1">Upload meeting notes or transcript</p>
                <p className="text-xs text-white/25">TXT · PDF · DOCX · Markdown</p>
              </div>
            ) : (
              <div className="rounded-2xl p-6 text-center" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <div className={`size-16 rounded-full flex items-center justify-center mx-auto mb-4 ${recording ? 'pulsating-border' : ''}`}
                  style={{ background: recording ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.15)', border: `2px solid ${recording ? 'rgba(239,68,68,0.5)' : 'rgba(124,58,237,0.4)'}` }}>
                  {recording ? <div className="size-5 rounded bg-red-500" /> : <Mic className="size-7 text-violet-400" />}
                </div>
                {recording && (
                  <div className="flex justify-center gap-1 items-end h-6 mb-3">
                    {[1,2,3,4,5].map(b => <div key={b} className="voice-bar" />)}
                  </div>
                )}
                <p className="text-sm text-white/60 mb-4">{recording ? 'Recording in progress...' : 'Record meeting audio live'}</p>
                <button onClick={toggleRecording}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all ${recording ? 'bg-red-500/80 hover:bg-red-500' : ''}`}
                  style={recording ? {} : { background:'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                  {recording ? 'Stop & Process' : 'Start Recording'}
                </button>
              </div>
            )}

            {/* Processing indicator */}
            {loading && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)' }}>
                <Sparkles className="size-4 text-violet-400 animate-spin flex-shrink-0" />
                <div>
                  <p className="text-xs text-violet-300 font-medium">NVIDIA NIM processing...</p>
                  <p className="text-[10px] text-white/35">Analyzing transcript · Extracting insights</p>
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Meeting History</p>
              <div className="space-y-2">
                {summaries.map(s => (
                  <button key={s.id} onClick={() => setSelected(s)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selected.id === s.id ? 'border-violet-500/30 bg-violet-500/8' : 'border-white/7 hover:bg-white/5'}`}
                    style={{ border:`1px solid ${selected.id === s.id ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
                    <p className="text-xs font-medium text-white/75 truncate">{s.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-white/30 flex items-center gap-1"><Clock className="size-2.5"/>{s.duration}</span>
                      <span className="text-[10px] text-white/30">{s.date.toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary output */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div key={selected.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="space-y-4">

                {/* Header */}
                <div className="p-5 rounded-2xl" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="font-bold font-display text-white/90">{selected.title}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-white/35 flex items-center gap-1"><Calendar className="size-3"/>{selected.date.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
                        <span className="text-[11px] text-white/35 flex items-center gap-1"><Clock className="size-3"/>{selected.duration}</span>
                      </div>
                    </div>
                    <button onClick={() => copySection(selected.summary + '\n\nTasks:\n' + selected.tasks.join('\n'), 'all')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/50 hover:text-white transition-all"
                      style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
                      <Clipboard className="size-3.5" />{copied === 'all' ? 'Copied!' : 'Copy all'}
                    </button>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{selected.summary}</p>
                </div>

                {/* Three columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tasks */}
                  <div className="p-4 rounded-2xl" style={{ background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5"><CheckSquare className="size-3.5"/>Tasks ({selected.tasks.length})</p>
                      <button onClick={() => copySection(selected.tasks.join('\n'), 'tasks')} className="text-[10px] text-white/30 hover:text-emerald-400 transition-colors">{copied==='tasks'?'Copied!':'Copy'}</button>
                    </div>
                    <ul className="space-y-2">
                      {selected.tasks.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <div className="size-1.5 rounded-full bg-emerald-400/60 flex-shrink-0 mt-1.5" />{t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Items */}
                  <div className="p-4 rounded-2xl" style={{ background:'rgba(124,58,237,0.05)', border:'1px solid rgba(124,58,237,0.15)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-1.5"><Users className="size-3.5"/>Action Items</p>
                      <button onClick={() => copySection(selected.actionItems.join('\n'), 'actions')} className="text-[10px] text-white/30 hover:text-violet-400 transition-colors">{copied==='actions'?'Copied!':'Copy'}</button>
                    </div>
                    <ul className="space-y-2">
                      {selected.actionItems.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <ArrowRight className="size-3 text-violet-400/60 flex-shrink-0 mt-0.5" />{a}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Follow-ups */}
                  <div className="p-4 rounded-2xl" style={{ background:'rgba(6,182,212,0.05)', border:'1px solid rgba(6,182,212,0.15)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="size-3.5"/>Follow-ups</p>
                      <button onClick={() => copySection(selected.followUps.join('\n'), 'followups')} className="text-[10px] text-white/30 hover:text-cyan-400 transition-colors">{copied==='followups'?'Copied!':'Copy'}</button>
                    </div>
                    <ul className="space-y-2">
                      {selected.followUps.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                          <div className="size-1.5 rounded-full bg-cyan-400/60 flex-shrink-0 mt-1.5" />{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
