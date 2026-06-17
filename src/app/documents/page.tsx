'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, Search, Eye, Trash2, MessageSquare, CheckCircle2, FolderOpen } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface Document {
  id: string; name: string; type: 'PDF' | 'DOCX' | 'PPTX' | 'TXT';
  size: string; uploadedAt: Date; status: 'ready' | 'processing' | 'error';
  insights?: string; pages?: number;
}

const SAMPLE_DOCS: Document[] = [
  { id:'1', name:'NVIDIA_Architecture_Overview.pdf', type:'PDF', size:'2.4 MB', uploadedAt: new Date('2025-06-01'), status:'ready', insights:'Key topics: TensorRT-LLM, NIM microservices, H100 GPU optimization, inference pipeline architecture.', pages:24 },
  { id:'2', name:'Q3_Strategy_Deck.pptx', type:'PPTX', size:'5.8 MB', uploadedAt: new Date('2025-05-28'), status:'ready', insights:'32 slides covering product roadmap, revenue targets, competitive analysis, and go-to-market strategy.', pages:32 },
  { id:'3', name:'Research_Notes.txt', type:'TXT', size:'48 KB', uploadedAt: new Date('2025-06-05'), status:'ready', insights:'Personal research notes on LLM alignment, RLHF techniques, and constitutional AI approaches.', pages:1 },
  { id:'4', name:'Annual_Report_2025.pdf', type:'PDF', size:'8.2 MB', uploadedAt: new Date('2025-06-03'), status:'processing', pages:88 },
];

const TYPE_ICON: Record<string, { icon: string; bg: string; text: string }> = {
  PDF:  { icon:'📄', bg:'bg-red-500/10',    text:'text-red-400'    },
  DOCX: { icon:'📝', bg:'bg-blue-500/10',   text:'text-blue-400'   },
  PPTX: { icon:'📊', bg:'bg-orange-500/10', text:'text-orange-400' },
  TXT:  { icon:'📋', bg:'bg-gray-500/10',   text:'text-gray-400'   },
};

