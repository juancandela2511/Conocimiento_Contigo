import React from 'react';
import './UserProgressCard.css'; // Ajusta la ruta de tus estilos si es necesario

const UserProgressCard = ({ progress }) => {
  if (!progress) return null;

  // Extraemos las propiedades asegurando un objeto o valor por defecto
  const title = progress.title || progress.course_title || 'Curso sin título';
  const category = (progress.category || progress.course_category || '').toLowerCase();
  const status = (progress.status || '').toLowerCase();
  
  // Conversión segura del porcentaje de progreso
  const rawProgress = Number(progress.progress) || 0;
  const percentage = Math.min(Math.max(rawProgress, 0), 100);

  return (
    <div className="user-progress-card">
      <div className="card-header">
        <h3 className="course-title">{title}</h3>
        {category && (
          <span className={`category-tag category-${category}`}>
            {category}
          </span>
        )}
      </div>

      <div className="card-body">
        <div className="progress-info">
          <span>Progreso:</span>
          <span className="percentage-text">{percentage}%</span>
        </div>

        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${percentage}%` }}
          />
        </div>

        {status && (
          <div className={`status-badge status-${status}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProgressCard;