'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Search, FileText, Trash2, Sparkles, Clock, FolderOpen } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface Doc { id: string; name: string; type: string; size: string; tags: string[]; summary: string; ts: Date; category: string; }

const SAMPLE_DOCS: Doc[] = [
  { id:'1', name:'NVIDIA_NIM_Architecture.pdf', type:'PDF', size:'2.4 MB', tags:['AI','NVIDIA','Inference'], summary:'Comprehensive overview of NVIDIA NIM microservices architecture, deployment models, and TensorRT-LLM optimization pipeline.', ts: new Date('2025-06-01'), category:'Research' },
  { id:'2', name:'Q3_2025_Strategy.docx', type:'DOCX', size:'890 KB', tags:['Strategy','Business'], summary:'Q3 2025 product and go-to-market strategy document with OKRs, milestones, and revenue targets.', ts: new Date('2025-05-28'), category:'Business' },
  { id:'3', name:'Resume_AlexJohnson.pdf', type:'PDF', size:'340 KB', tags:['Career','Resume'], summary:'Senior AI Engineer resume with 7 years experience in ML infrastructure, LLMs, and distributed systems.', ts: new Date('2025-05-20'), category:'Career' },
  { id:'4', name:'Meeting_Notes_June5.txt', type:'TXT', size:'12 KB', tags:['Meeting','Notes'], summary:'Product roadmap meeting notes covering Q3 priorities, engineering blockers, and design review outcomes.', ts: new Date('2025-06-05'), category:'Meetings' },
  { id:'5', name:'LLM_Research_Survey.pdf', type:'PDF', size:'5.1 MB', tags:['AI','LLM','Research'], summary:'Academic survey of large language model training methods, RLHF techniques, and emerging architectures as of mid-2025.', ts: new Date('2025-06-03'), category:'Research' },
];

const CATEGORIES = ['All', 'Research', 'Business', 'Career', 'Meetings'];
const TYPE_COLORS: Record<string,string> = { PDF:'text-red-400 bg-red-500/10 border-red-500/20', DOCX:'text-blue-400 bg-blue-500/10 border-blue-500/20', TXT:'text-gray-400 bg-gray-500/10 border-gray-500/20', PPTX:'text-orange-400 bg-orange-500/10 border-orange-500/20' };

// Deterministic date format — same output on server and client, no locale/timezone drift.
// This is the hydration fix: never use toLocaleDateString()/toLocaleString() for SSR-rendered text.
function formatDate(d: Date): string {
  const mm = d.getUTCMonth() + 1;
  const dd = d.getUTCDate();
  const yyyy = d.getUTCFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function DocCard({ doc, onDelete }: { doc: Doc; onDelete: (id:string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = TYPE_COLORS[doc.type] || 'text-white/40 bg-white/5 border-white/10';
  return (
    <motion.div layout initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
      className="rounded-2xl p-5 group transition-all hover:-translate-y-0.5"
      style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}>
          <FileText className="size-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-white/85 truncate">{doc.name}</p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeColor}`}>{doc.type}</span>
              <button onClick={() => onDelete(doc.id)} className="opacity-0 group-hover:opacity-100 p-1 text-white/25 hover:text-red-400 transition-all"><Trash2 className="size-3.5" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-white/30">{doc.size}</span>
            <span className="text-[10px] text-white/30 flex items-center gap-1"><Clock className="size-2.5" />{formatDate(doc.ts)}</span>
            <span className="text-[10px] text-white/30">{doc.category}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {doc.tags.map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full text-violet-400" style={{ background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)' }}># {t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-white/30 hover:text-violet-400 transition-colors flex items-center gap-1">
          <Sparkles className="size-3" /> {expanded ? 'Hide' : 'Show'} AI Summary
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} style={{ overflow:'hidden' }}>
              <p className="text-xs text-white/50 leading-relaxed mt-2 pl-4 border-l-2 border-violet-500/30">{doc.summary}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function KnowledgeVaultPage() {
  const [docs, setDocs] = useState<Doc[]>(SAMPLE_DOCS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [dragging, setDragging] = useState(false);

  const filtered = docs.filter(d =>
    (category === 'All' || d.category === category) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  function deleteDoc(id: string) { setDocs(prev => prev.filter(d => d.id !== id)); }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const newDocs: Doc[] = files.map((f, i) => ({
      id: Date.now().toString() + i, name: f.name, type: f.name.split('.').pop()?.toUpperCase() || 'FILE',
      size: `${(f.size / 1024).toFixed(0)} KB`, tags: ['Uploaded'], summary: 'AI summary will be generated after processing.',
      ts: new Date(), category: 'Research',
    }));
    setDocs(prev => [...newDocs, ...prev]);
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black font-display mb-2">Knowledge Vault</h1>
          <p className="text-white/40 text-sm">Your AI-indexed document library — semantic search, summaries, and Q&A</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label:'Documents', val: docs.length, color:'text-violet-400' },
            { label:'Categories', val: CATEGORIES.length - 1, color:'text-cyan-400' },
            { label:'AI Indexed', val: docs.length, color:'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl text-center glass-card">
              <p className={`text-2xl font-black font-display ${s.color}`}>{s.val}</p>
              <p className="text-xs text-white/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Upload zone */}
        <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
          className={`mb-8 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${dragging ? 'border-violet-500/60 bg-violet-500/8' : 'border-white/10 hover:border-white/20'}`}>
          <Upload className="size-8 text-white/25 mx-auto mb-3" />
          <p className="text-sm text-white/50 mb-1">Drop documents here or <label className="text-violet-400 cursor-pointer hover:text-violet-300 transition-colors"><input type="file" multiple className="hidden" accept=".pdf,.docx,.txt,.pptx" />browse files</label></p>
          <p className="text-xs text-white/25">Supports PDF, DOCX, PPTX, TXT · Stored in Cloudinary · AI-indexed via NVIDIA NIM</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Semantic search across your vault..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/8 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${category === cat ? 'nav-item-active' : 'text-white/40 hover:text-white bg-white/5 hover:bg-white/8'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Docs grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.length > 0 ? filtered.map(doc => (
              <DocCard key={doc.id} doc={doc} onDelete={deleteDoc} />
            )) : (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="col-span-2 py-20 text-center">
                <FolderOpen className="size-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 text-sm">No documents found. Upload some files to get started.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AppLayout>
  );
}