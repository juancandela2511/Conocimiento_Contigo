
 // src/pages/AdminDashboard.jsx
export default function AdminDashboard({ addCourse }) {
  
  const handleAddNew = () => {
    const nuevoCurso = { 
      id: Date.now(), 
      title: "Nuevo Módulo", 
      status: "en-progreso" 
    };
    addCourse(nuevoCurso); // Aquí es donde la función cobra vida
  };

  return (
    <div>
      <h1>Panel de Administración</h1>
      <button onClick={handleAddNew}>Agregar Módulo</button>
    </div>
  );
}