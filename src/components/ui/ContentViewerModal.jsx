/*
  Archivo: ContentViewerModal.jsx
  Función: Muestra un modal con el contenido específico y gestiona la finalización automática.
  Tipo: Componente de Frontend.
*/
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
// Se importa el módulo completo para manejar un posible problema de interoperabilidad
// entre CommonJS y ES Modules que a veces ocurre con algunos bundlers.
import ReactPlayerModule from 'react-player';

import QuizRunner from '../juegos/QuizRunner';
import OrdenarPasosRunner from '../juegos/OrdenarPasosRunner'; // Importamos el nuevo componente
import './ContentViewerModal.css';

// --- Componente específico para el reproductor de video ---
// Se extrae a su propio componente para cumplir con las reglas de los Hooks de React,
// ya que no se pueden llamar Hooks (`useRef`, `useState`) de forma condicional.

const VideoPlayerWithTriggers = ({ content, onMarkAsComplete, isCompleted }) => {
  // Se extrae el componente ReactPlayer del módulo. Si el módulo se importó como un objeto
  // con una propiedad 'default' (típico de la interoperabilidad CJS/ESM), se usa esa.
  const ReactPlayer = ReactPlayerModule.default || ReactPlayerModule;
  const videoUrl = content.contenido_json?.url;
  const quizTriggers = content.contenido_json?.quizTriggers || [];

  const [isPlaying, setIsPlaying] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [shownTriggers, setShownTriggers] = useState(new Set());
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

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

  const handleProgress = (progress) => {
    // No hacer nada si no hay triggers o si ya hay un quiz activo.
    if (quizTriggers.length === 0 || activeQuiz) return;

    const currentTime = progress.playedSeconds;

    for (const trigger of quizTriggers) {
      // Comprueba si se alcanzó el tiempo del trigger y si no se ha mostrado ya.
      if (currentTime >= trigger.time && !shownTriggers.has(trigger.time)) {
        setIsPlaying(false); // Pausa el video.
        
        // Prepara el objeto del cuestionario para QuizRunner.
        const quizForRunner = {
          contenido_json: {
            preguntas: [{
              pregunta: trigger.pregunta,
              opciones: trigger.opciones,
              respuestaCorrecta: trigger.respuestaCorrecta,
            }]
          }
        };
        setActiveQuiz(quizForRunner);
        setShownTriggers(prev => new Set(prev).add(trigger.time));
        break; // Muestra solo un cuestionario a la vez.
      }
    }
  };

  const handleQuizClose = () => {
    // Muestra la animación de éxito.
    setShowSuccessAnimation(true);

    // Después de un par de segundos, oculta la animación y reanuda el video.
    setTimeout(() => {
      setShowSuccessAnimation(false);
      setActiveQuiz(null);
      setIsPlaying(true);
    }, 2500); // Duración de la animación.
  };

  return (
    <>
      {showSuccessAnimation && (
        <div className="success-animation-overlay">
          <div className="success-animation-content">
            <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="success-checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <p>¡Correcto!</p>
          </div>
        </div>
      )}
      {activeQuiz && (
        <div className="quiz-in-video-overlay">
          <div className="quiz-in-video-modal">
            <h3>¡Pregunta Rápida!</h3>
            <QuizRunner content={activeQuiz} onQuizComplete={handleQuizClose} />
          </div>
        </div>
      )}
      <div className="video-responsive-container">
        <ReactPlayer
          url={videoUrl}
          controls
          playing={isPlaying}
          width="100%"
          height="100%"
          className="react-player" // Clase para aplicar estilos
          onEnded={handleVideoEnd}
          onProgress={handleProgress}
        />
      </div>
    </>
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
    case 'ordenar_pasos':
      return (
        <OrdenarPasosRunner
          content={content}
          onGameComplete={() => {
            onMarkAsComplete(content.id);
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