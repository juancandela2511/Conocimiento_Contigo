/*
  Archivo: AddOrdenarPasosModal.jsx
  Función: Modal para crear un nuevo contenido de tipo "ordenar pasos".
  Tipo: Componente de Frontend con interacción de Backend.
*/
import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import './AddModals.css'; // Reutilizamos estilos

const AddOrdenarPasosModal = ({ isOpen, onClose, onContentAdded, curso_id }) => {
  const [titulo, setTitulo] = useState('');
  // El admin ingresa los pasos en el orden correcto.
  const [pasos, setPasos] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePasoChange = (index, value) => {
    const nuevosPasos = [...pasos];
    nuevosPasos[index] = value;
    setPasos(nuevosPasos);
  };

  const agregarPaso = () => {
    setPasos([...pasos, '']);
  };

  const eliminarPaso = (index) => {
    if (pasos.length > 1) {
      const nuevosPasos = pasos.filter((_, i) => i !== index);
      setPasos(nuevosPasos);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || pasos.some(p => !p.trim())) {
      setError('El título y todos los pasos son obligatorios.');
      return;
    }
    setIsLoading(true);
    setError('');
    let wasSuccessful = false;

    try {
      // Obtenemos el número actual de contenidos para asignar el orden correcto.
      const { count, error: countError } = await supabase
        .from('contenidos')
        .select('*', { count: 'exact', head: true })
        .eq('curso_id', curso_id);
      
      if (countError) throw countError;

      const nuevoOrden = count || 0;
      // Creamos el objeto JSON con los pasos, asignando un ID secuencial.
      const stepsData = pasos.map((texto, index) => ({
        id: index + 1,
        texto: texto.trim(),
      }));

      const nuevoContenido = {
        curso_id,
        tipo: 'ordenar_pasos',
        titulo,
        contenido_json: { steps: stepsData },
        orden: nuevoOrden // El nuevo contenido va al final
      };
  
      const { error: insertError } = await supabase
        .from('contenidos')
        .insert(nuevoContenido);
  
      if (insertError) throw insertError;

      wasSuccessful = true;
    } catch (err) {
      console.error('Error al agregar ejercicio de ordenar pasos:', err);
      setError('No se pudo guardar el contenido. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }

    if (wasSuccessful) onContentAdded();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar Ejercicio: Ordenar Pasos</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo-ordenar">Título del Ejercicio</label>
            <input id="titulo-ordenar" type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Pasos para crear un componente React" disabled={isLoading} />
          </div>
          
          <div className="form-group">
            <label>Pasos (en el orden correcto)</label>
            {pasos.map((paso, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  value={paso} 
                  onChange={(e) => handlePasoChange(index, e.target.value)} 
                  placeholder={`Paso ${index + 1}`}
                  style={{ flexGrow: 1 }}
                  disabled={isLoading}
                />
                {pasos.length > 1 && (
                  <button type="button" onClick={() => eliminarPaso(index)} className="btn-secondary" style={{ padding: '5px 10px' }} disabled={isLoading}>
                    X
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={agregarPaso} className="btn-secondary" disabled={isLoading}>
              + Agregar Paso
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>{isLoading ? 'Guardando...' : 'Guardar Ejercicio'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrdenarPasosModal;