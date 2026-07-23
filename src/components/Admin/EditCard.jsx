import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AddModals.css'; // Reutilizamos estilos compartidos para los modales

export default function EditCard({ isOpen, onClose, course, onCourseUpdated }) {
  const [titulo, definirTitulo] = useState('');
  const [archivoImagen, definirArchivoImagen] = useState(null);
  const [urlImagenActual, definirUrlImagenActual] = useState(''); // Para mostrar la imagen actual o la nueva
  const [estaGuardando, definirEstaGuardando] = useState(false);
  const [error, definirError] = useState('');

  // Este efecto se ejecuta cuando el componente se monta o cuando la prop 'course' cambia.
  // Asegura que el formulario se inicialice con los datos del curso correcto.
  useEffect(() => {
    if (course) {
      definirTitulo(course.curso);
      definirUrlImagenActual(course.imagen_url);
      definirArchivoImagen(null); // Resetea el input de archivo cuando se selecciona un nuevo curso
      definirError('');
    }
  }, [course]);

  // Si el modal no está abierto o no hay un curso para editar, no renderizamos nada.
  if (!isOpen || !course) return null;

  // Se ejecuta cuando el usuario selecciona un nuevo archivo de imagen.
  const manejarCambioArchivo = (e) => {
    if (e.target.files?.[0]) {
      definirArchivoImagen(e.target.files[0]);
      // Muestra una vista previa de la nueva imagen seleccionada.
      definirUrlImagenActual(URL.createObjectURL(e.target.files[0]));
    } else {
      definirArchivoImagen(null);
      definirUrlImagenActual(course.imagen_url); // Si no se selecciona archivo, vuelve a la imagen original
    }
  };

  // Se ejecuta al enviar el formulario para guardar los cambios.
  const manejarGuardado = async (e) => {
    e.preventDefault();
    definirError('');

    if (!titulo.trim()) {
      definirError('El título del módulo es obligatorio.');
      return;
    }

    definirEstaGuardando(true);
    let nuevaUrlImagen = urlImagenActual; // Inicialmente, la URL de la imagen es la actual

    try {
      // 1. Si se ha seleccionado un nuevo archivo de imagen, lo subimos a Supabase Storage.
      if (archivoImagen) {
        const extensionArchivo = archivoImagen.name.split('.').pop();
        // Generamos un nombre de archivo único para evitar colisiones.
        const nombreArchivo = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extensionArchivo}`;
        const rutaArchivo = `${nombreArchivo}`;

        const { error: errorSubida } = await supabase.storage
          .from('Imagenes') // Nombre de tu bucket de almacenamiento
          .upload(rutaArchivo, archivoImagen);

        if (errorSubida) throw errorSubida;

        const { data: datosUrl } = supabase.storage
          .from('Imagenes')
          .getPublicUrl(rutaArchivo);

        nuevaUrlImagen = datosUrl.publicUrl; // Actualizamos la URL de la imagen con la nueva.
      }

      // 2. Actualizamos el curso en la base de datos con el nuevo título y la URL de la imagen.
      const { data, error: updateError } = await supabase
        .from('cursos')
        .update({ curso: titulo, imagen_url: nuevaUrlImagen })
        .eq('id', course.id) // Aseguramos que se actualice el curso correcto
        .select() // Solicitamos los datos actualizados del curso
        .single(); // Esperamos un solo registro

      if (updateError) throw updateError;

      onCourseUpdated(data); // Notificamos al componente padre con los datos actualizados del curso
      onClose(); // Cerramos el modal

    } catch (err) {
      console.error('Error al actualizar el módulo:', err);
      definirError('No se pudo actualizar el módulo. Inténtalo de nuevo.');
      // Si la subida falló, revertimos la vista previa de la imagen a la original del curso.
      if (archivoImagen) {
        definirUrlImagenActual(course.imagen_url);
      }
    } finally {
      definirEstaGuardando(false); // Desactivamos el estado de carga.
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar Módulo</h2>
        <form onSubmit={manejarGuardado}>
          <div className="form-group">
            <label htmlFor="edit-title">Título del Módulo</label>
            <input
              id="edit-title"
              type="text"
              value={titulo}
              onChange={(e) => definirTitulo(e.target.value)}
              disabled={estaGuardando}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-image">Imagen del Módulo</label>
            {urlImagenActual && (
              <img src={urlImagenActual} alt="Curso actual" style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px', borderRadius: '8px' }} />
            )}
            <input
              id="edit-image"
              type="file"
              accept="image/*"
              onChange={manejarCambioArchivo}
              disabled={estaGuardando}
            />
            <small>Selecciona una nueva imagen para reemplazar la actual.</small>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={estaGuardando}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={estaGuardando}>
              {estaGuardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}