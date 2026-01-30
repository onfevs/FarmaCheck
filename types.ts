
export interface MedicineResult {
  id: string;
  name: string;
  presentation: string;
  price: number;
  storeName: string;
  url: string;
  currency: string;
}

// Added ChatMessage interface to fix the import error in PharmacyChat.tsx
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum StoreColor {
  CHEAPEST = 'text-green-600 font-bold bg-green-50',
  EXPENSIVE = 'text-red-600 font-bold bg-red-50',
  NORMAL = 'text-slate-600'
}
