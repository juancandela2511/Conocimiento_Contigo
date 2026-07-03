import { Link } from 'react-router-dom';

export default function Navbar({ isLoggedIn }) {
  
  if (!isLoggedIn){
    return null;
  }
  return (
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/login">Login</Link>
      {/* El href debe coincidir exactamente con el ID que pongamos abajo */}
      <a 
  href="#soporte" 
  onClick={(e) => {
    e.preventDefault(); // Evita el comportamiento por defecto
    document.getElementById('ContactInfo').scrollIntoView({ behavior: 'smooth' });
  }}
  style={{ textDecoration: 'none', color: 'blue', cursor: 'pointer' }}
>
  Soporte
</a>
    </nav>
  );
}