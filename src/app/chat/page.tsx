'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mic, MicOff, Copy, RefreshCw, Trash2, Plus, Search, Sparkles, User, Volume2, Pencil, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

interface Message { id: string; role: 'user'|'assistant'; content: string; ts: Date; }
interface Chat { id: string; title: string; messages: Message[]; ts: Date; }

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0,1,2].map(i=>(
        <div key={i} className="size-2 rounded-full bg-violet-400" style={{animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
      ))}
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

function MessageBubble({ msg, onCopy }: { msg: Message; onCopy: (t:string)=>void }) {
  const isAI = msg.role === 'assistant';
  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:0.3}}
      className={`flex items-start gap-3 ${isAI?'':'flex-row-reverse'}`}>
      <div className={`size-8 rounded-xl flex-shrink-0 flex items-center justify-center ${isAI?'':'bg-white/10'}`}
        style={isAI?{background:'linear-gradient(135deg,#4F46E5,#7C3AED)'}:{}}>
        {isAI?<Sparkles className="size-3.5 text-white"/>:<User className="size-4 text-white/60"/>}
      </div>
      <div className={`group max-w-[75%] ${isAI?'':'items-end flex flex-col'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isAI?'rounded-tl-sm':'rounded-tr-sm'}`}
          style={isAI?{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.85)'}:{background:'linear-gradient(135deg,#4338CA,#6D28D9)',color:'white'}}>
          {msg.content}
        </div>
        <div className={`flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-all ${isAI?'':'flex-row-reverse'}`}>
          <button onClick={()=>onCopy(msg.content)} className="p-1 rounded-md hover:bg-white/8 text-white/30 hover:text-white/60 transition-all"><Copy className="size-3"/></button>
          {isAI&&<button className="p-1 rounded-md hover:bg-white/8 text-white/30 hover:text-white/60 transition-all"><Volume2 className="size-3"/></button>}
          {isAI&&<button className="p-1 rounded-md hover:bg-white/8 text-white/30 hover:text-white/60 transition-all"><RefreshCw className="size-3"/></button>}
          <span className="text-[10px] text-white/20 px-1">{msg.ts.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Persistence helpers ----
// All talk to /api/conversations[/[id]]. Dates come back from the API as
// ISO strings (JSON has no Date type) — reviveMessageDates fixes that up
// so the rest of the component can keep using msg.ts.toLocaleTimeString()
// etc. exactly as it already did.
function reviveMessageDates(messages: Array<Omit<Message,'ts'> & { ts: string | Date }>): Message[] {
  return messages.map(m => ({ ...m, ts: new Date(m.ts) }));
}

function reviveChat(raw: any): Chat {
  return {
    id: raw.id,
    title: raw.title,
    messages: reviveMessageDates(raw.messages || []),
    ts: new Date(raw.updatedAt || raw.createdAt || Date.now()),
  };
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [listening, setListening] = useState(false);
  const [search, setSearch] = useState('');
  const [provider, setProvider] = useState<'nvidia'|'openrouter'>('nvidia');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeChat = chats.find(c=>c.id===activeId);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth'});},[activeChat?.messages]);

  // ---- Load conversations on mount ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/conversations', { credentials: 'include' });
        if (!res.ok) {
          // Not fatal — fall back to a fresh local chat so the page is
          // still usable even if persistence is down (matches the
          // resilience pattern already used for /api/ai-chat failures).
          if (!cancelled) setLoadingChats(false);
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        const loaded: Chat[] = (data.conversations || []).map(reviveChat);
        if (loaded.length > 0) {
          setChats(loaded);
          setActiveId(loaded[0].id);
        }
        // If loaded.length === 0, leave chats empty — newChat() or the
        // first sendMessage() will create the first conversation, rather
        // than seeding a hardcoded welcome chat that doesn't exist in Mongo.
      } catch {
        // network error — same fallback as above
      } finally {
        if (!cancelled) setLoadingChats(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function newChat() {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: 'New conversation', messages: [] }),
      });
      if (res.ok) {
        const data = await res.json();
        const chat = reviveChat(data.conversation);
        setChats(prev=>[chat, ...prev]);
        setActiveId(chat.id);
        return;
      }
    } catch {
      // fall through to local-only chat below
    }
    // Persistence failed — still let the user start chatting locally
    // rather than blocking the button entirely.
    const id = Date.now().toString();
    setChats(prev=>[{id,title:'New conversation',messages:[],ts:new Date()}, ...prev]);
    setActiveId(id);
  }

  // Persists the given chat's current messages/title to the backend.
  // Fire-and-forget from the caller's perspective (errors logged, not
  // surfaced as a blocking UI state) — losing a save shouldn't interrupt
  // an in-progress conversation.
  async function persistChat(chat: Chat) {
    try {
      await fetch(`/api/conversations/${chat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: chat.title, messages: chat.messages }),
      });
    } catch (err) {
      console.error('[chat] failed to persist conversation:', err);
    }
  }

  async function sendMessage() {
    if(!input.trim()||loading) return;

    // If there's no active chat yet (fresh session, load failed, etc.),
    // create one first so the very first message has somewhere to land.
    let currentChat = activeChat;
    if (!currentChat) {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title: 'New conversation', messages: [] }),
        });
        if (res.ok) {
          const data = await res.json();
          currentChat = reviveChat(data.conversation);
          setChats(prev=>[currentChat!, ...prev]);
          setActiveId(currentChat.id);
        } else {
          currentChat = { id: Date.now().toString(), title: 'New conversation', messages: [], ts: new Date() };
          setChats(prev=>[currentChat!, ...prev]);
          setActiveId(currentChat.id);
        }
      } catch {
        currentChat = { id: Date.now().toString(), title: 'New conversation', messages: [], ts: new Date() };
        setChats(prev=>[currentChat!, ...prev]);
        setActiveId(currentChat.id);
      }
    }
    const chatId = currentChat.id;

    const userMsg: Message = {id:Date.now().toString(),role:'user',content:input.trim(),ts:new Date()};
    const newTitle = input.trim().slice(0,40);

    // Snapshot history INCLUDING the new user message for the API call
    const history = [...currentChat.messages, userMsg];
    const isFirstMessage = currentChat.messages.length === 0;

    setChats(prev=>prev.map(c=>c.id===chatId?{...c,title:isFirstMessage?newTitle:c.title,messages:[...c.messages,userMsg]}:c));
    setInput('');
    setLoading(true);

    // Create placeholder assistant message we'll stream tokens into
    const aiMsgId = (Date.now()+1).toString();
    const aiMsg: Message = { id: aiMsgId, role: 'assistant', content: '', ts: new Date() };
    setChats(prev=>prev.map(c=>c.id===chatId?{...c,messages:[...c.messages,aiMsg]}:c));

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m=>({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(()=>({error:'AI service unavailable'}));
        throw new Error(err.error || 'AI service unavailable');
      }

      const providerHeader = res.headers.get('X-Provider');
      if (providerHeader === 'openrouter' || providerHeader === 'nvidia') {
        setProvider(providerHeader);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') continue;

          try {
            const json = JSON.parse(payload);
            const delta = json.choices?.[0]?.delta?.content
                       ?? json.choices?.[0]?.message?.content
                       ?? '';
            if (delta) {
              fullText += delta;
              setChats(prev=>prev.map(c=>c.id===chatId
                ? {...c, messages: c.messages.map(m=>m.id===aiMsgId?{...m,content:fullText}:m)}
                : c
              ));
            }
          } catch {
            // ignore malformed SSE chunk
          }
        }
      }

      if (!fullText) {
        fullText = '(No response received.)';
        setChats(prev=>prev.map(c=>c.id===chatId
          ? {...c, messages: c.messages.map(m=>m.id===aiMsgId?{...m,content:fullText}:m)}
          : c
        ));
      }

      // Persist the completed exchange (user msg + final assistant text).
      // Read the latest state via the functional setChats pattern already
      // in use, then fire the save off the resulting chat snapshot.
      setChats(prev => {
        const updated = prev.map(c=>c.id===chatId
          ? {...c, messages: c.messages.map(m=>m.id===aiMsgId?{...m,content:fullText}:m)}
          : c
        );
        const finalChat = updated.find(c => c.id === chatId);
        if (finalChat) persistChat(finalChat);
        return updated;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setChats(prev=>prev.map(c=>c.id===chatId
        ? {...c, messages: c.messages.map(m=>m.id===aiMsgId?{...m,content:`⚠️ ${message}`}:m)}
        : c
      ));
      // Persist even the error state — better than the conversation
      // looking shorter on reload than what the user actually saw.
      setChats(prev => {
        const finalChat = prev.find(c => c.id === chatId);
        if (finalChat) persistChat(finalChat);
        return prev;
      });
    } finally {
      setLoading(false);
    }
  }

   function toggleVoice() {
  if (listening) {
    recognitionRef.current?.stop();
    setListening(false);
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SR = (window as Record<string, any>)['SpeechRecognition']
          || (window as Record<string, any>)['webkitSpeechRecognition'];

  if (!SR) { alert('Speech recognition not supported in this browser.'); return; }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rec: any = new SR();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = 'en-US';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rec.onresult = (e: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = Array.from(e.results).map((r: any) => r[0].transcript).join('');
    setInput(t);
    if (e.results[e.results.length - 1].isFinal) setListening(false);
  };
  rec.onend = () => setListening(false);
  rec.start();
  recognitionRef.current = rec;
  setListening(true);
}

  function copyMsg(text:string){navigator.clipboard.writeText(text);}

  async function deleteChat(id: string) {
    const wasActive = activeId === id;
    setChats(prev=>prev.filter(c=>c.id!==id));
    if (wasActive) {
      const remaining = chats.filter(c=>c.id!==id);
      setActiveId(remaining.length > 0 ? remaining[0].id : '');
    }
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE', credentials: 'include' });
    } catch (err) {
      console.error('[chat] failed to delete conversation on server:', err);
      // Not rolling back the optimistic local removal — a conversation
      // that's gone from the UI but still in Mongo will simply reappear
      // on next full reload, which is a less confusing failure mode than
      // a delete button that silently un-deletes itself.
    }
  }

  function startRename(chat: Chat) {
    setRenamingId(chat.id);
    setRenameValue(chat.title);
  }

  async function commitRename() {
    if (!renamingId) return;
    const title = renameValue.trim();
    if (!title) { setRenamingId(null); return; }

    setChats(prev=>prev.map(c=>c.id===renamingId?{...c,title}:c));
    const idToRename = renamingId;
    setRenamingId(null);

    try {
      await fetch(`/api/conversations/${idToRename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title }),
      });
    } catch (err) {
      console.error('[chat] failed to persist rename:', err);
    }
  }

  const filteredChats = chats.filter(c=>c.title.toLowerCase().includes(search.toLowerCase()));

  if (loadingChats) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-52px)]">
          <Loader2 className="size-6 text-violet-400 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-52px)]">
        {/* Chat list sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col" style={{borderRight:'1px solid rgba(255,255,255,0.06)',background:'rgba(255,255,255,0.01)'}}>
          <div className="p-3 space-y-2" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            <button onClick={newChat} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{background:'linear-gradient(135deg,#4F46E5,#7C3AED)',boxShadow:'0 0 16px rgba(124,58,237,0.3)'}}>
              <Plus className="size-3.5"/> New Chat
            </button>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-white/30"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search chats..."
                className="w-full pl-7 pr-3 py-2 rounded-xl text-xs bg-white/5 border border-white/8 focus:outline-none focus:border-violet-500/50 text-white/60 placeholder-white/25"/>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
            {filteredChats.length === 0 && (
              <p className="text-xs text-white/25 text-center mt-6 px-3">No conversations yet. Start typing below to begin one.</p>
            )}
            {filteredChats.map(chat=>(
              <div key={chat.id}
                role="button"
                tabIndex={0}
                onClick={()=>setActiveId(chat.id)}
                onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')setActiveId(chat.id);}}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all group cursor-pointer ${activeId===chat.id?'nav-item-active':'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
                <div className="flex items-center justify-between gap-1">
                  {renamingId === chat.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e=>setRenameValue(e.target.value)}
                      onClick={e=>e.stopPropagation()}
                      onKeyDown={e=>{
                        if(e.key==='Enter'){e.preventDefault();commitRename();}
                        if(e.key==='Escape'){setRenamingId(null);}
                      }}
                      onBlur={commitRename}
                      className="flex-1 bg-white/10 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                    />
                  ) : (
                    <span className="truncate">{chat.title}</span>
                  )}
                  {renamingId !== chat.id && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
                      <button onClick={e=>{e.stopPropagation();startRename(chat);}}
                        className="p-0.5 hover:text-violet-400 transition-all">
                        <Pencil className="size-3"/>
                      </button>
                      <button onClick={e=>{e.stopPropagation();deleteChat(chat.id);}}
                        className="p-0.5 hover:text-red-400 transition-all">
                        <Trash2 className="size-3"/>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-white/20 mt-0.5">{chat.ts.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            <div>
              <h2 className="text-sm font-semibold text-white font-display truncate">{activeChat?.title || 'New conversation'}</h2>
              <p className="text-[11px] text-white/30">Powered by NVIDIA NIM · LLaMA 3.1 70B</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] text-emerald-400" style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.2)'}}>
                <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                {provider === 'nvidia' ? 'NVIDIA NIM' : 'OpenRouter'}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {!activeChat && (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-white/30">Start a new conversation or pick one from the sidebar.</p>
              </div>
            )}
            {activeChat?.messages.map(msg=>(
              <MessageBubble key={msg.id} msg={msg} onCopy={copyMsg}/>
            ))}
            {loading&&!activeChat?.messages[activeChat.messages.length-1]?.content&&(
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-xl flex items-center justify-center" style={{background:'linear-gradient(135deg,#4F46E5,#7C3AED)'}}>
                  <Sparkles className="size-3.5 text-white"/>
                </div>
                <div className="rounded-2xl rounded-tl-sm" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <TypingDots/>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Voice indicator */}
          {listening&&(
            <div className="mx-5 mb-2 flex items-center gap-3 px-4 py-2.5 rounded-xl pulsating-border" style={{background:'rgba(124,58,237,0.08)',border:'1px solid rgba(124,58,237,0.3)'}}>
              <div className="flex gap-1 items-end h-5">
                {[1,2,3,4,5].map(b=><div key={b} className="voice-bar"/>)}
              </div>
              <span className="text-xs text-violet-400">Listening... speak now</span>
            </div>
          )}

          {/* Input */}
          <div className="p-4" style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <div className="flex items-end gap-2">
              <div className="flex-1 rounded-2xl flex items-end gap-2 px-4 py-3" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',transition:'border-color 0.2s'}}>
                <textarea value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                  placeholder="Message Nexus AI... (Enter to send, Shift+Enter for newline)"
                  rows={1} style={{resize:'none',maxHeight:'120px',overflowY:'auto'}}
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none custom-scrollbar"/>
              </div>
              <button onClick={toggleVoice} className={`size-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${listening?'pulsating-border':'hover:bg-white/8'}`}
                style={listening?{background:'rgba(124,58,237,0.15)',border:'1px solid rgba(124,58,237,0.4)'}:{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)'}}>
                {listening?<MicOff className="size-4 text-violet-400"/>:<Mic className="size-4 text-white/50"/>}
              </button>
              <button onClick={sendMessage} disabled={!input.trim()||loading}
                className="size-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40"
                style={{background:'linear-gradient(135deg,#4F46E5,#7C3AED)',boxShadow:'0 0 16px rgba(124,58,237,0.3)'}}>
                <Send className="size-4 text-white"/>
              </button>
            </div>
            <p className="text-[10px] text-white/20 text-center mt-2">Nexus AI can make mistakes. Verify important information.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}