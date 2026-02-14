
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import LegalOutput from './components/LegalOutput';
import RightsLibrary from './components/RightsLibrary';
import LegalQA from './components/LegalQA';
import SectionLookup from './components/SectionLookup';
import SupportModal from './components/SupportModal';
import QuickInfoModal from './components/QuickInfoModal';
import AboutUs from './components/AboutUs';
import PoliceFinder from './components/PoliceFinder';
import HistoryView from './components/HistoryView';
import AuthModal from './components/AuthModal';
import { CaseType, CaseSubmission, LegalAnalysis, View, StoredAnalysis } from './types';
import { analyzeLegalProblem } from './services/geminiService';
import { supabase } from './services/supabaseClient';
import { 
  Send, Loader2, AlertCircle, Info, Gavel, 
  ShieldCheck, Scale, HeartHandshake, BookOpen, MessageCircleQuestion,
  Mic, MicOff
} from 'lucide-react';

const NationalEmblemBackground: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none z-[-1] flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${isDarkMode ? 'opacity-[0.07]' : 'opacity-[0.05]'} print:hidden`}>
      <div className="relative flex flex-col items-center max-w-[90vw] animate-in fade-in zoom-in duration-1000">
        <svg 
          viewBox="0 0 512 650" 
          className="w-[450px] md:w-[600px] h-auto"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="emblemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF9933" />
              <stop offset="60%" stopColor="#FF9933" />
              <stop offset="70%" stopColor="#128807" />
              <stop offset="100%" stopColor="#128807" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <g filter="url(#glow)">
            <path 
              d="M256 40C200 40 180 80 180 120C180 160 210 190 256 190C302 190 332 160 332 120C332 80 312 40 256 40ZM240 80C240 70 272 70 272 80C272 90 240 90 240 80Z" 
              fill="url(#emblemGradient)" 
            />
            <path 
              d="M175 90C140 90 125 120 125 150C125 180 150 210 185 210C210 210 225 190 225 160C225 130 210 90 175 90Z" 
              fill="url(#emblemGradient)" 
            />
            <path 
              d="M337 90C372 90 387 120 387 150C387 180 362 210 327 210C302 210 287 190 287 160C287 130 302 90 337 90Z" 
              fill="url(#emblemGradient)" 
            />
            <path d="M210 160Q256 220 302 160" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
            <rect x="156" y="240" width="200" height="60" rx="8" fill="url(#emblemGradient)" />
            <circle cx="256" cy="270" r="20" stroke="white" strokeWidth="2" opacity="0.8" />
            <path 
              d="M176 300L156 380C156 420 200 450 256 450C312 450 356 420 356 380L336 300Z" 
              fill="#128807" 
            />
          </g>
        </svg>
        <div className={`mt-4 text-center ${isDarkMode ? 'text-[#128807]' : 'text-[#128807]'} font-bold`}>
           <div className="text-5xl md:text-7xl mb-2 opacity-80" style={{ fontFamily: 'serif' }}>सत्यमेव जयते</div>
           <div className="text-sm md:text-lg uppercase tracking-[0.3em] font-serif opacity-60">Truth Alone Triumphs</div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [quickInfoModal, setQuickInfoModal] = useState<{ isOpen: boolean; type: 'property' | 'police' }>({
    isOpen: false,
    type: 'property'
  });
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('legalguard_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  // Fixed errors by defining isDarkMode based on the current theme state.
  const isDarkMode = theme === 'dark';
  
  const [state, setState] = useState<{
    submission: CaseSubmission;
    loading: boolean;
    error: string | null;
    analysis: LegalAnalysis | null;
  }>({
    submission: {
      type: CaseType.FALSE_CASE,
      description: '',
      urgency: 'medium'
    },
    loading: false,
    error: null,
    analysis: null
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('legalguard_theme', theme);
  }, [theme]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setState(prev => ({
          ...prev,
          submission: {
            ...prev.submission,
            description: prev.submission.description + (prev.submission.description ? ' ' : '') + transcript
          }
        }));
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.submission.description.trim()) {
      setState(prev => ({ ...prev, error: "Please describe your situation in detail." }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await analyzeLegalProblem(state.submission);
      
      const storedItem: StoredAnalysis = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        submission: { ...state.submission },
        analysis: result
      };
      
      // Save locally
      const historyStr = localStorage.getItem('legalguard_reports_history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.push(storedItem);
      localStorage.setItem('legalguard_reports_history', JSON.stringify(history));

      // Sync to Supabase if logged in
      if (user) {
        await supabase.from('reports').insert([{
          user_id: user.id,
          submission: state.submission,
          analysis: result,
          timestamp: storedItem.timestamp
        }]);
      }

      setState(prev => ({ ...prev, analysis: result, loading: false }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, error: "An error occurred. Please try again.", loading: false }));
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'library': return <RightsLibrary isDarkMode={isDarkMode} />;
      case 'qa': return <LegalQA isDarkMode={isDarkMode} onBack={() => setView('home')} />;
      case 'sections': return <SectionLookup isDarkMode={isDarkMode} />;
      case 'about': return <AboutUs isDarkMode={isDarkMode} />;
      case 'policeFinder': return <PoliceFinder isDarkMode={isDarkMode} />;
      case 'history': return (
          <HistoryView 
            isDarkMode={isDarkMode} 
            onRevisitAnalysis={(a) => { setState({ ...state, analysis: a.analysis, submission: a.submission }); setView('home'); }} 
            onRevisitChat={() => setView('qa')} 
          />
        );
      default:
        return !state.analysis ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl font-serif font-bold mb-4 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                What is your legal situation?
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Explain your problem in detail. Our AI will analyze the legal implications and provide immediate steps.
              </p>
            </div>

            <div className={`backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 border transition-all ${isDarkMode ? 'bg-white/95 border-slate-200' : 'bg-white border-slate-200'}`}>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Category</label>
                    <select
                      value={state.submission.type}
                      onChange={(e) => setState({ ...state, submission: { ...state.submission, type: e.target.value as CaseType } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-black"
                    >
                      {Object.values(CaseType).map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase mb-2">Urgency</label>
                    <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                      {(['low', 'medium', 'high'] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setState({ ...state, submission: { ...state.submission, urgency: u } })}
                          className={`flex-1 py-2 rounded-md text-sm font-bold transition ${state.submission.urgency === u ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500'}`}
                        >
                          {u.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                      rows={6}
                      value={state.submission.description}
                      onChange={(e) => setState({ ...state, submission: { ...state.submission, description: e.target.value } })}
                      placeholder={isListening ? "Listening..." : "Describe the incident..."}
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-4 text-lg text-black ${isListening ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'}`}
                  />
                  <button
                      type="button"
                      onClick={toggleListening}
                      className={`absolute right-4 bottom-4 p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-bounce' : 'bg-slate-900 text-white'}`}
                  >
                      {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>
                </div>

                {state.error && <div className="text-red-600 text-sm font-bold">{state.error}</div>}

                <button
                  type="submit"
                  disabled={state.loading}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3"
                >
                  {state.loading ? <Loader2 className="animate-spin" /> : <Send />}
                  {state.loading ? "Analyzing Justice Protocol..." : "Generate Legal Strategy"}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
             <LegalOutput analysis={state.analysis} onReset={() => setState({ ...state, analysis: null })} isDarkMode={isDarkMode} />
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative ${isDarkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      <NationalEmblemBackground isDarkMode={isDarkMode} />
      <Header 
        currentView={view} 
        onViewChange={setView} 
        theme={theme} 
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
        onAuthClick={() => setIsAuthOpen(true)}
      />
      <main className="flex-grow container mx-auto px-4 py-12">
        {renderContent()}
      </main>
      <button 
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-8 right-8 z-[90] bg-amber-500 text-slate-900 p-4 rounded-full shadow-2xl flex items-center gap-3 font-bold"
      >
        <HeartHandshake />
        <span className="hidden md:inline pr-2 text-sm uppercase">Legal Aid</span>
      </button>

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} isDarkMode={isDarkMode} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} isDarkMode={isDarkMode} />
      <QuickInfoModal 
        isOpen={quickInfoModal.isOpen} 
        type={quickInfoModal.type}
        onClose={() => setQuickInfoModal({ ...quickInfoModal, isOpen: false })}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default App;
