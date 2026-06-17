'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Sparkles, ArrowRight, ChevronRight, Mic,
  BookOpen, FileText, Zap, Globe, Shield,
  MessageSquare, Search, Bot,
} from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/aurora/Aurora';

/* ── Typing Animation ── */
function TypingAnimation({ phrases }: { phrases: string[] }) {
  const [current, setCurrent] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const phrase = phrases[current];
    let t: NodeJS.Timeout;
    if (!deleting && displayed.length < phrase.length) t = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 60);
    else if (!deleting) t = setTimeout(() => setDeleting(true), 2200);
    else if (deleting && displayed.length > 0) t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 32);
    else { setDeleting(false); setCurrent(c => (c + 1) % phrases.length); }
    return () => clearTimeout(t);
  }, [displayed, deleting, current, phrases]);
  return <span className="gradient-text font-display typing-cursor">{displayed}</span>;
}

/* ── Floating Navbar ── */
function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  const links = [['/#features','Features'],['/dashboard','Dashboard'],['/research','Research'],['/career','Career']];
  return (
    <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 rounded-full px-4 py-2`}
      style={scrolled
        ? { background:'rgba(5,8,22,0.92)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }
        : { background:'rgba(5,8,22,0.6)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-7 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 0 16px rgba(124,58,237,0.5)' }}>
            <Sparkles className="size-3.5 text-white" />
          </div>
          <span className="font-black text-sm font-display">Nexus</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full text-violet-300" style={{ background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)' }}>AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map(([href,label]) => (
            <Link key={href} href={href} className="px-3 py-1.5 rounded-full text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all">{label}</Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-3 py-1.5 rounded-full text-xs text-white/60 hover:text-white transition-colors">Sign in</Link>
          <Link href="/register" className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white"
            style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 0 16px rgba(124,58,237,0.4)' }}>
            Get started <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ── Bento data ── */
const BENTO = [
  { icon:<MessageSquare className="size-5 text-violet-400"/>, title:'AI Chat', desc:'Streaming conversations powered by NVIDIA NIM with markdown, code highlighting, history & voice.', color:'from-violet-500/10', border:'border-violet-500/20', span:'lg:col-span-2', href:'/chat' },
  { icon:<Search className="size-5 text-cyan-400"/>, title:'AI Research', desc:'Tavily + Firecrawl + NVIDIA NIM generates cited research reports with follow-up questions.', color:'from-cyan-500/10', border:'border-cyan-500/20', span:'', href:'/research' },
  { icon:<BookOpen className="size-5 text-emerald-400"/>, title:'Knowledge Vault', desc:'Semantic document search across PDFs, notes, and research — AI-indexed and retrievable.', color:'from-emerald-500/10', border:'border-emerald-500/20', span:'', href:'/knowledge-vault' },
  { icon:<Mic className="size-5 text-pink-400"/>, title:'Voice Assistant', desc:'Web Speech API — speak commands, hear AI responses. Zero cost, fully browser-native.', color:'from-pink-500/10', border:'border-pink-500/20', span:'', href:'/chat' },
  { icon:<FileText className="size-5 text-amber-400"/>, title:'Career Copilot', desc:'ATS resume scoring, cover letters, interview prep, LinkedIn optimization — all AI-powered.', color:'from-amber-500/10', border:'border-amber-500/20', span:'lg:col-span-2', href:'/career' },
  { icon:<Bot className="size-5 text-blue-400"/>, title:'Agent Hub', desc:'Autonomous research, productivity, document, and career agents that execute tasks end-to-end.', color:'from-blue-500/10', border:'border-blue-500/20', span:'', href:'/agents' },
];

/* ── Bento Card (no framer-motion dependency on useInView) ── */
function BentoCard({ item, i }: { item: typeof BENTO[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref}
      className={`bento-cell group p-5 rounded-2xl border bg-gradient-to-br cursor-pointer transition-all ${item.color} to-transparent ${item.border} ${item.span}`}
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.45s ${i * 0.07}s ease, transform 0.45s ${i * 0.07}s ease` }}>
      <Link href={item.href} className="flex flex-col h-full">
        <div className="size-10 rounded-xl flex items-center justify-center mb-4" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }}>{item.icon}</div>
        <h3 className="font-bold text-white mb-2 font-display group-hover:text-violet-200 transition-colors">{item.title}</h3>
        <p className="text-sm text-white/40 leading-relaxed flex-1">{item.desc}</p>
        <div className="mt-4 flex items-center gap-1 text-xs text-white/30 group-hover:text-violet-400 transition-colors">Open <ChevronRight className="size-3" /></div>
      </Link>
    </div>
  );
}

