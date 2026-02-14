
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Mail, Loader2, ShieldAlert, ExternalLink, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { findNearbyPoliceStations } from '../services/geminiService';

interface PoliceFinderProps {
  isDarkMode: boolean;
}

const PoliceFinder: React.FC<PoliceFinderProps> = ({ isDarkMode }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; grounding: any[] } | null>(null);

  const requestLocation = () => {
    setLoading(true);
    setError(null);
    setResult(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        try {
          const res = await findNearbyPoliceStations(latitude, longitude);
          setResult(res);
        } catch (err) {
          setError("Failed to fetch police station data. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setError("Location access denied. Please enable location permissions in your browser.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="text-center mb-10">
        <h2 className={`text-3xl font-serif font-bold mb-3 flex items-center justify-center gap-2 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          <MapPin className="text-red-500" />
          Nearby Police & Help Centers
        </h2>
        <p className={`max-w-2xl mx-auto transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          Find where to file an FIR or seek immediate assistance. You have the right to file a <strong>Zero FIR</strong> at any station.
        </p>
      </div>

      {!result && !loading && (
        <div className={`p-10 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="bg-amber-500/10 p-5 rounded-full mb-6">
            <Navigation className="text-amber-500" size={48} />
          </div>
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Locate Nearest Help</h3>
          <p className={`mb-8 max-w-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            We need your location to find the closest police stations and legal aid centers near you.
          </p>
          <button
            onClick={requestLocation}
            className="bg-slate-900 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-slate-800 transition transform active:scale-95 shadow-xl"
          >
            <MapPin size={20} />
            Find Local Stations
          </button>
          {error && (
            <div className="mt-6 flex items-center gap-2 text-red-500 font-semibold bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
              <ShieldAlert size={18} />
              {error}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <Loader2 className="animate-spin text-amber-500 mb-6" size={64} />
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Triangulating Nearest Help Centers...</h3>
          <p className="text-slate-400 mt-2">Connecting to justice network</p>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          <div className={`rounded-3xl border overflow-hidden shadow-2xl transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="bg-red-600 px-8 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <ShieldAlert size={24} />
                <h3 className="text-xl font-bold font-serif">Critical Contact List</h3>
              </div>
              <button 
                onClick={requestLocation}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors font-bold uppercase tracking-wider"
              >
                Refresh Location
              </button>
            </div>
            
            <div className={`p-8 markdown-content ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.text}
              </ReactMarkdown>
            </div>

            {result.grounding && result.grounding.length > 0 && (
              <div className={`px-8 py-6 border-t ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ExternalLink size={14} /> Official Map Links
                </h4>
                <div className="flex flex-wrap gap-3">
                  {result.grounding.map((chunk: any, i: number) => (
                    chunk.maps && (
                      <a 
                        key={i}
                        href={chunk.maps.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-600 px-4 py-2 rounded-lg transition shadow-sm font-semibold text-slate-700 flex items-center gap-2"
                      >
                        <MapPin size={14} className="text-red-500" />
                        {chunk.maps.title}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}
            
            <div className={`px-8 py-5 border-t text-center ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100/50 border-slate-100'}`}>
               <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium italic">
                <Info size={14} />
                Contact details are fetched from public internet records. Verify before traveling in emergency.
               </div>
            </div>
          </div>

          <div className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-amber-900/20 border-amber-800/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm'}`}>
             <h4 className="font-bold flex items-center gap-2 mb-3">
                <Navigation size={20} />
                Your Essential Rights at the Police Station
             </h4>
             <ul className="text-sm space-y-3 list-none pl-0 opacity-90">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span><strong>Right to Know Grounds:</strong> Under Art 22(1) of the Constitution, you must be informed of the reasons for your arrest immediately.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span><strong>The 24-Hour Rule:</strong> You must be produced before the nearest Magistrate within 24 hours of arrest, excluding travel time.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span><strong>Arrest Memo:</strong> Police must prepare an Arrest Memo at the time of arrest. It must be signed by at least one witness (family or respectable local) and counter-signed by you.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span><strong>Sunset & Sunrise Law for Women:</strong> No woman can be arrested after sunset and before sunrise except in exceptional cases with a female officer and an order from a Judicial Magistrate (Section 46(4) CrPC / BNSS).</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span><strong>Zero FIR:</strong> You can file an FIR at <strong>any</strong> station; they must accept it and forward it to the relevant jurisdiction later.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                  <span><strong>Right to Counsel:</strong> You have the right to consult and be defended by a legal practitioner of your choice.</span>
                </li>
             </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliceFinder;
