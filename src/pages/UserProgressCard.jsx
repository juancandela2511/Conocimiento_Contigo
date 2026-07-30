import { Link } from 'react-router-dom';
import AnimatedProgressBar from './AnimatedProgressBar';
import './UserProgressCard.css';

const UserProgressCard = ({ progress }) => {
  // Verificación de seguridad para prevenir fallos si los datos del progreso están incompletos.
  // Esta comprobación mejorada asegura que todas las propiedades requeridas existan antes de renderizar.
  if (!progress || typeof progress.progress !== 'number' || !progress.course_id || !progress.course_name) {
    // Es útil registrar una advertencia en la consola para depurar problemas de datos de la API.
    console.warn('UserProgressCard recibió datos incompletos y no se renderizará:', progress);
    return null;
  }

  const isCompleted = progress.progress === 100;
  const statusText = isCompleted ? 'Completado' : 'En Progreso';
  // Esta lógica robusta crea la clase de estado sin usar .toLowerCase() en una propiedad potencialmente indefinida,
  // que es la causa del error que estás viendo.
  const statusClass = isCompleted ? 'completado' : 'en-progreso';

  return (
    <Link to={`/curso/${progress.course_id}`} className="user-progress-card-link">
      <div className="user-progress-card">
        <h3 className="user-progress-course-name">{progress.course_name || 'Curso sin nombre'}</h3>
        <div className="user-progress-details">
          <div className="user-progress-bar-container">
            <AnimatedProgressBar percentage={progress.progress} />
          </div>
          <span className={`user-progress-status status-${statusClass}`}>
            {statusText}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default UserProgressCard;
