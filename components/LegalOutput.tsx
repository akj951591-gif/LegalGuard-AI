
import React from 'react';
import { LegalAnalysis } from '../types';
import { CheckCircle2, AlertTriangle, FileText, UserCheck, ShieldCheck, Printer } from 'lucide-react';

interface LegalOutputProps {
  analysis: LegalAnalysis;
  onReset: () => void;
  isDarkMode: boolean;
}

const LegalOutput: React.FC<LegalOutputProps> = ({ analysis, onReset, isDarkMode }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white border-l-8 border-amber-500 rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-serif font-bold text-slate-900">Case Strategy & Analysis</h2>
          <button 
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-slate-900 print:hidden"
          >
            <Printer size={20} />
            Print Report
          </button>
        </div>
        
        <p className="text-slate-600 italic mb-8 leading-relaxed text-lg">
          "{analysis.summary}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Immediate Steps */}
          <section className="bg-red-50 p-6 rounded-xl border border-red-100">
            <h3 className="flex items-center gap-2 text-red-800 font-bold mb-4 uppercase text-sm tracking-widest">
              <AlertTriangle size={20} />
              Immediate Actions
            </h3>
            <ul className="space-y-3">
              {analysis.immediateSteps.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-slate-700 leading-snug">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-200 text-red-800 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </section>

          {/* Legal Provisions */}
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="flex items-center gap-2 text-slate-800 font-bold mb-4 uppercase text-sm tracking-widest">
              <FileText size={20} />
              Relevant Provisions (FIR/Defense)
            </h3>
            <div className="space-y-4">
              {analysis.legalProvisions.map((provision, idx) => (
                <div key={idx} className="border-b border-slate-200 pb-3 last:border-0">
                  <div className="text-amber-700 font-bold text-sm mb-1">{provision.section}</div>
                  <div className="text-slate-600 text-sm leading-relaxed">{provision.description}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <section className="p-4 rounded-xl border border-slate-100 bg-white">
            <h3 className="flex items-center gap-2 text-blue-800 font-bold mb-4 uppercase text-xs tracking-widest">
              <UserCheck size={18} />
              Contact List
            </h3>
            <ul className="space-y-2">
              {analysis.keyPersonnel.map((person, idx) => (
                <li key={idx} className="text-slate-600 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                  {person}
                </li>
              ))}
            </ul>
          </section>

          <section className="p-4 rounded-xl border border-slate-100 bg-white">
            <h3 className="flex items-center gap-2 text-green-800 font-bold mb-4 uppercase text-xs tracking-widest">
              <CheckCircle2 size={18} />
              Evidence Checklist
            </h3>
            <ul className="space-y-2">
              {analysis.documentChecklist.map((doc, idx) => (
                <li key={idx} className="text-slate-600 text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  {doc}
                </li>
              ))}
            </ul>
          </section>

          <section className="p-4 rounded-xl border border-slate-100 bg-amber-50">
            <h3 className="flex items-center gap-2 text-amber-800 font-bold mb-4 uppercase text-xs tracking-widest">
              <ShieldCheck size={18} />
              Police Interaction
            </h3>
            <ul className="space-y-2">
              {analysis.policeRights.map((right, idx) => (
                <li key={idx} className="text-slate-600 text-sm flex items-center gap-2 leading-tight">
                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                  {right}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-12 flex flex-col items-center pt-8 border-t border-slate-100">
          <p className="text-slate-400 text-xs text-center max-w-2xl mb-6">
            DISCLAIMER: This analysis is generated by AI for informational purposes only. It does not constitute legal advice. Please consult a qualified legal professional immediately.
          </p>
          <button 
            onClick={onReset}
            className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg print:hidden"
          >
            Start New Case Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalOutput;
