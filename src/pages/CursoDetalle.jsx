/*
  Archivo: CursoDetalle.jsx
   Función: Muestra la página de detalle de un curso, incluyendo el hero, la lista de contenidos con lógica de bloqueo y el progreso del usuario.
  Tipo: Componente de Frontend.
*/
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { BookOpen, Video, HelpCircle, Lock, Trash2, Edit, ChevronRight, ListOrdered } from 'lucide-react';
import CursoHero from '../components/CursoHero';

import ContentViewerModal from '../components/ContentViewerModal';
import { useRouteLoading } from '../components/RouteLoadingContext';
import './CursoDetalle.css'; // Importamos los nuevos estilos


/**
 * Otorga un logro a un usuario por completar un curso.
 * Si el logro para ese curso no existe, lo crea automáticamente.
 * @param {string} userId - El ID del usuario que completó el curso.
 * @param {string} courseName - El nombre del curso, usado para encontrar/crear el logro.
 */
const otorgarLogroPorCursoCompletado = async (idUsuario, nombreCurso) => {
  try {
    const tituloLogro = `Completaste: ${nombreCurso}`;

    // Paso 1: Buscar si el logro para este curso ya fue creado por un administrador.
    // Se elimina la lógica que intentaba crear logros, ya que eso viola las políticas de seguridad (RLS)
    // para usuarios no administradores y es la causa del error 403 Forbidden.
    const { data: logrosExistentes, error: logroError } = await supabase
      .from('logros')
      .select('id')
      .eq('titulo', tituloLogro)
      .limit(1);

    if (logroError) {
      throw logroError;
    }

    // Si no se encuentra un logro predefinido para este curso, se detiene el proceso.
    if (!logrosExistentes || logrosExistentes.length === 0) {
      console.warn(`No se encontró un logro predefinido para el curso "${nombreCurso}". No se otorgará ningún logro. Un administrador debe crearlo primero.`);
      return;
    }

    const logroId = logrosExistentes[0].id;

    // Paso 2: Verificar si el usuario ya tiene este logro para no duplicarlo.
    const { count, error: checkError } = await supabase
      .from('logros_obtenidos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', idUsuario)
      .eq('logro_id', logroId);

    if (checkError) throw checkError;

    if (count > 0) {
      console.log(`El usuario ya tiene el logro para "${nombreCurso}".`);
      return;
    }

    // Paso 3: Otorgar el logro insertando el registro en la tabla de unión.
    await supabase.from('logros_obtenidos').insert({ user_id: idUsuario, logro_id: logroId });
    console.log(`¡Logro "${tituloLogro}" otorgado al usuario ${idUsuario}!`);
  } catch (error) {
    console.error('Error en el proceso de otorgar logro:', error);
  }
};

