/*
  Archivo: HeroPrincipal.jsx
  Función: Renderiza la sección principal de bienvenida (Hero) en la página de inicio.
           Muestra el logo y un subtítulo de la aplicación.
  Tipo: Componente de Frontend (Presentacional).
*/
import './HeroPrincipal.css';

const HeroPrincipal = () => {
  return (
    // Contenedor principal con un estilo moderno.
    <header className="hero-modern">
      <div className="hero-inner">
        <div className="logo-container">
          {/* El logo tiene una animación 'flotante' definida en el CSS. */}
          <img src="/logo.png" alt="Logo" className="floating-logo" />
        </div>
        
        <p className="hero-subtitle">
          Plataforma interactiva para aprender a tu ritmo.
        </p>
      </div>
    </header>
  );
};

export default HeroPrincipal;