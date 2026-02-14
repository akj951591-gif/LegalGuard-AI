
import React, { useEffect } from 'react';
import { X, Gavel, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Scale, Clock, UserCheck } from 'lucide-react';

interface QuickInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  type: 'property' | 'police';
}

const QuickInfoModal: React.FC<QuickInfoModalProps> = ({ isOpen, onClose, isDarkMode, type }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const propertyContent = {
    title: "Property & Land Disputes",
    icon: <Gavel className="text-blue-500" size={28} />,
    sections: [
      {
        title: "Essential Document Checklist",
        icon: <FileText size={18} className="text-blue-500" />,
        items: [
          "Sale Deed / Title Deed: Proof of ownership and transfer history.",
          "Mother Deed: Previous ownership records for the last 30 years.",
          "Encumbrance Certificate (EC): Shows if the property has any legal dues/mortgages.",
          "Mutation Entry (Pahani/Khata): Record of the property in local government revenue records.",
          "Property Tax Receipts: Proof that the owner is up to date with government taxes.",
          "Survey Sketch / Land Map: Defines the physical boundaries clearly."
        ]
      },
      {
        title: "Common Dispute Types",
        icon: <AlertTriangle size={18} className="text-amber-500" />,
        items: [
          "Title Disputes: Conflict over who actually owns the land.",
          "Boundary Disputes: Disagreements over land measurements or fencing.",
          "Succession/Inheritance: Disputes among family members over ancestral property.",
          "Adverse Possession: When someone claims ownership by living on the land for over 12 years uninterrupted."
        ]
      },
      {
        title: "Immediate Steps to Take",
        icon: <CheckCircle2 size={18} className="text-green-500" />,
        items: [
          "Apply for a fresh Encumbrance Certificate (EC) from the Sub-Registrar's office.",
          "Verify the Mutation records in the Revenue Department.",
          "Check the Master Plan if the land is converted or agricultural.",
          "Issue a Legal Notice through a lawyer if someone is trespassing or claiming false title."
        ]
      }
    ]
  };

  const policeContent = {
    title: "Police Interaction & Rights",
    icon: <ShieldCheck className="text-red-500" size={28} />,
    sections: [
      {
        title: "Fundamental Custodial Rights",
        icon: <Scale size={18} className="text-red-500" />,
        items: [
          "Right to Know Grounds (Art 22(1)): Police must tell you WHY you are being arrested immediately.",
          "24-Hour Rule: You must be produced before a Magistrate within 24 hours (excluding travel).",
          "Arrest Memo: Mandatory document stating date, time, and witness signature. You must sign it too.",
          "Right to Counsel: You have the right to call your lawyer immediately upon detention."
        ]
      },
      {
        title: "Special Laws for Women",
        icon: <Clock size={18} className="text-pink-500" />,
        items: [
          "Sunset & Sunrise (Sec 46(4) CrPC/BNSS): No woman can be arrested after sunset and before sunrise.",
          "Exception: Only in rare cases with a FEMALE officer and prior order from a Judicial Magistrate.",
          "Right to Privacy: Body search of a woman can only be done by another female officer with strict decency."
        ]
      },
      {
        title: "Against Police Harassment",
        icon: <UserCheck size={18} className="text-amber-500" />,
        items: [
          "Zero FIR: Police cannot refuse to file an FIR just because the crime happened elsewhere.",
          "Identification: Officers must wear clear, visible name tags with their designation.",
          "Right to Medical: You can request a medical examination if you fear custodial violence.",
          "Family Notification: Police must inform one friend or relative of your choice about your arrest."
        ]
      }
    ]
  };

  const content = type === 'property' ? propertyContent : policeContent;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transition-all transform animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 border-b flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-3">
            {content.icon}
            <h3 className={`text-2xl font-serif font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{content.title}</h3>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
          {content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h4 className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {section.icon}
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex gap-3 group">
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 transition-colors ${type === 'property' ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {item.includes(':') ? (
                        <>
                          <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{item.split(':')[0]}:</strong>
                          {item.split(':')[1]}
                        </>
                      ) : item}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className={`p-6 border-t flex flex-col items-center gap-2 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
            Knowledge is your first line of defense • Justice for all
          </p>
          <button onClick={onClose} className="w-full mt-2 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition active:scale-95 shadow-lg">
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickInfoModal;
