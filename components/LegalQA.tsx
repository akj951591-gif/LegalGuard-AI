
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Bot, Loader2, Sparkles, AlertCircle, 
  Mic, MicOff, Download, Save, Plus, ArrowLeft 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { askLegalQuestion } from '../services/geminiService';
import { supabase } from '../services/supabaseClient';
import { ChatMessage, ChatSession } from '../types';

interface LegalQAProps {
  isDarkMode: boolean;
  onBack: () => void;
}

const LegalQA: React.FC<LegalQAProps> = ({ isDarkMode, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    
    const savedChat = localStorage.getItem('legalguard_chat_history');
    if (savedChat) setMessages(JSON.parse(savedChat));

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (e: any) => { setInput(p => p + ' ' + e.results[0][0].transcript); setIsListening(false); };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem('legalguard_chat_history', JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const saveCurrentSession = async () => {
    if (messages.length === 0) return;
    
    const firstUserMsg = messages.find(m => m.role === 'user')?.text || 'Untitled Chat';
    const title = firstUserMsg.length > 40 ? firstUserMsg.substring(0, 40) + '...' : firstUserMsg;

    if (user) {
      const { error } = await supabase.from('chat_sessions').insert([{
        user_id: user.id,
        title,
        messages,
        timestamp: Date.now()
      }]);
      if (error) alert("Error saving to cloud: " + error.message);
      else alert("Chat session synced to cloud!");
    } else {
      const sessionsStr = localStorage.getItem('legalguard_chat_sessions');
      const sessions = sessionsStr ? JSON.parse(sessionsStr) : [];
      sessions.push({ id: crypto.randomUUID(), title, messages, timestamp: Date.now() });
      localStorage.setItem('legalguard_chat_sessions', JSON.stringify(sessions));
      alert("Chat saved locally. Sign in to sync to cloud!");
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newUserMsg: ChatMessage = { role: 'user', text: userMessage, timestamp: Date.now() };
    setInput('');
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }));
      const response = await askLegalQuestion(userMessage, history);
      setMessages(prev => [...prev, { role: 'assistant', text: response, timestamp: Date.now() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Error. Try again.", timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 flex flex-col h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
          <ArrowLeft size={18} /> Dashboard
        </button>
        <button onClick={() => { setMessages([]); localStorage.removeItem('legalguard_chat_history'); }} className="bg-amber-500 text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus size={18} /> New Chat
        </button>
      </div>

      <div className="flex-grow bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col mb-6">
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-2xl shadow-sm text-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-800'}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && <div className="text-slate-400 text-xs animate-pulse">Assistant is thinking...</div>}
        </div>

        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-grow bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none"
              rows={1}
            />
            <button type="button" onClick={saveCurrentSession} className="p-3 bg-amber-100 text-amber-700 rounded-xl" title="Save Session">
              <Save size={20} />
            </button>
            <button type="submit" disabled={!input.trim()} className="bg-slate-900 text-white p-3 rounded-xl"><Send size={20} /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LegalQA;
