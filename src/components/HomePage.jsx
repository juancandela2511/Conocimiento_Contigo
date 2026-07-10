/* Este componente muestra todos los cursos disponibles en tarjetas y permite a los administradores editarlos. */
import { useState } from 'react';
import EditModal from "./Admin/EditModal";
import './HomePage.css'; 


const HomePage = ({ courses, userRole }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  if (!courses || courses.length === 0) {
    return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>No hay módulos de capacitación disponibles.</h2>;
  }
  // 3. FUNCIÓN PARA ABRIR EL MODAL
  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  return (
    <div style={{ padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif", maxWidth: '1200px', margin: '0 auto' }}>
    
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
        {courses.map((course) => (
          <div key={course.id} style={{ border: 'none', padding: '25px', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#1a1a1a' }}>{course.title}</h3>
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>{course.description || "Sin descripción disponible"}</p>
            </div>
            
            {/* 4. BOTÓN DE EDICIÓN: Solo aparece si el rol es 'administrador' */}
            {userRole === 'administrador' && (
  <button 
    onClick={() => handleEditClick(course)}
    style={{ 
      marginTop: '10px', 
      padding: '8px', 
      backgroundColor: '#ff9800', 
      color: 'white', 
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer' 
    }}
  >
    Editar Módulo
  </button>
)}

{/* 2. Botón de Acceso: Lo ven todos los usuarios (incluido el administrador) */}
<button style={{ 
  marginTop: '20px', 
  padding: '10px 20px', 
  backgroundColor: '#052fe9', 
  color: '#f6efef', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: 'bold' 
}}>
  Acceder al módulo
</button>
          </div>
        ))}
      </div>

      {/* 5. EL MODAL: Solo se muestra si isModalOpen es true */}
      <EditModal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)} 
  course={selectedCourse}
  onSave={() => console.log("Guardando...")} // Aquí luego pondremos la lógica de Supabase
/>
    </div>
  );
};

export default HomePage;