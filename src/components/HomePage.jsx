const HomePage = ({ courses }) => {
  // Si no hay cursos cargados aún, mostramos un mensaje
  if (!courses || courses.length === 0) {
    return <h2>No hay modulos de capacitacion disponibles en el momento.</h2>;
  }
 
  return (
    <div style={{ padding:'20px', fontFamily: 'sans-serif' }}>
      <h1>Rutas de aprendizaje disponibles</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {courses.map((course) => (
          <div 
            key={course.id}
            style={{
                border: '1px solid #b23333', 
                padding: '15px', 
                borderRadius: '10px',
                backgroundColor: '#fff'
            }}
          >
            {/* CORREGIDO: title (con una sola 't') */}
            <h3>{course.title}</h3>
            
            {/* CORREGIDO: description (faltaba la 'i') */}
            <p>{course.description || "Sin descripción disponible"}</p>
            
            <button>acceder al modulo</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default  HomePage;