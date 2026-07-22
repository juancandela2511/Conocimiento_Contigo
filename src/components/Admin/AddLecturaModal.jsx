/*
  Archivo: AddLecturaModal.jsx
  Función: Modal con formulario para crear un nuevo contenido de tipo "lectura".
  Tipo: Componente de Frontend con interacción de Backend.
*/
import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AddModals.css'; // Estilos compartidos para los modales de "Agregar"

const AddLecturaModal = ({ isOpen, onClose, onContentAdded, curso_id }) => {
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !texto.trim()) {
      setError('El título y el contenido son obligatorios.');
      return;
    }
    setIsLoading(true);
    setError('');
    let wasSuccessful = false;

    try {
      // --- INTERACCIÓN CON EL BACKEND (BASE DE DATOS) ---
      const nuevoContenido = {
        curso_id,
        tipo: 'lectura',
        titulo,
        contenido_json: { texto }, // Guardamos el texto en un campo JSONB
        orden: 0 // Lógica de ordenación futura
      };
  
      const { error: insertError } = await supabase
        .from('contenidos')
        .insert(nuevoContenido);
  
      if (insertError) throw insertError; // Si hay error, salta al catch

      wasSuccessful = true; // Si todo va bien, marcamos como exitoso
    } catch (error) {
      console.error('Error al agregar lectura:', error);
      setError('No se pudo guardar el contenido. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false); // Se asegura de que el spinner de carga se oculte siempre.
    }

    if (wasSuccessful) onContentAdded(); // Si fue exitoso, cerramos el modal
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar Nueva Lectura</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo">Título de la Lectura</label>
            <input id="titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Introducción a la Comunicación" disabled={isLoading} />
          </div>
          <div className="form-group">
            <label htmlFor="contenido">Contenido</label>
            <textarea id="contenido" rows="10" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe aquí el texto de la lectura..." disabled={isLoading} />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar Lectura'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLecturaModal;