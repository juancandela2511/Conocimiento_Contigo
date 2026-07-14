/*
  Archivo: HomePage.jsx
  Función: Muestra la cuadrícula de cursos, filtra los resultados de búsqueda y gestiona el modal de edición.
  Tipo: Componente de Frontend.
*/

// Importaciones de React y librerías externas.
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Importaciones de archivos locales.
import EditModal from "./Admin/EditModal";
import './HomePage.css'; 

// Definición del componente HomePage. Recibe datos y funciones como props.
const HomePage = ({ courses, userRole, terminoDeBusqueda }) => {

  // Lógica de Frontend: Estados para controlar el modal de edición.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Lógica de Frontend: Filtra la lista de cursos (recibida del Backend) según el término de búsqueda.
  const filteredCourses = (courses || []).filter(course =>
    course.curso && course.curso.toLowerCase().includes(terminoDeBusqueda.toLowerCase())
  );

  // Lógica de Frontend: Si no hay cursos (o no coinciden con la búsqueda), muestra un mensaje.
  if (!filteredCourses || filteredCourses.length === 0) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>No hay módulos de capacitación disponibles.</h2>;
  }

  // Lógica de Frontend: Función para abrir el modal de edición con los datos del curso seleccionado.
  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  // Renderizado del componente.
  return (
    <div className="homepage-layout">
    
      <div className="main-content-area">
        <div className="courses-grid">
          {/* Lógica de Frontend: Itera sobre la lista de cursos filtrados para crear una tarjeta por cada uno. */}
          {filteredCourses.map((course) => {
            // Lógica de Frontend: Determina si la tarjeta debe tener el efecto de palpitación.
            const shouldHighlight = terminoDeBusqueda.length > 0;

            return (
              <div 
                key={course.id} 
                className={`course-card ${shouldHighlight ? 'search-highlight' : ''}`}
                // La URL de la imagen viene de la base de datos (Backend).
                style={{ 
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${course.imagen_url})`
                }}
              >
                <div className="card-content">
                  {/* Muestra el título del curso, que viene del Backend. */}
                  <h3>{course.curso}</h3>
                </div> 
                
                <div className="card-actions">
                  {/* Lógica de Frontend: El botón de edición solo aparece si el rol es 'administrador'. */}
                  {userRole === 'administrador' && (
                    <button onClick={() => handleEditClick(course)} className="action-button edit-button">
                      Editar Módulo
                    </button>
                  )}

                  {/* Botón para navegar a la página de detalle del curso. */}
                  <Link to={`/curso/${course.id}`} style={{ textDecoration: 'none', width: '100%' }}>
                    <button className="action-button access-button">
                      Acceder al módulo
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel lateral de anuncios (contenido estático de Frontend por ahora). */}
      <aside className="announcements-panel">
        <h2>Anuncios</h2>
        <div className="announcement-item">
          <h4>Próxima Actualización</h4>
          <p>El día 30 se añadirán nuevos módulos de comunicación asertiva.</p>
        </div>
        <div className="announcement-item">
          <h4>Mantenimiento Programado</h4>
          <p>La plataforma estará en mantenimiento el viernes de 2am a 3am.</p>
        </div>
      </aside>

      {/* Lógica de Frontend: El modal de edición solo se muestra si isModalOpen es true. */}
      <EditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        course={selectedCourse}
        onSave={() => console.log("Guardando...")} // Aquí luego pondremos la lógica de Supabase
      />
    </div>
  );
};

export default HomePage;