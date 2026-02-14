
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Scale, Sun, Moon, Hash, Info, MapPin, History, User, LogOut } from 'lucide-react';
import { View } from '../types';
import { supabase } from '../services/supabaseClient';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onAuthClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, theme, onToggleTheme, onAuthClick }) => {
  const isDarkMode = theme === 'dark';
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className={`shadow-xl sticky top-0 z-50 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
          onClick={() => onViewChange('home')}
        >
          <div className="bg-amber-500 p-2 rounded-lg">
            <Scale size={28} className="text-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-tight">LegalGuard AI</h1>
            <p className="text-xs text-amber-500 uppercase tracking-widest font-semibold">Instant Justice Protocol</p>
          </div>
        </div>
        
        <nav className="hidden xl:flex space-x-6 text-sm font-medium uppercase tracking-wider">
          <button 
            onClick={() => onViewChange('home')}
            className={`${currentView === 'home' ? 'text-amber-400' : 'hover:text-amber-400'} transition`}
          >
            Case Analysis
          </button>
          <button 
            onClick={() => onViewChange('qa')}
            className={`${currentView === 'qa' ? 'text-amber-400' : 'hover:text-amber-400'} transition`}
          >
            Legal Q&A
          </button>
          <button 
            onClick={() => onViewChange('history')}
            className={`flex items-center gap-1.5 ${currentView === 'history' ? 'text-amber-400' : 'hover:text-amber-400'} transition`}
          >
            <History size={14} />
            History
          </button>
          <button 
            onClick={() => onViewChange('policeFinder')}
            className={`flex items-center gap-1.5 ${currentView === 'policeFinder' ? 'text-amber-400' : 'hover:text-amber-400'} transition`}
          >
            <MapPin size={14} />
            Nearby Help
          </button>
          <button 
            onClick={() => onViewChange('sections')}
            className={`flex items-center gap-1.5 ${currentView === 'sections' ? 'text-amber-400' : 'hover:text-amber-400'} transition`}
          >
            <Hash size={14} />
            Legal Sections
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-100 text-amber-700'}`}>
                {user.email?.[0].toUpperCase()}
              </div>
              <button 
                onClick={handleSignOut}
                className={`p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors`}
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition ${isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
            >
              Sign In
            </button>
          )}
          
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse whitespace-nowrap">
            <ShieldAlert size={18} />
            SOS
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
