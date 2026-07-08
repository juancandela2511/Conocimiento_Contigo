//El Hijo. Recibe la información del curso y la muestra.

import styles from './AdminDashboard.module.css';

// 1. Definimos la función sin "export default" al inicio
function CourseCard({ course }) {
  return (
    <div 
      className={styles.card} 
      style={{ backgroundImage: `url(${course.image_url})` }}
    >
      <h3>{course.title}</h3>
      <p>Estado: {course.status}</p>
      
      <div className={styles.cardActions}>
        <button onClick={() => console.log("Editar:", course.id)}>✏️ Editar</button>
      </div>
    </div>
  );
}

// 2. Exportamos al final (esta es la forma más clara y evita errores de duplicados)
export default CourseCard;