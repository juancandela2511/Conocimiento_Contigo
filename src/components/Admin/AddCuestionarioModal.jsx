/*
  Archivo: AddCuestionarioModal.jsx
  Función: Modal para crear la base de un nuevo contenido de tipo "cuestionario".
  Tipo: Componente de Frontend con interacción de Backend.
*/
import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AddModals.css';

const AddCuestionarioModal = ({ isOpen, onClose, onContentAdded, curso_id }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  // Estado para las preguntas. Cada pregunta es un objeto.
  const [preguntas, setPreguntas] = useState([
    { pregunta: '', opciones: ['', '', ''], respuestaCorrecta: 0 }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // --- MANEJADORES PARA EL FORMULARIO DINÁMICO DE PREGUNTAS ---

  const handlePreguntaChange = (index, field, value) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[index][field] = value;
    setPreguntas(nuevasPreguntas);
  };

  const handleOpcionChange = (pIndex, oIndex, value) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[pIndex].opciones[oIndex] = value;
    setPreguntas(nuevasPreguntas);
  };

  const agregarPregunta = () => {
    if (preguntas.length < 5) { // Límite de 5 preguntas
      setPreguntas([...preguntas, { pregunta: '', opciones: ['', '', ''], respuestaCorrecta: 0 }]);
    }
  };

  const eliminarPregunta = (index) => {
    if (preguntas.length > 1) { // Siempre debe haber al menos una pregunta
      const nuevasPreguntas = preguntas.filter((_, i) => i !== index);
      setPreguntas(nuevasPreguntas);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validación simple
    if (!titulo.trim() || preguntas.some(p => !p.pregunta.trim() || p.opciones.some(o => !o.trim()))) {
      setError('El título, todas las preguntas y todas las opciones son obligatorios.');
      return;
    }
    setIsLoading(true);
    setError('');
    let wasSuccessful = false;

    try {
      const nuevoContenido = {
        curso_id,
        tipo: 'cuestionario',
        titulo,
        // Guardamos la descripción y el array de preguntas.
        contenido_json: { descripcion, preguntas },
        orden: 0
      };
  
      const { error: insertError } = await supabase
        .from('contenidos')
        .insert(nuevoContenido);
  
      if (insertError) throw insertError; // Si hay error, salta al catch

      wasSuccessful = true; // Si todo va bien, marcamos como exitoso
    } catch (error) {
      console.error('Error al agregar cuestionario:', error);
      setError('No se pudo guardar el cuestionario. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false); // Se asegura de que el spinner de carga se oculte siempre.
    }

    if (wasSuccessful) onContentAdded(); // Si fue exitoso, cerramos el modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>Agregar Nuevo Cuestionario</h2>
          <div className="form-group">
            <label htmlFor="titulo">Título del Cuestionario</label>
            <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Prueba de Conocimientos - Unidad 1" disabled={isLoading} />
          </div>
          <div className="form-group">
            <label htmlFor="descripcion">Descripción (Opcional)</label>
            <textarea id="descripcion" rows="4" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Describe el propósito de este cuestionario..." disabled={isLoading} />
          </div>

          <hr className="form-divider" />
          
          {preguntas.map((p, pIndex) => (
            <div key={pIndex} className="pregunta-editor">
              <div className="pregunta-header">
                <h4>Pregunta {pIndex + 1}</h4>
                {preguntas.length > 1 && <button type="button" className="btn-delete" onClick={() => eliminarPregunta(pIndex)}>Eliminar</button>}
              </div>
              <input 
                type="text" 
                placeholder={`Texto de la pregunta ${pIndex + 1}`}
                value={p.pregunta}
                onChange={(e) => handlePreguntaChange(pIndex, 'pregunta', e.target.value)}
                disabled={isLoading}
              />
              <label className="opciones-label">Opciones (marca la correcta):</label>
              {p.opciones.map((opcion, oIndex) => (
                <div key={oIndex} className="opcion-editor">
                  <input type="radio" name={`correcta-${pIndex}`} checked={p.respuestaCorrecta === oIndex} onChange={() => handlePreguntaChange(pIndex, 'respuestaCorrecta', oIndex)} disabled={isLoading} />
                  <input type="text" placeholder={`Opción ${oIndex + 1}`} value={opcion} onChange={(e) => handleOpcionChange(pIndex, oIndex, e.target.value)} disabled={isLoading} />
                </div>
              ))}
            </div>
          ))}

          {preguntas.length < 5 && <button type="button" className="btn-add-pregunta" onClick={agregarPregunta} disabled={isLoading}>+ Agregar Pregunta</button>}

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Crear Cuestionario'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCuestionarioModal;