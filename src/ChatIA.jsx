/*
  Archivo: ChatIA.jsx
  Función: Implementa una interfaz de chat que se comunica con una IA (Gemini) a través de una Supabase Edge Function.
  Tipo: Componente de Frontend con interacciones de Backend (Edge Function).
*/

// Importaciones de React y librerías externas.
import { useState, useRef, useEffect } from 'react';
import { GraduationCap, Send, X, Bot } from 'lucide-react';

// Importaciones de archivos locales.
import { supabase } from './services/supabaseClient';
import './ChatIA.css';

// Definición del componente.
export default function ChatIA() {
  // Lógica de Frontend: Estados para controlar la visibilidad, mensajes, input y estado de carga.
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Lógica de Frontend: Efecto para hacer scroll automático al final de la conversación.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Lógica de Frontend que interactúa con el Backend.
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Lógica de Frontend: Añade el mensaje del usuario a la lista de mensajes al instante.
    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // --- INTERACCIÓN CON EL BACKEND (EDGE FUNCTION) ---
      // Llama a la función 'chat-gemini' de Supabase, enviando el prompt del usuario.
      // Esta función en la nube es la que realmente habla con la API de Gemini.
      const { data, error } = await supabase.functions.invoke('chat-gemini', {
        body: { prompt: input },
      });

      if (error) throw error;

      // Lógica de Frontend: Añade la respuesta de la IA a la lista de mensajes.
      const aiMessage = { role: 'ai', text: data.reply };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      // Lógica de Frontend: Manejo de errores si la comunicación con la IA falla.
      console.error('Error al contactar la IA:', error);
      const errorMessage = { role: 'ai', text: 'Lo siento, no pude procesar tu solicitud.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      // Lógica de Frontend: Desactiva el estado de carga.
      setIsLoading(false);
    }
  };

  // Lógica de Frontend: Si el chat está cerrado, solo muestra el botón para abrirlo.
  if (!isOpen) {
    return (
      <button className="chat-ia-logo-button" onClick={() => setIsOpen(true)}>
        <GraduationCap size={32} />
      </button>
    );
  }

  // Renderizado del componente de chat completo (Frontend).
  return (
    <div className="chat-ia-window">
      <div className="chat-ia-header">
        <h3>Asistente IA</h3>
        <button onClick={() => setIsOpen(false)}><X size={20} /></button>
      </div>
      <div className="chat-ia-messages">
        {/* Itera sobre los mensajes para mostrarlos. */}
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            {msg.role === 'ai' && <Bot size={20} className="ai-icon" />}
            <p>{msg.text}</p>
          </div>
        ))}
        {/* Muestra un indicador de "escribiendo..." mientras la IA responde. */}
        {isLoading && (
          <div className="chat-message ai">
            <Bot size={20} className="ai-icon" />
            <p className="typing-indicator">...</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form className="chat-ia-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregúntame algo..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}