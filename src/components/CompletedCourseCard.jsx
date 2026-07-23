/*
  Archivo: CompletedCourseCard.jsx
  Función: Renderiza una tarjeta visualmente atractiva para un curso que ha sido completado.
           Muestra el nombre del curso y un ícono de verificación.
  Tipo: Componente de Frontend (Presentacional).
*/
import { CheckCircle } from 'lucide-react';
import './CompletedCourseCard.css';

const CompletedCourseCard = ({ course, style }) => {
  return (
    <div 
      className="completed-course-card" 
      // Estilos en línea para aplicar la imagen de fondo y una animación de entrada.
      style={{ 
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${course.imagen_url})`,
        ...style
      }}
    >
      <div className="completed-course-icon">
        <CheckCircle size={32} />
      </div>
      <h4 className="completed-course-name">{course.course_name}</h4>
    </div>
  );
};

export default CompletedCourseCard;