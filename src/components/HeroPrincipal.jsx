import './HeroPrincipal.css';

const HeroPrincipal = () => {
  return (
    <header className="hero-modern">
      <div className="hero-inner">
        {/* Logo con animación de flotación */}
        <div className="logo-container">
          <img src="/logo.png" alt="Logo" className="floating-logo" />
        </div>
        
        <h1 className="hero-title">
          El conocimiento <span className="highlight">va contigo</span>
        </h1>
        
        <p className="hero-subtitle">
          Plataforma interactiva para aprender a tu ritmo.
        </p>

        <button className="cta-button" onClick={() => window.scrollBy({ top: 500, behavior: 'smooth' })}>
          Comenzar Aventura
        </button>
      </div>
    </header>
  );
};

export default HeroPrincipal;