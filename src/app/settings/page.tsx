'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Mic, Cpu, Bell, Palette, LogOut, Save,
  Eye, EyeOff, Check, ChevronRight, Sparkles, Moon, Sun,
  Trash2,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

type SettingsTab = 'profile' | 'security' | 'voice' | 'model' | 'notifications' | 'theme' | 'account';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile',       label: 'Profile',       icon: <User className="size-4" /> },
  { id: 'security',      label: 'Security',       icon: <Shield className="size-4" /> },
  { id: 'voice',         label: 'Voice',          icon: <Mic className="size-4" /> },
  { id: 'model',         label: 'AI Models',      icon: <Cpu className="size-4" /> },
  { id: 'notifications', label: 'Notifications',  icon: <Bell className="size-4" /> },
  { id: 'theme',         label: 'Theme',          icon: <Palette className="size-4" /> },
  { id: 'account',       label: 'Account',        icon: <LogOut className="size-4" /> },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className="relative w-10 h-5.5 rounded-full transition-all flex-shrink-0"
      style={{
        background: value ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : 'rgba(255,255,255,0.1)',
        boxShadow: value ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
        width: 40, height: 22,
      }}>
      <span className="absolute top-0.5 transition-all rounded-full bg-white size-[18px]"
        style={{ left: value ? 20 : 2 }} />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80">{label}</p>
        {description && <p className="text-xs text-white/35 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);

  // Profile
  const [profile, setProfile] = useState({ name: 'Alex Johnson', email: 'alex@example.com', bio: 'Senior AI Engineer · Building the future', avatar: '' });

  // Security
  const [showPw, setShowPw] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });

  // Voice
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: true, continuousListening: false, voiceOutput: true,
    language: 'en-US', rate: 1, pitch: 1,
  });

  // Model
  const [modelSettings, setModelSettings] = useState({
    primary: 'meta/llama-3.1-70b-instruct',
    fallback: 'openrouter',
    temperature: 0.7,
    maxTokens: 1024,
    streamResponses: true,
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    researchComplete: true, agentUpdates: true, documentProcessed: true,
    weeklyDigest: false, emailNotifs: true, browserNotifs: true,
  });

  // Theme
  const [theme, setTheme] = useState({ mode: 'dark', accentColor: 'violet', reducedMotion: false, compactMode: false });

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const NVIDIA_MODELS = [
    { value: 'meta/llama-3.1-70b-instruct', label: 'LLaMA 3.1 70B (Default)', badge: 'Recommended' },
    { value: 'meta/llama-3.1-8b-instruct',  label: 'LLaMA 3.1 8B (Fast)',    badge: 'Fast' },
    { value: 'nvidia/llama-3.1-nemotron-70b-instruct', label: 'Nemotron 70B (Reasoning)', badge: 'Powerful' },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black font-display mb-2">Settings</h1>
          <p className="text-white/40 text-sm">Manage your profile, AI models, voice, and workspace preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar nav */}
          <div className="lg:w-52 flex-shrink-0">
            <nav className="space-y-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${tab === t.id ? 'nav-item-active' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                  {t.icon}
                  <span>{t.label}</span>
                  {tab === t.id && <ChevronRight className="size-3.5 ml-auto" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>

                {/* Profile */}
                {tab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-base font-bold font-display">Profile Settings</h2>
                    <div className="flex items-center gap-5">
                      <div className="size-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}>
                        {profile.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white/85">{profile.name}</p>
                        <p className="text-sm text-white/40">{profile.email}</p>
                        <button className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">Change avatar</button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { key: 'name',  label: 'Full Name',    type: 'text',  placeholder: 'Your name' },
                        { key: 'email', label: 'Email',        type: 'email', placeholder: 'you@example.com' },
                        { key: 'bio',   label: 'Bio',          type: 'text',  placeholder: 'Short description' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">{field.label}</label>
                          <input type={field.type} value={(profile as any)[field.key]}
                            onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25"
                            placeholder={field.placeholder} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security */}
                {tab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-base font-bold font-display">Security Settings</h2>
                    <div className="space-y-4">
                      <p className="text-sm text-white/50">Change Password</p>
                      {[
                        { key: 'current', label: 'Current Password' },
                        { key: 'newPw',   label: 'New Password' },
                        { key: 'confirm', label: 'Confirm New Password' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">{field.label}</label>
                          <div className="relative">
                            <input type={showPw ? 'text' : 'password'}
                              value={(passwords as any)[field.key]}
                              onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                              className="w-full pl-4 pr-10 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25"
                              placeholder="••••••••" />
                            {field.key === 'newPw' && (
                              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-white/8 space-y-0">
                      <SettingRow label="Two-Factor Authentication" description="Add extra security with 2FA">
                        <span className="text-xs text-amber-400 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">Not enabled</span>
                      </SettingRow>
                      <SettingRow label="Active Sessions" description="Manage devices signed into your account">
                        <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View sessions</button>
                      </SettingRow>
                    </div>
                  </div>
                )}

                {/* Voice */}
                {tab === 'voice' && (
                  <div className="space-y-6">
                    <h2 className="text-base font-bold font-display">Voice Assistant Settings</h2>
                    <div className="p-4 rounded-xl mb-2 flex items-start gap-3" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
                      <Mic className="size-4 text-violet-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white/60 leading-relaxed">Voice features use the browser's native Web Speech API (SpeechRecognition + SpeechSynthesis). No external API required — 100% free and private.</p>
                    </div>
                    <SettingRow label="Enable Voice Assistant" description="Allow voice input and output"><Toggle value={voiceSettings.enabled} onChange={v => setVoiceSettings(s => ({ ...s, enabled: v }))} /></SettingRow>
                    <SettingRow label="Voice Output" description="AI speaks responses aloud"><Toggle value={voiceSettings.voiceOutput} onChange={v => setVoiceSettings(s => ({ ...s, voiceOutput: v }))} /></SettingRow>
                    <SettingRow label="Continuous Listening" description="Always-on voice detection"><Toggle value={voiceSettings.continuousListening} onChange={v => setVoiceSettings(s => ({ ...s, continuousListening: v }))} /></SettingRow>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Language</label>
                      <select value={voiceSettings.language} onChange={e => setVoiceSettings(s => ({ ...s, language: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white">
                        {[['en-US','English (US)'],['en-GB','English (UK)'],['es-ES','Spanish'],['fr-FR','French'],['de-DE','German'],['ja-JP','Japanese']].map(([v,l]) => (
                          <option key={v} value={v} className="bg-slate-900">{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Speech Rate: {voiceSettings.rate}x</label>
                      <input type="range" min="0.5" max="2" step="0.1" value={voiceSettings.rate}
                        onChange={e => setVoiceSettings(s => ({ ...s, rate: parseFloat(e.target.value) }))}
                        className="w-full accent-violet-500" />
                    </div>
                  </div>
                )}

                {/* Model */}
                {tab === 'model' && (
                  <div className="space-y-6">
                    <h2 className="text-base font-bold font-display">AI Model Settings</h2>
                    <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <Sparkles className="size-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-white/60 leading-relaxed">Primary provider: <span className="text-emerald-400 font-semibold">NVIDIA NIM</span>. Automatic fallback to OpenRouter if NVIDIA is unavailable. All routing is handled by the Provider Manager.</p>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider block mb-3">Primary Model (NVIDIA NIM)</label>
                      <div className="space-y-2">
                        {NVIDIA_MODELS.map(m => (
                          <button key={m.value} onClick={() => setModelSettings(s => ({ ...s, primary: m.value }))}
                            className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all ${modelSettings.primary === m.value ? 'border-violet-500/40' : 'border-white/8 hover:border-white/15'}`}
                            style={{ background: modelSettings.primary === m.value ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${modelSettings.primary === m.value ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                            <div className={`size-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${modelSettings.primary === m.value ? 'border-violet-500 bg-violet-500/20' : 'border-white/20'}`}>
                              {modelSettings.primary === m.value && <div className="size-1.5 rounded-full bg-violet-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/80">{m.label}</p>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full text-violet-300 flex-shrink-0" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>{m.badge}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Temperature: {modelSettings.temperature}</label>
                        <input type="range" min="0" max="1" step="0.1" value={modelSettings.temperature}
                          onChange={e => setModelSettings(s => ({ ...s, temperature: parseFloat(e.target.value) }))}
                          className="w-full accent-violet-500" />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-2">Max Tokens: {modelSettings.maxTokens}</label>
                        <input type="range" min="256" max="4096" step="256" value={modelSettings.maxTokens}
                          onChange={e => setModelSettings(s => ({ ...s, maxTokens: parseInt(e.target.value) }))}
                          className="w-full accent-violet-500" />
                      </div>
                    </div>
                    <SettingRow label="Stream Responses" description="Show AI output as it's generated"><Toggle value={modelSettings.streamResponses} onChange={v => setModelSettings(s => ({ ...s, streamResponses: v }))} /></SettingRow>
                  </div>
                )}

                {/* Notifications */}
                {tab === 'notifications' && (
                  <div className="space-y-2">
                    <h2 className="text-base font-bold font-display mb-6">Notification Settings</h2>
                    <SettingRow label="Research Complete" description="Notify when AI research report is ready"><Toggle value={notifications.researchComplete} onChange={v => setNotifications(n => ({ ...n, researchComplete: v }))} /></SettingRow>
                    <SettingRow label="Agent Task Updates" description="Updates from autonomous agents"><Toggle value={notifications.agentUpdates} onChange={v => setNotifications(n => ({ ...n, agentUpdates: v }))} /></SettingRow>
                    <SettingRow label="Document Processed" description="When document analysis is complete"><Toggle value={notifications.documentProcessed} onChange={v => setNotifications(n => ({ ...n, documentProcessed: v }))} /></SettingRow>
                    <SettingRow label="Weekly Digest" description="Summary of your AI activity"><Toggle value={notifications.weeklyDigest} onChange={v => setNotifications(n => ({ ...n, weeklyDigest: v }))} /></SettingRow>
                    <div className="pt-4 border-t border-white/8">
                      <SettingRow label="Email Notifications" description="Receive notifications via email"><Toggle value={notifications.emailNotifs} onChange={v => setNotifications(n => ({ ...n, emailNotifs: v }))} /></SettingRow>
                      <SettingRow label="Browser Notifications" description="Desktop push notifications"><Toggle value={notifications.browserNotifs} onChange={v => setNotifications(n => ({ ...n, browserNotifs: v }))} /></SettingRow>
                    </div>
                  </div>
                )}

                {/* Theme */}
                {tab === 'theme' && (
                  <div className="space-y-6">
                    <h2 className="text-base font-bold font-display">Theme Settings</h2>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider block mb-3">Color Mode</label>
                      <div className="flex gap-3">
                        {[['dark', <Moon className="size-4" />, 'Dark'], ['light', <Sun className="size-4" />, 'Light']].map(([val, icon, label]) => (
                          <button key={val as string} onClick={() => setTheme(t => ({ ...t, mode: val as string }))}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${theme.mode === val ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                            style={{ background: theme.mode === val ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {icon as React.ReactNode}{label as string}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-wider block mb-3">Accent Color</label>
                      <div className="flex gap-3">
                        {[['violet','#7C3AED'],['blue','#3B82F6'],['emerald','#10B981'],['pink','#EC4899'],['amber','#F59E0B']].map(([name, color]) => (
                          <button key={name} onClick={() => setTheme(t => ({ ...t, accentColor: name }))}
                            className="size-8 rounded-full transition-all hover:scale-110"
                            style={{ background: color, boxShadow: theme.accentColor === name ? `0 0 12px ${color}` : 'none', outline: theme.accentColor === name ? `2px solid white` : 'none', outlineOffset: 2 }} />
                        ))}
                      </div>
                    </div>
                    <SettingRow label="Reduced Motion" description="Disable animations for accessibility"><Toggle value={theme.reducedMotion} onChange={v => setTheme(t => ({ ...t, reducedMotion: v }))} /></SettingRow>
                    <SettingRow label="Compact Mode" description="Reduce spacing and padding"><Toggle value={theme.compactMode} onChange={v => setTheme(t => ({ ...t, compactMode: v }))} /></SettingRow>
                  </div>
                )}

                {/* Account */}
                {tab === 'account' && (
                  <div className="space-y-6">
                    <h2 className="text-base font-bold font-display">Account Management</h2>
                    <div className="space-y-3">
                      {[
                        { label: 'Export Data', desc: 'Download all your data as JSON', action: 'Export', color: 'text-white/60' },
                        { label: 'Sign Out All Devices', desc: 'Revoke all active sessions', action: 'Sign Out', color: 'text-amber-400' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div>
                            <p className="text-sm text-white/80">{item.label}</p>
                            <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>
                          </div>
                          <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${item.color} hover:bg-white/8`}>{item.action}</button>
                        </div>
                      ))}
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-red-400">Delete Account</p>
                            <p className="text-xs text-white/35 mt-0.5">Permanently delete your account and all data</p>
                          </div>
                          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 className="size-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save button (all tabs except account) */}
                {tab !== 'account' && (
                  <div className="mt-6 flex justify-end">
                    <button onClick={save}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                      style={{ background: saved ? 'rgba(16,185,129,0.8)' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
                      {saved ? <><Check className="size-4" /> Saved!</> : <><Save className="size-4" /> Save Changes</>}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
