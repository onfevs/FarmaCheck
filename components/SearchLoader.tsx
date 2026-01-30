
import React, { useState, useEffect } from 'react';

const SearchLoader: React.FC = () => {
  const [step, setStep] = useState(0);
  const stores = ['Cruz Verde', 'Farmatodo', 'La Rebaja', 'Condrogas', 'Droguería Alemana', 'Farmacenter', 'Pasteur', 'Farmalisto'];
  
  const messages = [
    "Conectando con redes nacionales...",
    "Escaneando inventarios en tiempo real...",
    "Comparando precios de marcas y genéricos...",
    "Filtrando las mejores ofertas para ti...",
    "Casi listo, organizando por ahorro..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-700">
      {/* Animación Central: Píldora Tecnológica */}
      <div className="relative mb-12">
        <div className="w-24 h-24 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl rotate-45 animate-pulse flex items-center justify-center shadow-lg shadow-emerald-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Partículas de "Datos" */}
        <div className="absolute -top-4 -right-4 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute -bottom-2 -left-6 w-3 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.5s]"></div>
      </div>

      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
            Buscando el mejor precio
          </h3>
          <p className="text-emerald-600 font-black text-xs tracking-[0.2em] uppercase h-4">
            {messages[step % messages.length]}
          </p>
        </div>

        {/* Visualización de Escaneo de Tiendas */}
        <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-100 overflow-hidden relative h-12 flex items-center justify-center">
          <div className="flex flex-col transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${(step % stores.length) * 100}%)` }}>
            {stores.map((store, i) => (
              <div key={i} className="h-12 flex items-center justify-center shrink-0">
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic opacity-50 group-hover:opacity-100">
                  Consultando: {store}...
                </span>
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-slate-50 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-t from-slate-50 to-transparent"></div>
        </div>

        <div className="pt-4">
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${Math.min((step * 15), 98)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-tighter">
            Ten paciencia, estamos ahorrándote dinero en cuestión de segundos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchLoader;
