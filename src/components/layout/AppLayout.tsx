'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles, LayoutDashboard, MessageSquare, Search, BookOpen,
  FileText, Bot, Briefcase, Calendar, Settings, LogOut,
  ChevronLeft, ChevronRight, Command, Bell, User,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const VoiceAssistant = dynamic(() => import('@/components/voice/VoiceAssistant'), { ssr: false });

const NAV = [
  { icon: <LayoutDashboard className="size-4" />, label: 'Dashboard',     href: '/dashboard' },
  { icon: <MessageSquare className="size-4" />,  label: 'AI Chat',        href: '/chat' },
  { icon: <Search className="size-4" />,         label: 'Research',       href: '/research' },
  { icon: <BookOpen className="size-4" />,       label: 'Knowledge Vault',href: '/knowledge-vault' },
  { icon: <FileText className="size-4" />,       label: 'Documents',      href: '/documents' },
  { icon: <Bot className="size-4" />,            label: 'Agents',         href: '/agents' },
  { icon: <Briefcase className="size-4" />,      label: 'Career Copilot', href: '/career' },
  { icon: <Calendar className="size-4" />,       label: 'Meetings',       href: '/meeting' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen text-white" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className="flex flex-col flex-shrink-0 transition-all duration-300 relative"
        style={{ width: collapsed ? '60px' : '220px', background: 'rgba(255,255,255,0.015)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="size-7 flex-shrink-0 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>
            <Sparkles className="size-3.5 text-white" />
          </div>
          {!collapsed && <span className="font-black text-sm font-display truncate">Nexus AI</span>}
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-2 space-y-0.5 custom-scrollbar overflow-y-auto">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all ${active ? 'nav-item-active' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/settings" title={collapsed ? 'Settings' : undefined}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-all ${pathname === '/settings' ? 'nav-item-active' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
            <Settings className="size-4 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <Link href="/login" title={collapsed ? 'Sign out' : undefined}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-white/40 hover:text-red-400 hover:bg-red-500/8 transition-all">
            <LogOut className="size-4 flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </Link>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 size-6 rounded-full flex items-center justify-center transition-all hover:scale-110 z-10"
          style={{ background: 'rgba(20,20,40,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {collapsed ? <ChevronRight className="size-3 text-white/50" /> : <ChevronLeft className="size-3 text-white/50" />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(5,8,22,0.7)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-2">
            <kbd className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-white/25"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Command className="size-2.5" /> K
            </kbd>
            <span className="text-[11px] text-white/25 hidden sm:block">Command palette</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="size-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all relative">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-violet-400 animate-pulse" />
            </button>
            <Link href="/settings">
              <div className="size-8 rounded-xl flex items-center justify-center cursor-pointer hover:opacity-80 transition-all"
                style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                <User className="size-4 text-white" />
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-auto custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Global Voice Assistant (floating) */}
      <VoiceAssistant />
    </div>
  );
}
