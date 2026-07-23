/*
  Archivo: EditUserRoleModal.jsx
  Función: Renderiza un modal para cambiar el rol de un usuario.
  Tipo: Componente de Administración (Frontend).
*/
import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AddModals.css'; // Reutilizamos estilos

export default function EditUserRoleModal({ isOpen, onClose, user, onUserUpdated }) {
  const [newRole, setNewRole] = useState(user.profile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const { data, error: updateError } = await supabase
        .from('Usuario')
        .update({ profile: newRole })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      onUserUpdated(data);
      onClose();
    } catch (err) {
      console.error("Error al actualizar el rol del usuario:", err);
      setError("No se pudo actualizar el rol. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Rol de {user.usuario || user.email}</h2>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="role-select">Rol del Usuario</label>
            <select id="role-select" value={newRole} onChange={(e) => setNewRole(e.target.value)} disabled={isSaving}>
              <option value="usuario">Usuario</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}