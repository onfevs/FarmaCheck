
import { MedicineResult } from "../types";

// Base de datos simulada
const MOCK_DB: Omit<MedicineResult, 'id'>[] = [
  { name: "Acetaminofén 500mg", presentation: "Caja x 30 Tab", price: 4500, storeName: "Farmatodo", url: "https://www.farmatodo.com.co", currency: "COP" },
  { name: "Acetaminofén 500mg", presentation: "Caja x 30 Tab", price: 4200, storeName: "Droguerías La Rebaja", url: "https://www.larebaja.com", currency: "COP" },
  { name: "Acetaminofén 500mg", presentation: "Caja x 30 Tab", price: 5100, storeName: "Cruz Verde", url: "https://www.cruzverde.com.co", currency: "COP" },
  { name: "Advil Ultra", presentation: "Caja x 20 Caps", price: 22000, storeName: "Éxito", url: "https://www.exito.com", currency: "COP" },
  { name: "Advil Ultra", presentation: "Caja x 20 Caps", price: 21500, storeName: "Farmatodo", url: "https://www.farmatodo.com.co", currency: "COP" },
  { name: "Losartán 50mg", presentation: "Caja x 30 Tab", price: 12000, storeName: "Cruz Verde", url: "https://www.cruzverde.com.co", currency: "COP" },
  { name: "Losartán 50mg", presentation: "Caja x 30 Tab", price: 11500, storeName: "Colsubsidio", url: "https://www.drogueriascolsubsidio.com", currency: "COP" },
  { name: "Amoxicilina 500mg", presentation: "Caja x 50 Cap", price: 18000, storeName: "Alemana", url: "https://www.drogueriaalemana.com", currency: "COP" },
  { name: "Loratadina 10mg", presentation: "Caja x 10 Tab", price: 3500, storeName: "Surtitodo", url: "https://www.drogueriassurtitodo.com", currency: "COP" },
  { name: "Aspirina 100mg", presentation: "Caja x 28 Tab", price: 9500, storeName: "Olimpica", url: "https://www.olimpica.com", currency: "COP" },
];

interface CacheEntry {
  results: MedicineResult[];
  timestamp: number;
}

// TTL de 5 minutos (300,000 ms)
const CACHE_TTL = 5 * 60 * 1000;
const localCache = new Map<string, CacheEntry>();

export const searchMedicines = async (query: string): Promise<MedicineResult[]> => {
  const normalizedQuery = query.toLowerCase().trim();
  const now = Date.now();

  // Verificar si existe en caché y no ha expirado
  const cached = localCache.get(normalizedQuery);
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    console.log(`[Cache Hit] Serving: ${normalizedQuery}`);
    return cached.results;
  }

  // Simulación de latencia de red (solo si no está en caché)
  await new Promise(resolve => setTimeout(resolve, 80));

  const results = MOCK_DB
    .filter(item => 
      item.name.toLowerCase().includes(normalizedQuery) || 
      normalizedQuery.includes(item.name.toLowerCase().split(' ')[0])
    )
    .map((r, i) => ({ ...r, id: `res-${now}-${i}` }))
    .sort((a, b) => a.price - b.price);

  // Guardar en caché con marca de tiempo actual
  localCache.set(normalizedQuery, {
    results,
    timestamp: now
  });

  return results;
};
