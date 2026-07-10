// COMPONENTE DE MENU DESPLEGABLE
import { Link } from 'react-router-dom';
import { Home, LogIn, Info, Menu, Search } from 'lucide-react';
import './Navbar.css';
import { supabase } from '../services/supabaseClient';

// Definición del componente Navbar que recibe props para autenticación y gestión de búsqueda
export default function Navbar({ isLoggedIn, alBuscar, alPresionarEnter }) {
  
  // Si el usuario no ha iniciado sesión, no renderizamos nada en el DOM
  if (!isLoggedIn) return null;

  // Función asíncrona para cerrar sesión en Supabase y redirigir al login
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Cierra la sesión activa
    window.location.href = '/login'; // Fuerza la redirección a la página de login
  };

  return (
    // Contenedor principal de la barra de navegación (posición fija en pantalla)
    <nav className="Navbar-container">
      
      {/* Icono de menú visible siempre como gatillo de interacción */}
      <div className="menu-trigger">
        <Menu size={28} />
      </div>

      {/* Contenedor que agrupa los elementos del menú que se despliegan */}
      <div className="menu-content">
        
        {/* Link hacia el Inicio (Home) */}
        <Link to="/" className="nav-item">
          <Home size={20} />
        </Link>
        
        {/* Link hacia la sección de Soporte */}
        <Link to="/#soporte" className="nav-item">
          <Info size={20} />
        </Link>

        {/* Contenedor del buscador: evita que el clic cierre el menú (stopPropagation) */}
        <div className="search-container" onClick={(e) => e.stopPropagation()}>
          <Search size={20} />
          
          <input 
             type="text" 
             placeholder="Buscar..."
             className="search-input" 
             // Al escribir, actualiza el estado del padre mediante 'alBuscar'
             onChange={(e) => alBuscar(e.target.value)}
             // Al presionar Enter, ejecuta la función de navegación entre resultados
             onKeyDown={(e) => {
               if (e.key === 'Enter') {
                 alPresionarEnter(); 
               }
             }} 
          />
        </div>

        {/* Botón dedicado para cerrar sesión */}
        <button onClick={handleLogout} className="nav-item-btn">
          <LogIn size={20} />
        </button>

      </div>
    </nav>
  );
}