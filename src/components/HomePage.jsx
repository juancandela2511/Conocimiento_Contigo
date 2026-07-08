const HomePage = ({ courses }) => {
  if (!courses || courses.length === 0) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>No hay módulos de capacitación disponibles.</h2>;
  }

  return (
    <div style={{ padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif", maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Rutas de aprendizaje</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '25px' 
      }}>
        {courses.map((course) => (
          <div 
            key={course.id}
            style={{
              border: 'none', 
              padding: '25px', 
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)', // Sombra suave para profundidad
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>{course.title}</h3>
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {course.description || "Sin descripción disponible"}
              </p>
            </div>
            
            <button style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#052fe9', // Color acorde a tu estilo anterior
              color: '#f6efef',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.3s',
              position: "relative",
              zIndex: 9999,
            }}>
              Acceder al módulo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;