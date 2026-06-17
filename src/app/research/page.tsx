'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Globe, ChevronDown, ChevronUp, ExternalLink, Clock, Plus } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface Source { title: string; url: string; snippet: string; }
interface ResearchResult { query: string; report: string; sources: Source[]; followUps: string[]; ts: Date; }

const SAMPLE: ResearchResult = {
  query: 'NVIDIA NIM platform AI inference 2025',
  report: `## NVIDIA NIM: Next-Generation AI Inference\n\nNVIDIA NIM (NVIDIA Inference Microservices) represents a significant leap in deploying AI models at scale. Released as part of NVIDIA's AI Enterprise platform, NIM provides optimized inference containers for large language models, vision models, and multimodal AI systems.\n\n### Key Capabilities\n\n**Performance Optimization**: NIM leverages TensorRT-LLM for up to 5x faster inference compared to standard PyTorch deployments. The platform automatically selects optimal GPU kernels based on hardware configuration.\n\n**Model Support**: NIM supports Meta's LLaMA 3.1 series (8B, 70B, 405B), Mistral models, Google's Gemma, and NVIDIA's own Nemotron series. Each model is pre-optimized and safety-tested.\n\n**Deployment Flexibility**: Organizations can deploy NIM on-premises, in private clouds, or access via NVIDIA's hosted API at integrate.api.nvidia.com.\n\n### Industry Impact\n\nEnterprise adoption has accelerated throughout 2025, with major healthcare, finance, and technology companies integrating NIM into production workflows. The platform's OpenAI-compatible API makes migration from existing deployments straightforward.`,
  sources: [
    {title:'NVIDIA NIM Documentation', url:'https://docs.nvidia.com/nim', snippet:'Official NVIDIA NIM platform documentation covering deployment, APIs, and supported models.'},
    {title:'NVIDIA Developer Blog', url:'https://developer.nvidia.com/blog', snippet:'NVIDIA announces NIM microservices for enterprise AI deployment with TensorRT-LLM optimization.'},
    {title:'AI Inference Benchmark 2025', url:'https://benchmarks.ai', snippet:'Independent benchmarks show NVIDIA NIM achieving 5x throughput improvement over baseline PyTorch.'},
  ],
  followUps: [
    'How does NVIDIA NIM compare to Amazon Bedrock?',
    'What are the costs of NVIDIA NIM API usage?',
    'How to integrate NVIDIA NIM with LangChain?',
    'What is TensorRT-LLM and how does it work?',
  ],
  ts: new Date('2025-06-05T11:08:00Z'), // static — never use new Date() at module scope, it evaluates separately on server vs client and causes hydration mismatch
};

