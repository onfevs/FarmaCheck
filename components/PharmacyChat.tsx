
import React, { useState, useRef, useEffect } from 'react';
import { chatWithPharmacist } from '../services/geminiService';
import { ChatMessage } from '../types';

const PharmacyChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithPharmacist(input, history);
      setMessages(prev => [...prev, { role: 'assistant', content: response || 'Lo siento, no pude procesar tu solicitud.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Hubo un error al conectar con la farmacia inteligente.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg flex flex-col h-[500px]">
      <div className="p-4 border-b border-slate-100 bg-blue-600 rounded-t-xl">
        <h3 className="text-white font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Asistente Farmacéutico IA
        </h3>
        <p className="text-blue-100 text-xs mt-1">Pregunta por dosis, usos o comparaciones</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm">¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {["¿Para qué sirve el Ibuprofeno?", "¿Diferencia entre Genérico y Marca?", "Mejor precio de Acetaminofén"].map(chip => (
                <button 
                  key={chip}
                  onClick={() => setInput(chip)}
                  className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white rounded-b-xl flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit"
          disabled={isTyping}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default PharmacyChat;
