/*
  Archivo: CursoHero.jsx
  Función: Renderiza la cabecera (hero) para la página de detalle de un curso.
  Tipo: Componente de Frontend.
*/

import { Download } from 'lucide-react';
import './CursoHero.css';

const CursoHero = ({ course, isComplete, onDownloadClick }) => {
  if (!course) {
    return null; // No renderiza nada si no hay datos del curso
  }

  return (
    <div className="curso-hero-container" style={{ backgroundImage: `url(${course.imagen_url})` }}>
      {/* La capa de filtro de color se aplica con CSS puro usando un pseudo-elemento ::before */}
      <div className="curso-hero-content"> 
        <div className="curso-hero-box">
          <img src="/logo.png" alt="Logo Aprende Contigo" className="curso-hero-logo" />
          <h1 className="curso-hero-title">{course.curso}</h1>
          {isComplete && (
            <button onClick={onDownloadClick} className="download-certificate-btn">
              <Download size={20} />
              <span>Ver Certificado</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CursoHero;