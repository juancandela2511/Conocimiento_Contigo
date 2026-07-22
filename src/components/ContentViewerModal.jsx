/*
  Archivo: ContentViewerModal.jsx
  Función: Muestra un modal con el contenido específico y gestiona la finalización automática.
  Tipo: Componente de Frontend.
*/
import { useEffect, useRef, useState } from 'react';
import './ContentViewerModal.css';
import { X } from 'lucide-react';
import QuizRunner from './QuizRunner'; // Importa el nuevo componente de cuestionario

// Componente interno para renderizar el tipo de contenido adecuado.
const ContentRenderer = ({ content, onMarkAsComplete, isCompleted }) => {
  // Añadimos una comprobación de seguridad para evitar que la app se rompa si 'contenido_json' es nulo.
  if (!content.contenido_json) {
    return <p style={{ color: '#e74c3c', textAlign: 'center' }}>Error: No se pudo cargar el contenido (faltan datos).</p>;
  }

  switch (content.tipo) {
    case 'lectura':
      // Reemplaza los saltos de línea con <br> para que se muestren en HTML.
      const texto = content.contenido_json.texto || ''; // Valor por defecto si el texto es nulo
      const formattedText = texto.replace(/\n/g, '<br />');
      return (
        <div className="lectura-viewer" dangerouslySetInnerHTML={{ __html: formattedText }} />
      );
    case 'video':
      const videoUrl = content.contenido_json?.url;
      const quizTriggers = content.contenido_json?.quizTriggers || [];
      const videoRef = useRef(null);
      const [activeQuiz, setActiveQuiz] = useState(null);
      const [shownTriggers, setShownTriggers] = useState(new Set());

      // Comprobación de seguridad para la URL del video.
      if (!videoUrl) {
        return <p style={{ color: '#e74c3c', textAlign: 'center' }}>Error: La URL del video no está disponible.</p>;
      }

      const handleTimeUpdate = () => {
        if (!videoRef.current || quizTriggers.length === 0) return;

        const currentTime = videoRef.current.currentTime;

        for (const trigger of quizTriggers) {
          // Comprueba si se alcanzó el tiempo del trigger y si no se ha mostrado ya
          if (currentTime >= trigger.time && !shownTriggers.has(trigger.time)) {
            videoRef.current.pause();
            // Prepara el objeto del cuestionario para QuizRunner
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
            break; // Detiene el bucle para mostrar solo un cuestionario a la vez
          }
        }
      };

      const handleQuizClose = () => {
        setActiveQuiz(null);
        if (videoRef.current) {
          videoRef.current.play();
        }
      };

      // Lógica para videos. Se marca como completado cuando el video termina.
      return (
        <>
          {activeQuiz && (
            <div className="quiz-in-video-overlay">
              <div className="quiz-in-video-modal">
                <h3>¡Pregunta Rápida!</h3>
                {/* Cuando el quiz se completa (aprueba), se cierra y el video continúa */}
                <QuizRunner content={activeQuiz} onQuizComplete={handleQuizClose} />
              </div>
            </div>
          )}
          <video ref={videoRef} controls autoPlay width="100%" style={{ maxHeight: '70vh', borderRadius: '8px' }} onTimeUpdate={handleTimeUpdate} onEnded={() => { if (!isCompleted) { onMarkAsComplete(content.id); } }}>
            <source src={videoUrl} type="video/mp4" />
            Tu navegador no soporta la etiqueta de video.
          </video>
        </>
      );
    case 'cuestionario':
      return (
        // Renderiza el componente del cuestionario y le pasa la función para marcar como completado.
        <QuizRunner content={content} onQuizComplete={() => { onMarkAsComplete(content.id); onClose(); }} />
      );
    default:
      return <p>Tipo de contenido no soportado.</p>;
  }
};

const ContentViewerModal = ({ content, onClose, onMarkAsComplete, isCompleted }) => {
  if (!content) return null;

  // Efecto para marcar las lecturas como completadas tan pronto como se abren.
  useEffect(() => {
    if (content && content.tipo === 'lectura' && !isCompleted) {
      onMarkAsComplete(content.id);
    }
    // Este efecto se ejecuta solo cuando el contenido cambia.
  }, [content, isCompleted, onMarkAsComplete]);

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
          />
        </div>
      </div>
    </div>
  );
};

export default ContentViewerModal;