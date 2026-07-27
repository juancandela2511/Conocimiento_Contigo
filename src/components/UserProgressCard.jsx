/*
  Archivo: UserProgressCard.jsx
  Función: Renderiza una tarjeta que muestra el progreso de un usuario en un curso específico.
           Incluye el nombre del curso, una barra de progreso y el estado.
  Tipo: Componente de Frontend (Presentacional).
*/

import './UserProgressCard.css';

// Componente interno para la barra de progreso visual.
const ProgressBar = ({ progress }) => (
  <div className="user-progress-bar-container">
    <div className="user-progress-bar" style={{ width: `${progress}%` }}>
      {/* Muestra el porcentaje solo si hay espacio suficiente (ej. más del 10%) */}
      {progress > 10 && `${progress}%`}
    </div>
  </div>
);

const UserProgressCard = ({ courseName, progress, status }) => {
  return (
    <div className="user-progress-card">
      <h3 className="user-progress-course-name">{courseName}</h3>
      <div className="user-progress-details">
        <ProgressBar progress={progress} />
        {/* El estado (ej. 'Completado') recibe una clase CSS dinámica para cambiar su color. */}
        <span className={`user-progress-status status-${status.toLowerCase().replace(' ', '-')}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default UserProgressCard;