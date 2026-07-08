import { Link } from 'react-router-dom';
import { Home, LogIn, Info } from 'lucide-react';
import './Navbar.css';
import { supabase } from '../services/supabaseClient';

export default function Navbar({ isLoggedIn }) {
  if (!isLoggedIn) return null;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Opcional: recargar la página para asegurar que el estado se limpie
      window.location.href = '/login'; 
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="Navbar-container">
      <Link to="/" className="nav-item">
        <Home size={20} />
        <span className="tooltip">Inicio</span>
      </Link>

      <Link to="/#soporte" className="nav-item">
        <Info size={20} />
        <span className="tooltip">Soporte</span>
      </Link>
      
      {/* Usamos un botón para que sea semánticamente correcto */}
      <button onClick={handleLogout} className="nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        <LogIn size={20} />
        <span className="tooltip">Salir</span>
      </button>
    </nav>
  );
}