/*
  Archivo: AdminAptitudesPage.jsx
  Función: Página de administración para crear, editar, eliminar y vincular aptitudes a cursos.
  Tipo: Componente de Frontend (Página de Administración).
*/
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Plus, Trash2, Edit, X, Save } from 'lucide-react';
import './AdminAptitudesPage.css'; // Asumimos que crearemos este archivo de estilos

const AdminAptitudesPage = () => {
  const [aptitudes, setAptitudes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newAptitudNombre, setNewAptitudNombre] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the edit modal
  const [editingAptitud, setEditingAptitud] = useState(null);
  const [selectedCursos, setSelectedCursos] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Hacemos un join para traer los cursos vinculados con cada aptitud
        const { data: aptitudesData, error: aptitudesError } = await supabase
          .from('aptitudes')
          .select('*, cursos_aptitudes(curso_id)')
          .order('nombre', { ascending: true });
        
        if (aptitudesError) throw aptitudesError;

        const { data: cursosData, error: cursosError } = await supabase
          .from('cursos')
          .select('id, curso')
          .order('curso', { ascending: true });

        if (cursosError) throw cursosError;

        setAptitudes(aptitudesData);
        setCursos(cursosData);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("No se pudieron cargar los datos. Revise la consola.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddAptitud = async (e) => {
    e.preventDefault();
    if (!newAptitudNombre.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('aptitudes')
        .insert({ nombre: newAptitudNombre.trim() })
        .select('*, cursos_aptitudes(curso_id)') // Pedimos el mismo formato que el fetch inicial
        .single();
      
      if (error) throw error;

      setAptitudes([...aptitudes, data]);
      setNewAptitudNombre('');
    } catch (err) {
      console.error("Error adding aptitude:", err);
      alert("No se pudo crear la aptitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAptitud = async (aptitudId) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta aptitud? Se desvinculará de todos los cursos.")) return;

    try {
      // La eliminación en cascada en la BD se encarga de los vínculos en `curso_aptitud`
      const { error } = await supabase.from('aptitudes').delete().eq('id', aptitudId);
      if (error) throw error;

      setAptitudes(aptitudes.filter(a => a.id !== aptitudId));
    } catch (err) {
      console.error("Error deleting aptitude:", err);
      alert("No se pudo eliminar la aptitud.");
    }
  };

  const openEditModal = (aptitud) => {
    setEditingAptitud(aptitud);
    const linkedCursos = new Set(aptitud.cursos_aptitudes.map(link => link.curso_id));
    setSelectedCursos(linkedCursos);
  };

  const closeEditModal = () => {
    setEditingAptitud(null);
    setSelectedCursos(new Set());
  };

  const handleCursoSelection = (cursoId) => {
    const newSelection = new Set(selectedCursos);
    if (newSelection.has(cursoId)) {
      newSelection.delete(cursoId);
    } else {
      newSelection.add(cursoId);
    }
    setSelectedCursos(newSelection);
  };

  const handleSaveChanges = async () => {
    if (!editingAptitud) return;
    setIsSubmitting(true);

    try {
      // 1. Eliminar todos los vínculos existentes para esta aptitud
      const { error: deleteError } = await supabase
        .from('cursos_aptitudes')
        .delete()
        .eq('aptitud_id', editingAptitud.id);
      
      if (deleteError) throw deleteError;

      // 2. Insertar los nuevos vínculos seleccionados
      const newLinks = Array.from(selectedCursos).map(cursoId => ({
        aptitud_id: editingAptitud.id,
        curso_id: cursoId,
      }));

      if (newLinks.length > 0) {
        const { error: insertError } = await supabase.from('cursos_aptitudes').insert(newLinks);
        if (insertError) throw insertError;
      }

      // 3. Actualizar el estado local para reflejar los cambios en la UI
      const updatedAptitudes = aptitudes.map(apt => {
        if (apt.id === editingAptitud.id) {
          return { ...apt, cursos_aptitudes: newLinks.map(l => ({ curso_id: l.curso_id })) };
        }
        return apt;
      });
      setAptitudes(updatedAptitudes);
      closeEditModal();

    } catch (err) {
      console.error("Error saving changes:", err);
      alert("No se pudieron guardar los cambios.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="admin-page-container">Cargando...</div>;
  if (error) return <div className="admin-page-container error-message">{error}</div>;

  return (
    <div className="admin-page-container">
      <h1>Administrar Aptitudes</h1>
      <p>Crea, edita y elimina las aptitudes que se mostrarán en los perfiles de los aprendices. Vincula cada aptitud a los cursos correspondientes.</p>

      <form onSubmit={handleAddAptitud} className="add-form">
        <input
          type="text"
          placeholder="Nombre de la nueva aptitud"
          value={newAptitudNombre}
          onChange={(e) => setNewAptitudNombre(e.target.value)}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          <Plus size={18} /> {isSubmitting ? 'Creando...' : 'Crear Aptitud'}
        </button>
      </form>

      <div className="admin-table-container">
        <table>
          <thead>
            <tr>
              <th>Aptitud</th>
              <th>Cursos Vinculados</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {aptitudes.map(aptitud => (
              <tr key={aptitud.id}>
                <td>{aptitud.nombre}</td>
                <td>{aptitud.cursos_aptitudes.length}</td>
                <td className="actions-cell">
                  <button onClick={() => openEditModal(aptitud)} className="action-btn edit-btn">
                    <Edit size={16} /> Editar Vínculos
                  </button>
                  <button onClick={() => handleDeleteAptitud(aptitud.id)} className="action-btn delete-btn">
                    <Trash2 size={16} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingAptitud && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editando: {editingAptitud.nombre}</h3>
              <button onClick={closeEditModal} className="close-btn"><X /></button>
            </div>
            <div className="modal-body">
              <p>Selecciona los cursos que desarrollan esta aptitud:</p>
              <div className="curso-checkbox-list">
                {cursos.map(curso => (
                  <label key={curso.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCursos.has(curso.id)}
                      onChange={() => handleCursoSelection(curso.id)}
                    />
                    {curso.curso}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeEditModal} className="btn-secondary">Cancelar</button>
              <button onClick={handleSaveChanges} className="btn-primary" disabled={isSubmitting}>
                <Save size={16} /> {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAptitudesPage;