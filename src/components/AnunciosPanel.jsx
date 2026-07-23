/*
  Archivo: AnunciosPanel.jsx
  Función: Renderiza un panel lateral con anuncios importantes.
  Tipo: Componente de Frontend.
*/
import { useState } from 'react';
import { Pin, StickyNote, X, Book } from 'lucide-react';
import './AnunciosPanel.css';

export default function AnunciosPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isApuntesOpen, setIsApuntesOpen] = useState(false); // Estado para la sección de apuntes
  const [apuntes, setApuntes] = useState(''); // Estado para el texto de los apuntes temporales

  // Por ahora, los anuncios están definidos aquí.
  // En el futuro, podrían venir de una base de datos.
  const anuncios = [
    {
      id: 1,
      titulo: "¡Nuevo Módulo!",
      texto: "Ya está disponible el módulo de Comunicación Asertiva. ¡No te lo pierdas!"
    },
    {
      id: 2,
      titulo: "Mantenimiento Programado",
      texto: "El próximo domingo de 2am a 3am realizaremos mantenimiento en la plataforma."
    }
  ];

  if (!isOpen) {
    return (
      <button className="announcement-fab" onClick={() => setIsOpen(true)}>
        <StickyNote size={28} />
        {anuncios.length > 0 && <span className="announcement-notification-dot"></span>}
      </button>
    );
  }

  return (
    <aside className="announcements-panel">
      <div className="announcements-header">
        <h2>Anuncios</h2>
        <button className="announcements-close-btn" onClick={() => setIsOpen(false)}>
          <X size={20} />
        </button>
      </div>
      <div className="announcements-content">
        {anuncios.map((anuncio, index) => (
          <div
            key={anuncio.id}
            className="announcement-item note"
            style={{ '--rotation': `${(index % 2 === 0 ? 1.5 : -1)}deg` }}
          >
            <Pin className="note-pin" size={24} />
            <h4>{anuncio.titulo}</h4>
            <p>{anuncio.texto}</p>
          </div>
        ))}
      </div>
      <div className="apuntes-section">
        <button className="apuntes-header" onClick={() => setIsApuntesOpen(!isApuntesOpen)}>
          <span><Book size={16} /> Apuntes Temporales</span>
          {/* Icono de flecha que indica si está abierto o cerrado */}
          <span className={`apuntes-chevron ${isApuntesOpen ? 'open' : ''}`}>▼</span>
        </button>
        {isApuntesOpen && (
          <div className="apuntes-body">
            <textarea
              className="apuntes-textarea"
              value={apuntes}
              onChange={(e) => setApuntes(e.target.value)}
              placeholder="Escribe tus notas aquí. Se borrarán al recargar la página..."
            />
          </div>
        )}
      </div>
    </aside>
  );
}