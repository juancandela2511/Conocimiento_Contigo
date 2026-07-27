/*
  Archivo: OrdenarPasosRunner.jsx
  Función: Renderiza un minijuego interactivo para ordenar pasos con soporte para arrastrar y soltar (drag and drop) y controles de botones.
  Tipo: Componente de Frontend.
*/
import  { useState, useEffect } from 'react';
import './OrdenarPasosRunner.css';

const OrdenarPasosRunner = ({ content, onGameComplete }) => {
  const [pasos, setPasos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [indiceArrastrado, setIndiceArrastrado] = useState(null);

  useEffect(() => {
    const pasosOriginales = content.contenido_json?.steps || [];
    setPasos([...pasosOriginales].sort(() => Math.random() - 0.5));
  }, [content]);

  // Función para mover elementos con los botones ⬆️ ⬇️
  const mover = (index, direccion) => {
    if (isComplete) return;
    const nuevosPasos = [...pasos];
    const destino = index + direccion;
    
    if (destino < 0 || destino >= nuevosPasos.length) return;
    
    [nuevosPasos[index], nuevosPasos[destino]] = [nuevosPasos[destino], nuevosPasos[index]];
    
    setPasos(nuevosPasos);
    setMensaje('');
  };

  // Funciones nativas de Drag and Drop
  const handleDragStart = (index) => {
    if (isComplete) return;
    setIndiceArrastrado(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (indexDestino) => {
    if (isComplete || indiceArrastrado === null) return;

    const nuevosPasos = [...pasos];
    const [elementoMovido] = nuevosPasos.splice(indiceArrastrado, 1);
    nuevosPasos.splice(indexDestino, 0, elementoMovido);

    setPasos(nuevosPasos);
    setIndiceArrastrado(null);
    setMensaje('');
  };

  const verificarOrden = () => {
    const esCorrecto = pasos.every((paso, index) => paso.id === index + 1);
    if (esCorrecto) {
      setMensaje('¡Excelente! El orden es completamente correcto.');
      setIsComplete(true);
      if (onGameComplete) onGameComplete();
    } else {
      setMensaje('Casi, hay pasos en el lugar incorrecto. ¡Inténtalo de nuevo!');
    }
  };

  if (pasos.length === 0) {
    return <p>Este ejercicio no tiene pasos configurados.</p>;
  }

  return (
    <div className="ordenar-pasos-container">
      <h2 className="ordenar-pasos-title">Ordena los Pasos</h2>
      <p className="ordenar-pasos-instructions">
        Arrastra las tarjetas o usa las flechas para organizar la secuencia en el orden lógico correcto de arriba hacia abajo.
      </p>

      <div className="pasos-list">
        {pasos.map((paso, index) => (
          <div 
            key={paso.id} 
            draggable={!isComplete}
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            className="paso-item"
            style={{ cursor: isComplete ? 'default' : 'grab' }}
          >
            <span className="paso-texto">⠿ {paso.texto}</span>
            <div className="paso-controles">
              <button 
                onClick={() => mover(index, -1)}
                className="control-btn"
                disabled={index === 0 || isComplete}
                aria-label="Mover hacia arriba"
              >
                ⬆️
              </button>
              <button 
                onClick={() => mover(index, 1)}
                className="control-btn"
                disabled={index === pasos.length - 1 || isComplete}
                aria-label="Mover hacia abajo"
              >
                ⬇️
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isComplete && (
        <button 
          onClick={verificarOrden}
          className="verificar-btn"
        >
          Verificar Respuesta
        </button>
      )}

      {mensaje && (
        <p className={`mensaje-feedback ${mensaje.includes('Excelente') ? 'correcto' : 'incorrecto'}`}>
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default OrdenarPasosRunner;