type ActivePanel = { docId: string; mode: 'summary' | 'qa' | 'insights' } | null;

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>(SAMPLE_DOCS);
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [answering, setAnswering] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function addFiles(files: File[]) {
    const newDocs: Document[] = files.map((f, i) => ({
      id: Date.now().toString() + i,
      name: f.name,
      type: (f.name.split('.').pop()?.toUpperCase() ?? 'TXT') as Document['type'],
      size: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${(f.size / 1024).toFixed(0)} KB`,
      uploadedAt: new Date(),
      status: 'processing',
    }));
    setDocs(prev => [...newDocs, ...prev]);
    // Simulate processing
    setTimeout(() => {
      setDocs(prev => prev.map(d =>
        newDocs.find(n => n.id === d.id)
          ? { ...d, status: 'ready', insights: 'AI insights will appear after processing. Connect NVIDIA_API_KEY to enable.' }
          : d
      ));
    }, 2500);
  }

  function askQuestion() {
    if (!question.trim() || answering) return;
    setAnswering(true);
    setTimeout(() => {
      const doc = docs.find(d => d.id === activePanel?.docId);
      setAnswer(`Based on "${doc?.name}", here is what I found regarding your question: "${question}"\n\nThis is a demo answer. Connect your NVIDIA_API_KEY and the document will be processed through NVIDIA NIM for real AI-powered Q&A with accurate citations from the document content.`);
      setAnswering(false);
    }, 1500);
  }

  const filtered = docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const activeDoc = docs.find(d => d.id === activePanel?.docId);

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black font-display mb-2">Document Intelligence</h1>
          <p className="text-white/40 text-sm">Upload documents — AI summarizes, answers questions, and extracts key insights via NVIDIA NIM</p>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); }}
          onClick={() => fileRef.current?.click()}
          className={`mb-8 rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${dragging ? 'border-violet-500/60 bg-violet-500/8 scale-[1.01]' : 'border-white/10 hover:border-violet-500/30 hover:bg-white/[0.02]'}`}>
          <input ref={fileRef} type="file" multiple className="hidden" accept=".pdf,.docx,.pptx,.txt"
            onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files)); }} />
          <Upload className="size-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm mb-1">Drop files here or <span className="text-violet-400">click to browse</span></p>
          <p className="text-xs text-white/25">PDF · DOCX · PPTX · TXT · Stored in Cloudinary · AI-indexed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/8 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25" />
            </div>

            {/* Stats row */}
            <div className="flex gap-3">
              {[['Total', docs.length, 'text-white/60'], ['Ready', docs.filter(d=>d.status==='ready').length, 'text-emerald-400'], ['Processing', docs.filter(d=>d.status==='processing').length, 'text-amber-400']].map(([l,v,c]) => (
                <div key={l as string} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <span className={c as string}>{v}</span><span className="text-white/40">{l}</span>
                </div>
              ))}
            </div>

            {/* Doc cards */}
            <AnimatePresence>
              {filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <FolderOpen className="size-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No documents found</p>
                </div>
              ) : filtered.map(doc => {
                const meta = TYPE_ICON[doc.type] ?? TYPE_ICON.TXT;
                const isActive = activePanel?.docId === doc.id;
                return (
                  <motion.div key={doc.id} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.97 }}
                    className={`group p-4 rounded-2xl transition-all ${isActive ? 'border-violet-500/30' : 'border-white/7 hover:border-white/15'}`}
                    style={{ background: isActive ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.025)', border: `1px solid ${isActive ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.07)'}` }}>
                    <div className="flex items-start gap-3">
                      <div className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${meta.bg}`}>{meta.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-white/85 truncate">{doc.name}</p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {doc.status === 'ready' ? <CheckCircle2 className="size-3.5 text-emerald-400" /> : <div className="size-3.5 rounded-full border-2 border-amber-400/60 border-t-transparent animate-spin" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>{doc.type}</span>
                          <span className="text-[10px] text-white/30">{doc.size}</span>
                          {doc.pages && <span className="text-[10px] text-white/30">{doc.pages} pages</span>}
                        </div>
                        {doc.insights && doc.status === 'ready' && (
                          <p className="text-[11px] text-white/40 mt-1.5 line-clamp-2">{doc.insights}</p>
                        )}
                      </div>
                    </div>
                    {doc.status === 'ready' && (
                      <div className="flex gap-2 mt-3">
                        {(['summary','qa','insights'] as const).map(mode => (
                          <button key={mode} onClick={() => setActivePanel(prev => prev?.docId === doc.id && prev.mode === mode ? null : { docId: doc.id, mode })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive && activePanel?.mode === mode ? 'text-white' : 'text-white/40 hover:text-white bg-white/5 hover:bg-white/8'}`}
                            style={isActive && activePanel?.mode === mode ? { background:'linear-gradient(135deg,#4F46E5,#7C3AED)' } : {}}>
                            {mode === 'summary' ? <><Sparkles className="size-3"/>Summary</> : mode === 'qa' ? <><MessageSquare className="size-3"/>Q&A</> : <><Eye className="size-3"/>Insights</>}
                          </button>
                        ))}
                        <button onClick={() => setDocs(prev => prev.filter(d => d.id !== doc.id))}
                          className="ml-auto p-1.5 text-white/25 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/8 opacity-0 group-hover:opacity-100">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {activePanel && activeDoc ? (
                <motion.div key={activePanel.docId + activePanel.mode} initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:16 }}
                  className="p-5 rounded-2xl" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="size-4 text-violet-400" />
                    <span className="text-sm font-semibold text-white/80 capitalize">{activePanel.mode === 'qa' ? 'Document Q&A' : activePanel.mode}</span>
                  </div>
                  <p className="text-[11px] text-white/30 mb-4 truncate">{activeDoc.name}</p>

                  {activePanel.mode === 'summary' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl" style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.15)' }}>
                        <p className="text-xs text-white/70 leading-relaxed">{activeDoc.insights ?? 'Summary will be generated when NVIDIA_API_KEY is connected.'}</p>
                      </div>
                      {activeDoc.pages && <p className="text-[11px] text-white/30">{activeDoc.pages} pages · {activeDoc.size}</p>}
                    </div>
                  )}

                  {activePanel.mode === 'qa' && (
                    <div className="space-y-3">
                      <textarea value={question} onChange={e => setQuestion(e.target.value)} rows={3}
                        placeholder="Ask anything about this document..."
                        className="w-full px-3 py-2.5 rounded-xl text-xs bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25 resize-none" />
                      <button onClick={askQuestion} disabled={!question.trim() || answering}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-40"
                        style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                        {answering ? 'Analyzing...' : 'Ask AI'}
                      </button>
                      {answer && (
                        <div className="p-3 rounded-xl text-xs text-white/70 leading-relaxed" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                          {answer}
                        </div>
                      )}
                    </div>
                  )}

                  {activePanel.mode === 'insights' && (
                    <div className="space-y-2">
                      {['Key Topics', 'Main Arguments', 'Action Items', 'Key Statistics', 'Named Entities'].map((item, i) => (
                        <div key={item} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{item}</p>
                          <div className="skeleton h-3 rounded w-3/4" />
                        </div>
                      ))}
                      <p className="text-[10px] text-white/25 text-center pt-2">Connect NVIDIA_API_KEY to unlock real insights</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} className="p-8 rounded-2xl text-center"
                  style={{ background:'rgba(255,255,255,0.015)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <FileText className="size-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/25 text-sm">Select a document and choose Summary, Q&A, or Insights</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload stats */}
            <div className="p-4 rounded-2xl glass-card">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Storage</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Cloudinary</span>
                  <span className="text-violet-400">Active</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Documents</span>
                  <span className="text-white/60">{docs.length} files</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">AI Engine</span>
                  <span className="text-emerald-400">NVIDIA NIM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
