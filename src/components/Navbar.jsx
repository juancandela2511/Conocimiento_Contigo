/*
  Archivo: Navbar.jsx
  Función: Renderiza la barra de navegación principal y el indicador de rol/logout.
  Tipo: Componente de Frontend.
*/

// Importaciones de React y librerías externas.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, LogIn, Info, Menu, Search, UserCircle, Trophy, Users, BarChart, Settings } from 'lucide-react';

// Importaciones de archivos locales.
import './Navbar.css';
import { supabase } from '../services/supabaseClient';
import ThemeSwitcher from './ThemeSwitcher'; // Importación sin extensión para consistencia

// Definición del componente Navbar. Recibe props para funcionar.
export default function BarraNavegacion({ sesionIniciada, alBuscar, alPresionarEnter, rolUsuario }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Lógica de Frontend: Si el usuario no ha iniciado sesión, no se muestra nada.
  if (!sesionIniciada) return null;

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
      <nav className={`contenedor-barra-navegacion ${isMenuOpen ? 'is-open' : ''}`}>
        
        {/* Icono que activa el menú al pasar el ratón. */}
        <button className="activador-menu" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menú">
          <Menu size={28} />
        </button>

        {/* Contenido del menú que se expande. */}
        <div className="contenido-menu">
          
          {/* Enlace a la página de inicio. */}
          <Link to="/" className="elemento-nav">
            <Home size={20} />
            <span></span>
          </Link>
          
          {/* Enlace a la sección de soporte. */}
          <Link to="/#soporte" className="elemento-nav">
            <Info size={20} />
            <span></span>
          </Link>

          {/* Enlace a la página de logros (visible para todos). */}
          <Link to="/logros" className="elemento-nav">
            <Trophy size={20} />
            <span></span>
          </Link>

          {/* Enlace condicional a la página de progreso. */}
          {rolUsuario === 'administrador' ? (
            // Los administradores ven el progreso de todos los usuarios.
            <Link to="/admin/progreso" className="elemento-nav">
              <Users size={20} />
              <span></span>
            </Link>
          ) : (
            // Los usuarios ven su propio progreso.
            <Link to="/progreso" className="elemento-nav">
              <BarChart size={20} />
              <span></span>
            </Link>
          )}

          {/* Enlace a la página de administración de usuarios, visible solo para administradores */}
          {rolUsuario === 'administrador' && (
            <Link to="/admin/usuarios" className="elemento-nav" title="Administrar Usuarios">
              <Settings size={20} />
              <span></span>
            </Link>
          )}

          {/* Componente de búsqueda. */}
          <div className="contenedor-busqueda" onClick={(e) => e.stopPropagation()}>
            <Search size={20} />
            
            <input 
               type="text" 
               placeholder="Buscar..."
               className="input-busqueda"
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

          {/* Botón de logout, visible solo en el menú expandido en móvil */}
          <button onClick={handleLogout} className="elemento-nav logout-mobile">
            <LogIn size={20} />
            <span>Salir</span>
          </button>

        </div>
      </nav>

      {/* Contenedor para los elementos fijos en la esquina superior derecha. */}
      <div className="contenedor-superior-derecho">
        {/* Aquí colocamos el interruptor de tema, a la izquierda del rol de usuario. */}
        <ThemeSwitcher />

        {/* Indicador de rol del usuario. */}
        {rolUsuario && (
          <div 
            // Lógica de Frontend: Aplica un estilo diferente si el rol es 'administrador' o 'usuario'.
            className={`indicador-rol-usuario ${
              rolUsuario === 'administrador' || rolUsuario === 'usuario' ? 'indicador-rol-admin' : ''
            }`}
          >
            {/* Lógica de Frontend: Muestra 'aprendiz' si el rol es 'usuario', si no, muestra el rol tal cual. */}
            <UserCircle size={20} /> <span>{rolUsuario === 'usuario' ? 'aprendiz' : rolUsuario}</span>
          </div>
        )}
        {/* Botón para cerrar sesión. */}
        <button onClick={handleLogout} className="boton-cierre-sesion-circular">
          <LogIn size={20} />
        </button>
      </div>
    </>
  );
}