// Deterministic formatters — never use toLocaleDateString/toLocaleTimeString for SSR-rendered text (hydration mismatch).
function formatDate(d: Date): string {
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
}
function formatTime(d: Date): string {
  let h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function SourceCard({ source }: { source: Source }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden transition-all" style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.08)'}}>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={()=>setExpanded(!expanded)}>
        <Globe className="size-4 text-cyan-400 flex-shrink-0"/>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/80 truncate">{source.title}</p>
          <p className="text-[11px] text-white/30 truncate">{source.url}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={source.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} className="text-white/30 hover:text-cyan-400 transition-colors"><ExternalLink className="size-3.5"/></a>
          {expanded?<ChevronUp className="size-4 text-white/30"/>:<ChevronDown className="size-4 text-white/30"/>}
        </div>
      </button>
      <AnimatePresence>
        {expanded&&(
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} style={{overflow:'hidden'}}>
            <p className="px-4 pb-3 text-xs text-white/50 leading-relaxed border-t border-white/6 pt-3">{source.snippet}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult|null>(null);
  const [history, setHistory] = useState<ResearchResult[]>([SAMPLE]);

  async function runResearch() {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50s ceiling — NIM-only path, give it room past its own 40s timeout
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `Research request failed (${res.status})`);
      }

      const data = await res.json();
      const r: ResearchResult = {
        query: query.trim(),
        ts: new Date(),
        report: data.report,
        sources: data.sources ?? [],
        followUps: data.followUps ?? [],
      };
      setResult(r);
      setHistory(prev => [r, ...prev]);
    } catch (e) {
      clearTimeout(timeoutId);
      if (e instanceof DOMException && e.name === 'AbortError') {
        setError('Research timed out after 45s. The Tavily/Firecrawl/NIM pipeline may be slow or unreachable — check your network and API keys.');
      } else {
        setError(e instanceof Error ? e.message : 'Research failed. Check your API keys and try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black font-display mb-2">AI Research Assistant</h1>
          <p className="text-white/40 text-sm">Deep research powered by NVIDIA NIM · Tavily · Firecrawl — cited reports in minutes</p>
        </div>

        {/* Search input */}
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="mb-8">
          <div className="relative flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/30"/>
              <input value={query} onChange={e=>setQuery(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter')runResearch();}}
                placeholder="Enter a research topic... e.g. 'Latest advances in quantum computing 2025'"
                className="w-full pl-11 pr-4 py-4 rounded-2xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25 transition-all"/>
            </div>
            <button onClick={runResearch} disabled={!query.trim()||loading}
              className="flex items-center gap-2.5 px-6 py-4 rounded-2xl text-sm font-bold text-white disabled:opacity-40 transition-all hover:-translate-y-0.5"
              style={{background:'linear-gradient(135deg,#4F46E5,#7C3AED)',boxShadow:'0 0 24px rgba(124,58,237,0.4)'}}>
              {loading?<><Sparkles className="size-4 animate-spin"/>Researching...</>:<><Search className="size-4"/>Research</>}
            </button>
          </div>
        </motion.div>

        {/* Error state */}
        {error && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-8 p-4 rounded-2xl text-sm text-red-300" style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)'}}>
            {error}
          </motion.div>
        )}

        {/* Loading state */}
        {loading&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-8 p-6 rounded-2xl text-center" style={{background:'rgba(124,58,237,0.06)',border:'1px solid rgba(124,58,237,0.2)'}}>
            <div className="flex justify-center gap-1 mb-4 items-end h-8">
              {[1,2,3,4,5].map(b=><div key={b} className="voice-bar"/>)}
            </div>
            <div className="space-y-1">
              {['🔍 Searching with Tavily...','📄 Extracting content with Firecrawl...','🧠 Synthesizing with NVIDIA NIM...'].map((s,i)=>(
                <p key={i} className="text-xs text-white/40">{s}</p>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Result */}
          <div className="lg:col-span-2 space-y-6">
            {(result||(!loading&&history[0]))&&(()=>{
              const r = result||history[0];
              return (
                <>
                  {/* Report */}
                  <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="rounded-2xl p-6" style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.08)'}}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="size-4 text-violet-400"/>
                        <span className="text-sm font-semibold text-white/80">Research Report</span>
                      </div>
                      <span className="text-[10px] text-white/25 flex items-center gap-1"><Clock className="size-3"/>{formatTime(r.ts)}</span>
                    </div>
                    <h2 className="text-lg font-bold font-display mb-4 gradient-text">{r.query}</h2>
                    <div className="prose prose-invert prose-sm max-w-none text-white/70 leading-relaxed text-sm whitespace-pre-line">{r.report}</div>
                  </motion.div>

                  {/* Sources */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Sources ({r.sources.length})</h3>
                    <div className="space-y-2">
                      {r.sources.map((s,i)=><SourceCard key={i} source={s}/>)}
                    </div>
                  </div>

                  {/* Follow-ups */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Follow-up Questions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {r.followUps.map((q,i)=>(
                        <button key={i} onClick={()=>{setQuery(q);}}
                          className="flex items-center gap-2 px-4 py-3 rounded-xl text-left text-xs text-white/60 hover:text-white transition-all hover:bg-white/5"
                          style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)'}}>
                          <Plus className="size-3 text-violet-400 flex-shrink-0"/>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* History sidebar */}
          <div>
            <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Research History</h3>
            <div className="space-y-2">
              {history.map((h,i)=>(
                <button key={i} onClick={()=>setResult(h)}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all hover:bg-white/5"
                  style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.07)'}}>
                  <p className="text-xs text-white/70 truncate">{h.query}</p>
                  <p className="text-[10px] text-white/25 mt-1">{formatDate(h.ts)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}