const CursoDetalle = ({ terminoDeBusqueda = '', rolUsuario, onEditContentClick }) => {
  const esAdmin = rolUsuario === 'administrador';
  const { id: idCurso } = useParams(); // Obtiene el ID del curso de la URL y lo renombra
  const [curso, definirCurso] = useState(null);
  const [contenidos, setContenidos] = useState([]);
  const [contenidoSeleccionado, definirContenidoSeleccionado] = useState(null); // Estado para el contenido a visualizar
  const [contenidosCompletados, definirContenidosCompletados] = useState(new Set());
  const [idUsuario, definirIdUsuario] = useState(null);
  const { setIsRouteLoading } = useRouteLoading(); // Usamos el estado de carga global
  const [highlightedContentId, setHighlightedContentId] = useState(null); // Nuevo estado para resaltar
  const [searchParams, setSearchParams] = useSearchParams();
  const [draggedIndex, setDraggedIndex] = useState(null); // Estado para el drag and drop


  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este contenido? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsRouteLoading(true);
    try {
      // 1. Intenta eliminar el registro de la base de datos.
      const { error } = await supabase
        .from('contenidos')
        .delete()
        .eq('id', contentId);

      // 2. Si hay un error (por RLS o cualquier otra causa), lo lanzamos para que lo capture el 'catch'.
      if (error) {
        throw error;
      }

      // 3. Si NO hubo error, la eliminación fue exitosa. Actualizamos la interfaz.
      // NOTA: La eliminación de archivos de video del storage se puede añadir aquí si es necesario,
      // pero la prioridad es asegurar que la eliminación de la base de datos funcione.
      setContenidos(prevContenidos => prevContenidos.filter(c => c.id !== contentId));
      console.log('Contenido eliminado con éxito.');

    } catch (error) {
      console.error('Error al eliminar el contenido:', error);
      alert(`No se pudo eliminar el contenido. Causa probable: Permisos insuficientes (RLS). Error: ${error.message}`);
    } finally {
      setIsRouteLoading(false);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDrop = async (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    // 1. Reordenar localmente para una UI instantánea
    const reorderedContenidos = [...contenidos];
    const [draggedItem] = reorderedContenidos.splice(draggedIndex, 1);
    reorderedContenidos.splice(targetIndex, 0, draggedItem);
    
    setContenidos(reorderedContenidos);
    setDraggedIndex(null);

    // 2. Preparar los datos para actualizar el 'orden' en la base de datos
    const updates = reorderedContenidos.map((content, index) => ({
      id: content.id,
      orden: index,
    }));

    // 3. Enviar las actualizaciones a Supabase
    try {
      const { error } = await supabase.from('contenidos').upsert(updates);
      if (error) throw error;
      console.log('Orden del contenido actualizado con éxito.');
    } catch (error) {
      console.error('Error al actualizar el orden del contenido:', error);
      alert('No se pudo guardar el nuevo orden. La página se recargará para restaurar el orden anterior.');
      window.location.reload();
    }
  };
  useEffect(() => {
    const cargarDatosCurso = async () => {
      setIsRouteLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsRouteLoading(false);
        return;
      }
      definirIdUsuario(user.id);

      // --- CARGA DE DATOS DESDE SUPABASE ---
      const [respuestaCurso, respuestaContenidos, respuestaCompletados] = await Promise.all([
        // Se elimina .single() para evitar el error 406 si el curso no se encuentra.
        // Se manejará el caso de que no se devuelvan datos.
        supabase.from('cursos').select('*').eq('id', idCurso),
        supabase.from('contenidos').select('*').eq('curso_id', idCurso).order('orden', { ascending: true }),
        supabase.from('contenido_completado').select('contenido_id').eq('user_id', user.id).eq('curso_id', idCurso)
      ]);

      // Verificamos si la consulta del curso devolvió un resultado.
      if (respuestaCurso.data && respuestaCurso.data.length > 0) {
        definirCurso(respuestaCurso.data[0]);
      } else {
        console.error("Curso no encontrado con ID:", idCurso);
        definirCurso(null); // Asegura que se muestre el mensaje "Curso no encontrado"
      }

      if (respuestaContenidos.data) {
        setContenidos(respuestaContenidos.data);
      }
      if (respuestaCompletados.data) {
        definirContenidosCompletados(new Set(respuestaCompletados.data.map(c => c.contenido_id)));
      }

      // --- LÓGICA PARA ABRIR CONTENIDO DESDE URL (CHAT IA) ---
      const contentToOpenId = searchParams.get('open');
      if (contentToOpenId && respuestaContenidos.data) {
        const allContents = respuestaContenidos.data;
        const completedContents = new Set(respuestaCompletados.data.map(c => c.contenido_id));
        const contentToOpen = allContents.find(c => c.id.toString() === contentToOpenId);

        if (contentToOpen) {
          setHighlightedContentId(contentToOpen.id); // Guardamos el ID para resaltarlo
          const contentIndex = allContents.findIndex(c => c.id === contentToOpen.id);
          let isLocked = false;
          // Replicamos la lógica de bloqueo para verificar si se puede abrir.
          if (rolUsuario !== 'administrador' && contentIndex > 0) {
            for (let i = 0; i < contentIndex; i++) {
              if (!completedContents.has(allContents[i].id)) {
                isLocked = true;
                break;
              }
            }
          }

          if (!isLocked) {
            definirContenidoSeleccionado(contentToOpen);
          } else {
            alert("Cerebrito intentó llevarte a un contenido que aún está bloqueado. ¡Sigue avanzando para desbloquearlo!");
          }

          // Limpiamos el parámetro de la URL para que no se vuelva a abrir al recargar.
          searchParams.delete('open');
          setSearchParams(searchParams, { replace: true });
        }
      }

      setIsRouteLoading(false);
    };

    if (idCurso) {
      cargarDatosCurso();
    }
    // Añadimos dependencias para que el efecto se ejecute si cambian.
  }, [idCurso, setIsRouteLoading, searchParams, setSearchParams, rolUsuario]);

  const marcarComoCompletado = async (idContenido) => {
    // Evita marcar como completado si no hay datos o si ya está completado.
    if (!idUsuario || !idCurso || !idContenido || contenidosCompletados.has(idContenido)) return;

    // Actualización optimista de la UI: el usuario ve el cambio al instante.
    const nuevoSetCompletados = new Set(contenidosCompletados).add(idContenido);
    definirContenidosCompletados(nuevoSetCompletados);

    // --- LÓGICA DE LOGROS ---
    if (contenidos.length > 0 && nuevoSetCompletados.size === contenidos.length && curso) {
      console.log(`¡Curso "${curso.curso}" completado! Otorgando logro...`);
      otorgarLogroPorCursoCompletado(idUsuario, curso.curso);
    }

    // --- SINCRONIZACIÓN CON SUPABASE ---
    const registroCompletado = {
      user_id: idUsuario,
      contenido_id: idContenido,
      curso_id: idCurso,
    };

    try {
      const { error } = await supabase.from('contenido_completado').upsert(registroCompletado);
      if (error) throw error;
      console.log('Contenido marcado como completado y sincronizado.');
    } catch (err) {
      console.error("Error al sincronizar 'marcar como completado':", err);
    }
  };

  if (!curso) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Curso no encontrado.</h2></div>;
  }

  return (
    <div className="curso-detalle-page">
      <CursoHero course={curso} />
      <div className="contenido-curso-container">
        <h2>Contenido del Módulo</h2>
        {contenidos.length > 0 ? (
          <div className="contenidos-grid">
            {contenidos.map((item, index) => {
              const estaCompletado = contenidosCompletados.has(item.id);
              
              // Lógica de bloqueo mejorada: un contenido está bloqueado si CUALQUIER contenido anterior no está completado.
              const estaBloqueado = (() => {
                // Los administradores pueden ver todo el contenido sin restricciones.
                if (esAdmin) {
                  return false;
                }

                if (index === 0) return false; // El primer contenido nunca está bloqueado para otros usuarios.
                
                // Para usuarios normales, verificar el progreso secuencial.
                for (let i = 0; i < index; i++) {
                  if (!contenidosCompletados.has(contenidos[i].id)) {
                    return true; // Si se encuentra un contenido anterior sin completar, se bloquea.
                  }
                }
                return false; // Si todos los anteriores están completos, se desbloquea.
              })();

              // Lógica de búsqueda: si no coincide con el término, no se renderiza.
              const coincideConBusqueda = item.titulo.toLowerCase().includes(terminoDeBusqueda.toLowerCase());
              if (terminoDeBusqueda && !coincideConBusqueda) {
                return null;
              }

              const Icon = {
                lectura: BookOpen,
                video: Video,
                cuestionario: HelpCircle,
                ordenar_pasos: ListOrdered,
              }[item.tipo] || HelpCircle; // Icono por defecto si el tipo no se reconoce

              return (
                <div 
                  key={item.id} 
                  className={`contenido-item-card ${estaBloqueado ? 'is-locked' : 'is-clickable'} ${item.id === highlightedContentId ? 'highlighted-by-ai' : ''} ${index === draggedIndex ? 'dragging' : ''}`}
                  onClick={!estaBloqueado ? () => definirContenidoSeleccionado(item) : undefined}
                  role={!estaBloqueado ? 'button' : undefined}
                  tabIndex={!estaBloqueado ? 0 : -1}
                  // Props para Drag and Drop (solo para administradores)
                  draggable={esAdmin}
                  onDragStart={() => esAdmin && handleDragStart(index)}
                  onDragOver={(e) => esAdmin && e.preventDefault()}
                  onDrop={() => esAdmin && handleDrop(index)}
                >
                  <div className="contenido-icon-container">
                    {Icon && <Icon size={24} />}
                  </div>
                  <div className="contenido-text-container">
                    <h3>{item.titulo}</h3>
                    <p>
                      {item.tipo} {estaCompletado && !estaBloqueado && '✓'}
                    </p>
                  </div>
                  <div className="contenido-action-container">
                    {estaBloqueado ? (
                      <Lock size={24} className="lock-icon" />
                    ) : (
                      <ChevronRight size={24} className="access-icon" />
                    )}
                    {/* Mostramos los botones de admin solo si el usuario tiene el rol correcto */}
                    {esAdmin && (
                      <>
                        <button
                          className="edit-contenido-btn"
                          onClick={(e) => { e.stopPropagation(); onEditContentClick(item); }}
                          title="Editar contenido"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="delete-contenido-btn" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContent(item.id);
                          }} 
                          title="Eliminar contenido"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Este módulo aún no tiene contenido. ¡Los administradores pueden empezar a agregarlo!</p>
        )}
      </div>
      {/* Renderiza el modal del visor si hay un contenido seleccionado */}
      {contenidoSeleccionado && (
        <ContentViewerModal content={contenidoSeleccionado} onClose={() => definirContenidoSeleccionado(null)} onMarkAsComplete={marcarComoCompletado} isCompleted={contenidosCompletados.has(contenidoSeleccionado.id)} />
      )}
    </div>
  );
};

export default CursoDetalle;