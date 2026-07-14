import './HeroPrincipal.css';

const HeroPrincipal = () => {
  return (
    <header className="hero-modern">
      <div className="hero-inner">
        <div className="logo-container">
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