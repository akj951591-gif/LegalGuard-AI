
import React, { useState, useEffect } from 'react';
import { History, FileText, MessageCircle, Trash2, Calendar, ChevronRight, AlertCircle, Info, Trash, Scale, Plus } from 'lucide-react';
import { StoredAnalysis, ChatSession } from '../types';

interface HistoryViewProps {
  isDarkMode: boolean;
  onRevisitAnalysis: (analysis: StoredAnalysis) => void;
  onRevisitChat: (session?: ChatSession) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ isDarkMode, onRevisitAnalysis, onRevisitChat }) => {
  const [reports, setReports] = useState<StoredAnalysis[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    const savedReports = localStorage.getItem('legalguard_reports_history');
    if (savedReports) setReports(JSON.parse(savedReports));

    const savedChats = localStorage.getItem('legalguard_chat_sessions');
    if (savedChats) setChatSessions(JSON.parse(savedChats));
  }, []);

  const deleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem('legalguard_reports_history', JSON.stringify(updated));
  };

  const deleteChatSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = chatSessions.filter(s => s.id !== id);
    setChatSessions(updated);
    localStorage.setItem('legalguard_chat_sessions', JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    if (window.confirm("This will permanently delete ALL saved reports and chat sessions. Continue?")) {
      setReports([]);
      setChatSessions([]);
      localStorage.removeItem('legalguard_reports_history');
      localStorage.removeItem('legalguard_chat_sessions');
      localStorage.removeItem('legalguard_chat_history');
    }
  };

  const openSavedChat = (session: ChatSession) => {
    // To restore the chat in LegalQA, we overwrite the current active chat
    localStorage.setItem('legalguard_chat_history', JSON.stringify(session.messages));
    onRevisitChat(session);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className={`text-4xl font-serif font-bold mb-2 flex items-center gap-3 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <History className="text-amber-500" size={32} />
            Justice History
          </h2>
          <p className={`transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Access your past case reports and AI conversations. All data is stored locally on your device.
          </p>
        </div>
        {(reports.length > 0 || chatSessions.length > 0) && (
          <button 
            onClick={clearAllHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            <Trash2 size={16} />
            Clear All Data
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <FileText className="text-blue-500" />
              Generated Reports
            </h3>
            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {reports.length} Reports
            </span>
          </div>

          {reports.length === 0 ? (
            <div className={`p-12 rounded-3xl border-2 border-dashed text-center flex flex-col items-center justify-center ${isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="font-medium">No case reports found yet.</p>
              <p className="text-sm mt-1">Submit a case from the dashboard to see it here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.sort((a,b) => b.timestamp - a.timestamp).map((report) => (
                <div 
                  key={report.id}
                  onClick={() => onRevisitAnalysis(report)}
                  className={`group relative p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between hover:scale-[1.01] ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-900/10' : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-lg'}`}
                >
                  <div className="flex items-start gap-4 pr-12">
                    <div className="bg-amber-500/10 p-3 rounded-xl mt-1">
                      <Scale className="text-amber-500" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-black uppercase tracking-widest ${report.submission.urgency === 'high' ? 'text-red-500' : 'text-blue-500'}`}>
                          {report.submission.urgency} Urgency
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(report.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className={`text-lg font-bold mb-1 leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {report.submission.type}
                      </h4>
                      <p className={`text-sm line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {report.analysis.summary}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button 
                      onClick={(e) => deleteReport(report.id, e)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Entry"
                    >
                      <Trash size={18} />
                    </button>
                    <ChevronRight className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chats Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <MessageCircle className="text-teal-500" />
              Chat History
            </h3>
            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {chatSessions.length} Saved
            </span>
          </div>

          <div className="space-y-3">
            {chatSessions.length === 0 ? (
              <div className={`p-8 rounded-3xl border border-dashed text-center flex flex-col items-center justify-center ${isDarkMode ? 'bg-slate-900/30 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <MessageCircle size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No saved sessions.</p>
                <button 
                  onClick={() => onRevisitChat()}
                  className="mt-4 text-xs font-bold text-amber-500 hover:underline"
                >
                  Start Chat Now
                </button>
              </div>
            ) : (
              chatSessions.sort((a,b) => b.timestamp - a.timestamp).map((session) => (
                <div 
                  key={session.id}
                  onClick={() => openSavedChat(session)}
                  className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between hover:scale-[1.02] ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-teal-500/40' : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-md'}`}
                >
                  <div className="overflow-hidden">
                    <h4 className={`text-sm font-bold truncate mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {session.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Calendar size={10} />
                      {new Date(session.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteChatSession(session.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
            
            <button 
              onClick={() => onRevisitChat()}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition active:scale-[0.98] shadow-lg mt-4"
            >
              <Plus size={18} />
              New Conversation
            </button>
          </div>

          <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-amber-900/10 border-amber-500/10' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-500 flex-shrink-0" size={20} />
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Local Storage</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your chat history is stored locally. Use "Save Session" in the Q&A section to pin conversations here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
