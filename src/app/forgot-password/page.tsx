'use client';
import { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/aurora/Aurora';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen text-white overflow-hidden relative" style={{ background: '#050816' }}>
      <Aurora variant="minimal" />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="size-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-black font-display text-lg">Nexus AI</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
            {!sent ? (
              <>
                <div className="size-12 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                  <Mail className="size-5 text-violet-400" />
                </div>
                <h1 className="text-xl font-bold font-display mb-2 text-center">Reset password</h1>
                <p className="text-white/40 text-sm text-center mb-7">Enter your email and we'll send a reset link.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/60 text-white placeholder-white/25 transition-all"
                      placeholder="you@example.com" />
                  </div>
                  <button type="submit" disabled={loading || !email}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}>
                    {loading ? 'Sending...' : <> Send reset link <ArrowRight className="size-4" /> </>}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="size-12 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-emerald-500/15 border border-emerald-500/25">
                  <Mail className="size-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold font-display mb-2">Check your inbox</h2>
                <p className="text-white/40 text-sm leading-relaxed">We sent a password reset link to <span className="text-violet-400">{email}</span>. Check your spam folder if you don't see it.</p>
              </div>
            )}
          </div>
          <p className="text-center mt-4 text-sm text-white/30">
            <Link href="/login" className="text-violet-400 hover:text-violet-300 flex items-center justify-center gap-1">
              <ArrowLeft className="size-3" /> Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
