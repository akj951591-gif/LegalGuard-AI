
import React, { useState, useEffect } from 'react';
import { History, FileText, MessageCircle, Trash2, Calendar, ChevronRight, AlertCircle, Scale, Plus, Cloud, CloudOff } from 'lucide-react';
import { StoredAnalysis, ChatSession } from '../types';
import { supabase } from '../services/supabaseClient';

interface HistoryViewProps {
  isDarkMode: boolean;
  onRevisitAnalysis: (analysis: StoredAnalysis) => void;
  onRevisitChat: (session?: ChatSession) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ isDarkMode, onRevisitAnalysis, onRevisitChat }) => {
  const [reports, setReports] = useState<StoredAnalysis[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Local Data
      const savedReports = localStorage.getItem('legalguard_reports_history');
      let localReports = savedReports ? JSON.parse(savedReports) : [];
      
      const savedChats = localStorage.getItem('legalguard_chat_sessions');
      let localChats = savedChats ? JSON.parse(savedChats) : [];

      if (session?.user) {
        // Fetch from Supabase
        const { data: cloudReports } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', session.user.id);
        
        const { data: cloudChats } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', session.user.id);

        if (cloudReports) {
          // Merge logic: in a real app we'd check IDs
          const cloudFormatted = cloudReports.map(r => ({
            id: r.id,
            timestamp: r.timestamp,
            submission: r.submission,
            analysis: r.analysis,
            isCloud: true
          }));
          localReports = [...localReports, ...cloudFormatted];
        }
        
        if (cloudChats) {
          const cloudFormatted = cloudChats.map(c => ({
            id: c.id,
            title: c.title,
            timestamp: c.timestamp,
            messages: c.messages,
            isCloud: true
          }));
          localChats = [...localChats, ...cloudFormatted];
        }
      }

      setReports(localReports);
      setChatSessions(localChats);
      setLoading(false);
    };

    fetchData();
  }, []);

  const deleteReport = async (report: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (report.isCloud && user) {
      await supabase.from('reports').delete().eq('id', report.id);
    }
    const updated = reports.filter(r => r.id !== report.id);
    setReports(updated);
    localStorage.setItem('legalguard_reports_history', JSON.stringify(updated.filter(r => !(r as any).isCloud)));
  };

  const clearAllHistory = () => {
    if (window.confirm("This will clear local history. Cloud records remain if logged in.")) {
      setReports([]);
      localStorage.removeItem('legalguard_reports_history');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className={`text-4xl font-serif font-bold mb-2 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <History className="text-amber-500" size={32} />
            Justice History
          </h2>
          <p className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}>
            Access your case reports and AI conversations. {user ? "Cloud sync is active." : "Sign in to backup your data."}
          </p>
        </div>
        <button onClick={clearAllHistory} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-red-500/10 text-red-500">
          <Trash2 size={16} />
          Clear Local Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <FileText className="text-blue-500" />
            Case Reports
          </h3>

          {loading ? (
             <div className="p-12 text-center animate-pulse"><Scale className="mx-auto text-slate-300" size={48} /></div>
          ) : reports.length === 0 ? (
            <div className="p-12 rounded-3xl border-2 border-dashed text-center">No reports found.</div>
          ) : (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <div 
                  key={report.id}
                  onClick={() => onRevisitAnalysis(report)}
                  className={`group relative p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-500/10 p-3 rounded-xl">
                      <Scale className="text-amber-500" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${report.submission.urgency === 'high' ? 'text-red-500' : 'text-blue-500'}`}>
                          {report.submission.urgency}
                        </span>
                        {report.isCloud ? <Cloud size={10} className="text-amber-500" /> : <CloudOff size={10} className="text-slate-400" />}
                        <span className="text-xs text-slate-400">
                          {new Date(report.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{report.submission.type}</h4>
                      <p className="text-sm line-clamp-2 opacity-60">{report.analysis.summary}</p>
                    </div>
                  </div>
                  <button onClick={(e) => deleteReport(report, e)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <MessageCircle className="text-teal-500" />
            Saved Chats
          </h3>

          <div className="space-y-3">
            {chatSessions.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-3xl opacity-50">No saved sessions.</div>
            ) : (
              chatSessions.map((session: any) => (
                <div 
                  key={session.id}
                  onClick={() => { localStorage.setItem('legalguard_chat_history', JSON.stringify(session.messages)); onRevisitChat(session); }}
                  className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                >
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold truncate mb-1">{session.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Calendar size={10} />
                      {new Date(session.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-400" />
                </div>
              ))
            )}
            <button onClick={() => onRevisitChat()} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2">
              <Plus size={18} />
              New Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
