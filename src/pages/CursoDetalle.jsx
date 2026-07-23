/*
  Archivo: CursoDetalle.jsx
  Función: Muestra la página de detalle de un curso, incluyendo el hero, la lista de contenidos con lógica de bloqueo y el progreso del usuario.
  Tipo: Componente de Frontend.
*/
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { BookOpen, Video, HelpCircle, Lock} from 'lucide-react';
import CursoHero from '../components/CursoHero';
import Loading from '../components/Loading';
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
    const descripcionLogro = `Has finalizado con éxito todos los contenidos del curso "${nombreCurso}".`;

    // Paso 1: Buscar si el logro ya existe.
    let { data: logro, error: logroError } = await supabase
      .from('logros')
      .select('id')
      .eq('titulo', tituloLogro)
      .single();

    // Paso 2: Si el logro no existe, crearlo.
    // 'PGRST116' es el código de Supabase para "no se encontraron filas".
    if (logroError && logroError.code === 'PGRST116') {
      console.log(`Logro para "${nombreCurso}" no encontrado. Creándolo automáticamente...`);
      const { data: nuevoLogro, error: createError } = await supabase
        .from('logros')
        .insert({
          titulo: tituloLogro,
          descripcion: descripcionLogro,
          // Aquí podrías definir un ícono por defecto si tu tabla 'logros' tiene esa columna.
          // icono_url: '/icons/default_trophy.png'
        })
        .select('id')
        .single();

      if (createError) throw createError;
      logro = nuevoLogro;
    } else if (logroError) {
      // Si hubo otro tipo de error al buscar, lo lanzamos.
      throw logroError;
    }

    if (!logro) throw new Error("No se pudo encontrar o crear el logro.");

    const logroId = logro.id;

    // Paso 3: Verificar si el usuario ya tiene este logro para no duplicarlo.
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

    // Paso 4: Otorgar el logro insertando el registro en la tabla.
    await supabase.from('logros_obtenidos').insert({ user_id: idUsuario, logro_id: logroId });
    console.log(`¡Logro "${tituloLogro}" otorgado al usuario ${idUsuario}!`);
  } catch (error) {
    console.error('Error en el proceso de otorgar logro:', error);
  }
};

const CursoDetalle = ({ terminoDeBusqueda = '' }) => {
  const { id: idCurso } = useParams(); // Obtiene el ID del curso de la URL y lo renombra
  const [curso, definirCurso] = useState(null);
  const [contenidos, setContenidos] = useState([]);
  const [contenidoSeleccionado, definirContenidoSeleccionado] = useState(null); // Estado para el contenido a visualizar
  const [contenidosCompletados, definirContenidosCompletados] = useState(new Set());
  const [idUsuario, definirIdUsuario] = useState(null);
  const { setIsRouteLoading } = useRouteLoading(); // Usamos el estado de carga global

  useEffect(() => {
    const cargarDatosCurso = async () => {
      setIsRouteLoading(true); // Activamos el cargador global

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuario no autenticado.");
        definirIdUsuario(user.id);

        // --- INTERACCIÓN CON EL BACKEND (BASE DE DATOS) ---
        // Cargamos el curso, sus contenidos y el progreso del usuario en paralelo.
        const [respuestaCurso, respuestaContenidos, respuestaCompletados] = await Promise.all([
          supabase.from('cursos').select('*').eq('id', idCurso).single(),
          supabase.from('contenidos').select('*').eq('curso_id', idCurso).order('orden', { ascending: true }),
          supabase.from('contenido_completado').select('contenido_id').eq('user_id', user.id).eq('curso_id', idCurso)
        ]);

        const { data: datosCurso, error: errorCurso } = respuestaCurso;
        const { data: datosContenidos, error: errorContenidos } = respuestaContenidos;
        const { data: datosCompletados, error: errorCompletados } = respuestaCompletados;

        if (errorCurso) throw errorCurso;
        definirCurso(datosCurso);

        if (errorContenidos) throw errorContenidos;
        setContenidos(datosContenidos);

        if (errorCompletados) throw errorCompletados;
        definirContenidosCompletados(new Set(datosCompletados.map(c => c.contenido_id)));

      } catch (err) {
        console.error("Error al cargar los datos del curso:", err);
        definirCurso(null);
        setContenidos([]);
      } finally {
        // Desactivamos el cargador global cuando todo ha terminado
        setIsRouteLoading(false);
      }
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
    // Verificamos si el curso se ha completado con este último contenido.
    if (contenidos.length > 0 && nuevoSetCompletados.size === contenidos.length) {
      console.log(`¡Curso "${curso.curso}" completado! Otorgando logro...`);
      // Llamamos a la función para dar el logro.
      otorgarLogroPorCursoCompletado(idUsuario, curso.curso);
    }

    try {
      // --- INTERACCIÓN CON EL BACKEND (BASE DE DATOS) ---
      // Usamos upsert para evitar errores si el registro ya existe por alguna razón.
      const { error } = await supabase.from('contenido_completado').upsert({
        user_id: idUsuario,
        contenido_id: idContenido,
        curso_id: idCurso,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Error al marcar como completado:", err);
      // Revertir la actualización optimista si la base de datos falla.
      definirContenidosCompletados(prev => {
        const newSet = new Set(prev);
        newSet.delete(idContenido);
        return newSet;
      });
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
                if (index === 0) return false; // El primer contenido nunca está bloqueado.
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
                <div key={item.id} className={`contenido-item-card ${estaBloqueado ? 'is-locked' : ''}`}>
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
                      <button className="ver-contenido-btn" onClick={() => definirContenidoSeleccionado(item)}>
                        Ver
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