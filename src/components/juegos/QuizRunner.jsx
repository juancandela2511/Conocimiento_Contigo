/*
  Archivo: QuizRunner.jsx
  Función: Gestiona la lógica y la interfaz para tomar un cuestionario.
  Tipo: Componente de Frontend.
*/
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import './QuizRunner.css';

const QuizRunner = ({ content, onQuizComplete }) => {
  const preguntas = content.contenido_json?.preguntas || [];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (optionIndex) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const handleNextQuestion = () => {
    // Solo avanza si se ha seleccionado una respuesta
    if (userAnswers[currentQuestionIndex] === undefined) return;

    if (currentQuestionIndex < preguntas.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
      setIsFinished(true);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    preguntas.forEach((pregunta, index) => {
      // Compara la respuesta del usuario con la respuesta correcta
      if (userAnswers[index] === pregunta.respuestaCorrecta) {
        correctAnswers++;
      }
    });
    const finalScore = (correctAnswers / preguntas.length) * 10;
    setScore(finalScore);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setIsFinished(false);
    setScore(0);
  };

  if (preguntas.length === 0) {
    return <p>Este cuestionario aún no tiene preguntas.</p>;
  }

  if (isFinished) {
    const isApproved = score >= 7;
    return (
      <div className="quiz-results">
        <h3 className={isApproved ? 'results-approved' : 'results-failed'}>
          {isApproved ? '¡Aprobado!' : 'Inténtalo de nuevo'}
        </h3>
        <p className="results-score">Tu calificación: <strong>{score.toFixed(1)} / 10</strong></p>
        <p className="results-feedback">Necesitas una calificación de 7.0 o más para desbloquear el siguiente contenido.</p>
        
        <div className="results-summary">
          <h4>Resumen de tus respuestas:</h4>
          {preguntas.map((pregunta, index) => {
            const userAnswerIndex = userAnswers[index];
            const isCorrect = userAnswerIndex === pregunta.respuestaCorrecta;
            return (
              <div key={index} className="result-item">
                <p className="result-question">{index + 1}. {pregunta.pregunta}</p>
                <div className={`result-answer ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? <Check size={16} /> : <X size={16} />}
                  <span>Tu respuesta: {pregunta.opciones[userAnswerIndex]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {isApproved ? (
            // Si se aprueba, el botón "Continuar" llama a la función que se le pasó (cerrar modal, marcar como completo, etc.)
            <button className="btn-primary" onClick={onQuizComplete} style={{marginTop: '20px'}}>
              Continuar
            </button>
          ) : (
            <button className="btn-primary" onClick={restartQuiz}>
              Volver a intentar
            </button>
          )}
      </div>
    );
  }

  const currentQuestion = preguntas[currentQuestionIndex];

  return (
    <div className="quiz-runner">
      <div className="quiz-progress">
        Pregunta {currentQuestionIndex + 1} de {preguntas.length}
      </div>
      <h3 className="quiz-question">{currentQuestion.pregunta}</h3>
      <div className="quiz-options">
        {currentQuestion.opciones.map((opcion, index) => (
          <button
            key={index}
            className={`quiz-option-btn ${userAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
            onClick={() => handleAnswerSelect(index)}
          >
            {opcion}
          </button>
        ))}
      </div>
      <button
        className="btn-primary quiz-next-btn"
        onClick={handleNextQuestion}
        disabled={userAnswers[currentQuestionIndex] === undefined}
      >
        {currentQuestionIndex < preguntas.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Cuestionario'}
      </button>
    </div>
  );
};

export default QuizRunner;