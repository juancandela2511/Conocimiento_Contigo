/*
  Archivo: ContentViewerModal.jsx
  Función: Muestra un modal con el contenido específico y gestiona la finalización automática.
  Tipo: Componente de Frontend.
*/
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import ReactPlayer from 'react-player/lazy'; // Importamos un reproductor de video universal
import QuizRunner from './QuizRunner'; // Importa el nuevo componente de cuestionario
import './ContentViewerModal.css';

// --- Componente específico para el reproductor de video ---
// Se extrae a su propio componente para cumplir con las reglas de los Hooks de React,
// ya que no se pueden llamar Hooks (`useRef`, `useState`) de forma condicional.

const VideoPlayerWithTriggers = ({ content, onMarkAsComplete, isCompleted }) => {
  const videoUrl = content.contenido_json?.url;

  // Comprobación de seguridad para la URL del video.
  if (!videoUrl) {
    return <p style={{ color: '#e74c3c', textAlign: 'center' }}>Error: La URL del video no está disponible.</p>;
  }

  // Función que se llama cuando el video termina.
  const handleVideoEnd = () => {
    if (!isCompleted) {
      onMarkAsComplete(content.id);
    }
  };

  // La lógica de los cuestionarios en video (triggers) se ha simplificado.
  // ReactPlayer es muy versátil pero controlar la pausa/reproducción para los triggers
  // requiere una lógica de estado más compleja que se puede añadir en el futuro.
  // Por ahora, priorizamos que todos los videos carguen y se reproduzcan correctamente.

  return (
    <div className="video-responsive-container">
      <ReactPlayer
        url={videoUrl}
        controls
        playing // Inicia la reproducción (si el navegador lo permite)
        width="100%"
        height="100%"
        className="react-player" // Clase para aplicar estilos
        onEnded={handleVideoEnd}
      />
    </div>
  );
};

// Componente interno para renderizar el tipo de contenido adecuado.
const ContentRenderer = ({ content, onMarkAsComplete, isCompleted, onClose }) => {
  // Añadimos una comprobación de seguridad para evitar que la app se rompa si 'contenido_json' es nulo.
  if (!content.contenido_json) {
    return <p style={{ color: '#e74c3c', textAlign: 'center' }}>Error: No se pudo cargar el contenido (faltan datos).</p>;
  }

  switch (content.tipo) {
    case 'lectura': {
      // Reemplaza los saltos de línea con <br> para que se muestren en HTML.
      const texto = content.contenido_json.texto || ''; // Valor por defecto si el texto es nulo
      const formattedText = texto.replace(/\n/g, '<br />');
      return (
        <div className="lectura-viewer" dangerouslySetInnerHTML={{ __html: formattedText }} />
      );
    }
    case 'video':
      return <VideoPlayerWithTriggers content={content} onMarkAsComplete={onMarkAsComplete} isCompleted={isCompleted} />;
    case 'cuestionario':
      return (
        // Renderiza el componente del cuestionario y le pasa la función para marcar como completado.
        // Cuando el cuestionario se completa con éxito, se marca el contenido y se cierra el modal.
        <QuizRunner
          content={content}
          onQuizComplete={() => {
            onMarkAsComplete(content.id);
            onClose();
          }}
        />
      );
    default:
      return <p>Tipo de contenido no soportado.</p>;
  }
};

const ContentViewerModal = ({ content, onClose, onMarkAsComplete, isCompleted }) => {
  // Efecto para marcar las lecturas como completadas tan pronto como se abren.
  useEffect(() => {
    if (content && content.tipo === 'lectura' && !isCompleted) {
      onMarkAsComplete(content.id);
    }
    // Este efecto se ejecuta solo cuando el contenido cambia.
  }, [content, isCompleted, onMarkAsComplete]);

  if (!content) return null;

  return (
    <div className="content-viewer-overlay" onClick={onClose}>
      <div className="content-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="content-viewer-header">
          <h2>{content.titulo}</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
        <div className="content-viewer-body">
          <ContentRenderer
            content={content}
            onMarkAsComplete={onMarkAsComplete}
            isCompleted={isCompleted}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentViewerModal;