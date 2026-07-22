import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import '../Admin/AddModals.css'; // Reutilizamos estilos compartidos para los modales

export default function EditCard({ isOpen, onClose, course, onCourseUpdated }) {
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // Para mostrar la imagen actual o la nueva
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Este efecto se ejecuta cuando el componente se monta o cuando la prop 'course' cambia.
  // Asegura que el formulario se inicialice con los datos del curso correcto.
  useEffect(() => {
    if (course) {
      setTitle(course.curso);
      setCurrentImageUrl(course.imagen_url);
      setImageFile(null); // Resetea el input de archivo cuando se selecciona un nuevo curso
      setError('');
    }
  }, [course]);

  // Si el modal no está abierto o no hay un curso para editar, no renderizamos nada.
  if (!isOpen || !course) return null;

  // Maneja la selección de un nuevo archivo de imagen.
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      // Muestra una vista previa de la nueva imagen seleccionada.
      setCurrentImageUrl(URL.createObjectURL(e.target.files[0]));
    } else {
      setImageFile(null);
      setCurrentImageUrl(course.imagen_url); // Si no se selecciona archivo, vuelve a la imagen original
    }
  };

  // Maneja el envío del formulario para guardar los cambios.
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título del módulo es obligatorio.');
      return;
    }

    setIsSaving(true);
    let newImageUrl = currentImageUrl; // Inicialmente, la URL de la imagen es la actual

    try {
      // 1. Si se ha seleccionado un nuevo archivo de imagen, lo subimos a Supabase Storage.
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        // Generamos un nombre de archivo único para evitar colisiones.
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('Imagenes') // Nombre de tu bucket de almacenamiento
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('Imagenes')
          .getPublicUrl(filePath);

        newImageUrl = urlData.publicUrl; // Actualizamos la URL de la imagen con la nueva.
      }

      // 2. Actualizamos el curso en la base de datos con el nuevo título y la URL de la imagen.
      const { data, error: updateError } = await supabase
        .from('cursos')
        .update({ curso: title, imagen_url: newImageUrl })
        .eq('id', course.id) // Aseguramos que se actualice el curso correcto
        .select() // Solicitamos los datos actualizados del curso
        .single(); // Esperamos un solo registro

      if (updateError) throw updateError;

      onCourseUpdated(data); // Notificamos al componente padre con los datos actualizados del curso
      onClose(); // Cerramos el modal

    } catch (err) {
      console.error('Error al actualizar el módulo:', err);
      setError('No se pudo actualizar el módulo. Inténtalo de nuevo.');
      // Si la subida falló, revertimos la vista previa de la imagen a la original del curso.
      if (imageFile) {
        setCurrentImageUrl(course.imagen_url);
      }
    } finally {
      setIsSaving(false); // Desactivamos el estado de carga.
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Módulo</h2>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="edit-title">Título del Módulo</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-image">Imagen del Módulo</label>
            {currentImageUrl && (
              <img src={currentImageUrl} alt="Current Course" style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px', borderRadius: '8px' }} />
            )}
            <input
              id="edit-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSaving}
            />
            <small>Selecciona una nueva imagen para reemplazar la actual.</small>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSaving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}