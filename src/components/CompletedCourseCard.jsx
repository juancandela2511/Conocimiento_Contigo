/*
  Archivo: CompletedCourseCard.jsx
  Función: Renderiza una tarjeta visualmente atractiva para un curso que ha sido completado.
           Muestra el nombre del curso y un ícono de verificación.
           Al hacer clic, muestra un modal con un diploma.
  Tipo: Componente de Frontend (Presentacional).
*/
import { useState, useRef } from 'react';
import { CheckCircle, X, Download } from 'lucide-react';
import './CompletedCourseCard.css';

// Componente para el Modal del Diploma
export const DiplomaModal = ({ course, onClose, userName }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const diplomaRef = useRef(null);

  // Función para formatear la fecha en un formato legible (ej: "1 de enero de 2024")
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownloadPDF = async () => {
    if (!diplomaRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      // Se importan dinámicamente para evitar errores de compilación con Vite.
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      // Usamos html2canvas para tomar una "foto" del diploma con alta calidad.
      const canvas = await html2canvas(diplomaRef.current, {
        scale: 2, // Aumentamos la escala para una mejor resolución en el PDF.
        useCORS: true, // Permite que se carguen imágenes externas (logos, sellos).
        backgroundColor: null, // Mantiene el fondo original.
      });

      const imgData = canvas.toDataURL('image/png');

      // Creamos un PDF con las mismas dimensiones que la imagen para evitar distorsiones.
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Certificado-${course.course_name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al intentar generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="diploma-modal-overlay" onClick={onClose}>
      <div className="diploma-modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="diploma-modal-close-button">
          <X size={30} />
        </button>
        <button onClick={handleDownloadPDF} className="diploma-download-button" disabled={isDownloading} title="Descargar PDF">
          {isDownloading ? '...' : <Download size={20} />}
        </button>
        <div
          ref={diplomaRef}
          className="diploma-image-container"
          style={{ backgroundImage: `url(/diploma.png)` }}
          role="img"
          aria-label={`Diploma para ${course.course_name}`}
        >
          {/* Contenido del diploma rediseñado */}
          <img src="/logo.png" alt="Logo Aprende Contigo" className="diploma-logo" />
          <h2 className="diploma-title">Certificado de Finalización</h2>
          <div className="diploma-recipient-name">{userName}</div>
          <div className="diploma-course-name">{course.course_name}</div>
          <div className="diploma-description">
            Por haber completado satisfactoriamente todos los módulos y evaluaciones requeridas.
          </div>
          <div className="diploma-date">
            Finalizado el {formatDate(course.completion_date)}
          </div>
          <div className="diploma-issuer">Aprende Contigo</div>
          {/* Sello dorado decorativo */}
          <img src="/sello.png" alt="Sello de Calidad" className="diploma-seal" />
        </div>
      </div>
    </div>
  );
};


const CompletedCourseCard = ({ course, style, userName }) => {
  const [isDiplomaModalOpen, setDiplomaModalOpen] = useState(false);

  const handleCardClick = () => {
    setDiplomaModalOpen(true);
  };

  const handleCloseModal = () => {
    setDiplomaModalOpen(false);
  };

  return (
    <>
      <div 
        className="completed-course-card" 
        onClick={handleCardClick}
        // Estilos en línea para aplicar la imagen de fondo y una animación de entrada.
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${course.imagen_url})`,
          ...style
        }}
      >
        <div className="completed-course-icon">
          <CheckCircle size={32} />
        </div>
        <h4 className="completed-course-name">{course.course_name}</h4>
      </div>
      {isDiplomaModalOpen && <DiplomaModal course={course} onClose={handleCloseModal} userName={userName} />}
    </>
  );
};

export default CompletedCourseCard;
