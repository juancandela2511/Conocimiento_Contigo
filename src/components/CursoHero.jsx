/*
  Archivo: CursoHero.jsx
  Función: Renderiza la cabecera (hero) para la página de detalle de un curso.
  Tipo: Componente de Frontend.
*/

import './CursoHero.css';

const CursoHero = ({ course }) => {
  if (!course) {
    return null; // No renderiza nada si no hay datos del curso
  }

  return (
    <div className="curso-hero-container" style={{ backgroundImage: `url(${course.imagen_url})` }}>
      <div className="curso-hero-overlay"></div>
      <div className="curso-hero-content">
        <div className="curso-hero-box">
          <img src="/logo.png" alt="Logo Aprende Contigo" className="curso-hero-logo" />
          <h1 className="curso-hero-title">{course.curso}</h1>
        </div>
      </div>
    </div>
  );
};

export default CursoHero;