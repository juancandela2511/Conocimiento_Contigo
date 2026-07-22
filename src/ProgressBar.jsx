/*
  Archivo: ProgressBar.jsx
  Función: Componente reutilizable que muestra una barra de progreso visual.
  Tipo: Componente de Frontend.
*/

import './ProgressBar.css';

const ProgressBar = ({ percentage }) => {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${percentage}%` }}>
        {percentage}%
      </div>
    </div>
  );
};

export default ProgressBar;