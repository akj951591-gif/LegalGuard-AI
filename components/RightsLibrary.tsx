
import React, { useState, useMemo } from 'react';
import { BookOpen, Shield, Heart, Scale, Landmark, AlertCircle, Info, Search, X, UserCheck, Baby, Briefcase, Star } from 'lucide-react';

interface RightsLibraryProps {
  isDarkMode: boolean;
}

const RightsLibrary: React.FC<RightsLibraryProps> = ({ isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      title: "Fundamental Rights (Part III)",
      icon: <Shield className="text-blue-600" />,
      items: [
        { label: "Right to Equality (Art. 14-18)", text: "Prohibits discrimination on grounds of religion, race, caste, sex or place of birth. Guarantees equality before the law." },
        { label: "Right to Freedom (Art. 19-22)", text: "Freedom of speech, assembly, association, movement, residence, and profession. Includes protection of life and personal liberty (Art. 21)." },
        { label: "Right against Exploitation (Art. 23-24)", text: "Prohibits forced labor, child labor, human trafficking." },
        { label: "Right to Constitutional Remedies (Art. 32)", text: "Right to move the Supreme Court for enforcement of rights via Writs." }
      ]
    },
    {
      title: "Fundamental Duties (Art. 51A)",
      icon: <Star className="text-amber-600" />,
      items: [
        { label: "Uphold Constitution", text: "To abide by the Constitution and respect its ideals and institutions, the National Flag and the National Anthem." },
        { label: "Promote Harmony", text: "To promote harmony and the spirit of common brotherhood amongst all the people of India transcending religious, linguistic and regional or sectional diversities." },
        { label: "Protect Environment", text: "To protect and improve the natural environment including forests, lakes, rivers and wildlife, and to have compassion for living creatures." },
        { label: "Safeguard Public Property", text: "To safeguard public property and to abjure violence." }
      ]
    },
    {
      title: "Daily Constitutional Articles",
      icon: <Landmark className="text-purple-600" />,
      items: [
        { label: "Article 20: Protection against Conviction", text: "No person shall be convicted of any offence except for violation of the law in force at the time. Protection against double jeopardy and self-incrimination." },
        { label: "Article 21: Right to Life", text: "No person shall be deprived of his life or personal liberty except according to procedure established by law. Includes right to privacy and speedy trial." },
        { label: "Article 22: Rights of Arrested Person", text: "Right to be informed of grounds of arrest, right to consult a legal practitioner, and must be produced before magistrate within 24 hours." }
      ]
    },
    {
      title: "Women's Specific Rights",
      icon: <Heart className="text-pink-600" />,
      items: [
        { label: "Right to Property", text: "Daughters have equal rights in ancestral property as sons (Hindu Succession Act amendment 2005)." },
        { label: "Protection from DV", text: "Legal recourse against physical, mental, or economic abuse within a domestic relationship (DV Act 2005)." },
        { label: "Workplace Harassment", text: "Mandatory Internal Complaints Committees in workplaces to handle sexual harassment (POSH Act)." }
      ]
    },
    {
      title: "Child Protection (POCSO)",
      icon: <Baby className="text-indigo-600" />,
      items: [
        { label: "Mandatory Reporting", text: "Any person who has an apprehension that a sexual offence against a child is likely to be committed or has knowledge of it must report it." },
        { label: "Child's Identity", text: "The identity of a child victim of sexual abuse must be protected and never disclosed in media." }
      ]
    },
    {
      title: "Digital & Consumer Rights",
      icon: <Scale className="text-green-600" />,
      items: [
        { label: "Deepfake & Identity Theft", text: "Section 66E and 67 of the IT Act provide punishment for violation of privacy and publishing obscene material." },
        { label: "Right to Information", text: "Request information from public authorities regarding government work (RTI Act 2005)." }
      ]
    }
  ];

  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return sections;

    const lowerSearch = searchTerm.toLowerCase();
    return sections.map(section => {
      const filteredItems = section.items.filter(item => 
        item.label.toLowerCase().includes(lowerSearch) || 
        item.text.toLowerCase().includes(lowerSearch)
      );

      if (section.title.toLowerCase().includes(lowerSearch) || filteredItems.length > 0) {
        return {
          ...section,
          items: filteredItems.length > 0 ? filteredItems : section.items
        };
      }
      return null;
    }).filter(section => section !== null) as typeof sections;
  }, [searchTerm]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className={`text-4xl font-serif font-bold mb-4 flex items-center justify-center gap-3 drop-shadow-md transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <BookOpen className="text-amber-500" size={40} />
          Rights & Duties Library
        </h2>
        <p className={`text-lg transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Comprehensive guide to Constitutional Articles, Fundamental Duties, and Essential Laws.</p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
          </div>
          <input
            type="text"
            className={`block w-full pl-11 pr-12 py-4 border rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
            placeholder="Search for articles, duties, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredSections.length > 0 ? (
          filteredSections.map((section, sIdx) => (
            <div key={sIdx} className={`rounded-2xl shadow-lg border overflow-hidden h-fit transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`px-6 py-4 border-b flex items-center gap-3 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                {section.icon}
                <h3 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{section.title}</h3>
              </div>
              <div className="p-6 space-y-6">
                {section.items.map((item, iIdx) => (
                  <div key={iIdx} className="group">
                    <h4 className={`font-bold mb-1 transition-colors ${isDarkMode ? 'text-slate-200 group-hover:text-amber-400' : 'text-slate-800 group-hover:text-amber-600'}`}>
                      {item.label}
                    </h4>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="lg:col-span-2 py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Info className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 text-lg">No matches found for your search. Try different keywords.</p>
          </div>
        )}

        <div className="bg-red-50 rounded-2xl shadow-lg border border-red-100 p-8 flex flex-col justify-center h-fit">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-600" size={32} />
            <h3 className="text-2xl font-serif font-bold text-red-900">Critical Daily Laws</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
              <p className="text-red-800 font-medium italic">Zero FIR: You can file an FIR at any police station regardless of jurisdiction.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
              <p className="text-red-800 font-medium italic">Admissibility of Digital Evidence: Recordings are valid evidence if they follow Section 65B requirements.</p>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
              <p className="text-red-800 font-medium italic">Bail as a Right: In bailable offences, bail is a right that cannot be denied by police.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RightsLibrary;
