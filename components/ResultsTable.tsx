
import React from 'react';
import { MedicineResult } from '../types';

interface Props {
  results: MedicineResult[];
  loading: boolean;
  onRowClick: (medicine: MedicineResult) => void;
}

const StoreLogo: React.FC<{ store: string }> = ({ store }) => {
  const s = store.toLowerCase();
  if (s.includes('rebaja')) return (
    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-[8px] p-1 text-center leading-none">REBAJA</div>
  );
  if (s.includes('farmatodo')) return (
    <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center text-white font-black text-[8px] p-1 text-center leading-none">FARMA TODO</div>
  );
  if (s.includes('cruz verde')) return (
    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black text-[8px] p-1 text-center leading-none">CRUZ VERDE</div>
  );
  if (s.includes('pasteur')) return (
    <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center text-white font-black text-[8px] p-1 text-center leading-none">PASTEUR</div>
  );
  if (s.includes('condrogas')) return (
    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-[7px] p-1 text-center leading-none">CON DROGAS</div>
  );
  if (s.includes('farmalisto')) return (
    <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center text-white font-black text-[8px] p-1 text-center leading-none">FARMA LISTO</div>
  );
  if (s.includes('alemana')) return (
    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white font-black text-[8px] p-1 text-center leading-none border-b-4 border-yellow-400">ALEMANA</div>
  );
  if (s.includes('multidrogas')) return (
    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-[8px] p-1 text-center leading-none">MULTI</div>
  );
  if (s.includes('farmacenter')) return (
    <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center text-white font-black text-[7px] p-1 text-center leading-none">FARMA CENTER</div>
  );
  if (s.includes('botica')) return (
    <div className="w-10 h-10 bg-lime-700 rounded-lg flex items-center justify-center text-white font-black text-[8px] p-1 text-center leading-none">BOTICA</div>
  );
  if (s.includes('olimpica')) return (
    <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center text-white font-black text-xs border-2 border-white">O</div>
  );
  return (
    <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </div>
  );
};

/**
 * Validación estricta de Deep Linking Farmacéutico.
 */
const isValidProductUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.toLowerCase();
    const searchParams = parsed.search.toLowerCase();
    
    if (!parsed.protocol.startsWith('http')) return false;
    if (path.length < 12 || path === '/') return false;

    const blacklist = [
      '/search', '/busqueda', '/results', '/category', '/categoria', 
      '/find', '/query', '/listado', 's=', 'q=', 'keyword=', 'query=', 
      'filter=', 'orderby=', 'ps='
    ];
    if (blacklist.some(term => path.includes(term) || searchParams.includes(term))) {
      return false;
    }

    const whitelistTokens = [
      '/p/', '/pdp/', '/producto/', '/item/', '/medicamentos/', 
      '/detalle/', '/sku/', '-p-', '.html', '/catalogo/producto/',
      '/catalogo/articulo/'
    ];
    const hasProductToken = whitelistTokens.some(token => path.includes(token));
    const segments = path.split('/').filter(s => s.length > 0);
    const hasSufficientDepth = segments.length >= 2;
    const commonLandings = ['/nosotros', '/contacto', '/sedes', '/domicilios', '/promociones'];
    
    if (commonLandings.some(l => path.startsWith(l))) return false;

    return hasProductToken || hasSufficientDepth;
  } catch {
    return false;
  }
};

const ResultsTable: React.FC<Props> = ({ results, loading, onRowClick }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
            <div className="w-20 h-8 bg-slate-100 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) return null;

  const sortedResults = [...results].sort((a, b) => a.price - b.price);
  const minPrice = sortedResults[0].price;

  return (
    <div className="grid grid-cols-1 gap-4">
      {sortedResults.map((item) => {
        const isCheapest = item.price === minPrice && results.length > 1;
        const isUrlValid = isValidProductUrl(item.url);
        
        return (
          <div 
            key={item.id}
            onClick={() => onRowClick(item)}
            className="group bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-900/5 transition-all cursor-pointer relative"
          >
            {isCheapest && (
              <div className="absolute -top-2 left-4 bg-emerald-600 text-white text-[8px] font-black px-4 py-1 rounded-full uppercase shadow-lg z-10">
                OFERTA DESTACADA
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <StoreLogo store={item.storeName} />
              <div>
                <h4 className="font-black text-slate-900 text-sm group-hover:text-emerald-600 transition-colors line-clamp-1 uppercase tracking-tight">
                  {item.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                  {item.presentation} • <span className="text-slate-800 font-black">{item.storeName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                  ${item.price.toLocaleString('es-CO')}
                </p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Precio Final</p>
              </div>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (isUrlValid) window.open(item.url, '_blank'); 
                }}
                disabled={!isUrlValid}
                className={`px-6 py-3 rounded-xl font-black text-[10px] transition-all active:scale-95 shadow-md uppercase ${
                  isUrlValid 
                    ? 'bg-slate-900 text-white hover:bg-emerald-600 shadow-emerald-900/10' 
                    : 'bg-slate-50 text-slate-300 border border-slate-200 shadow-none cursor-not-allowed opacity-60'
                }`}
              >
                {isUrlValid ? 'COMPRAR' : 'NO DISPONIBLE'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultsTable;
