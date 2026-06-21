'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, BookOpen, FileText, Bot, Mic, ArrowRight, CheckCircle2, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import Aurora from '@/components/aurora/Aurora';

function getGreeting(){const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening';}

const QUICK_ACTIONS = [
  {icon:<MessageSquare className="size-5 text-violet-400"/>,label:'New Chat',desc:'Start AI conversation',href:'/chat',color:'border-violet-500/20'},
  {icon:<Search className="size-5 text-cyan-400"/>,label:'Research',desc:'Deep research reports',href:'/research',color:'border-cyan-500/20'},
  {icon:<FileText className="size-5 text-amber-400"/>,label:'Career',desc:'Resume & interview prep',href:'/career',color:'border-amber-500/20'},
  {icon:<Mic className="size-5 text-pink-400"/>,label:'Voice',desc:'Speak to your AI',href:'/chat',color:'border-pink-500/20'},
  {icon:<Bot className="size-5 text-blue-400"/>,label:'Agents',desc:'Autonomous AI agents',href:'/agents',color:'border-blue-500/20'},
  {icon:<BookOpen className="size-5 text-emerald-400"/>,label:'Knowledge',desc:'Your document vault',href:'/knowledge-vault',color:'border-emerald-500/20'},
];

// NOTE: STATS, RECENT, and the AI Status list below are still hardcoded
// mock data — that was true before this fix and is unchanged here. Only
// userName was wired to real data, since that's what was reported broken.
// Wiring stats/recent-activity/AI-status to real collections is a
// separate, larger task (would need actual usage-tracking endpoints that
// don't exist yet) — flagging so this isn't mistaken for "fully live."
const STATS = [
  {label:'Active Tasks',val:'12',delta:'+3 today',icon:<CheckCircle2 className="size-4 text-emerald-400"/>,color:'text-emerald-400'},
  {label:'Documents',val:'34',delta:'+2 this week',icon:<FileText className="size-4 text-amber-400"/>,color:'text-amber-400'},
  {label:'Research Sessions',val:'7',delta:'2 active',icon:<Search className="size-4 text-cyan-400"/>,color:'text-cyan-400'},
  {label:'Chat Messages',val:'284',delta:'Last 7 days',icon:<MessageSquare className="size-4 text-violet-400"/>,color:'text-violet-400'},
];

const RECENT = [
  {type:'chat',label:'Analyzed Q3 earnings report',time:'2m ago',icon:'💬'},
  {type:'research',label:'AI trends in healthcare 2025',time:'1h ago',icon:'🔍'},
  {type:'career',label:'Resume ATS score: 87/100',time:'3h ago',icon:'📄'},
  {type:'knowledge',label:'Added 3 documents to vault',time:'5h ago',icon:'📚'},
  {type:'agent',label:'Research agent completed task',time:'8h ago',icon:'🤖'},
];

export default function DashboardPage() {
  // ✅ FIX: was `useState('Alex')` — hardcoded placeholder, never replaced
  // with a real value. Now fetched from /api/settings, the same endpoint
  // src/app/settings/page.tsx already uses, which returns both `email`
  // and `settings.profile.name`. Falls back to the email's local-part
  // (before the @) if profile.name is empty, so a user who registered
  // but never set a display name still sees something better than
  // "Unnamed" or a blank greeting.
  const [userName, setUserName] = useState('');
  const [nameLoading, setNameLoading] = useState(true);
  const [time,setTime]=useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setTime(new Date()),60000);return()=>clearInterval(t);},[]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/settings', { credentials: 'include' });
        if (!res.ok) {
          if (!cancelled) setNameLoading(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        const name = data.settings?.profile?.name?.trim();
        const emailLocalPart = data.email ? String(data.email).split('@')[0] : '';
        setUserName(name || emailLocalPart || 'there');
      } catch {
        if (!cancelled) setUserName('there');
      } finally {
        if (!cancelled) setNameLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AppLayout>
      <div className="relative min-h-full p-6" style={{zIndex:1}}>
        <Aurora variant="minimal"/>
        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          {/* Greeting */}
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.5}}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black font-display mb-1">
                  {getGreeting()}{nameLoading ? '' : `, ${userName}`} 👋
                </h1>
                <p className="text-white/40 text-sm">
                  {time.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · NVIDIA NIM is ready
                </p>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{background:'rgba(124,58,237,0.1)',border:'1px solid rgba(124,58,237,0.2)'}}>
                <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                <span className="text-xs text-violet-300 font-medium">All systems operational</span>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s,i)=>(
              <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                className="p-4 rounded-2xl glass-card bento-cell">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/40">{s.label}</span>
                  {s.icon}
                </div>
                <p className={`text-2xl font-black font-display ${s.color}`}>{s.val}</p>
                <p className="text-[11px] text-white/25 mt-1">{s.delta}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {QUICK_ACTIONS.map((a,i)=>(
                <motion.div key={a.label} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:0.2+i*0.06}}>
                  <Link href={a.href} className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl border bg-white/[0.02] hover:bg-white/[0.05] transition-all bento-cell text-center ${a.color}`}>
                    <div className="size-10 rounded-xl flex items-center justify-center" style={{background:'rgba(255,255,255,0.06)'}}>
                      {a.icon}
                    </div>
                    <span className="text-xs font-semibold text-white/80 group-hover:text-white font-display">{a.label}</span>
                    <span className="text-[10px] text-white/30">{a.desc}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Two column: Recent + NVIDIA Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent activity */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold font-display text-sm">Recent Activity</h2>
                <span className="text-[11px] text-white/30">Last 24 hours</span>
              </div>
              <div className="space-y-2">
                {RECENT.map((item,i)=>(
                  <motion.div key={i} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.3+i*0.05}}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-all cursor-default">
                    <span className="text-base">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70 truncate">{item.label}</p>
                    </div>
                    <span className="text-[10px] text-white/25 flex-shrink-0 flex items-center gap-1">
                      <Clock className="size-3"/>{item.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Status panel */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <h2 className="font-bold font-display text-sm">AI Status</h2>
              {[
                {label:'NVIDIA NIM',status:'Active',color:'emerald',icon:'⚡'},
                {label:'OpenRouter Fallback',status:'Standby',color:'amber',icon:'🔄'},
                {label:'Tavily Research',status:'Active',color:'emerald',icon:'🔍'},
                {label:'Voice Assistant',status:'Ready',color:'blue',icon:'🎤'},
              ].map(item=>(
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/60">{item.label}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full text-${item.color}-400`} style={{background:`rgba(${item.color==='emerald'?'52,211,153':item.color==='amber'?'251,191,36':'59,130,246'},0.1)`,border:`1px solid rgba(${item.color==='emerald'?'52,211,153':item.color==='amber'?'251,191,36':'59,130,246'},0.2)`}}>
                    {item.status}
                  </span>
                </div>
              ))}

              <div className="pt-3 border-t border-white/[0.06]">
                <Link href="/chat" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{background:'linear-gradient(135deg,#4F46E5,#7C3AED)',boxShadow:'0 0 20px rgba(124,58,237,0.3)'}}>
                  <Zap className="size-3.5"/> Launch AI Chat <ArrowRight className="size-3.5"/>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}