/*
  Archivo: AnimatedProgressBar.jsx
  Función: Renderiza una barra de progreso que se anima desde 0% hasta el valor deseado.
  Tipo: Componente de Frontend.
*/
import { useState, useEffect } from 'react';
import './AnimatedProgressBar.css';

const AnimatedProgressBar = ({ percentage }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Este timeout asegura que la transición CSS se aplique después de que el componente se haya montado.
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, 100); 

    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="animated-progress-bar-container">
      <div className="animated-progress-bar" style={{ width: `${width}%` }}>
        <span>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export default AnimatedProgressBar;