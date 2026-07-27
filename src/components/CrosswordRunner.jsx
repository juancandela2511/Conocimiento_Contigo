/*
  Archivo: CrosswordRunner.jsx
  Función: Renderiza y gestiona la lógica de un crucigrama.
  Tipo: Componente de Frontend.
*/
import { useState } from 'react';
import Crossword from '@jaredreisinger/react-crossword';
import './CrosswordRunner.css';

const CrosswordRunner = ({ content, onGameComplete }) => {
  const data = content.contenido_json?.clues;
  const [isComplete, setIsComplete] = useState(false);

  if (!data) {
    return <p>Este crucigrama no tiene datos configurados.</p>;
  }

  // El componente @jaredreisinger/react-crossword espera los datos en un formato específico.
  // El formato que usamos en el modal ya es compatible, solo hay que transformarlo.
  const crosswordData = {
    across: {},
    down: {},
  };

  data.across.forEach(item => {
    crosswordData.across[item.number] = {
      clue: item.clue,
      answer: item.answer.toUpperCase(),
      row: item.row,
      col: item.col,
    };
  });

  data.down.forEach(item => {
    crosswordData.down[item.number] = {
      clue: item.clue,
      answer: item.answer.toUpperCase(),
      row: item.row,
      col: item.col,
    };
  });

  // Si ya se completó, muestra un mensaje de felicitación.
  if (isComplete) {
    return (
      <div className="game-completed-feedback">
        <h3>¡Felicidades!</h3>
        <p>Has completado el crucigrama.</p>
      </div>
    );
  }

  return (
    <div className="crossword-container">
      <Crossword
        data={crosswordData}
        onCrosswordCorrect={(isCorrect) => {
          if (isCorrect && !isComplete) {
            setIsComplete(true);
            onGameComplete();
          }
        }}
        useStorage={false} // Deshabilitamos el guardado en localStorage
      />
    </div>
  );
};

export default CrosswordRunner;