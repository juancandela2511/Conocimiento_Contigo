import styles from './AdminDashboard.module.css';
import AddCard from './AddCard';

/**
 * AdminDashboard: En la página principal, este componente actúa como un contenedor
 * para el formulario de agregar nuevos cursos, visible solo para administradores.
 *
 * @param {object} props
 * @param {(newCourse: object) => void} props.addCourse - Función para agregar un curso a la lista.
 */
export default function AdminDashboard({ addCourse }) {
  return (
    <div className={styles.dashboardContainer}>
      <AddCard onCourseAdded={addCourse} />
    </div>
  );
}