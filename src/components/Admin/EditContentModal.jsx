/*
  Archivo: EditContentModal.jsx
  Función: Modal para editar el título de un contenido existente.
  Tipo: Componente de Frontend.
*/
import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AddModals.css'; // Reutilizamos estilos

const EditContentModal = ({ isOpen, onClose, content, onContentUpdated }) => {
  const [titulo, setTitulo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Cuando el modal se abre o el contenido cambia, actualizamos el título en el estado local.
  useEffect(() => {
    if (content) {
      setTitulo(content.titulo);
    }
  }, [content]);

  if (!isOpen || !content) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('El título no puede estar vacío.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase
        .from('contenidos')
        .update({ titulo: titulo.trim() })
        .eq('id', content.id)
        .select()
        .single();

      if (updateError) throw updateError;

      onContentUpdated(data); // Notificamos al padre que el contenido se actualizó
      onClose(); // Cerramos el modal

    } catch (err) {
      console.error('Error al actualizar el contenido:', err);
      setError('No se pudo actualizar el título. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Título del Contenido</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-content-title">Título</label>
            <input
              id="edit-content-title"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditContentModal;