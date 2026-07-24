import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Edit, PlusSquare, Video, BookOpen, HelpCircle } from 'lucide-react';
import './Navbar.css'; // Reutilizamos los mismos estilos

/**
 * EditorNavbar: Una barra de herramientas contextual para administradores.
 * Permite acceder a funciones de edición sin salir de la página actual.
 * - En la página principal, muestra "Agregar Módulo".
 * - En una página de curso, muestra "Agregar Contenido" con un submenú.
 *
 * @param {object} props
 * @param {() => void} props.alHacerClicAgregarModulo - Función que se ejecuta al hacer clic en "Agregar Módulo".
 * @param {() => void} props.alHacerClicAgregarLectura - Función para abrir el modal de agregar lectura.
 * @param {() => void} props.alHacerClicAgregarVideo - Función para abrir el modal de agregar video.
 * @param {() => void} props.alHacerClicAgregarCuestionario - Función para abrir el modal de agregar cuestionario.
 */
export default function BarraNavegacionEditor({ alHacerClicAgregarModulo, alHacerClicAgregarLectura, alHacerClicAgregarVideo, alHacerClicAgregarCuestionario }) {
  const location = useLocation();
  const estaEnPaginaCurso = location.pathname.startsWith('/curso/');
  const idCurso = estaEnPaginaCurso ? location.pathname.split('/')[2] : null;
  const [isEditorMenuOpen, setIsEditorMenuOpen] = useState(false);
  const [estaAbiertoMenuContenido, definirEstaAbiertoMenuContenido] = useState(false);

  const manejarClicSubMenu = (action) => {
    if (action) action();
    definirEstaAbiertoMenuContenido(false); // Cierra el menú después de la acción
    setIsEditorMenuOpen(false); // Cierra el menú principal también
  };

  const handleAddModuleClick = () => {
    alHacerClicAgregarModulo();
    setIsEditorMenuOpen(false); // Cierra el menú después de la acción
  };

  return (
    // Usamos las mismas clases que Navbar para mantener la consistencia visual.
    // Le añadimos una clase 'editor-nav' para poder posicionarla de forma distinta.
    <nav className={`contenedor-barra-navegacion editor-nav ${isEditorMenuOpen ? 'is-open' : ''}`}>
      
      {/* Icono de edición que actúa como disparador del menú */}
      <button className="activador-menu" onClick={() => setIsEditorMenuOpen(!isEditorMenuOpen)} aria-label="Abrir menú de edición">
        <Edit size={28} />
      </button>

      {/* Contenido del menú de edición que se expande */}
      {/* CORRECCIÓN: La clase debe ser 'contenido-menu' para que los estilos de expansión se apliquen. */}
      <div className="contenido-menu">
        {estaEnPaginaCurso ? (
          <div className="content-menu-container">
            <div 
              role="button" 
              tabIndex="0" 
              onClick={(e) => { e.stopPropagation(); definirEstaAbiertoMenuContenido(!estaAbiertoMenuContenido); }} 
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); definirEstaAbiertoMenuContenido(!estaAbiertoMenuContenido); } }} 
              className="nav-item-btn"
            >
              <PlusSquare size={20} />
              <span>Agregar Contenido</span>
            </div>
            {estaAbiertoMenuContenido && (
              <div className="content-submenu">
                <button onClick={() => manejarClicSubMenu(() => alHacerClicAgregarVideo(idCurso))} className="submenu-item-btn"><Video size={18} /><span>Video</span></button>
                <button onClick={() => manejarClicSubMenu(() => alHacerClicAgregarLectura(idCurso))} className="submenu-item-btn"><BookOpen size={18} /><span>Lectura</span></button>
                <button onClick={() => manejarClicSubMenu(() => alHacerClicAgregarCuestionario(idCurso))} className="submenu-item-btn"><HelpCircle size={18} /><span>Cuestionario</span></button>
              </div>
            )}
          </div>
        ) : (
          <div 
            role="button" 
            tabIndex="0" 
            onClick={handleAddModuleClick} 
            onKeyDown={(e) => { 
              if (e.key === 'Enter' || e.key === ' ') {
                handleAddModuleClick();
              }
            }} 
            className="nav-item-btn"
          >
            <PlusSquare size={20} />
            <span>Agregar Módulo</span>
          </div>
        )}

      </div>
    </nav>
  );
}