/*
  Archivo: AddVideoModal.jsx
  Función: Modal con formulario para subir un video a Cloudinary y guardar la URL en Supabase.
  Tipo: Componente de Frontend con interacción de Backend.
*/
/*
  Archivo: AddVideoModal.jsx
  Función: Modal con formulario para subir un video a Supabase Storage y guardar la URL en la base de datos.
  Tipo: Componente de Frontend con interacción de Backend.
*/
import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AddModals.css';

const AddVideoModal = ({ isOpen, onClose, onContentAdded, curso_id }) => {
  const [titulo, setTitulo] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [triggers, setTriggers] = useState([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const addTrigger = () => {
    setTriggers([...triggers, { time: '', pregunta: '', opciones: ['', '', ''], respuestaCorrecta: 0 }]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !videoFile) {
      setError('El título y el archivo de video son obligatorios.');
      return;
    }

    if (triggers.some(t => !t.time || !t.pregunta.trim() || t.opciones.some(o => !o.trim()))) {
      setError('Para cada cuestionario, el tiempo, la pregunta y todas las opciones son obligatorios.');
      return;
    }

    setIsLoading(true);
    setError('');
    let wasSuccessful = false;
    
    try {
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

      const videoUrl = urlData.publicUrl;

      const nuevoContenido = {
        curso_id,
        tipo: 'video',
        titulo,
        contenido_json: { url: videoUrl, quizTriggers: triggers },
        orden: 0
      };

      const { error: insertError } = await supabase
        .from('contenidos')
        .insert(nuevoContenido);

      if (insertError) throw insertError;

      wasSuccessful = true;
    } catch (error) {
      console.error('Error al agregar video:', error);
      setError('No se pudo guardar el video. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }

    if (wasSuccessful) onContentAdded();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar Nuevo Video</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo">Título del Video</label>
            <input 
              id="titulo" 
              type="text" 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              placeholder="Ej: Bienvenida al Módulo" 
              disabled={isLoading} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="videoFile">Archivo de Video</label>
            <input 
              id="videoFile" 
              type="file" 
              accept="video/*" 
              onChange={handleFileChange} 
              disabled={isLoading} 
            />
          </div>

          <hr className="form-divider" />

          <h3>Cuestionarios en Video (Opcional)</h3>

          {triggers.map((trigger, tIndex) => (
            <div key={tIndex} className="pregunta-editor">
              <div className="pregunta-header">
                <h4>Cuestionario en el segundo:</h4>
                <button type="button" className="btn-delete" onClick={() => removeTrigger(tIndex)}>Eliminar</button>
              </div>
              <input 
                type="number" 
                placeholder="Ej: 60" 
                value={trigger.time} 
                onChange={(e) => handleTriggerChange(tIndex, 'time', e.target.value)} 
                disabled={isLoading} 
                style={{marginBottom: '15px'}} 
              />
              <input 
                type="text" 
                placeholder="Texto de la pregunta" 
                value={trigger.pregunta} 
                onChange={(e) => handleTriggerChange(tIndex, 'pregunta', e.target.value)} 
                disabled={isLoading} 
              />
              <label className="opciones-label">Opciones (marca la correcta):</label>
              {trigger.opciones.map((opcion, oIndex) => (
                <div key={oIndex} className="opcion-editor">
                  <input 
                    type="radio" 
                    name={`correcta-trigger-${tIndex}`} 
                    checked={trigger.respuestaCorrecta === oIndex} 
                    onChange={() => handleTriggerChange(tIndex, 'respuestaCorrecta', oIndex)} 
                    disabled={isLoading} 
                  />
                  <input 
                    type="text" 
                    placeholder={`Opción ${oIndex + 1}`} 
                    value={opcion} 
                    onChange={(e) => handleTriggerOptionChange(tIndex, oIndex, e.target.value)} 
                    disabled={isLoading} 
                  />
                </div>
              ))}
            </div>
          ))}

          <button type="button" className="btn-add-pregunta" onClick={addTrigger} disabled={isLoading}>
            + Agregar Cuestionario
          </button>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVideoModal;