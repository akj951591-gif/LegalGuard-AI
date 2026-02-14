
import React from 'react';
import { Shield, Scale, Users, Cpu, Heart, CheckCircle, Gavel, Globe } from 'lucide-react';

interface AboutUsProps {
  isDarkMode: boolean;
}

const AboutUs: React.FC<AboutUsProps> = ({ isDarkMode }) => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-700">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h2 className={`text-5xl font-serif font-bold mb-6 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Our Mission: <span className="text-amber-500">Demystifying Justice</span>
        </h2>
        <p className={`text-xl max-w-3xl mx-auto leading-relaxed transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          LegalGuard AI was born from the belief that legal awareness shouldn't be a luxury. 
          We use cutting-edge technology to empower citizens with the knowledge they need 
          to protect their rights and navigate the complex legal landscape.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        <div className={`p-8 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-blue-900/10' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <Scale className="text-white" size={24} />
          </div>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>The Core Vision</h3>
          <p className={`leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            In a world where legal systems are often opaque and overwhelming, we serve as a 
            digital bridge. Our vision is a society where every individual, regardless of 
            their background, has immediate access to basic legal guidance, procedural 
            knowledge, and a clear understanding of their fundamental rights.
          </p>
        </div>

        <div className={`p-8 rounded-3xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-amber-900/10' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="bg-amber-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
            <Cpu className="text-slate-900" size={24} />
          </div>
          <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ethical AI Technology</h3>
          <p className={`leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            By leveraging advanced AI like Google Gemini, we can process complex queries 
            instantly. However, we remain committed to human-centric ethics. Our AI is 
            designed to assist, not replace, professional counsel. We prioritize 
            transparency, accuracy, and user privacy in every interaction.
          </p>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mb-20">
        <h3 className={`text-3xl font-serif font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>What Defines Us</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Shield className="text-green-500" />, title: "Privacy First", desc: "Your legal queries are processed with strict confidentiality." },
            { icon: <Gavel className="text-blue-500" />, title: "Legal Rigor", desc: "Information grounded in actual legal codes and constitutional articles." },
            { icon: <Users className="text-purple-500" />, title: "Pro-Citizen", desc: "Designed to help the common citizen fight against injustice." },
            { icon: <Globe className="text-red-500" />, title: "Universal Access", desc: "Available 24/7 for immediate emergency legal strategy." }
          ].map((item, idx) => (
            <div key={idx} className={`p-6 rounded-2xl text-center border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h4 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Quote */}
      <div className={`p-10 rounded-3xl text-center relative overflow-hidden ${isDarkMode ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
        <div className="relative z-10">
          <Heart className="mx-auto mb-6 text-amber-500" size={40} />
          <p className={`text-2xl font-serif italic mb-6 leading-relaxed ${isDarkMode ? 'text-amber-200' : 'text-amber-900'}`}>
            "Justice is the constant and perpetual will to allot to every man his due."
          </p>
          <div className="flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs text-amber-600">
            <CheckCircle size={14} />
            Verified Legal Frameworks
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
