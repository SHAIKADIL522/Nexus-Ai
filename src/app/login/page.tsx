"use client";
import { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight, Eye, EyeOff, Cpu, ChevronDown } from "lucide-react";
import Link from "next/link";

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d")!;
    let width = 0,
      height = 0,
      animId = 0;
    let explosions: { x: number; y: number; radius: number; life: number }[] =
      [];

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = container!.clientWidth;
      height = container!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx.scale(dpr, dpr);
    }
    window.addEventListener("resize", resize);
    resize();

    container.addEventListener("click", (e) => {
      const r = container.getBoundingClientRect();
      explosions.push({
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        radius: 0,
        life: 1,
      });
    });

    const paths: {
      isLeft: boolean;
      startY: number;
      particles: { t: number; speed: number }[];
    }[] = [];
    for (let i = 0; i < 40; i++) {
      paths.push({
        isLeft: i % 2 === 0,
        startY: (i / 40) * height * 1.5 - height * 0.2,
        particles: [
          { t: Math.random(), speed: 0.0015 + Math.random() * 0.002 },
        ],
      });
    }

    function bp(
      t: number,
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number },
    ) {
      const u = 1 - t;
      return {
        x:
          u ** 3 * p0.x +
          3 * u ** 2 * t * p1.x +
          3 * u * t ** 2 * p2.x +
          t ** 3 * p3.x,
        y:
          u ** 3 * p0.y +
          3 * u ** 2 * t * p1.y +
          3 * u * t ** 2 * p2.y +
          t ** 3 * p3.y,
      };
    }

    function render() {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2,
        cy = height / 2;

      explosions.forEach((e) => {
        e.radius += 12;
        e.life -= 0.02;
      });
      explosions = explosions.filter((e) => e.life > 0);

      paths.forEach((path) => {
        const p0 = { x: path.isLeft ? -50 : width + 50, y: path.startY };
        const p1 = {
          x: path.isLeft ? cx * 0.4 : width - cx * 0.4,
          y: path.startY,
        };
        const p2 = { x: path.isLeft ? cx * 0.7 : width - cx * 0.7, y: cy };
        const p3 = { x: cx, y: cy };

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        path.particles.forEach((p) => {
          p.t += p.speed;
          if (p.t > 1) {
            p.t = 0;
            path.startY += (Math.random() - 0.5) * 15;
          }

          const pos = bp(p.t, p0, p1, p2, p3);

          explosions.forEach((exp) => {
            const dx = pos.x - exp.x,
              dy = pos.y - exp.y;
            const dist = Math.hypot(dx, dy);
            if (dist < exp.radius + 100 && dist > exp.radius - 100) {
              const f = (1 - Math.abs(dist - exp.radius) / 100) * exp.life;
              pos.x += (dx / dist) * f * 60;
              pos.y += (dy / dist) * f * 60;
            }
          });

          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      });
      animId = requestAnimationFrame(render);
    }
    render();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0">
      <div
        className="absolute inset-0 z-10 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.05) 0%, transparent 70%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />
    </div>
  );
}

