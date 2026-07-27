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
export default function ChatIA({ onNavigateRequest }) {
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

      // CONSOLE.LOG PARA DEPURACIÓN: Mostramos en la consola del navegador la respuesta exacta de la IA.
      console.log("Respuesta recibida de la IA:", data);

      // Lógica de Frontend: Añade la respuesta de la IA a la lista de mensajes.
      // La respuesta ahora puede ser un objeto con acciones o solo texto.
      if (data && typeof data === 'object' && data.type) {
        const aiMessage = { role: 'ai', text: data.reply };
        setMessages((prev) => [...prev, aiMessage]);

        // Si la IA nos pide navegar, llamamos a la función que nos pasaron.
        if (data.type === 'navigate' && onNavigateRequest) {
          onNavigateRequest(data.target);
        }
      } else {
        const aiMessage = { role: 'ai', text: data.reply || (typeof data === 'string' ? data : 'No entendí la respuesta.') };
        setMessages((prev) => [...prev, aiMessage]);
      }

    } catch (error) {
      // Lógica de Frontend: Manejo de errores mejorado.
      console.error('Error al contactar la IA:', error);

      let displayErrorMessage = 'Lo siento, no pude procesar tu solicitud en este momento.';

      // El error de Supabase Functions (`FunctionsHttpError`) contiene el `context`
      // que es la respuesta original del fetch. Intentamos leer el cuerpo del error.
      if (error.context && typeof error.context.json === 'function') {
        try {
          const errorData = await error.context.json();
          console.log("Cuerpo del error de la Edge Function:", errorData);
          // Si la función devuelve un JSON con 'details' o 'error', lo mostramos.
          if (errorData.details) {
            displayErrorMessage = `Error desde la IA: ${errorData.details}`;
          } else if (errorData.error) {
            displayErrorMessage = `Error desde la IA: ${errorData.error}`;
          }
        } catch (e) {
          console.error('No se pudo parsear el cuerpo del error como JSON:', e);
        }
      }
      const errorMessage = { role: 'ai', text: displayErrorMessage };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      // Lógica de Frontend: Desactiva el estado de carga.
      setIsLoading(false);
    }
  };

  // Lógica de Frontend: Si el chat está cerrado, solo muestra el botón para abrirlo.
  if (!isOpen) {
    return (
      // Este botón se muestra como un círculo flotante en la esquina de la pantalla.
      <button className="chat-ia-logo-button" onClick={() => setIsOpen(true)}>
        <GraduationCap size={32} />
        {/* El punto rojo de notificación para atraer la atención del usuario. */}
        <span className="chat-ia-notification-dot"></span>
      </button>
    );
  }

  // Renderizado del componente de chat completo (Frontend).
  return (
    <div className="chat-ia-window">
      <img src="/cerebrito.png" alt="Avatar de Cerebrito" className="chat-ia-avatar" />
      <div className="chat-ia-header">
        <h3>CEREBRITO</h3>
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