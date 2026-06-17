'use client';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import Link from 'next/link';

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d')!;
    let width = 0, height = 0, animId = 0;
    let explosions: { x: number; y: number; radius: number; life: number }[] = [];
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = container!.clientWidth; height = container!.clientHeight;
      canvas!.width = width * dpr; canvas!.height = height * dpr;
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize); resize();
    container.addEventListener('click', (e) => {
      const r = container.getBoundingClientRect();
      explosions.push({ x: e.clientX - r.left, y: e.clientY - r.top, radius: 0, life: 1 });
    });
    const paths: { isLeft: boolean; startY: number; particles: { t: number; speed: number }[] }[] = [];
    for (let i = 0; i < 40; i++) paths.push({ isLeft: i % 2 === 0, startY: (i / 40) * height * 1.5 - height * 0.2, particles: [{ t: Math.random(), speed: 0.0015 + Math.random() * 0.002 }] });
    function bp(t: number, p0: {x:number;y:number}, p1: {x:number;y:number}, p2: {x:number;y:number}, p3: {x:number;y:number}) {
      const u = 1 - t;
      return { x: u**3*p0.x+3*u**2*t*p1.x+3*u*t**2*p2.x+t**3*p3.x, y: u**3*p0.y+3*u**2*t*p1.y+3*u*t**2*p2.y+t**3*p3.y };
    }
    function render() {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2, cy = height / 2;
      explosions.forEach(e => { e.radius += 12; e.life -= 0.02; });
      explosions = explosions.filter(e => e.life > 0);
      paths.forEach((path) => {
        const p0 = { x: path.isLeft ? -50 : width + 50, y: path.startY };
        const p1 = { x: path.isLeft ? cx * 0.4 : width - cx * 0.4, y: path.startY };
        const p2 = { x: path.isLeft ? cx * 0.7 : width - cx * 0.7, y: cy };
        const p3 = { x: cx, y: cy };
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.setLineDash([2, 6]); ctx.stroke(); ctx.setLineDash([]);
        path.particles.forEach((p) => {
          p.t += p.speed;
          if (p.t > 1) { p.t = 0; path.startY += (Math.random() - 0.5) * 15; }
          let pos = bp(p.t, p0, p1, p2, p3);
          explosions.forEach((exp) => {
            const dx = pos.x - exp.x, dy = pos.y - exp.y, dist = Math.hypot(dx, dy);
            if (dist < exp.radius + 100 && dist > exp.radius - 100) {
              const f = (1 - Math.abs(dist - exp.radius) / 100) * exp.life;
              pos.x += (dx / dist) * f * 60; pos.y += (dy / dist) * f * 60;
            }
          });
          ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2); ctx.fill();
        });
      });
      animId = requestAnimationFrame(render);
    }
    render();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <div className="absolute inset-0 z-10 opacity-20" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.05) 0%, transparent 70%)' }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (password.length < 1) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const levels = ['Very Weak', 'Weak', 'Good', 'Strong'];
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  const textColors = ['text-red-400', 'text-amber-400', 'text-blue-400', 'text-emerald-400'];
  const idx = Math.max(0, score - 1);
  return (
    <div className="mt-2.5 space-y-1.5">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[idx] : 'bg-white/10'}`} />
        ))}
      </div>
      <span className={`text-[10px] uppercase tracking-widest font-light ${textColors[idx]}`}>
        {levels[idx]}
      </span>
    </div>
  );
}

// FIX: shared email regex, mirrors the server-side check in register/route.ts
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // FIX: refs so Enter key can move focus between fields
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const emailTouched = form.email.length > 0;
  const emailValid = EMAIL_REGEX.test(form.email);
  const passwordsMatch = form.confirm.length > 0 && form.password === form.confirm;
  const passwordsMismatch = form.confirm.length > 0 && form.password !== form.confirm;
  const canSubmit = !loading && form.name && emailValid && form.password.length >= 8 && passwordsMatch;

  // FIX: Enter key on Name/Email moves to next field instead of submitting early or doing nothing
  function handleFieldEnter(e: React.KeyboardEvent<HTMLInputElement>, next: React.RefObject<HTMLInputElement | null>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      next.current?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) { setError('Please enter a valid email address'); return; }
    if (!passwordsMatch) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      const warningParam = data.emailWarning ? `&warning=${encodeURIComponent(data.emailWarning)}` : '';
      window.location.href = `/verify-otp?email=${encodeURIComponent(form.email)}${warningParam}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen flex text-slate-300 antialiased relative" style={{ background: '#020202', fontFamily: "'Inter', sans-serif" }}>
      {/* Grain */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.08]"
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 2 2\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Crect width=\"1\" height=\"1\" fill=\"%23ffffff\"/%3E%3Crect x=\"1\" y=\"1\" width=\"1\" height=\"1\" fill=\"%23ffffff\"/%3E%3C/svg%3E')", backgroundSize: '2px 2px' }} />

      <main className="flex flex-col lg:flex-row w-full min-h-screen relative z-30">

        {/* LEFT PANEL */}
        <section className="relative w-full lg:w-5/12 min-h-[40vh] lg:min-h-screen flex flex-col justify-between p-8 lg:p-14 bg-black border-b lg:border-b-0 lg:border-r border-slate-900 overflow-hidden">
          <ParticleCanvas />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-10 lg:hidden" />

          <div className="relative z-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg border border-slate-800 bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="size-5 text-slate-200" />
              </div>
              <span className="text-xs font-light tracking-widest uppercase text-slate-400">Nexus AI</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-extralight text-slate-500 uppercase tracking-widest">System Active</span>
            </div>
          </div>

          <div className="relative z-20 mt-16 lg:mt-0">
            <h2 className="text-3xl lg:text-5xl font-thin tracking-tight text-white mb-4 uppercase leading-[1.1]">
              Join<br />Nexus AI<br />Today
            </h2>
            <p className="text-sm font-extralight text-slate-500 max-w-sm mb-8 leading-relaxed">
              Create your AI workspace in seconds. Access research tools, voice AI, career copilot, and autonomous agents — all powered by NVIDIA NIM.
            </p>
            <div className="space-y-3 mb-8">
              {[
                ['AI Chat', 'Streaming conversations with LLaMA 3.1 70B'],
                ['Research', 'Tavily + Firecrawl cited reports'],
                ['Career Copilot', 'ATS scoring, cover letters, interview prep'],
                ['Voice AI', 'Browser-native speak & listen'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-300 font-light uppercase tracking-widest">{title}</span>
                    <span className="text-xs text-slate-600 font-extralight ml-2">{desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-6 border-t border-slate-800/60">
              <div className="flex -space-x-2">
                {['AI', 'AG', 'ML'].map((n, i) => (
                  <div key={n} className="w-8 h-8 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[9px] text-slate-400 font-extralight shadow-lg" style={{ zIndex: 30 - i * 10 }}>{n}</div>
                ))}
              </div>
              <div>
                <span className="block text-xs text-slate-300 font-light uppercase tracking-widest">Autonomous Agents</span>
                <span className="block text-xs text-slate-600 font-extralight uppercase tracking-widest">Research · Automation · Voice</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="w-full lg:w-7/12 flex-grow flex items-center justify-center p-8 sm:p-12 lg:p-20 relative z-10 bg-black">
          <div className="w-full max-w-lg">

            <div className="mb-10">
              <h1 className="text-4xl font-semibold tracking-tight text-white mb-3">Create your account</h1>
              <p className="text-sm font-extralight text-slate-500 leading-relaxed">
                Join Nexus AI — your personal AI operating system.
              </p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-lg text-sm text-red-400 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-xs font-light text-slate-500 uppercase tracking-widest block mb-2.5">Full Name</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  onKeyDown={e => handleFieldEnter(e, emailRef)}
                  required
                  className="w-full h-12 bg-slate-900/30 border border-slate-800 rounded-lg px-4 text-sm text-slate-200 focus:outline-none focus:border-slate-600 focus:bg-slate-900/50 transition-all font-extralight placeholder-slate-700"
                  placeholder="Alex Johnson" />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-light text-slate-500 uppercase tracking-widest block mb-2.5">Email Address</label>
                <input
                  ref={emailRef}
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  onKeyDown={e => handleFieldEnter(e, passwordRef)}
                  required
                  className={`w-full h-12 bg-slate-900/30 border rounded-lg px-4 text-sm text-slate-200 focus:outline-none focus:bg-slate-900/50 transition-all font-extralight placeholder-slate-700 ${
                    emailTouched && !emailValid
                      ? 'border-red-500/50 focus:border-red-500/70'
                      : 'border-slate-800 focus:border-slate-600'
                  }`}
                  placeholder="you@example.com" />
                {emailTouched && !emailValid && (
                  <p className="mt-2 text-xs text-red-400 font-extralight">Enter a valid email like name@example.com</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-light text-slate-500 uppercase tracking-widest block mb-2.5">Password</label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    onKeyDown={e => handleFieldEnter(e, confirmRef)}
                    required
                    minLength={8}
                    className="w-full h-12 bg-slate-900/30 border border-slate-800 rounded-lg pl-4 pr-11 text-sm text-slate-200 focus:outline-none focus:border-slate-600 focus:bg-slate-900/50 transition-all font-extralight placeholder-slate-700"
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 z-10"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-light text-slate-500 uppercase tracking-widest block mb-2.5">Confirm Password</label>
                <div className="relative">
                  <input
                    ref={confirmRef}
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={e => set('confirm', e.target.value)}
                    required
                    className={`w-full h-12 bg-slate-900/30 border rounded-lg pl-4 pr-11 text-sm text-slate-200 focus:outline-none transition-all font-extralight placeholder-slate-700 ${
                      passwordsMismatch
                        ? 'border-red-500/50 focus:border-red-500/70'
                        : passwordsMatch
                        ? 'border-emerald-500/50 focus:border-emerald-500/70'
                        : 'border-slate-800 focus:border-slate-600'
                    }`}
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 z-10"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {passwordsMatch && (
                  <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5 font-extralight">
                    <Check className="size-3" /> Passwords match
                  </p>
                )}
                {passwordsMismatch && (
                  <p className="mt-2 text-xs text-red-400 font-extralight">Passwords do not match</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full h-12 bg-slate-100 hover:bg-white text-black text-sm font-normal rounded-lg transition-colors uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                style={{ boxShadow: '0 0 20px rgba(255,255,255,0.05)' }}
              >
                {loading
                  ? 'Creating account...'
                  : <><span>Create Account</span><ArrowRight className="size-4" /></>
                }
              </button>
            </form>

            <div className="relative flex items-center py-8">
              <div className="flex-grow border-t border-slate-800/60" />
              <span className="flex-shrink-0 px-4 text-xs font-extralight text-slate-600 uppercase tracking-widest">or continue with</span>
              <div className="flex-grow border-t border-slate-800/60" />
            </div>

            <button type="button" onClick={() => window.location.href = '/api/auth/google'}
              className="w-full h-12 flex items-center justify-center gap-2.5 bg-transparent border border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-all font-light tracking-widest uppercase">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 1 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
              </svg>
              Continue with Google
            </button>

            <p className="text-center text-xs text-slate-600 mt-8">
              Already have an account?{' '}
              <Link href="/login" className="text-slate-300 hover:text-white transition-colors">Sign in</Link>
            </p>
          </div>
        </section>
      </main>
    </section>
  );
}