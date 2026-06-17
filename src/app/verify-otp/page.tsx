'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, RefreshCw, Mail, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Aurora from '@/components/aurora/Aurora';

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [email, setEmail] = useState('');
  const [emailWarning, setEmailWarning] = useState(''); // ✅ FIX: shows when register's OTP send failed
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get('email') || '');
    setEmailWarning(params.get('warning') || '');
  }, []);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const t = setInterval(() => setTimer(v => v - 1), 1000);
      return () => clearInterval(t);
    }
  }, [timer]);

  function handleChange(i: number, v: string) {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp];
    n[i] = v.slice(-1);
    setOtp(n);
    if (v && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const n = ['', '', '', '', '', ''];
    pasted.split('').forEach((char, idx) => { if (idx < 6) n[idx] = char; });
    setOtp(n);
    const lastIdx = Math.min(pasted.length - 1, 5);
    inputs.current[lastIdx]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const code = otp.join('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setLoading(false);
    }
  }

  async function resend() {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      // ✅ FIX: surface resend delivery failure too, not just the initial register one
      if (data?.success === false) {
        setEmailWarning(data.warning || 'Email delivery failed again. Check Resend domain verification.');
      } else {
        setEmailWarning('');
        setResent(true);
        setTimeout(() => setResent(false), 3000);
      }
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch {
      setError('Failed to resend code');
    }
  }

  const filled = otp.join('').length === 6;

  return (
    <div className="min-h-screen text-white overflow-hidden relative" style={{ background: '#050816' }}>
      <Aurora variant="minimal" />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">

        {/* Logo */}
        <div className="mb-8 flex items-center gap-2.5">
          <div className="size-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="font-black font-display text-lg">Nexus AI</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="p-8 rounded-2xl text-center"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>

            {/* Icon */}
            <div className="size-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
              <Mail className="size-6 text-violet-400" />
            </div>

            <h1 className="text-xl font-bold font-display mb-2">Check your email</h1>
            <p className="text-white/40 text-sm mb-1">We sent a 6-digit code to</p>
            {email && (
              <p className="text-violet-400 text-sm font-semibold mb-6 truncate">{email}</p>
            )}

            {/* Email delivery warning */}
            {emailWarning && (
              <div className="mb-4 px-3 py-2.5 rounded-xl text-xs text-amber-300 text-left flex items-start gap-2"
                style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <AlertTriangle className="size-4 flex-shrink-0 mt-0.5" />
                <span>{emailWarning}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 px-3 py-2.5 rounded-xl text-xs text-red-400 text-left"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* OTP Inputs */}
              <div className="flex gap-2.5 justify-center mb-6">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    onPaste={handlePaste}
                    className="otp-input"
                    placeholder="·"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || !filled}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: filled
                    ? 'linear-gradient(135deg,#4F46E5,#7C3AED)'
                    : 'rgba(255,255,255,0.06)',
                  boxShadow: filled ? '0 0 24px rgba(124,58,237,0.4)' : 'none',
                }}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="size-4 animate-spin" /> Verifying...
                  </span>
                ) : (
                  <>Verify Account <ArrowRight className="size-4" /></>
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="mt-5">
              {timer > 0 ? (
                <p className="text-xs text-white/30">
                  Resend code in <span className="text-violet-400 font-medium">{timer}s</span>
                </p>
              ) : (
                <button onClick={resend}
                  className="flex items-center gap-1.5 mx-auto text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  <RefreshCw className="size-3" />
                  {resent ? '✓ Code sent!' : 'Resend code'}
                </button>
              )}
            </div>
          </div>

          <p className="text-center mt-4 text-sm text-white/30">
            <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}