const REGIONS = [
  { key: "in-south-1", label: "India South (Primary)", dot: "bg-emerald-500" },
  { key: "us-east-1", label: "US East (Fallback)", dot: "bg-amber-500" },
  { key: "eu-west-2", label: "Europe West (High Latency)", dot: "bg-rose-500" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [regionOpen, setRegionOpen] = useState(false);
  const [region, setRegion] = useState(REGIONS[0]);
  const regionRef = useRef<HTMLDivElement>(null);

  const [maintainSession, setMaintainSession] = useState(false);

  // Close region dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  async function handleGoogleOAuth() {
    window.location.href = "/api/auth/google";
  }

  async function handleEmailOTP() {
    if (!email) {
      setError("Enter your email address first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
      setLoading(false);
    }
  }

  return (
    <section
      className="min-h-screen flex text-slate-300 antialiased relative select-none"
      style={{ background: "#020202", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Grain overlay */}
      <div
        className="fixed inset-0 z-50 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage:
            'url(\'data:image/svg+xml,%3Csvg viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="1" height="1" fill="%23ffffff"/%3E%3Crect x="1" y="1" width="1" height="1" fill="%23ffffff"/%3E%3C/svg%3E\')',
          backgroundSize: "2px 2px",
        }}
      />

      <main className="flex flex-col lg:flex-row w-full min-h-screen relative z-30">
        {/* ── LEFT PANEL ── */}
        <section className="relative w-full lg:w-5/12 min-h-[45vh] lg:min-h-screen flex flex-col justify-between px-8 py-8 lg:px-14 lg:py-12 bg-black border-b lg:border-b-0 lg:border-r border-slate-900 overflow-hidden">
          <ParticleCanvas />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-10 lg:hidden" />

          {/* Top bar */}
          <div className="relative z-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                <Cpu className="w-[18px] h-[18px] text-slate-200" strokeWidth={1.4} />
              </div>
              <span className="text-[11px] font-extralight tracking-[0.28em] text-slate-400">
                NEXUS AI
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]" />
              <span className="text-[11px] font-extralight tracking-[0.22em] uppercase text-slate-500">
                System Active
              </span>
            </div>
          </div>

          {/* Bottom content */}
          <div className="relative z-20 mt-16 lg:mt-0">
            <h2 className="text-[46px] font-thin tracking-[-0.03em] leading-[0.98] text-white uppercase mb-4">
              Nexus AI
              <br />
              Operating
              <br />
              System
            </h2>
            <p className="text-[14px] font-extralight text-slate-500 max-w-sm mb-8 leading-[1.7]">
              AI-powered workspace built for research, automation, career growth,
              voice interaction and autonomous workflows.
            </p>
            <div className="flex items-center gap-4 pt-6 border-t border-slate-800/60">
              <div className="flex -space-x-2">
                {["AI", "AG", "ML"].map((n, i) => (
                  <div
                    key={n}
                    className="w-7 h-7 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-extralight shadow-lg"
                    style={{ zIndex: 30 - i * 10 }}
                  >
                    {n}
                  </div>
                ))}
              </div>
              <div>
                <span className="block text-xs text-slate-300 font-light uppercase tracking-widest">
                  Autonomous Agents
                </span>
                <span className="block text-xs text-slate-600 font-extralight uppercase tracking-widest">
                  Research · Automation · Voice
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL ── */}
        <section className="w-full lg:w-7/12 flex-grow flex items-center justify-center p-6 sm:p-12 lg:p-20 relative z-10 bg-black">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="space-y-3">
              <h1 className="text-[32px] font-light tracking-[-0.03em] text-white">
                Identity Verification
              </h1>
              <p className="text-[14px] leading-6 font-extralight text-slate-500">
                Provide credentials to access your AI workspace.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mt-10 px-4 py-3 rounded-lg text-sm text-red-400 border border-red-500/20"
                style={{ background: "rgba(239,68,68,0.08)" }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-light text-slate-500 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900/30 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-slate-600 focus:bg-slate-900/50 transition-all font-extralight placeholder-slate-700"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-light text-slate-500 uppercase tracking-widest">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-extralight text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-900/30 border border-slate-800 rounded-lg pl-4 pr-11 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-slate-600 focus:bg-slate-900/50 transition-all font-extralight placeholder-slate-700"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors p-1"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Gateway Region - custom dropdown */}
              <div className="space-y-1.5 relative" ref={regionRef}>
                <label className="text-xs font-light text-slate-500 uppercase tracking-widest">
                  Gateway Region
                </label>
                <button
                  type="button"
                  onClick={() => setRegionOpen((o) => !o)}
                  className="w-full bg-slate-900/30 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-slate-600 transition-all font-extralight flex items-center justify-between hover:bg-slate-900/50"
                >
                  <span className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${region.dot}`} />
                    {region.label}
                  </span>
                  <ChevronDown
                    className={`size-4 text-slate-500 transition-transform ${
                      regionOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.5}
                  />
                </button>

                {regionOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#050505] border border-slate-800 rounded-lg shadow-2xl z-50 p-1.5">
                    {REGIONS.map((r) => (
                      <div
                        key={r.key}
                        onClick={() => {
                          setRegion(r);
                          setRegionOpen(false);
                        }}
                        className={`px-3 py-2 text-sm rounded flex items-center gap-2 cursor-pointer font-extralight transition-colors ${
                          region.key === r.key
                            ? "text-slate-200 bg-slate-800/50"
                            : "text-slate-500 hover:bg-slate-800/30 hover:text-slate-300"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${r.dot}`} />
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Session Toggle */}
              <div className="flex items-center justify-between py-2 border-y border-slate-800/40">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-light text-slate-300 uppercase tracking-widest">
                    Maintain Session
                  </span>
                  <span className="text-xs font-extralight text-slate-600">
                    Keep session active beyond 12 hours
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={maintainSession}
                  onClick={() => setMaintainSession((v) => !v)}
                  className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center"
                >
                  <span
                    className={`absolute h-3 w-7 rounded-full transition-colors ${
                      maintainSession ? "bg-slate-600" : "bg-slate-800"
                    }`}
                  />
                  <span
                    className={`absolute left-0 h-4 w-4 rounded-full border border-slate-700 transition-all ${
                      maintainSession
                        ? "translate-x-4 bg-slate-200 border-slate-400"
                        : "bg-slate-900"
                    }`}
                  />
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-100 hover:bg-white text-black text-sm font-normal py-3.5 rounded-lg transition-colors uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                style={{ boxShadow: "0 0 20px rgba(255,255,255,0.05)" }}
              >
                {loading ? (
                  "Authenticating..."
                ) : (
                  <>
                    <span>Initialize Session</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-10 relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-800/60" />
              <span className="flex-shrink-0 px-4 text-xs font-extralight text-slate-600 uppercase tracking-widest">
                External Gateways
              </span>
              <div className="flex-grow border-t border-slate-800/60" />
            </div>

            {/* OAuth buttons */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleOAuth}
                className="flex items-center justify-center gap-2.5 w-full bg-transparent border border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 rounded-lg py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-all font-light tracking-widest uppercase"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 1 1 0-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0 0 12.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                </svg>
                Google OAuth
              </button>
              <button
                type="button"
                onClick={handleEmailOTP}
                className="flex items-center justify-center gap-2.5 w-full bg-transparent border border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 rounded-lg py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-all font-light tracking-widest uppercase"
              >
                <Sparkles className="size-4" />
                Email OTP
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-600">
              No account?{" "}
              <Link href="/register" className="text-slate-300 hover:text-white transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </section>
      </main>
    </section>
  );
}
