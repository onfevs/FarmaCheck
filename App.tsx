
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MedicineResult } from './types';
import { searchMedicines } from './services/geminiService';
import ResultsTable from './components/ResultsTable';
import MedicineDetailsModal from './components/MedicineDetailsModal';
import SearchLoader from './components/SearchLoader';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<MedicineResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineResult | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Animación de ciudades colombianas
  const [cityIndex, setCityIndex] = useState(0);
  const cities = ['Manizales', 'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Pereira', 'Armenia', 'Bucaramanga', 'Cúcuta'];

  // Cargar persistencia e historial al montar
  useEffect(() => {
    const savedTerm = localStorage.getItem('farmacheck_last_query');
    const savedResults = localStorage.getItem('farmacheck_last_results');
    const savedHistory = localStorage.getItem('farmacheck_search_history');
    
    if (savedTerm) setSearchTerm(savedTerm);
    if (savedHistory) {
        try {
            setSearchHistory(JSON.parse(savedHistory));
        } catch(e) {
            setSearchHistory([]);
        }
    }
    
    if (savedResults) {
      try {
        const parsed = JSON.parse(savedResults);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setResults(parsed);
          setHasSearched(true);
        }
      } catch (e) {
        console.error("Error parsing saved results", e);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCityIndex((prev) => (prev + 1) % cities.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const filtered = searchHistory.filter(term => 
        term.toLowerCase().includes(searchTerm.toLowerCase()) && 
        term.toLowerCase() !== searchTerm.toLowerCase()
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && isFocused);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, searchHistory, isFocused]);

  const performSearch = useCallback(async (query: string, force: boolean = false) => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setShowSuggestions(false);
    
    try {
      const data = await searchMedicines(query, force);
      setResults(data);
      
      const newHistory = [query, ...searchHistory.filter(h => h.toLowerCase() !== query.toLowerCase())].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('farmacheck_search_history', JSON.stringify(newHistory));
      localStorage.setItem('farmacheck_last_query', query);
      localStorage.setItem('farmacheck_last_results', JSON.stringify(data));
    } catch (err) {
      console.error("Error en la búsqueda:", err);
    } finally {
      setLoading(false);
    }
  }, [searchHistory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm, false);
  };

  const handleRefresh = () => {
    performSearch(searchTerm, true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    performSearch(suggestion);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <MedicineDetailsModal 
        medicine={selectedMedicine} 
        onClose={() => setSelectedMedicine(null)} 
      />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => {
              setHasSearched(false);
              setSearchTerm('');
              localStorage.removeItem('farmacheck_last_query');
              localStorage.removeItem('farmacheck_last_results');
              setResults([]);
          }}>
            <div className="bg-emerald-600 p-2 rounded-2xl shadow-lg shadow-emerald-100 transition-transform active:scale-90">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">FARMA CHECK</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">AHORRA EN CADA DOSIS</p>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 w-full max-w-4xl flex gap-2 relative" ref={searchRef}>
            <div className={`relative flex-1 transition-all duration-300 rounded-xl ${isFocused ? 'ring-4 ring-emerald-500/10 scale-[1.01]' : ''}`}>
              <input
                type="text"
                value={searchTerm}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busca un medicamento (Ej: Ibuprofeno)"
                className={`w-full pl-12 pr-4 py-3 bg-slate-100 border-2 rounded-xl text-slate-900 font-bold text-base transition-all outline-none ${
                  isFocused 
                    ? 'border-emerald-500 bg-white shadow-lg shadow-emerald-900/5 focus-animation' 
                    : 'border-transparent'
                }`}
                autoComplete="off"
              />
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-emerald-500' : 'text-slate-400'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {showSuggestions && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3">Sugerencias de tu historial</p>
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-5 py-3 text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-between group"
                    >
                      <span>{suggestion}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" className="rotate-45" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#0f172a] hover:bg-emerald-600 text-white font-black px-8 py-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 text-sm uppercase shrink-0"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'COMPARAR'}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 w-full py-10 flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <SearchLoader />
          </div>
        ) : !hasSearched ? (
          <div className="animate-in fade-in duration-700">
            <div className="bg-white rounded-[3rem] p-12 md:p-20 border border-slate-200 shadow-xl relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
              <h2 className="text-4xl md:text-6xl font-black text-[#0f172a] mb-6 leading-tight tracking-tight">
                Precios de farmacia en <br/>
                <div className="h-20 flex items-center justify-center">
                  <span key={cities[cityIndex]} className="text-emerald-600 inline-block animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {cities[cityIndex]}
                  </span>
                </div>
                al instante.
              </h2>
              <p className="text-slate-500 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Comparamos precios en las principales cadenas y droguerías locales para que encuentres el mejor precio cerca de ti.
              </p>
              
              <div className="w-full h-px bg-slate-100 mb-10"></div>
              
              <div className="relative w-full overflow-hidden">
                <div className="flex w-[200%] animate-marquee gap-16 items-center">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex justify-around items-center w-full gap-16">
                      <span className="text-slate-300 font-black text-xl md:text-2xl grayscale hover:grayscale-0 transition-all cursor-default uppercase italic tracking-tighter">CRUZ VERDE</span>
                      <span className="text-slate-300 font-black text-xl md:text-2xl grayscale hover:grayscale-0 transition-all cursor-default uppercase italic tracking-tighter">LA REBAJA</span>
                      <span className="text-slate-300 font-black text-xl md:text-2xl grayscale hover:grayscale-0 transition-all cursor-default uppercase italic tracking-tighter">FARMATODO</span>
                      <span className="text-slate-300 font-black text-xl md:text-2xl grayscale hover:grayscale-0 transition-all cursor-default uppercase italic tracking-tighter">COLSUBSIDIO</span>
                      <span className="text-slate-300 font-black text-xl md:text-2xl grayscale hover:grayscale-0 transition-all cursor-default uppercase italic tracking-tighter">OLIMPICA</span>
                      <span className="text-slate-300 font-black text-xl md:text-2xl grayscale hover:grayscale-0 transition-all cursor-default uppercase italic tracking-tighter">PASTEUR</span>
                      <span className="text-slate-300 font-black text-xl md:text-2xl grayscale hover:grayscale-0 transition-all cursor-default uppercase italic tracking-tighter">CONDROGAS</span>
                      <span className="text-slate-300 font-black text-xl md:text-2xl grayscale hover:grayscale-0 transition-all cursor-default uppercase italic tracking-tighter">ALEMANA</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                  {results.length} Opciones disponibles
                </h3>
                <p className="text-slate-500 font-medium">Resultados para: <span className="text-emerald-600 font-bold">"{searchTerm}"</span></p>
              </div>
              {results.length > 0 && (
                <button 
                  onClick={handleRefresh}
                  className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-full text-[10px] font-black hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  REFRESCAR PRECIOS
                </button>
              )}
            </div>
            
            <ResultsTable 
              results={results} 
              loading={false} 
              onRowClick={(med) => setSelectedMedicine(med)}
            />

            {results.length === 0 && (
              <div className="bg-white p-16 rounded-[2.5rem] border border-slate-200 text-center shadow-lg">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">💊</span>
                </div>
                <p className="text-slate-800 text-xl font-black uppercase tracking-tighter">Sin resultados exactos</p>
                <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Prueba buscando solo el nombre principal o verifica la ortografía del medicamento.</p>
                <button 
                  onClick={() => { 
                    setSearchTerm(''); 
                    setHasSearched(false); 
                    localStorage.removeItem('farmacheck_last_query'); 
                    localStorage.removeItem('farmacheck_last_results'); 
                    setResults([]);
                  }} 
                  className="mt-8 bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition-colors"
                >
                  Nueva búsqueda
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-200 p-1.5 rounded-lg grayscale">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-black text-slate-400 text-xs tracking-widest uppercase italic">FARMA CHECK</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] text-center">
            Información de precios referencial • Datos actualizados mediante IA • Colombia 2024
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes subtle-glow {
          0% { background-color: #f8fafc; }
          50% { background-color: #ffffff; }
          100% { background-color: #f8fafc; }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .focus-animation {
          animation: subtle-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
