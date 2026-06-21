'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle, XCircle, AlertCircle, FileText, MessageSquare, ChevronRight, Upload, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

type Tab = 'resume' | 'interview' | 'cover' | 'linkedin';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id:'resume', label:'Resume Analyzer', icon:'📄' },
  { id:'interview', label:'Interview Prep', icon:'🎤' },
  { id:'cover', label:'Cover Letter', icon:'✉️' },
  { id:'linkedin', label:'LinkedIn Optimizer', icon:'💼' },
];

const INTERVIEW_QUESTIONS = [
  { q:'Tell me about a time you led a technically complex project under tight deadlines.', category:'Behavioral', difficulty:'Medium' },
  { q:'How would you design a distributed caching system that handles 10M requests/day?', category:'System Design', difficulty:'Hard' },
  { q:'What is your approach to debugging a memory leak in a production Node.js service?', category:'Technical', difficulty:'Medium' },
  { q:'Describe how you would implement a real-time collaboration feature.', category:'System Design', difficulty:'Hard' },
  { q:'How do you prioritize features when technical debt competes with new development?', category:'Product', difficulty:'Easy' },
];

const LINKEDIN_TOOLS: { type:string; icon:string; title:string; desc:string; cta:string; placeholder:string }[] = [
  { type:'headline', icon:'📝', title:'Headline Optimizer', desc:'Craft a keyword-rich LinkedIn headline that attracts recruiters and passes LinkedIn search algorithms.', cta:'Optimize Headline', placeholder:'Paste your current title/background, e.g. "Frontend dev, 2 yrs React/Next.js"...' },
  { type:'profile', icon:'📊', title:'Profile Score', desc:'Get a comprehensive LinkedIn profile audit with actionable improvements ranked by impact.', cta:'Score My Profile', placeholder:'Paste your current "About" section...' },
  { type:'connection', icon:'🔗', title:'Connection Strategy', desc:'AI-generated personalized connection messages for cold outreach, follow-ups, and networking.', cta:'Generate Messages', placeholder:'Who are you reaching out to and why? e.g. "Recruiter at a fintech startup, cold outreach"...' },
  { type:'post', icon:'📣', title:'Post Generator', desc:'Create engaging LinkedIn posts that build your personal brand and attract opportunities.', cta:'Write Posts', placeholder:'What do you want to post about? e.g. "Just shipped a Next.js AI app with NVIDIA NIM"...' },
  { type:'jobmatch', icon:'🎯', title:'Job Match', desc:'Analyze job descriptions and highlight exactly how your profile matches the role requirements.', cta:'Match Jobs', placeholder:'Paste the job description...' },
  { type:'recommendation', icon:'⭐', title:'Recommendations', desc:'Generate professional recommendation templates for colleagues and managers to customize.', cta:'Draft Recommendations', placeholder:'Who is this for and what did they do well? e.g. "Teammate who led our backend migration"...' },
];

function ATSScore({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const circumference = 2 * Math.PI * 45;
  const dashOffset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative size-28">
        <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" style={{ transition:'stroke-dashoffset 1.5s ease', filter:`drop-shadow(0 0 8px ${color}66)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black font-display" style={{ color }}>{score}</span>
          <span className="text-[10px] text-white/40">ATS Score</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold" style={{ color }}>{score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}</p>
    </div>
  );
}

