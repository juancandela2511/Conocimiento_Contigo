/*
  Archivo: LogroItem.jsx
  Función: Renderiza una tarjeta individual para un logro.
  Tipo: Componente de Frontend.
*/
import React from 'react';
import './LogroItem.css';

const LogroItem = ({ logro }) => {
  return (
    <div className="logro-card">
      <div className="logro-icon-container">
        <img src={logro.icono_url || '/default-badge.png'} alt={logro.titulo} className="logro-icon" />
      </div>
      <h3 className="logro-title">{logro.titulo}</h3>
      <p className="logro-description">{logro.descripcion}</p>
    </div>
  );
};

export default LogroItem;