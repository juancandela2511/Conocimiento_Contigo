/*
  Archivo: CursoDetalle.jsx
   Función: Muestra la página de detalle de un curso, incluyendo el hero, la lista de contenidos con lógica de bloqueo y el progreso del usuario.
  Tipo: Componente de Frontend.
*/
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { BookOpen, Video, HelpCircle, Lock, Trash2, ChevronRight } from 'lucide-react';
import CursoHero from '../components/CursoHero';

import ContentViewerModal from '../components/ContentViewerModal';
import { useRouteLoading } from '../components/RouteLoadingContext'; // Importamos el hook de carga
import './CursoDetalle.css'; // Estilos para la lista de contenidos


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

const CursoDetalle = ({ terminoDeBusqueda = '', rolUsuario }) => {
  const { id: idCurso } = useParams(); // Obtiene el ID del curso de la URL y lo renombra
  const [curso, definirCurso] = useState(null);
  const [contenidos, setContenidos] = useState([]);
  const [contenidoSeleccionado, definirContenidoSeleccionado] = useState(null); // Estado para el contenido a visualizar
  const [contenidosCompletados, definirContenidosCompletados] = useState(new Set());
  const [idUsuario, definirIdUsuario] = useState(null);
  const { setIsRouteLoading } = useRouteLoading(); // Usamos el estado de carga global

  const handleDeleteContent = async (contentId) => {
    // Ventana de confirmación para evitar borrados accidentales.
    if (window.confirm('¿Estás seguro de que quieres eliminar este contenido? Esta acción no se puede deshacer.')) {
        try {
            setIsRouteLoading(true);

            // Buscamos el contenido para obtener sus detalles antes de borrarlo.
            const contentToDelete = contenidos.find(c => c.id === contentId);
            if (!contentToDelete) {
                throw new Error("Contenido no encontrado para eliminar.");
            }

            // 1. Elimina el registro de la tabla 'contenidos'.
            const { error: deleteError } = await supabase
                .from('contenidos')
                .delete()
                .eq('id', contentId);

            if (deleteError) throw deleteError;

            // 2. Si es un video subido a nuestro almacenamiento, elimina también el archivo.
            if (contentToDelete.tipo === 'video' && contentToDelete.contenido_json?.url) {
                const url = contentToDelete.contenido_json.url;
                const supabaseStorageUrlSignature = `/storage/v1/object/public/Videos/`;
                
                // Solo intentamos borrar si es una URL de nuestro storage.
                if (url.includes(supabaseStorageUrlSignature)) {
                    const filePath = url.split(supabaseStorageUrlSignature)[1];
                    if (filePath) {
                        const { error: storageError } = await supabase.storage.from('Videos').remove([filePath]);
                        if (storageError) {
                            // No detenemos el proceso, pero informamos del error.
                            console.error("Error eliminando el archivo del storage, pero el registro de la DB fue eliminado:", storageError);
                        }
                    }
                }
            }

            // 3. Actualiza la interfaz de usuario para reflejar el cambio al instante.
            setContenidos(prevContenidos => prevContenidos.filter(c => c.id !== contentId));
            console.log('Contenido eliminado con éxito.');

        } catch (error) {
            console.error('Error al eliminar el contenido:', error);
            alert(`No se pudo eliminar el contenido: ${error.message}`);
        } finally {
            setIsRouteLoading(false);
        }
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

      setIsRouteLoading(false);
    };

    if (idCurso) {
      cargarDatosCurso();
    }
  }, [idCurso, setIsRouteLoading]);

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
                if (rolUsuario === 'administrador') {
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
              }[item.tipo];

              return (
                <div 
                  key={item.id} 
                  className={`contenido-item-card ${estaBloqueado ? 'is-locked' : 'is-clickable'}`}
                  onClick={!estaBloqueado ? () => definirContenidoSeleccionado(item) : undefined}
                  role={!estaBloqueado ? 'button' : undefined}
                  tabIndex={!estaBloqueado ? 0 : -1}
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
                    {rolUsuario === 'administrador' && (
                      <button 
                        className="delete-contenido-btn" 
                        onClick={(e) => {
                          e.stopPropagation(); // Evita que se abra el modal al hacer clic en eliminar
                          handleDeleteContent(item.id);
                        }} 
                        title="Eliminar contenido"
                      >
                        <Trash2 size={18} />
                      </button>
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