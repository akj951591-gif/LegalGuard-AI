
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Bot, Loader2, Sparkles, AlertCircle, 
  Mic, MicOff, Trash2, Download, Save, Plus,
  Bold, Italic, List, Code, Type as TypeIcon, ArrowLeft 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { askLegalQuestion } from '../services/geminiService';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedChat = localStorage.getItem('legalguard_chat_history');
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error("Failed to parse saved chat history", e);
      }
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('legalguard_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const saveCurrentSession = () => {
    if (messages.length === 0) return;
    
    const sessionsStr = localStorage.getItem('legalguard_chat_sessions');
    const sessions: ChatSession[] = sessionsStr ? JSON.parse(sessionsStr) : [];
    
    // First user message as title
    const firstUserMsg = messages.find(m => m.role === 'user')?.text || 'Untitled Chat';
    const title = firstUserMsg.length > 40 ? firstUserMsg.substring(0, 40) + '...' : firstUserMsg;

    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title,
      timestamp: Date.now(),
      messages: [...messages]
    };

    sessions.push(newSession);
    localStorage.setItem('legalguard_chat_sessions', JSON.stringify(sessions));
  };

  const startNewChat = () => {
    if (messages.length > 0) {
      if (window.confirm("Do you want to save this current session to your History before starting a new one?")) {
        saveCurrentSession();
      }
    }
    setMessages([]);
    localStorage.removeItem('legalguard_chat_history');
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear this active chat? (Saved sessions in History will remain)")) {
      setMessages([]);
      localStorage.removeItem('legalguard_chat_history');
    }
  };

  const downloadHistory = () => {
    const chatText = messages.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.role.toUpperCase()}: ${m.text}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LegalGuard_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selection = input.substring(start, end);
    const newText = input.substring(0, start) + prefix + selection + suffix + input.substring(end);
    setInput(newText);
    
    // Set focus and selection back
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = selection ? end + prefix.length + suffix.length : start + prefix.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
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
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        text: m.text
      }));
      const response = await askLegalQuestion(userMessage, history);
      const newAssistantMsg: ChatMessage = { role: 'assistant', text: response, timestamp: Date.now() };
      setMessages(prev => [...prev, newAssistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: "I encountered an error. Please check your connection and try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Can police arrest me without a warrant?",
    "What are my rights if I am accused of a false crime?",
    "How do I file an RTI application?",
    "What is the process for mutual divorce?",
    "Someone is blackmailing me with deepfakes, help."
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 flex flex-col h-[80vh]">
      {/* Back Button and Header */}
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className={`w-fit flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50'}`}
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>
          
          <button 
            onClick={startNewChat}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h2 className={`text-3xl font-serif font-bold mb-2 flex items-center justify-center md:justify-start gap-2 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="text-amber-500" />
              Legal Q&A Assistant
            </h2>
            <p className={`transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Instant guidance for your legal concerns.</p>
          </div>
          
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <button 
                  onClick={() => {
                    saveCurrentSession();
                    alert("Chat session saved to History!");
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${isDarkMode ? 'bg-blue-900/30 text-blue-400 hover:text-white border-blue-900/30' : 'bg-blue-50 text-blue-600 hover:text-blue-900 border-blue-200 shadow-sm'}`}
                  title="Save to History"
                >
                  <Save size={14} />
                  Save Session
                </button>
                <button 
                  onClick={downloadHistory}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700' : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 shadow-sm'}`}
                  title="Download Chat Log"
                >
                  <Download size={14} />
                  Download
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-grow bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col mb-6">
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-6 space-y-6 bg-slate-50/50 no-scrollbar"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="bg-slate-100 p-8 rounded-full">
                <Bot size={56} className="text-slate-400" />
              </div>
              <div className="max-w-3xl px-4 w-full">
                <p className="text-slate-500 mb-6 font-medium text-lg">Start a conversation by asking a question, using voice, or select a suggestion below.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(s);
                      }}
                      className="text-sm bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-600 hover:shadow-md px-5 py-2.5 rounded-full transition shadow-sm font-semibold text-slate-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
            >
              <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-amber-500 text-slate-900'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="flex flex-col gap-1 w-full overflow-hidden">
                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    <div className="markdown-content prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold text-slate-400 uppercase ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-1 mb-2">
            <button 
              type="button" 
              onClick={() => insertFormatting('**', '**')} 
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition" 
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button 
              type="button" 
              onClick={() => insertFormatting('_', '_')} 
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition" 
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button 
              type="button" 
              onClick={() => insertFormatting('\n- ', '')} 
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition" 
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button 
              type="button" 
              onClick={() => insertFormatting('\n```\n', '\n```\n')} 
              className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition" 
              title="Code Block"
            >
              <Code size={16} />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <TypeIcon size={12} />
              Markdown Support
            </span>
          </div>
          
          <form onSubmit={handleSend} className="flex gap-2 items-end">
            <div className="relative flex-grow">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={isListening ? "Listening..." : "Type or speak your question..."}
                rows={1}
                className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 transition text-black placeholder-slate-400 resize-none min-h-[48px] max-h-[200px] leading-relaxed ${isListening ? 'ring-2 ring-red-400 animate-pulse' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`absolute right-2 bottom-2 p-2 rounded-lg transition-colors ${
                  isListening 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100'
                }`}
                title={isListening ? "Stop Listening" : "Start Voice Input"}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-slate-900 text-white p-3.5 rounded-xl hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex-shrink-0 mb-1"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            <AlertCircle size={12} />
            Not legal advice • Consult a lawyer for official counsel
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalQA;
