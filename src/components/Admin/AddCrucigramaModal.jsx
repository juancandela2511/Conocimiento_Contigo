/*
  Archivo: AddCrucigramaModal.jsx
  Función: Modal con formulario para crear un nuevo contenido de tipo "crucigrama".
  Tipo: Componente de Frontend con interacción de Backend.
*/
import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AddModals.css'; // Reutilizamos estilos

const AddCrucigramaModal = ({ isOpen, onClose, onContentAdded, curso_id }) => {
  const [titulo, setTitulo] = useState('');
  const [jsonCrucigrama, setJsonCrucigrama] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !jsonCrucigrama.trim()) {
      setError('El título y los datos del crucigrama son obligatorios.');
      return;
    }
    
    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonCrucigrama);
    } catch (jsonError) {
      setError('El formato de los datos del crucigrama no es un JSON válido.');
      return;
    }

    setIsLoading(true);
    setError('');
    let wasSuccessful = false;

    try {
      const nuevoContenido = {
        curso_id,
        tipo: 'crucigrama',
        titulo,
        contenido_json: parsedJson,
        orden: 0
      };
  
      const { error: insertError } = await supabase
        .from('contenidos')
        .insert(nuevoContenido);
  
      if (insertError) throw insertError;

      wasSuccessful = true;
    } catch (err) {
      console.error('Error al agregar crucigrama:', err);
      setError('No se pudo guardar el contenido. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }

    if (wasSuccessful) onContentAdded();
  };

  const placeholderJson = `{\n  "size": 10,\n  "clues": {\n    "across": [\n      {"number": 1, "clue": "Pista horizontal", "answer": "RESPUESTA", "row": 0, "col": 0}\n    ],\n    "down": [\n      {"number": 2, "clue": "Pista vertical", "answer": "OTRA", "row": 0, "col": 3}\n    ]\n  }\n}`;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar Nuevo Crucigrama</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo-crucigrama">Título del Crucigrama</label>
            <input id="titulo-crucigrama" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Conceptos Básicos de Web" disabled={isLoading} />
          </div>
          <div className="form-group">
            <label htmlFor="contenido-crucigrama">Datos del Crucigrama (en formato JSON)</label>
            <textarea id="contenido-crucigrama" rows="10" value={jsonCrucigrama} onChange={(e) => setJsonCrucigrama(e.target.value)} placeholder={placeholderJson} disabled={isLoading} />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar Crucigrama'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCrucigramaModal;