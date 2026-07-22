/*
  Archivo: HomePage.jsx (PaginaPrincipal.jsx)
  Función: Renderiza el layout principal de la página de inicio, incluyendo la cuadrícula de cursos y el panel de anuncios.
  Tipo: Componente de Frontend.
*/
import AnunciosPanel from './AnunciosPanel'; // Importamos el nuevo componente
import './HomePage.css';

// Componente para una tarjeta de curso individual (para mantener el código limpio)
const TarjetaCurso = ({ curso, onEditCourseClick, userRole }) => (
  <div
    className="course-card"
    style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${curso.imagen_url})` }}
  >
    <div className="card-content">
      <h3>{curso.curso}</h3>
    </div>
    <div className="card-actions">
      {userRole === 'administrador' && (
        <button onClick={() => onEditCourseClick(curso)} className="action-button edit-button">
          Editar Módulo
        </button>
      )}
      <a href={`/curso/${curso.id}`} className="action-button access-button">
        Acceder al Módulo
      </a>
    </div>
  </div>
);

export default function PaginaPrincipal({ courses, userRole, terminoDeBusqueda, onEditCourseClick }) {
  const cursosFiltrados = courses.filter(curso =>
    curso.curso.toLowerCase().includes(terminoDeBusqueda.toLowerCase())
  );

  return (
    <div className="homepage-layout">
      <main className="main-content-area">
        <div className="courses-grid">
          {cursosFiltrados.map(curso => (
            <TarjetaCurso
              key={curso.id}
              curso={curso}
              onEditCourseClick={onEditCourseClick}
              userRole={userRole}
            />
          ))}
        </div>
      </main>
      
      {/* Aquí usamos el nuevo componente de anuncios */}
      <AnunciosPanel />
    </div>
  );
}