/*
  Archivo: Navbar.jsx
  Función: Renderiza la barra de navegación principal y el indicador de rol/logout.
  Tipo: Componente de Frontend.
*/

// Importaciones de React y librerías externas.
import { Link } from 'react-router-dom';
import { Home, LogIn, Info, Menu, Search, Shield, UserCircle } from 'lucide-react';

// Importaciones de archivos locales.
import './Navbar.css';
import { supabase } from '../services/supabaseClient';

// Definición del componente Navbar. Recibe props para funcionar.
export default function Navbar({ isLoggedIn, alBuscar, alPresionarEnter, userRole }) {
  
  // Lógica de Frontend: Si el usuario no ha iniciado sesión, no se muestra nada.
  if (!isLoggedIn) return null;

  // Lógica de Frontend que interactúa con el Backend.
  const handleLogout = async () => {
    // Llama al servicio de autenticación de Supabase (Backend) para cerrar la sesión.
    await supabase.auth.signOut();
    // Redirección en el Frontend a la página de login.
    window.location.href = '/login';
  };

  // Renderizado del componente (lo que se ve en pantalla).
  return (
    <>
      {/* Barra de navegación principal, a la izquierda. */}
      <nav className="Navbar-container">
        
        {/* Icono que activa el menú al pasar el ratón. */}
        <div className="menu-trigger">
          <Menu size={28} />
        </div>

        {/* Contenido del menú que se expande. */}
        <div className="menu-content">
          
          {/* Enlace a la página de inicio. */}
          <Link to="/" className="nav-item">
            <Home size={20} />
          </Link>
          
          {/* Enlace a la sección de soporte. */}
          <Link to="/#soporte" className="nav-item">
            <Info size={20} />
          </Link>

          {/* Componente de búsqueda. */}
          <div className="search-container" onClick={(e) => e.stopPropagation()}>
            <Search size={20} />
            
            <input 
               type="text" 
               placeholder="Buscar..."
               className="search-input"
               // Lógica de Frontend: Al escribir, se llama a la función 'alBuscar' del componente padre (App.jsx).
               onChange={(e) => alBuscar(e.target.value)}
               // Lógica de Frontend: Al presionar Enter, se llama a la función 'alPresionarEnter'.
               onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                   alPresionarEnter();
                 }
               }} 
            />
          </div>

        </div>
      </nav>

      {/* Contenedor para los elementos fijos en la esquina superior derecha. */}
      <div className="top-right-container">
        {/* Indicador de rol del usuario. */}
        {userRole && (
          <div 
            // Lógica de Frontend: Aplica un estilo diferente si el rol es 'administrador' o 'usuario'.
            className={`user-role-indicator ${
              userRole === 'administrador' || userRole === 'usuario' ? 'admin-role-indicator' : ''
            }`}
          >
            {/* Lógica de Frontend: Muestra 'aprendiz' si el rol es 'usuario', si no, muestra el rol tal cual. */}
            <UserCircle size={20} /> <span>{userRole === 'usuario' ? 'aprendiz' : userRole}</span>
          </div>
        )}
        {/* Botón para cerrar sesión. */}
        <button onClick={handleLogout} className="logout-button-circle">
          <LogIn size={20} />
        </button>
      </div>
    </>
  );
}