/* ── Tech stack marquee ── */
const TECH = ['NVIDIA NIM','Next.js 16','React 19','TypeScript','Tailwind CSS','MongoDB Atlas','Cloudinary','Tavily','Firecrawl','OpenRouter','Resend','Zustand','Sentry','Web Speech API'];

/* ── Dashboard preview ── */
function DashboardPreview() {
  return (
    <div className="relative mt-16 mx-auto max-w-5xl"
      style={{ opacity:1, animation:'fadeUp 0.8s 0.5s both ease' }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(40px) scale(0.96)}to{opacity:1;transform:none}}`}</style>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-20 blur-3xl opacity-25 rounded-full" style={{ background:'linear-gradient(90deg,#7C3AED,#3B82F6)' }} />
      <div className="relative rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(124,58,237,0.2)', background:'rgba(5,8,22,0.97)', boxShadow:'0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)' }}>
        {/* Chrome */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.02)' }}>
          <div className="flex gap-1.5">
            {['#FF5F57','#FFBD2E','#28CA42'].map(c => <div key={c} className="size-2.5 rounded-full" style={{ background:c, opacity:0.7 }} />)}
          </div>
          <div className="flex-1 mx-4 h-5 rounded-md flex items-center justify-center" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-[10px] text-white/20">nexus-ai.vercel.app/dashboard</span>
          </div>
        </div>
        {/* Layout */}
        <div className="flex" style={{ height:'340px' }}>
          {/* Sidebar */}
          <div className="w-44 flex-shrink-0 flex flex-col" style={{ borderRight:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-2 p-3 mb-1" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div className="size-6 rounded-lg flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)' }}><Sparkles className="size-3 text-white" /></div>
              <span className="text-xs font-bold font-display">Nexus AI</span>
            </div>
            <nav className="flex-1 p-2 space-y-0.5">
              {[['🏠','Dashboard',true],['💬','AI Chat'],['🔍','Research'],['📚','Knowledge'],['📄','Documents'],['🎤','Voice'],['🤖','Agents'],['💼','Career'],['📅','Meetings']].map(([icon,label,active]) => (
                <div key={label as string} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] cursor-default ${active ? 'nav-item-active' : 'text-white/40'}`}>
                  <span>{icon}</span>{label}
                </div>
              ))}
            </nav>
          </div>
          {/* Chat */}
          <div className="flex flex-col flex-1 min-w-0" style={{ borderRight:'1px solid rgba(255,255,255,0.05)' }}>
            <div className="px-4 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-xs font-semibold text-white/80 font-display">Good morning, Alex 👋</p>
              <p className="text-[10px] text-white/35">NVIDIA NIM · LLaMA 3.1 70B</p>
            </div>
            <div className="flex-1 p-3 flex flex-col gap-2.5 overflow-hidden">
              <div className="flex items-start gap-2">
                <div className="size-5 rounded-md flex-shrink-0 flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)' }}><Sparkles className="size-2.5 text-white" /></div>
                <div className="px-2.5 py-1.5 rounded-xl rounded-tl-sm text-[9px] text-white/60 max-w-56 leading-relaxed" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  ATS score: <span className="text-emerald-400 font-bold">87/100</span>. 3 improvements found for FAANG roles.
                </div>
              </div>
              <div className="flex justify-end">
                <div className="px-2.5 py-1.5 rounded-xl rounded-tr-sm text-[9px] text-white/90 max-w-40" style={{ background:'linear-gradient(135deg,#4338CA,#6D28D9)' }}>Analyze my resume for FAANG</div>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex gap-0.5 items-end h-4">{[1,2,3,4,5].map(b => <div key={b} className="voice-bar" />)}</div>
                <span className="text-[9px] text-violet-400">AI is thinking...</span>
              </div>
            </div>
            <div className="px-3 pb-3">
              <div className="h-7 rounded-xl flex items-center px-2.5" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-[9px] text-white/20">Ask Nexus AI anything...</span>
                <div className="ml-auto flex items-center gap-1">
                  <Mic className="size-3 text-white/30" />
                  <div className="size-4 rounded-md flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)' }}><ArrowRight className="size-2 text-white" /></div>
                </div>
              </div>
            </div>
          </div>
          {/* Right panel */}
          <div className="w-48 flex-shrink-0 flex flex-col">
            <div className="px-3 py-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}><p className="text-[10px] font-semibold text-white/70">Stats</p></div>
            <div className="flex-1 p-2.5 space-y-2">
              {[['Tasks','12','#818CF8'],['Documents','34','#34D399'],['Research','7','#F59E0B'],['Sessions','28','#F472B6']].map(([l,v,c]) => (
                <div key={l} className="rounded-lg p-2" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[8px] text-white/30">{l}</p>
                  <p className="text-sm font-bold" style={{ color:c }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Scroll-reveal helper (no framer-motion) ── */
function Reveal({ children, delay=0, className='' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity:vis?1:0, transform:vis?'none':'translateY(20px)', transition:`opacity 0.5s ${delay}s ease, transform 0.5s ${delay}s ease` }}>
      {children}
    </div>
  );
}

/* ── MAIN ── */
export default function LandingPage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background:'var(--bg)' }}>
      <Aurora />
      <FloatingNav />

      {/* Hero */}
      <section className="relative pt-36 pb-8 px-6 text-center" style={{ zIndex:1 }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-violet-300 text-xs font-medium mb-6"
          style={{ border:'1px solid rgba(124,58,237,0.3)', background:'rgba(124,58,237,0.08)', animation:'fadeUp 0.5s ease both' }}>
          <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
          Powered by NVIDIA NIM · Next.js 16 · React 19 · MongoDB Atlas
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-4 max-w-5xl mx-auto font-display"
          style={{ animation:'fadeUp 0.6s 0.1s ease both' }}>
          Nexus AI<br />
          <TypingAnimation phrases={['Your Personal AI OS','Research at Warp Speed','Career Copilot','Voice-First AI','Knowledge Vault']} />
        </h1>
        <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ animation:'fadeUp 0.6s 0.2s ease both' }}>
          A full-stack AI Operating System — chat, research, documents, voice assistant, career tools, and autonomous agents. One platform, infinite capability.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3" style={{ animation:'fadeUp 0.5s 0.3s ease both' }}>
          <Link href="/register" className="flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 font-display"
            style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 0 32px rgba(124,58,237,0.5)' }}>
            Start for Free <ArrowRight className="size-4" />
          </Link>
          <Link href="/login" className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-white/60 hover:text-white transition-all"
            style={{ border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)' }}>
            Sign In
          </Link>
        </div>
        <DashboardPreview />
      </section>

      {/* Stats */}
      <section className="relative px-6 py-16" style={{ zIndex:1 }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val:'10+', label:'AI Features', sub:'chat · research · voice · agents' },
            { val:'NIM', label:'NVIDIA Powered', sub:'LLaMA 3.1 70B primary' },
            { val:'∞', label:'Knowledge Vault', sub:'semantic doc search' },
            { val:'🎤', label:'Voice Native', sub:'speak & listen' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="p-5 rounded-2xl text-center hover:-translate-y-1 transition-all h-full"
                style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(12px)' }}>
                <p className="text-3xl font-black font-display mb-1 gradient-text">{s.val}</p>
                <p className="text-sm font-semibold text-white/70 mb-1">{s.label}</p>
                <p className="text-[11px] text-white/25">{s.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features Bento */}
      <section id="features" className="relative px-6 py-20" style={{ zIndex:1 }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 font-display">One OS. Every AI feature.</h2>
            <p className="text-white/35 max-w-xl mx-auto text-sm leading-relaxed">Production-grade AI built with NVIDIA NIM, MongoDB Atlas, Cloudinary, Tavily, and more.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENTO.map((item, i) => <BentoCard key={item.title} item={item} i={i} />)}
          </div>
        </div>
      </section>

      {/* Tech marquee */}
      <section className="relative py-12 overflow-hidden" style={{ borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', zIndex:1 }}>
        <p className="text-center text-[10px] text-white/20 uppercase tracking-widest font-semibold mb-6">Built on the best stack</p>
        <div className="flex">
          <div className="animate-scroll-left flex gap-6 whitespace-nowrap">
            {[...TECH, ...TECH].map((t, i) => (
              <span key={i} className="px-4 py-2 rounded-full text-xs text-white/40 hover:text-white transition-all cursor-default flex-shrink-0"
                style={{ border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.025)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 relative" style={{ zIndex:1 }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight mb-3 font-display">How Nexus AI works</h2>
            <p className="text-white/30 text-sm">From sign up to full AI productivity in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step:'01', title:'Create Account', desc:'Register with Google OAuth or email OTP. Your AI workspace is ready instantly.', icon:<Shield className="size-5 text-violet-400"/> },
              { step:'02', title:'Connect Your Tools', desc:'Upload documents, connect your data, and let NVIDIA NIM understand your context.', icon:<Globe className="size-5 text-cyan-400"/> },
              { step:'03', title:'AI Does the Rest', desc:'Chat, research, analyze resumes, run agents — all with NVIDIA-grade LLMs.', icon:<Zap className="size-5 text-amber-400"/> },
            ].map((step, i) => (
              <Reveal key={step.step} delay={i * 0.1}>
                <div className="p-6 rounded-2xl relative h-full" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div className="absolute -top-3 -left-2 text-5xl font-black font-display opacity-10 text-violet-400">{step.step}</div>
                  <div className="size-10 rounded-xl flex items-center justify-center mb-4" style={{ background:'rgba(255,255,255,0.06)' }}>{step.icon}</div>
                  <h3 className="font-bold text-white mb-2 font-display">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 relative" style={{ zIndex:1 }}>
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <div className="p-10 rounded-3xl" style={{ border:'1px solid rgba(124,58,237,0.25)', background:'linear-gradient(135deg,rgba(124,58,237,0.08),rgba(99,102,241,0.04))', backdropFilter:'blur(20px)' }}>
              <div className="size-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 0 40px rgba(124,58,237,0.5)' }}>
                <Sparkles className="size-6 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-3 font-display">Your AI OS awaits</h2>
              <p className="text-white/40 text-sm leading-relaxed mb-7">Join and experience AI-powered research, career tools, voice assistant, and autonomous agents in one platform.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register" className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-white transition-all hover:-translate-y-0.5 font-display"
                  style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow:'0 0 28px rgba(124,58,237,0.45)' }}>
                  Create free account <ChevronRight className="size-4" />
                </Link>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium text-white/60 hover:text-white transition-all"
                  style={{ border:'1px solid rgba(255,255,255,0.1)' }}>
                  View Dashboard
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10" style={{ borderTop:'1px solid rgba(255,255,255,0.05)', position:'relative', zIndex:1 }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#4F46E5,#7C3AED)' }}><Sparkles className="size-3.5 text-white" /></div>
              <span className="font-black font-display">Nexus AI</span>
              <span className="text-xs text-white/25">Your Personal AI Operating System</span>
            </div>
            <div className="flex flex-wrap gap-6 text-xs text-white/30">
              {[['Dashboard','/dashboard'],['AI Chat','/chat'],['Research','/research'],['Knowledge Vault','/knowledge-vault'],['Career','/career'],['Agents','/agents']].map(([label,href]) => (
                <Link key={href} href={href} className="hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[11px] text-white/20">© 2025 Nexus AI · Powered by NVIDIA NIM</p>
            <div className="flex items-center gap-2 text-[11px] text-white/20">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
