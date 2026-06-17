'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Volume2, VolumeX, X } from 'lucide-react';

interface VoiceAssistantProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
}

export default function VoiceAssistant({ onTranscript, onResponse }: VoiceAssistantProps) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [visible, setVisible] = useState(false);
  const recognitionRef = useRef<any>(null);

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in this browser.'); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (e: any) => {
      const t = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join('');
      setTranscript(t);
      if ((e.results as any)[e.results.length - 1].isFinal) {
        onTranscript?.(t);
        handleVoiceCommand(t);
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function handleVoiceCommand(text: string) {
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      if (data.response) {
        setResponse(data.response);
        onResponse?.(data.response);
        if (voiceEnabled) speakResponse(data.response);
      }
    } catch { /* fallback: echo transcript */ }
  }

  function speakResponse(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0; utt.pitch = 1.0; utt.lang = 'en-US';
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
    if (preferred) utt.voice = preferred;
    window.speechSynthesis.speak(utt);
  }

  function stopSpeaking() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  const COMMANDS = [
    { cmd: 'Create Task', desc: 'create a new task' },
    { cmd: 'Open Research', desc: 'start a research session' },
    { cmd: 'Search Knowledge Vault', desc: 'search your documents' },
    { cmd: 'Summarize Document', desc: 'summarize uploaded file' },
    { cmd: 'Generate Notes', desc: 'create AI notes' },
  ];

  if (!visible) {
    return (
      <button onClick={() => setVisible(true)}
        className={`fixed bottom-6 right-6 size-14 rounded-full flex items-center justify-center z-40 transition-all hover:scale-110 shadow-2xl ${listening ? 'pulsating-border' : ''}`}
        style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 0 32px rgba(124,58,237,0.6)' }}>
        <Mic className="size-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 z-40 rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: 'rgba(5,8,22,0.97)', border: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(20px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-sm font-semibold font-display">Voice Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
            {voiceEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          <button onClick={() => setVisible(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all">
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Voice visualizer */}
      <div className="px-4 py-4 flex flex-col items-center gap-3">
        <div className={`size-20 rounded-full flex items-center justify-center transition-all ${listening ? 'pulsating-border' : ''}`}
          style={{ background: listening ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)', border: `2px solid ${listening ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}` }}>
          {listening ? (
            <div className="flex gap-1 items-end h-8">{[1,2,3,4,5].map(b => <div key={b} className="voice-bar" />)}</div>
          ) : speaking ? (
            <Volume2 className="size-8 text-violet-400 animate-pulse" />
          ) : (
            <Mic className="size-8 text-white/40" />
          )}
        </div>

        <p className="text-xs text-white/40 text-center">
          {listening ? 'Listening... speak now' : speaking ? 'Speaking response...' : 'Tap mic to speak'}
        </p>

        {transcript && (
          <div className="w-full p-2.5 rounded-xl text-xs text-white/70" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] text-white/30 mb-1">You said:</p>
            {transcript}
          </div>
        )}

        {response && (
          <div className="w-full p-2.5 rounded-xl text-xs text-white/70" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
            <p className="text-[10px] text-violet-400 mb-1">Nexus AI:</p>
            {response}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 w-full">
          <button onClick={listening ? stopListening : startListening}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all ${listening ? 'bg-red-500/80' : ''}`}
            style={listening ? {} : { background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
            {listening ? 'Stop' : 'Start Listening'}
          </button>
          {speaking && (
            <button onClick={stopSpeaking} className="px-3 py-2.5 rounded-xl text-xs text-white/60 hover:text-white bg-white/8 hover:bg-white/15 transition-all">
              Stop
            </button>
          )}
        </div>
      </div>

      {/* Commands */}
      <div className="px-4 pb-4">
        <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2">Voice Commands</p>
        <div className="space-y-1">
          {COMMANDS.map(c => (
            <button key={c.cmd} onClick={() => { setTranscript(c.cmd); handleVoiceCommand(c.cmd); }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-white/50 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
              <span className="text-violet-400 font-mono">{c.cmd}</span>
              <span className="text-white/25">— {c.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
