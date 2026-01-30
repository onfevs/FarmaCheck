
import React from 'react';

const ArchitectureInfo: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 text-white shadow-2xl mt-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
        <h2 className="text-2xl font-black uppercase tracking-tighter italic">FarmaCheck Colombia Engine</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-800/40 p-7 rounded-3xl border border-slate-700/50 hover:border-emerald-500/50 transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-emerald-400 font-black uppercase text-sm tracking-widest">Nacional Search</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Rastreamos en tiempo real el catálogo de más de 12 cadenas nacionales e independientes para garantizar que encuentres el precio más bajo disponible hoy.
          </p>
        </div>

        <div className="bg-slate-800/40 p-7 rounded-3xl border border-slate-700/50 hover:border-emerald-500/50 transition-colors group">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <h3 className="text-emerald-400 font-black uppercase text-sm tracking-widest">IA Geolocalizada</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Nuestro motor prioriza farmacias con presencia en tu ciudad actual, facilitando la entrega inmediata o el retiro en tienda física.
          </p>
        </div>
      </div>
      
      <div className="mt-10 pt-8 border-t border-slate-800/50 flex flex-wrap gap-3">
        {['FarmaCheck v2.0', 'Deep Linking Engine', 'Nacional Scraper', 'LRU Active Cache'].map(tech => (
          <span key={tech} className="text-[10px] bg-slate-800/80 px-4 py-1.5 rounded-full font-black text-slate-500 border border-slate-700/50 tracking-tighter">
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ArchitectureInfo;
