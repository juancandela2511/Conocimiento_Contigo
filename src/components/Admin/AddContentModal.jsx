import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AddModals.css'; // Reutilizamos estilos existentes
import './AddContentModal.css'; // Añadimos estilos específicos para el cuestionario

const AddContentModal = ({ isOpen, onClose, onContentAdded, curso_id, contentType }) => {
  // Estado común para todos los tipos de contenido
  const [titulo, setTitulo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Estados específicos para cada tipo de contenido
  const [textoLectura, setTextoLectura] = useState('');
  const [videoFile, setVideoFile] = useState(null); // Para subida de archivo
  const [videoUrl, setVideoUrl] = useState(''); // Para subida por URL
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' o 'url'
  const [isDragging, setIsDragging] = useState(false); // Para la UI de arrastrar y soltar
  const [triggers, setTriggers] = useState([]);
  const [preguntas, setPreguntas] = useState([{ pregunta: '', opciones: ['', '', '', ''], respuestaCorrecta: '' }]);

  // Resetea los campos del formulario cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setTitulo('');
      setError('');
      setTextoLectura('');
      setVideoFile(null);
      setVideoUrl('');
      setUploadMethod('file');
      setTriggers([]);
      setPreguntas([{ pregunta: '', opciones: ['', '', '', ''], respuestaCorrecta: '' }]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Funciones para manejar el formulario de cuestionario ---
  const handlePreguntaChange = (index, field, value) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[index][field] = value;
    setPreguntas(nuevasPreguntas);
  };

  const handleOpcionChange = (preguntaIndex, opcionIndex, value) => {
    const nuevasPreguntas = [...preguntas];
    nuevasPreguntas[preguntaIndex].opciones[opcionIndex] = value;
    setPreguntas(nuevasPreguntas);
  };

  const agregarPregunta = () => {
    setPreguntas([...preguntas, { pregunta: '', opciones: ['', '', '', ''], respuestaCorrecta: '' }]);
  };

  // --- Funciones para manejar los triggers del video ---
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  // Handlers para la zona de arrastrar y soltar
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
      setVideoFile(e.dataTransfer.files[0]);
    }
  };

  const addTrigger = () => {
    setTriggers([...triggers, { time: '', pregunta: '', opciones: ['', '', ''], respuestaCorrecta: '' }]);
  };

  const handleTriggerChange = (tIndex, field, value) => {
    const newTriggers = [...triggers];
    newTriggers[tIndex][field] = value;
    setTriggers(newTriggers);
  };

  const handleTriggerOptionChange = (tIndex, oIndex, value) => {
    const newTriggers = [...triggers];
    newTriggers[tIndex].opciones[oIndex] = value;
    setTriggers(newTriggers);
  };

  const removeTrigger = (tIndex) => {
    setTriggers(triggers.filter((_, i) => i !== tIndex));
  };

  // --- Función principal para guardar el contenido ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    setIsSaving(true);
    setError('');

    let contenido_json = {};

    try {
      switch (contentType) {
        case 'lectura':
          contenido_json = { texto: textoLectura };
          break;
        case 'video':
          let finalVideoUrl = '';

          if (uploadMethod === 'file') {
            if (!videoFile) {
              throw new Error('Debes seleccionar un archivo de video para subir.');
            }
            const fileExt = videoFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('Videos')
              .upload(filePath, videoFile);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from('Videos')
              .getPublicUrl(filePath);
            finalVideoUrl = urlData.publicUrl;
          } else { // uploadMethod === 'url'
            if (!videoUrl.trim()) {
              throw new Error('La URL del video es obligatoria.');
            }
            try {
              new URL(videoUrl); // Valida si la URL tiene un formato correcto
            } catch (_) {
              throw new Error('La URL del video no es válida.');
            }
            finalVideoUrl = videoUrl;
          }

          if (triggers.some(t => !t.time || !t.pregunta.trim() || t.opciones.some(o => !o.trim()) || t.respuestaCorrecta === '')) {
            throw new Error('Para cada cuestionario en video, el tiempo, la pregunta, todas las opciones y la respuesta correcta son obligatorios.');
          }
          contenido_json = { url: finalVideoUrl, quizTriggers: triggers };
          break;
        case 'cuestionario':
          // Corrección: La validación debe ser `p.respuestaCorrecta === ''` para que el índice 0 sea válido.
          if (preguntas.some(p => !p.pregunta || p.opciones.some(o => !o) || p.respuestaCorrecta === '')) {
            throw new Error('Completa todos los campos del cuestionario, incluyendo la selección de una respuesta correcta.');
          }
          contenido_json = { preguntas };
          break;
        default:
          throw new Error('Tipo de contenido no válido.');
      }

      // Lógica común para obtener el orden e insertar en la base de datos
      const { data: maxOrderData, error: orderError } = await supabase
        .from('contenidos')
        .select('orden')
        .eq('curso_id', curso_id)
        .order('orden', { ascending: false })
        .limit(1)
        .single();

      if (orderError && orderError.code !== 'PGRST116') throw orderError;

      const nuevoOrden = maxOrderData ? maxOrderData.orden + 1 : 1;

      const { error: insertError } = await supabase
        .from('contenidos')
        .insert([{ curso_id, titulo, tipo: contentType, contenido_json, orden: nuevoOrden }]);

      if (insertError) throw insertError;

      onContentAdded();
      onClose();

    } catch (err) {
      console.error(`Error al guardar ${contentType}:`, err);
      setError(`No se pudo guardar el contenido. Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Renderiza los campos del formulario según el tipo de contenido ---
  const renderFormFields = () => {
    switch (contentType) {
      case 'lectura':
        return (
          <div className="form-group">
            <label htmlFor="lectura-texto">Texto del Contenido</label>
            <textarea id="lectura-texto" rows="10" value={textoLectura} onChange={(e) => setTextoLectura(e.target.value)} required />
          </div>
        );
      case 'video':
        return (
          <>
            <div className="upload-method-switcher">
              <button type="button" className={uploadMethod === 'file' ? 'active' : ''} onClick={() => setUploadMethod('file')}>Subir Archivo</button>
              <button type="button" className={uploadMethod === 'url' ? 'active' : ''} onClick={() => setUploadMethod('url')}>Usar URL</button>
            </div>

            {uploadMethod === 'file' ? (
              <div 
                className={`drop-zone ${isDragging ? 'is-dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('videoFileInput').click()}
              >
                <input id="videoFileInput" type="file" accept="video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                {videoFile ? (
                  <p>Archivo seleccionado: <strong>{videoFile.name}</strong></p>
                ) : (
                  <p>Arrastra y suelta un video aquí, o haz clic para seleccionarlo.</p>
                )}
              </div>
            ) : (
              <div className="form-group">
                <label htmlFor="videoUrl">URL del Video</label>
                <input id="videoUrl" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://ejemplo.com/video.mp4" required />
              </div>
            )}

            <hr className="form-divider" />
            <h3>Cuestionarios en Video (Opcional)</h3>
            {triggers.map((trigger, tIndex) => (
              <div key={tIndex} className="pregunta-editor">
                <div className="pregunta-header">
                  <h4>Cuestionario en el segundo:</h4>
                  <button type="button" className="btn-delete" onClick={() => removeTrigger(tIndex)}>Eliminar</button>
                </div>
                <input type="number" placeholder="Ej: 60" value={trigger.time} onChange={(e) => handleTriggerChange(tIndex, 'time', e.target.value)} style={{ marginBottom: '15px' }} />
                <input type="text" placeholder="Texto de la pregunta" value={trigger.pregunta} onChange={(e) => handleTriggerChange(tIndex, 'pregunta', e.target.value)} />
                <label className="opciones-label">Opciones (marca la correcta):</label>
                {trigger.opciones.map((opcion, oIndex) => (
                  <div key={oIndex} className="opcion-editor">
                    <input type="radio" name={`correcta-trigger-${tIndex}`} checked={trigger.respuestaCorrecta === oIndex} onChange={() => handleTriggerChange(tIndex, 'respuestaCorrecta', oIndex)} />
                    <input type="text" placeholder={`Opción ${oIndex + 1}`} value={opcion} onChange={(e) => handleTriggerOptionChange(tIndex, oIndex, e.target.value)} />
                  </div>
                ))}
              </div>
            ))}
            <button type="button" className="btn-add-pregunta" onClick={addTrigger}>+ Agregar Cuestionario</button>
          </>
        );
      case 'cuestionario':
        return (
          <div className="form-group-cuestionario">
            {preguntas.map((p, pIndex) => (
              <div key={pIndex} className="pregunta-block">
                <label>Pregunta {pIndex + 1}</label>
                <input type="text" placeholder={`Texto de la pregunta ${pIndex + 1}`} value={p.pregunta} onChange={(e) => handlePreguntaChange(pIndex, 'pregunta', e.target.value)} />
                <label>Opciones</label>
                {p.opciones.map((opcion, oIndex) => (
                  <input key={oIndex} type="text" placeholder={`Opción ${oIndex + 1}`} value={opcion} onChange={(e) => handleOpcionChange(pIndex, oIndex, e.target.value)} />
                ))}
                <label>Respuesta Correcta</label>
                <input type="text" placeholder="Escribe el texto exacto de la opción correcta" value={p.respuestaCorrecta} onChange={(e) => handlePreguntaChange(pIndex, 'respuestaCorrecta', e.target.value)} />
              </div>
            ))}
            <button type="button" onClick={agregarPregunta} className="btn-secondary">Añadir otra pregunta</button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar {contentType.charAt(0).toUpperCase() + contentType.slice(1)}</h2>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="contenido-titulo">Título del Contenido</label>
            <input id="contenido-titulo" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Introducción a React" required />
          </div>
          {renderFormFields()}
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSaving}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Contenido'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContentModal;