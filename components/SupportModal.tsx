
import React, { useEffect } from 'react';
import { X, Phone, Globe, HeartHandshake, Shield, HelpCircle } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  // Listen for Escape key to close the modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const contacts = [
    { name: "Emergency Response", phone: "112", icon: <Shield className="text-red-500" /> },
    { name: "Women Helpline", phone: "1091", icon: <HeartHandshake className="text-pink-500" /> },
    { name: "Child Helpline", phone: "1098", icon: <HelpCircle className="text-blue-500" /> },
    { name: "Cyber Crime Cell", phone: "1930", icon: <Shield className="text-indigo-500" /> },
    { name: "Anti-Ragging", phone: "1800-180-5522", icon: <Shield className="text-orange-500" /> }
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all transform animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/10 flex items-center justify-between bg-amber-500 text-slate-900">
          <div className="flex items-center gap-2">
            <HeartHandshake />
            <h3 className="text-xl font-bold font-serif">Legal Aid & Support</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-black/10 rounded-full transition-colors"
            aria-label="Close dialogue"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Government Helplines</h4>
            {contacts.map((c, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'} transition-colors`}>
                <div className="flex items-center gap-3">
                  {c.icon}
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{c.name}</span>
                </div>
                <a href={`tel:${c.phone}`} className="text-amber-500 font-bold hover:underline flex items-center gap-1">
                  <Phone size={14} />
                  {c.phone}
                </a>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Useful Resources</h4>
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-amber-900/20 text-amber-200' : 'bg-amber-50 text-amber-800'} text-sm leading-relaxed`}>
              <div className="flex gap-3">
                <Globe className="flex-shrink-0" />
                <p>Visit <a href="https://nalsa.gov.in" target="_blank" className="font-bold underline">NALSA.gov.in</a> for Free Legal Services if you are eligible under Section 12 of the Legal Services Authorities Act.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with explicit Close button */}
        <div className={`p-6 border-t flex flex-col items-center gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Close Support Menu
          </button>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Justice is your right • Stay informed • Stay safe
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