export default function CareerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('resume');
  const [resumeText, setResumeText] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<{ score:number; breakdown:Record<string,number>; issues:{type:string;text:string}[] } | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [coverInput, setCoverInput] = useState({ company:'', role:'', highlights:'' });
  const [generatedCover, setGeneratedCover] = useState('');

  const [selectedQ, setSelectedQ] = useState<number|null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');

  const [activeLinkedinTool, setActiveLinkedinTool] = useState<string|null>(null);
  const [linkedinInput, setLinkedinInput] = useState('');
  const [linkedinResult, setLinkedinResult] = useState('');

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/career/resume/parse-pdf', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse PDF');
      setResumeText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF upload failed');
    } finally {
      setUploadingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function analyze() {
    if (!resumeText.trim()) { setError('Paste your resume or upload a PDF first'); return; }
    setError('');
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch('/api/career/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  async function generateCover() {
    if (!coverInput.company.trim() || !coverInput.role.trim()) { setError('Company and role are required'); return; }
    setError('');
    setLoading(true);
    setGeneratedCover('');
    try {
      const res = await fetch('/api/career/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coverInput),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setGeneratedCover(data.letter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  async function getFeedback() {
    if (selectedQ === null || !answer.trim()) return;
    setError('');
    setLoading(true);
    setFeedback('');
    try {
      const res = await fetch('/api/career/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: INTERVIEW_QUESTIONS[selectedQ].q, answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Feedback failed');
      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feedback failed');
    } finally {
      setLoading(false);
    }
  }

  async function runLinkedinTool() {
    if (!activeLinkedinTool || !linkedinInput.trim()) return;
    setError('');
    setLoading(true);
    setLinkedinResult('');
    try {
      const res = await fetch('/api/career/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeLinkedinTool, input: linkedinInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setLinkedinResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black font-display mb-2">Career Copilot</h1>
          <p className="text-white/40 text-sm">AI-powered resume analysis, interview prep & career tools — powered by NVIDIA NIM</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-xs text-red-400 flex items-center justify-between" style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="size-3.5" /></button>
          </div>
        )}

        {/* Animated Tabs */}
        <div className="flex gap-2 mb-8 p-1.5 rounded-2xl flex-wrap" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setError(''); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
              style={activeTab === tab.id ? { background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 0 20px rgba(124,58,237,0.35)' } : {}}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* Resume Analyzer */}
          {activeTab === 'resume' && (
            <motion.div key="resume" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Target Job Role</label>
                    <input value={jobRole} onChange={e => setJobRole(e.target.value)} placeholder="e.g. Senior AI Engineer at Google"
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-white/40 uppercase tracking-wider block">Paste Resume Text</label>
                      <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPdf}
                        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50 transition-colors">
                        <Upload className="size-3" /> {uploadingPdf ? 'Reading PDF...' : 'Upload PDF'}
                      </button>
                      <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                    </div>
                    <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={10} placeholder="Paste your resume here or upload a PDF..."
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25 resize-none custom-scrollbar" />
                  </div>
                  <button onClick={analyze} disabled={loading || uploadingPdf}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
                    style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 0 20px rgba(124,58,237,0.35)' }}>
                    {loading ? <><Sparkles className="size-4 animate-spin" /> Analyzing with AI...</> : <><Sparkles className="size-4" /> Analyze Resume</>}
                  </button>
                </div>

                {analysis && (
                  <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="space-y-5">
                    <div className="p-5 rounded-2xl glass-card flex flex-col sm:flex-row gap-6 items-center">
                      <ATSScore score={analysis.score} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-semibold text-white/80 mb-3">Score Breakdown</p>
                        {[
                          ['Keywords Match', analysis.breakdown.keywords],
                          ['Format Quality', analysis.breakdown.format],
                          ['Experience Depth', analysis.breakdown.experience],
                          ['Skills Coverage', analysis.breakdown.skills],
                        ].map(([l, v]) => (
                          <div key={l as string} className="flex items-center gap-2">
                            <span className="text-xs text-white/50 w-36">{l}</span>
                            <div className="flex-1 h-1.5 rounded-full bg-white/8">
                              <div className="h-full rounded-full bg-violet-500" style={{ width:`${v}%` }}/>
                            </div>
                            <span className="text-xs text-white/50 w-8 text-right">{v}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {analysis.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.025)' }}>
                          {issue.type === 'success' ? <CheckCircle className="size-4 text-emerald-400 flex-shrink-0 mt-0.5" /> : issue.type === 'warning' ? <AlertCircle className="size-4 text-amber-400 flex-shrink-0 mt-0.5" /> : <XCircle className="size-4 text-red-400 flex-shrink-0 mt-0.5" />}
                          <p className="text-xs text-white/65">{issue.text}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Interview Prep */}
          {activeTab === 'interview' && (
            <motion.div key="interview" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm text-white/50 mb-4">Select a question to practice your answer and get AI feedback</p>
                  {INTERVIEW_QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => { setSelectedQ(i); setAnswer(''); setFeedback(''); setError(''); }}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${selectedQ === i ? 'border-violet-500/40' : 'border-white/8 hover:border-white/15'}`}
                      style={{ background: selectedQ === i ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.025)', border: `1px solid ${selectedQ === i ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-white/80">{q.q}</p>
                        <ChevronRight className="size-4 text-white/30 flex-shrink-0 mt-0.5" />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full text-violet-400" style={{ background:'rgba(124,58,237,0.1)' }}>{q.category}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${q.difficulty === 'Hard' ? 'text-red-400 bg-red-500/10' : q.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>{q.difficulty}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  {selectedQ !== null ? (
                    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="space-y-4">
                      <div className="p-4 rounded-2xl" style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.2)' }}>
                        <p className="text-sm text-white/80">{INTERVIEW_QUESTIONS[selectedQ].q}</p>
                      </div>
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Your Answer</label>
                        <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={7} placeholder="Type your answer here..."
                          className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25 resize-none custom-scrollbar" />
                      </div>
                      <button onClick={getFeedback} disabled={!answer.trim() || loading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
                        style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                        {loading ? 'Getting AI feedback...' : <><Sparkles className="size-4" /> Get AI Feedback</>}
                      </button>
                      {feedback && (
                        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="p-4 rounded-2xl" style={{ background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)' }}>
                          <p className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Sparkles className="size-3 text-emerald-400" /> AI Feedback</p>
                          <p className="text-sm text-white/70 leading-relaxed">{feedback}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16">
                      <MessageSquare className="size-10 text-white/10 mb-4" />
                      <p className="text-white/30 text-sm">Select a question to start practicing</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Cover Letter */}
          {activeTab === 'cover' && (
            <motion.div key="cover" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Company Name</label>
                    <input value={coverInput.company} onChange={e => setCoverInput(p => ({...p, company: e.target.value}))} placeholder="e.g. Google, Anthropic, OpenAI"
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Role Title</label>
                    <input value={coverInput.role} onChange={e => setCoverInput(p => ({...p, role: e.target.value}))} placeholder="e.g. Senior AI Engineer"
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25" />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Key Highlights (optional)</label>
                    <textarea value={coverInput.highlights} onChange={e => setCoverInput(p => ({...p, highlights: e.target.value}))} rows={4} placeholder="Key achievements, skills, or experiences to highlight..."
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25 resize-none" />
                  </div>
                  <button onClick={generateCover} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
                    style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 0 20px rgba(124,58,237,0.35)' }}>
                    {loading ? <><Sparkles className="size-4 animate-spin" /> Generating...</> : <><Sparkles className="size-4" /> Generate Cover Letter</>}
                  </button>
                </div>
                <div>
                  {generatedCover ? (
                    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="h-full">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-white/40 uppercase tracking-wider">Generated Cover Letter</p>
                        <button onClick={() => navigator.clipboard.writeText(generatedCover)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Copy</button>
                      </div>
                      <div className="p-5 rounded-2xl h-[calc(100%-2rem)] overflow-y-auto custom-scrollbar" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{generatedCover}</p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16">
                      <FileText className="size-10 text-white/10 mb-4" />
                      <p className="text-white/30 text-sm">Fill in the details and generate your cover letter</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* LinkedIn */}
          {activeTab === 'linkedin' && (
            <motion.div key="linkedin" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}>
              {!activeLinkedinTool ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {LINKEDIN_TOOLS.map((item, i) => (
                    <motion.div key={item.type} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.06 }}
                      onClick={() => { setActiveLinkedinTool(item.type); setLinkedinInput(''); setLinkedinResult(''); setError(''); }}
                      className="p-5 rounded-2xl group bento-cell cursor-pointer"
                      style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
                      <div className="text-2xl mb-3">{item.icon}</div>
                      <h3 className="text-sm font-bold font-display text-white/85 mb-2">{item.title}</h3>
                      <p className="text-xs text-white/40 leading-relaxed mb-4">{item.desc}</p>
                      <span className="flex items-center gap-1.5 text-xs text-violet-400 group-hover:text-violet-300 transition-colors font-medium">
                        {item.cta} <ArrowRight className="size-3" />
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <button onClick={() => setActiveLinkedinTool(null)} className="text-xs text-white/40 hover:text-white/70 transition-colors">← Back to tools</button>
                    <p className="text-sm font-semibold text-white/80">{LINKEDIN_TOOLS.find(t => t.type === activeLinkedinTool)?.title}</p>
                    <textarea value={linkedinInput} onChange={e => setLinkedinInput(e.target.value)} rows={8}
                      placeholder={LINKEDIN_TOOLS.find(t => t.type === activeLinkedinTool)?.placeholder}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25 resize-none custom-scrollbar" />
                    <button onClick={runLinkedinTool} disabled={!linkedinInput.trim() || loading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
                      style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 0 20px rgba(124,58,237,0.35)' }}>
                      {loading ? <><Sparkles className="size-4 animate-spin" /> Generating...</> : <><Sparkles className="size-4" /> Generate</>}
                    </button>
                  </div>
                  <div>
                    {linkedinResult ? (
                      <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="h-full">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-white/40 uppercase tracking-wider">Result</p>
                          <button onClick={() => navigator.clipboard.writeText(linkedinResult)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Copy</button>
                        </div>
                        <div className="p-5 rounded-2xl h-[calc(100%-2rem)] overflow-y-auto custom-scrollbar" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)' }}>
                          <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{linkedinResult}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-16">
                        <FileText className="size-10 text-white/10 mb-4" />
                        <p className="text-white/30 text-sm">Fill in the details and generate</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}