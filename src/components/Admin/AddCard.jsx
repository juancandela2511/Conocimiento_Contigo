/*
  Archivo: AddCard.jsx
  Función: Proporciona un formulario modal para que los administradores creen nuevos cursos.
  Tipo: Componente de Frontend con interacciones de Backend.
*/

// Importaciones de React y Supabase.
import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import styles from './AddCard.module.css'; // Asegúrate de que esta línea esté correcta

// Definición del componente. Recibe funciones del componente padre (App.jsx).
export default function AddCard({ onCourseAdded, onClose }) {
  // Lógica de Frontend: Estados para manejar los datos del formulario.
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Estado para la vista previa de la imagen
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Estado para la UI de arrastrar y soltar

  // Función centralizada para manejar la selección de un archivo (ya sea por clic o por arrastre).
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Se activa cuando el usuario selecciona un archivo a través del input.
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // --- Handlers para la zona de arrastrar y soltar ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Lógica de Frontend que orquesta múltiples llamadas al Backend.
  const handleSave = async (e) => {
    e.preventDefault();
    // Validación en el Frontend.
    if (!title.trim() || !imageFile) {
      alert('El título y la imagen son obligatorios.');
      return;
    }

    setIsSaving(true);

    try {
      // --- INTERACCIÓN CON EL BACKEND (PASO 1: STORAGE) ---
      // Sube el archivo de imagen al bucket 'Imagenes' en Supabase Storage.
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; // Usar timestamp para nombre único
      const filePath = `${fileName}`; // La ruta del archivo dentro del bucket
      
      const { error: uploadError } = await supabase.storage
        .from('Imagenes')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // --- INTERACCIÓN CON EL BACKEND (PASO 2: OBTENER URL) ---
      // Obtiene la URL pública de la imagen recién subida para guardarla en la base de datos.
      const { data: urlData } = supabase.storage
        .from('Imagenes')
        .getPublicUrl(filePath);
      
      const imageUrl = urlData.publicUrl;

      // --- INTERACCIÓN CON EL BACKEND (PASO 3: BASE DE DATOS) ---
      // Inserta un nuevo registro en la tabla 'cursos' con el título y la URL de la imagen.
      const { data, error: insertError } = await supabase
        .from('cursos')
        .insert([{ curso: title, imagen_url: imageUrl }])
        .select()
        .single();
      
      if (insertError) throw insertError;

      // Lógica de Frontend: Actualiza la UI después de una operación exitosa en el Backend.
      onCourseAdded(data);
      setTitle('');
      setImageFile(null);
      setPreviewUrl(null);
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = ''; // Resetea el input de archivo
      }
      onClose(); // Cierra el modal.

    } catch (error) {
      // Lógica de Frontend: Manejo de errores para informar al usuario.
      console.error('Error al crear el módulo:', error);
      alert('No se pudo crear el módulo. Revisa la consola para más detalles.');
    } finally {
      // Lógica de Frontend: Se asegura de que el estado de carga se desactive siempre.
      setIsSaving(false);
    }
  };

  // Renderizado del formulario modal (Frontend).
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <form onSubmit={handleSave} className={styles.addForm}>
          <div className={styles.modalHeader}>
            <h3>Agregar Nuevo Módulo</h3>
            <button type="button" onClick={onClose} className={styles.closeButton}>&times;</button>
          </div>
          <input type="text" placeholder="Título del módulo" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSaving} required />
          
          {/* Nueva zona para arrastrar y soltar la imagen */}
          <div
            className={`${styles.dropZone} ${isSaving ? styles.disabled : ''} ${isDragging ? styles.isDragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isSaving && document.getElementById('file-input').click()}
          >
            <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} disabled={isSaving} />
            {previewUrl ? (
              <img src={previewUrl} alt="Vista previa" className={styles.imagePreview} />
            ) : (
              <p>Arrastra y suelta una imagen aquí, o haz clic para seleccionarla.</p>
            )}
          </div>

          <button type="submit" className={styles.saveButton} disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Módulo'}</button>
        </form>
      </div>
    </div>
  );
}