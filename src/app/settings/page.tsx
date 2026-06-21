'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Mic, Cpu, Bell, Palette, LogOut, Save,
  Eye, EyeOff, Check, ChevronRight, Sparkles, Moon, Sun, Monitor,
  Trash2, Loader2, AlertTriangle,
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

// ---- Types matching src/models/Settings.ts ----
interface ProfileSettings { name: string; bio: string; avatar: string; }
interface VoiceSettings { enabled: boolean; continuousListening: boolean; voiceOutput: boolean; language: string; rate: number; pitch: number; }
interface ModelSettings { primary: string; fallback: string; temperature: number; maxTokens: number; streamResponses: boolean; }
interface NotificationSettings { researchComplete: boolean; agentUpdates: boolean; documentProcessed: boolean; weeklyDigest: boolean; emailNotifs: boolean; browserNotifs: boolean; }
interface ThemeSettings { mode: 'dark' | 'light' | 'system'; accentColor: string; reducedMotion: boolean; compactMode: boolean; }

const NVIDIA_MODELS = [
  { value: 'meta/llama-3.1-70b-instruct', label: 'LLaMA 3.1 70B (Default)', badge: 'Recommended' },
  { value: 'meta/llama-3.1-8b-instruct',  label: 'LLaMA 3.1 8B (Fast)',    badge: 'Fast' },
  { value: 'nvidia/llama-3.1-nemotron-70b-instruct', label: 'Nemotron 70B (Reasoning)', badge: 'Powerful' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Profile — email is read-only here, sourced from /api/settings (which reads it off the user doc)
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<ProfileSettings>({ name: '', bio: '', avatar: '' });

  // Security
  const [showPw, setShowPw] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Voice
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true, continuousListening: false, voiceOutput: true,
    language: 'en-US', rate: 1, pitch: 1,
  });

  // Model
  const [modelSettings, setModelSettings] = useState<ModelSettings>({
    primary: 'meta/llama-3.1-70b-instruct',
    fallback: 'openrouter',
    temperature: 0.7,
    maxTokens: 1024,
    streamResponses: true,
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationSettings>({
    researchComplete: true, agentUpdates: true, documentProcessed: true,
    weeklyDigest: false, emailNotifs: true, browserNotifs: true,
  });

  // Theme
  const [theme, setTheme] = useState<ThemeSettings>({ mode: 'dark', accentColor: 'violet', reducedMotion: false, compactMode: false });

  // Account
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ---- Load settings on mount ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/settings', { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 401) {
            setLoadError('Your session has expired. Please log in again.');
          } else {
            setLoadError('Failed to load settings.');
          }
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        const s = data.settings;
        setProfile(s.profile);
        setVoiceSettings(s.voice);
        setModelSettings(s.model);
        setNotifications(s.notifications);
        setTheme(s.theme);
        if (data.email) setEmail(data.email);
      } catch {
        if (!cancelled) setLoadError('Could not reach the server. Check your connection.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- Generic save for a single section ----
  const saveSection = useCallback(async (section: 'profile' | 'voice' | 'model' | 'notifications' | 'theme', value: unknown) => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [section]: value }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setLoadError('Failed to save. Please try again.');
      setTimeout(() => setLoadError(''), 3000);
    } finally {
      setSaving(false);
    }
  }, []);

  function save() {
    const sectionMap: Record<SettingsTab, { key: 'profile' | 'voice' | 'model' | 'notifications' | 'theme'; value: unknown } | null> = {
      profile: { key: 'profile', value: profile },
      security: null, // security has its own dedicated save flow (change password)
      voice: { key: 'voice', value: voiceSettings },
      model: { key: 'model', value: modelSettings },
      notifications: { key: 'notifications', value: notifications },
      theme: { key: 'theme', value: theme },
      account: null,
    };
    const target = sectionMap[tab];
    if (target) saveSection(target.key, target.value);
  }

  // ---- Change password ----
  async function changePassword() {
    setPwMessage(null);
    if (!passwords.current || !passwords.newPw || !passwords.confirm) {
      setPwMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (passwords.newPw !== passwords.confirm) {
      setPwMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    if (passwords.newPw.length < 8) {
      setPwMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMessage({ type: 'error', text: data.error || 'Failed to change password.' });
        return;
      }
      setPwMessage({ type: 'success', text: 'Password updated successfully.' });
      setPasswords({ current: '', newPw: '', confirm: '' });
    } catch {
      setPwMessage({ type: 'error', text: 'Could not reach the server.' });
    } finally {
      setPwSaving(false);
    }
  }

  // ---- Logout all devices ----
  async function logoutAllDevices() {
    setLogoutAllLoading(true);
    setAccountMessage(null);
    try {
      const res = await fetch('/api/account/logout-all', { method: 'POST', credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAccountMessage({ type: 'error', text: data.error || 'Failed to log out other devices.' });
        return;
      }
      // This request's own session is now also invalid (tokenVersion bumped).
      // Redirect to login since the current cookie no longer verifies.
      window.location.href = '/login?notice=logged_out_everywhere';
    } catch {
      setAccountMessage({ type: 'error', text: 'Could not reach the server.' });
      setLogoutAllLoading(false);
    }
  }

  // ---- Delete account ----
  async function deleteAccount() {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setAccountMessage({ type: 'error', text: data.error || 'Failed to delete account.' });
        setDeleting(false);
        return;
      }
      window.location.href = '/login?notice=account_deleted';
    } catch {
      setAccountMessage({ type: 'error', text: 'Could not reach the server.' });
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="size-6 text-violet-400 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black font-display mb-2">Settings</h1>
          <p className="text-white/40 text-sm">Manage your profile, AI models, voice, and workspace preferences</p>
          {loadError && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertTriangle className="size-3.5 flex-shrink-0" /> {loadError}
            </div>
          )}
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
                        {(profile.name || email || '??').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white/85">{profile.name || 'Unnamed'}</p>
                        <p className="text-sm text-white/40">{email}</p>
                        <button className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors">Change avatar</button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Full Name</label>
                        <input type="text" value={profile.name}
                          onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25"
                          placeholder="Your name" />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Email</label>
                        <input type="email" value={email} disabled readOnly
                          className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                          title="Email is tied to your account and can't be changed here" />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Bio</label>
                        <input type="text" value={profile.bio}
                          onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 text-white placeholder-white/25"
                          placeholder="Short description" />
                      </div>
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
                      {pwMessage && (
                        <p className={`text-xs ${pwMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{pwMessage.text}</p>
                      )}
                      <div className="flex justify-end">
                        <button onClick={changePassword} disabled={pwSaving}
                          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 0 16px rgba(124,58,237,0.3)' }}>
                          {pwSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                          {pwSaving ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/8 space-y-0">
                      <SettingRow label="Two-Factor Authentication" description="Add extra security with 2FA">
                        <span className="text-xs text-amber-400 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">Not enabled</span>
                      </SettingRow>
                      <SettingRow label="Active Sessions" description="Manage devices signed into your account">
                        <button onClick={() => setTab('account')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View in Account tab</button>
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
                      <p className="text-xs text-white/60 leading-relaxed">Voice features use the browser&apos;s native Web Speech API (SpeechRecognition + SpeechSynthesis). No external API required — 100% free and private.</p>
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
                        {([
                          ['dark', <Moon className="size-4" key="m" />, 'Dark'],
                          ['light', <Sun className="size-4" key="s" />, 'Light'],
                          ['system', <Monitor className="size-4" key="sys" />, 'System'],
                        ] as const).map(([val, icon, label]) => (
                          <button key={val} onClick={() => setTheme(t => ({ ...t, mode: val }))}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${theme.mode === val ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                            style={{ background: theme.mode === val ? 'linear-gradient(135deg,#4F46E5,#7C3AED)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {icon}{label}
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
                    {accountMessage && (
                      <p className={`text-xs ${accountMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{accountMessage.text}</p>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div>
                          <p className="text-sm text-white/80">Export Data</p>
                          <p className="text-xs text-white/35 mt-0.5">Download all your data as JSON</p>
                        </div>
                        <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all text-white/60 hover:bg-white/8">Export</button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div>
                          <p className="text-sm text-white/80">Sign Out All Devices</p>
                          <p className="text-xs text-white/35 mt-0.5">Revoke all active sessions, including this one</p>
                        </div>
                        <button onClick={logoutAllDevices} disabled={logoutAllLoading}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all text-amber-400 hover:bg-white/8 disabled:opacity-50">
                          {logoutAllLoading ? <Loader2 className="size-3.5 animate-spin" /> : null}
                          {logoutAllLoading ? 'Signing out...' : 'Sign Out'}
                        </button>
                      </div>
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-red-400">Delete Account</p>
                            <p className="text-xs text-white/35 mt-0.5">Permanently delete your account and all data</p>
                          </div>
                          <button onClick={() => setDeleteModalOpen(true)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 className="size-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save button (all tabs except account/security, which have their own dedicated actions) */}
                {tab !== 'account' && tab !== 'security' && (
                  <div className="mt-6 flex justify-end">
                    <button onClick={save} disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      style={{ background: saved ? 'rgba(16,185,129,0.8)' : 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
                      {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : <Save className="size-4" />}
                      {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete account confirmation modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => !deleting && setDeleteModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-2xl"
              style={{ background: 'rgba(15,15,20,0.98)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.12)' }}>
                  <AlertTriangle className="size-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete your account?</h3>
                  <p className="text-xs text-white/40 mt-1">This permanently deletes your profile, settings, conversations, and file metadata. This cannot be undone.</p>
                </div>
              </div>
              <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Type DELETE to confirm</label>
              <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                disabled={deleting}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 focus:outline-none focus:border-red-500/50 text-white placeholder-white/25 mb-5"
                placeholder="DELETE" />
              <div className="flex gap-3">
                <button onClick={() => { setDeleteModalOpen(false); setDeleteConfirmText(''); }} disabled={deleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/60 hover:bg-white/5 transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={deleteAccount} disabled={deleteConfirmText !== 'DELETE' || deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40"
                  style={{ background: deleteConfirmText === 'DELETE' ? '#DC2626' : 'rgba(239,68,68,0.3)' }}>
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  {deleting ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}