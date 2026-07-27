/*
  Archivo: AnunciosPanel.jsx
  Función: Renderiza un panel lateral con anuncios importantes.
  Tipo: Componente de Frontend.
*/
import { useState, useEffect } from 'react';
import { Pin, StickyNote, X, Book } from 'lucide-react';
import { supabase } from '../services/supabaseClient'; // Importamos supabase
import './AnunciosPanel.css';

// El componente ahora recibe el rol del usuario para mostrar/ocultar las opciones de admin.
export default function AnunciosPanel({ rolUsuario }) {
  // Hacemos la comprobación del rol más robusta:
  // 1. `?.` para evitar errores si rolUsuario es nulo.
  // 2. `.toLowerCase()` para ignorar mayúsculas/minúsculas.
  const esAdmin = rolUsuario?.toLowerCase() === 'administrador';
  const [isOpen, setIsOpen] = useState(false);
  const [isApuntesOpen, setIsApuntesOpen] = useState(false);
  const [apuntes, setApuntes] = useState('');
  
  // --- Estados para manejar los anuncios desde la base de datos ---
  const [anuncios, setAnuncios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- Estados para el formulario de nuevo anuncio (solo para admins) ---
  const [newTitulo, setNewTitulo] = useState('');
  const [newTexto, setNewTexto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Nuevo estado

  // Función para obtener los anuncios de la base de datos.
  const fetchAnuncios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnuncios(data);
    } catch (error) {
      console.error("Error al cargar los anuncios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect para cargar los anuncios desde Supabase cuando el panel se abre por primera vez.
  useEffect(() => {
    // Solo cargamos los anuncios si el panel está abierto, para no hacer peticiones innecesarias.
    if (isOpen) {
      fetchAnuncios();
    }
  }, [isOpen]); // Se ejecuta cada vez que 'isOpen' cambia.

  // Función para manejar la creación de un nuevo anuncio (solo admins).
  const handleAddAnuncio = async (e) => {
    e.preventDefault();
    if (!newTitulo.trim() || !newTexto.trim() || isSubmitting) {
      alert("El título y el texto no pueden estar vacíos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('anuncios')
        .insert([{ 
          title: newTitulo,   // Corregido para coincidir con la columna 'title' de la BD
          messege: newTexto   // Corregido para coincidir con la columna 'messege' de la BD
        }])
        .select(); // .select() devuelve el registro insertado

      if (error) throw error;

      // Actualización optimista: añadimos el nuevo anuncio al principio de la lista.
      setAnuncios(prevAnuncios => [data[0], ...prevAnuncios]);
      
      // Limpiamos el formulario.
      setNewTitulo('');
      setNewTexto('');

    } catch (error) {
      console.error("Error al crear el anuncio:", error);
      alert("No se pudo crear el anuncio. Revisa los permisos de la tabla o la consola del navegador.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar la eliminación de un anuncio (solo admins).
  const handleDeleteAnuncio = async (anuncioId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este anuncio?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('anuncios')
        .delete()
        .eq('id', anuncioId);

      if (error) throw error;

      // Actualización optimista: filtramos el anuncio eliminado de la lista.
      setAnuncios(prevAnuncios => prevAnuncios.filter(a => a.id !== anuncioId));

    } catch (error) {
      console.error("Error al eliminar el anuncio:", error);
      alert("No se pudo eliminar el anuncio. Revisa los permisos de la tabla.");
    }
  };


  if (!isOpen) {
    return (
      <button className="announcement-fab" onClick={() => setIsOpen(true)}>
        <StickyNote size={28} />
        {/* El punto de notificación podría basarse en anuncios no leídos en el futuro */}
        {anuncios.length > 0 && <span className="announcement-notification-dot"></span>}
      </button>
    );
  }

  return (
    <aside className="announcements-panel">
      <div className="announcements-header">
        <h2>Anuncios</h2>
        <div className="header-actions">
          <button className="announcements-close-btn" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* El formulario ahora se muestra siempre que el usuario sea admin, sin necesidad de un botón. */}
      {esAdmin && (
        <form className="add-announcement-form" onSubmit={handleAddAnuncio}>
          <input 
            type="text" 
            placeholder="Título del anuncio" 
            value={newTitulo}
            onChange={(e) => setNewTitulo(e.target.value)}
            disabled={isSubmitting}
            required
          />
          <textarea 
            placeholder="Texto del anuncio..."
            value={newTexto}
            onChange={(e) => setNewTexto(e.target.value)}
            disabled={isSubmitting}
            required
          ></textarea>
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      )}

      <div className="announcements-content">
        {isLoading ? (
          <p>Cargando anuncios...</p>
        ) : anuncios.length === 0 ? (
          <p>No hay anuncios por el momento.</p>
        ) : (
          anuncios.map((anuncio, index) => (
            <div
              key={anuncio.id}
              className="announcement-item note"
              style={{ '--rotation': `${(index % 2 === 0 ? 1.5 : -1)}deg` }}
            >
              {/* Botón de eliminar, solo para admins */}
              {esAdmin && (
                <button 
                  className="note-delete-btn" 
                  onClick={() => handleDeleteAnuncio(anuncio.id)}
                  title="Eliminar anuncio"
                >
                  <X size={16} />
                </button>
              )}
              <Pin className="note-pin" size={24} />
              <h4>{anuncio.title}</h4>
              <p>{anuncio.messege}</p>
            </div>
          ))
        )}
      </div>
      <div className="apuntes-section">
        <button className="apuntes-header" onClick={() => setIsApuntesOpen(!isApuntesOpen)}>
          <span><Book size={16} /> Apuntes Temporales</span>
          {/* Icono de flecha que indica si está abierto o cerrado */}
          <span className={`apuntes-chevron ${isApuntesOpen ? 'open' : ''}`}>▼</span>
        </button>
        {isApuntesOpen && (
          <div className="apuntes-body">
            <textarea
              className="apuntes-textarea"
              value={apuntes}
              onChange={(e) => setApuntes(e.target.value)}
              placeholder="Escribe tus notas aquí. Se borrarán al recargar la página..."
            />
          </div>
        )}
      </div>
    </aside>
  );
}