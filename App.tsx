
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
import { CaseType, CaseSubmission, LegalAnalysis, View, StoredAnalysis } from './types';
import { analyzeLegalProblem } from './services/geminiService';
import { 
  Send, Loader2, AlertCircle, Info, FileQuestion, Gavel, 
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
            {/* Detailed Lion Heads Group */}
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
            
            {/* Manes and Details */}
            <path d="M210 160Q256 220 302 160" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
            <path d="M180 120L160 140M332 120L352 140" stroke="white" strokeWidth="1" opacity="0.2"/>
            
            {/* Abacus / Base */}
            <rect x="156" y="240" width="200" height="60" rx="8" fill="url(#emblemGradient)" />
            
            {/* Dharma Chakra in the center of base */}
            <circle cx="256" cy="270" r="20" stroke="white" strokeWidth="2" opacity="0.8" />
            <circle cx="256" cy="270" r="4" fill="white" />
            {[...Array(24)].map((_, i) => (
              <line 
                key={i}
                x1="256" y1="270" 
                x2={256 + 20 * Math.cos(i * 15 * Math.PI / 180)} 
                y2={270 + 20 * Math.sin(i * 15 * Math.PI / 180)} 
                stroke="white" 
                strokeWidth="0.5"
                opacity="0.5"
              />
            ))}
            
            {/* Bull and Horse details on base */}
            <path d="M186 260Q200 250 210 270" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            <path d="M326 260Q312 250 302 270" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            
            {/* Lotus Base / Lower Pedestal */}
            <path 
              d="M176 300L156 380C156 420 200 450 256 450C312 450 356 420 356 380L336 300Z" 
              fill="#128807" 
            />
            <path d="M206 320L256 360L306 320" stroke="white" strokeWidth="2" opacity="0.1"/>
          </g>
        </svg>
        
        {/* Satyamev Jayate Text */}
        <div className={`mt-4 text-center ${isDarkMode ? 'text-[#128807]' : 'text-[#128807]'} font-bold`}>
           <div className="text-5xl md:text-7xl mb-2 opacity-80" style={{ fontFamily: 'serif' }}>
             सत्यमेव जयते
           </div>
           <div className="text-sm md:text-lg uppercase tracking-[0.3em] font-serif opacity-60">
             Truth Alone Triumphs
           </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
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
    localStorage.setItem('legalguard_theme', theme);
  }, [theme]);

  // Speech Recognition Setup
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

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
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
      
      // Auto-save to history
      const storedItem: StoredAnalysis = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        submission: { ...state.submission },
        analysis: result
      };
      
      const historyStr = localStorage.getItem('legalguard_reports_history');
      const history = historyStr ? JSON.parse(historyStr) : [];
      history.push(storedItem);
      localStorage.setItem('legalguard_reports_history', JSON.stringify(history));

      setState(prev => ({ ...prev, analysis: result, loading: false }));
    } catch (err: any) {
      console.error(err);
      setState(prev => ({ ...prev, error: "An error occurred while analyzing your case. Please try again.", loading: false }));
    }
  };

  const resetForm = () => {
    setState({
      submission: {
        type: CaseType.FALSE_CASE,
        description: '',
        urgency: 'medium'
      },
      loading: false,
      error: null,
      analysis: null
    });
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
    setState(prev => ({ ...prev, error: null }));
  };

  const revisitAnalysis = (item: StoredAnalysis) => {
    setState({
      submission: item.submission,
      analysis: item.analysis,
      loading: false,
      error: null
    });
    setView('home');
  };

  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const renderContent = () => {
    switch (view) {
      case 'library':
        return <RightsLibrary isDarkMode={isDarkMode} />;
      case 'qa':
        return <LegalQA isDarkMode={isDarkMode} onBack={() => handleViewChange('home')} />;
      case 'sections':
        return <SectionLookup isDarkMode={isDarkMode} />;
      case 'about':
        return <AboutUs isDarkMode={isDarkMode} />;
      case 'policeFinder':
        return <PoliceFinder isDarkMode={isDarkMode} />;
      case 'history':
        return (
          <HistoryView 
            isDarkMode={isDarkMode} 
            onRevisitAnalysis={revisitAnalysis} 
            onRevisitChat={() => handleViewChange('qa')} 
          />
        );
      default:
        return !state.analysis ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className={`text-4xl md:text-5xl font-serif font-bold mb-4 drop-shadow-md transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                What is your legal situation?
              </h2>
              <p className={`text-lg max-w-2xl mx-auto transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Explain your problem in detail. Our AI will analyze the legal implications and provide immediate steps, relevant laws, and an evidence checklist.
              </p>
            </div>

            <div className={`backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10 border transition-all ${isDarkMode ? 'bg-white/95 border-slate-200' : 'bg-white border-slate-200'}`}>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Case Category
                    </label>
                    <select
                      value={state.submission.type}
                      onChange={(e) => setState({ ...state, submission: { ...state.submission, type: e.target.value as CaseType } })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:outline-none transition text-black font-medium"
                    >
                      {Object.values(CaseType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Urgency Level
                    </label>
                    <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                      {(['low', 'medium', 'high'] as const).map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setState({ ...state, submission: { ...state.submission, urgency: u } })}
                          className={`flex-1 py-2 rounded-md text-sm font-bold transition ${
                            state.submission.urgency === u 
                              ? 'bg-slate-900 text-white shadow-md' 
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {u.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
                      Describe the incident / problem
                    </label>
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-medium italic hidden sm:flex items-center gap-1">
                        <Info size={14} /> Detailed input ensures high-accuracy analysis
                        </span>
                    </div>
                  </div>
                  <div className="relative group">
                    <textarea
                        rows={6}
                        value={state.submission.description}
                        onChange={(e) => setState({ ...state, submission: { ...state.submission, description: e.target.value } })}
                        placeholder={isListening ? "Listening to your case..." : "E.g., I have been wrongly accused in a domestic violence case. My wife is demanding property for divorce..."}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-4 focus:ring-2 focus:ring-amber-500 focus:outline-none transition resize-none text-lg text-black placeholder-slate-400 ${isListening ? 'border-red-500 ring-2 ring-red-200 animate-pulse' : 'border-slate-200'}`}
                    />
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`absolute right-4 bottom-4 p-3 rounded-full shadow-lg transition-all transform active:scale-95 ${isListening ? 'bg-red-500 text-white animate-bounce' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        title={isListening ? "Stop Voice Input" : "Speak your Problem"}
                    >
                        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                  </div>
                </div>

                {state.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 animate-shake">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{state.error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state.loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${
                    state.loading 
                    ? 'bg-slate-400 cursor-not-allowed text-white' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl'
                  }`}
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Analyzing Justice Protocol...
                    </>
                  ) : (
                    <>
                      <Send size={24} />
                      Generate Legal Strategy
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => setQuickInfoModal({ isOpen: true, type: 'property' })}
                className={`backdrop-blur-sm p-6 rounded-2xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] cursor-pointer group ${isDarkMode ? 'bg-blue-900/40 border-blue-500/30' : 'bg-blue-50 border-blue-200'}`}
              >
                <div className="bg-blue-600 p-3 rounded-full mb-4 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-shadow">
                  <Gavel className="text-white" size={24} />
                </div>
                <h3 className={`font-bold mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Property Disputes</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Complex land ownership, essential documents & title issues.</p>
              </button>
              <button 
                onClick={() => setQuickInfoModal({ isOpen: true, type: 'police' })}
                className={`backdrop-blur-sm p-6 rounded-2xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] cursor-pointer group ${isDarkMode ? 'bg-green-900/40 border-green-500/30' : 'bg-green-50 border-green-200'}`}
              >
                <div className="bg-green-600 p-3 rounded-full mb-4 group-hover:shadow-[0_0_15px_rgba(22,163,74,0.5)] transition-shadow">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <h3 className={`font-bold mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Police Interaction</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Your rights during arrest, detention & custody protocols.</p>
              </button>
              <button 
                onClick={() => handleViewChange('library')}
                className={`backdrop-blur-sm p-6 rounded-2xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] cursor-pointer group ${isDarkMode ? 'bg-purple-900/40 border-purple-500/30' : 'bg-purple-50 border-purple-200'}`}
              >
                <div className="bg-purple-600 p-3 rounded-full mb-4 group-hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-shadow">
                  <BookOpen className="text-white" size={24} />
                </div>
                <h3 className={`font-bold mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Rights Library</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Browse all Fundamental Rights & Duties.</p>
              </button>
              <button 
                onClick={() => handleViewChange('qa')}
                className={`backdrop-blur-sm p-6 rounded-2xl border flex flex-col items-center text-center transition-all hover:scale-[1.02] cursor-pointer group ${isDarkMode ? 'bg-teal-900/40 border-teal-500/30' : 'bg-teal-50 border-teal-200'}`}
              >
                <div className="bg-teal-600 p-3 rounded-full mb-4 group-hover:shadow-[0_0_15px_rgba(13,148,136,0.5)] transition-shadow">
                  <MessageCircleQuestion className="text-white" size={24} />
                </div>
                <h3 className={`font-bold mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Legal Q&A</h3>
                <p className={`text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Freely ask about your specific legal situation.</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
             <LegalOutput analysis={state.analysis} onReset={resetForm} isDarkMode={isDarkMode} />
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col relative overflow-x-hidden ${isDarkMode ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      <NationalEmblemBackground isDarkMode={isDarkMode} />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          currentView={view} 
          onViewChange={handleViewChange} 
          theme={theme} 
          onToggleTheme={toggleTheme} 
        />
        
        <main className="flex-grow container mx-auto px-4 py-12">
          {renderContent()}
        </main>

        <footer className={`backdrop-blur-md py-10 mt-20 border-t print:hidden relative z-10 transition-colors ${isDarkMode ? 'bg-slate-950/95 text-slate-400 border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Scale size={20} className="text-amber-500" />
              <span className={`font-serif font-bold text-xl transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>LegalGuard AI</span>
            </div>
            <p className="text-sm max-w-md mx-auto mb-6">
              Empowering citizens with instant legal awareness. Justice is a right, not a privilege.
            </p>
            <div className="text-xs space-x-6 uppercase tracking-widest font-semibold">
              <a href="#" className="hover:text-amber-500 transition">Terms of Use</a>
              <a href="#" className="hover:text-amber-500 transition">Privacy Policy</a>
              <a href="#" className="hover:text-amber-500 transition">Disclaimer</a>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800/20 text-xs">
              © {new Date().getFullYear()} LegalGuard AI Systems. Developed for Public Justice.
            </div>
          </div>
        </footer>
      </div>

      {/* SUPPORT BUTTON */}
      <button 
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-8 right-8 z-[90] bg-amber-500 hover:bg-amber-600 text-slate-900 p-4 rounded-full shadow-2xl flex items-center gap-3 font-bold transition-all transform hover:scale-105 active:scale-95 group"
      >
        <HeartHandshake className="group-hover:animate-bounce" />
        <span className="hidden md:inline pr-2 uppercase tracking-wider text-sm">Legal Aid & Support</span>
      </button>

      <SupportModal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
        isDarkMode={isDarkMode} 
      />

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
