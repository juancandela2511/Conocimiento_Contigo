/*
  Archivo: HomePage.jsx (PaginaPrincipal.jsx)
  Función: Renderiza el layout principal de la página de inicio, incluyendo la cuadrícula de cursos y el panel de anuncios.
  Tipo: Componente de Frontend.
*/
import { Edit, Trash2 } from 'lucide-react';
import './HomePage.css';

// Componente para una tarjeta de curso individual (para mantener el código limpio)
const TarjetaCurso = ({ curso, onEditCourseClick, onDeleteCourseClick, userRole, style }) => (
  <div
    // Añadimos una clase 'completed' si el curso está terminado.
    className={`course-card ${curso.estaCompleto ? 'completed' : ''}`}
    style={{ 
      backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${curso.imagen_url})`,
      ...style 
    }}
  >
    {/* Mostramos una insignia si el curso está completado. */}
    {curso.estaCompleto && <div className="course-completed-badge">Culminado</div>}

    {/* Botones de acción para administradores, aparecen al hacer hover */}
    {userRole === 'administrador' && (
      <div className="course-admin-actions">
        <button onClick={() => onEditCourseClick(curso)} className="admin-action-btn" title="Editar Módulo">
          <Edit size={18} />
        </button>
        <button onClick={() => onDeleteCourseClick(curso.id)} className="admin-action-btn" title="Eliminar Módulo">
          <Trash2 size={18} />
        </button>
      </div>
    )}

    <div className="card-content">
      <h3>{curso.curso}</h3>
      {/* Botón de acceso siempre visible con nuevo estilo */}
      <a href={`/curso/${curso.id}`} className="access-button-bubble">
        Acceder
      </a>
    </div>
  </div>
);

export default function PaginaPrincipal({ courses, userRole, terminoDeBusqueda, onEditCourseClick, onDeleteCourseClick }) {
  const cursosFiltrados = courses.filter(curso =>
    curso.curso.toLowerCase().includes(terminoDeBusqueda.toLowerCase())
  );

  return (
    <div className="homepage-layout">
      <main className="main-content-area">
        <div className="courses-grid">
          {cursosFiltrados.map((curso, index) => (
            <TarjetaCurso
              key={curso.id}
              curso={curso}
              onEditCourseClick={onEditCourseClick}
              onDeleteCourseClick={onDeleteCourseClick}
              userRole={userRole}
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}