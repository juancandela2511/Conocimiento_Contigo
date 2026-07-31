/*
  Archivo: LogroItem.jsx
  Función: Renderiza una tarjeta individual para un logro.
  Tipo: Componente de Frontend.
*/

import * as icons from 'lucide-react';
import './LogroItem.css';

const LogroItem = ({ logro }) => {
  // Busca el componente del ícono por su nombre (ej: "Trophy") en la librería.
  // Si no lo encuentra o el nombre es nulo, usa el ícono 'Award' como respaldo seguro.
  const IconoComponente = (logro && icons[logro.icono]) || icons.Award;

  return (
    <div className="logro-card">
      <div className="logro-icon-container">
        {/* Renderiza el componente del ícono dinámicamente. */}
        <IconoComponente size={48} className="logro-icon" />
      </div>
      <h3 className="logro-title">{logro.titulo}</h3>
      <p className="logro-description">{logro.descripcion}</p>
    </div>
  );
};

export default LogroItem;