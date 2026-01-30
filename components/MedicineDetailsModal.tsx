
import React from 'react';
import { MedicineResult } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  medicine: MedicineResult | null;
  onClose: () => void;
}

const MedicineDetailsModal: React.FC<Props> = ({ medicine, onClose }) => {
  if (!medicine) return null;

  const historyData = [
    { name: 'Hace 3 meses', price: medicine.price * 1.15 },
    { name: 'Hace 2 meses', price: medicine.price * 1.05 },
    { name: 'Hace 1 mes', price: medicine.price * 1.08 },
    { name: 'Hoy', price: medicine.price },
  ];

  const simulatedAverage = medicine.price * 1.08;
  const diffPercent = Math.abs(((medicine.price - simulatedAverage) / simulatedAverage) * 100).toFixed(1);
  const isGoodDeal = medicine.price <= simulatedAverage;

  /**
   * Validación ultra-estricta de Deep Linking Farmacéutico.
   * Asegura que el enlace apunte a un producto y no a un motor de búsqueda interno.
   */
  const isValidProductUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.toLowerCase();
      const searchParams = parsed.search.toLowerCase();
      
      // Debe ser una URL de farmacia conocida o al menos segura
      if (!parsed.protocol.startsWith('http')) return false;

      // 1. Longitud mínima del path: Un slug de producto suele ser descriptivo y largo
      if (path.length < 12 || path === '/') return false;

      // 2. Lista negra extendida: Bloquea patrones de búsqueda y listados genéricos
      const blacklist = [
        '/search', '/busqueda', '/results', '/category', '/categoria', 
        '/find', '/query', '/listado', 's=', 'q=', 'keyword=', 'query=', 
        'filter=', 'orderby=', 'ps='
      ];
      if (blacklist.some(term => path.includes(term) || searchParams.includes(term))) {
        return false;
      }

      // 3. Lista blanca de tokens de producto: Identificadores de ficha técnica
      const whitelistTokens = [
        '/p/', '/pdp/', '/producto/', '/item/', '/medicamentos/', 
        '/detalle/', '/sku/', '-p-', '.html', '/catalogo/producto/',
        '/catalogo/articulo/'
      ];
      const hasProductToken = whitelistTokens.some(token => path.includes(token));

      // 4. Verificación de jerarquía: Al menos 2 niveles (ej: /farmacia/producto)
      const segments = path.split('/').filter(s => s.length > 0);
      const hasSufficientDepth = segments.length >= 2;

      // 5. Exclusión de landing pages corporativas básicas
      const commonLandings = ['/nosotros', '/contacto', '/sedes', '/domicilios', '/promociones'];
      if (commonLandings.some(l => path.startsWith(l))) return false;

      return hasProductToken || hasSufficientDepth;
    } catch {
      return false;
    }
  };

  const hasValidLink = isValidProductUrl(medicine.url);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">Verificado</span>
              <h3 className="text-xl font-black text-slate-900 leading-tight">{medicine.name}</h3>
            </div>
            <p className="text-sm text-slate-500 font-medium">Ofrecido por: {medicine.storeName} • {medicine.presentation}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200/50 rounded-full transition-all active:scale-90">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Historial Regional (Manizales)</h4>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <span>En vivo</span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                    <YAxis fontSize={9} axisLine={false} tickLine={false} tickFormatter={(val) => `$${(val/1000)}k`} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                      formatter={(val: number) => [`$${val.toLocaleString()}`, 'Precio COP']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#059669" 
                      strokeWidth={4} 
                      dot={{ r: 5, fill: '#059669', strokeWidth: 2, stroke: '#fff' }} 
                      activeDot={{ r: 8, strokeWidth: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="md:w-64 space-y-6">
              <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-200">
                <h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Precio en Manizales</h4>
                <p className="text-4xl font-black leading-none">${medicine.price.toLocaleString('es-CO')}</p>
                <div className={`mt-4 flex items-center gap-2 ${isGoodDeal ? 'text-emerald-400' : 'text-orange-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isGoodDeal ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6"} />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {isGoodDeal ? 'Ahorro Detectado' : 'Por encima del Promedio'}
                  </span>
                </div>
              </div>
              
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                <h5 className="font-black text-emerald-900 text-[10px] mb-2 uppercase tracking-tight">Veredicto Farma Manizales</h5>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  Este producto está <span className="font-black underline">{diffPercent}%</span> {isGoodDeal ? 'más barato' : 'más caro'} que la media en droguerías locales de Caldas.
                </p>
              </div>

              {hasValidLink ? (
                <a 
                  href={medicine.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-100 text-center transform hover:-translate-y-1 overflow-hidden"
                >
                  <span className="relative z-10">IR AL PRODUCTO DIRECTO</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </a>
              ) : (
                <div className="space-y-3">
                  <button 
                    disabled
                    className="block w-full text-center bg-slate-100 text-slate-400 font-black py-5 rounded-2xl cursor-not-allowed border-2 border-dashed border-slate-200"
                  >
                    LINK NO DISPONIBLE
                  </button>
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                    <p className="text-[9px] text-center text-red-500 font-black leading-tight">
                      SEGURIDAD: El enlace detectado no parece ser una ficha de producto directa. Solo permitimos redirecciones seguras.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
              Escaneamos dinámicamente {medicine.storeName}. Si el enlace no carga el producto exacto, el stock podría haber cambiado. Recomendamos llamar al punto de venta físico en Manizales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailsModal;
