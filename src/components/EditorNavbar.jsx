import { Edit, PlusSquare } from 'lucide-react';
import './Navbar.css'; // Reutilizamos los mismos estilos

/**
 * EditorNavbar: Una barra de herramientas contextual para administradores.
 * Permite acceder a funciones de edición sin salir de la página actual.
 *
 * @param {object} props
 * @param {() => void} props.onAddModuleClick - Función que se ejecuta al hacer clic en "Agregar Módulo".
 */
export default function EditorNavbar({ onAddModuleClick }) {
  return (
    // Usamos las mismas clases que Navbar para mantener la consistencia visual.
    // Le añadimos una clase 'editor-nav' para poder posicionarla de forma distinta.
    <nav className="Navbar-container editor-nav">
      
      {/* Icono de edición que actúa como disparador del menú */}
      <div className="menu-trigger">
        <Edit size={28} />
      </div>

      {/* Contenido del menú de edición que se expande */}
      <div className="menu-content">
        
        {/* Botón para activar el formulario de agregar módulo */}
        <button onClick={onAddModuleClick} className="nav-item-btn">
          <PlusSquare size={20} />
          <span>Agregar Módulo</span>
        </button>

      </div>
    </nav>
  );
}