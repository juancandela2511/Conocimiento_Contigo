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
import ContentViewerModal from '../components/ContentViewerModal'; // Importa el nuevo visor
import './CursoDetalle.css'; // Estilos para la lista de contenidos

const CursoDetalle = ({ terminoDeBusqueda = '' }) => {
  const { id } = useParams(); // Obtiene el ID del curso de la URL
  const [course, setCourse] = useState(null);
  const [contenidos, setContenidos] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null); // Estado para el contenido a visualizar
  const [isLoading, setIsLoading] = useState(true);
  const [completedContent, setCompletedContent] = useState(new Set());
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      setIsLoading(true);
      const startTime = Date.now();

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuario no autenticado.");
        setUserId(user.id);

        // --- INTERACCIÓN CON EL BACKEND (BASE DE DATOS) ---
        // Cargamos el curso, sus contenidos y el progreso del usuario en paralelo.
        const [courseResponse, contenidosResponse, completedResponse] = await Promise.all([
          supabase.from('cursos').select('*').eq('id', id).single(),
          supabase.from('contenidos').select('*').eq('curso_id', id).order('orden', { ascending: true }),
          supabase.from('contenido_completado').select('contenido_id').eq('user_id', user.id).eq('curso_id', id)
        ]);

        const { data, error } = courseResponse;
        const { data: contenidosData, error: contenidosError } = contenidosResponse;
        const { data: completedData, error: completedError } = completedResponse;

        if (error) throw error;
        setCourse(data);

        if (contenidosError) throw contenidosError;
        setContenidos(contenidosData);

        if (completedError) throw completedError;
        setCompletedContent(new Set(completedData.map(c => c.contenido_id)));

      } catch (err) {
        console.error("Error al cargar los datos del curso:", err);
        setCourse(null);
        setContenidos([]);
      } finally {
        // Se asegura de que la pantalla de carga desaparezca, pero esperando un mínimo de 2 segundos.
        const elapsedTime = Date.now() - startTime;
        const remainingTime = 2000 - elapsedTime;

        if (remainingTime > 0) {
          setTimeout(() => setIsLoading(false), remainingTime);
        } else {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      fetchCourseData();
    } 
   
    
  }, [id]);

  const handleMarkAsComplete = async (contentId) => {
    // Evita marcar como completado si no hay datos o si ya está completado.
    if (!userId || !id || !contentId || completedContent.has(contentId)) return;

    // Actualización optimista de la UI: el usuario ve el cambio al instante.
    setCompletedContent(prev => new Set(prev).add(contentId));

    try {
      // --- INTERACCIÓN CON EL BACKEND (BASE DE DATOS) ---
      const { error } = await supabase.from('contenido_completado').insert({
        user_id: userId,
        contenido_id: contentId,
        curso_id: id,
      });

      // Si hay un error (y no es porque ya existía), se revierte el cambio.
      if (error && error.code !== '23505') {
        throw error;
      }
    } catch (err) {
      console.error("Error al marcar como completado:", err);
      // Revertir la actualización optimista si la base de datos falla.
      setCompletedContent(prev => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return <Loading isLoading={true} />;
  }

  if (!course) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>Curso no encontrado.</h2></div>;
  }

  return (
    <div>
      <CursoHero course={course} />
      <div className="contenido-curso-container">
        <h2>Contenido del Módulo</h2>
        {contenidos.length > 0 ? (
          <div className="contenidos-grid">
            {contenidos.map((item, index) => {
              const isCompleted = completedContent.has(item.id);
              
              // Lógica de bloqueo mejorada: un contenido está bloqueado si CUALQUIER contenido anterior no está completado.
              const isLocked = (() => {
                if (index === 0) return false; // El primer contenido nunca está bloqueado.
                for (let i = 0; i < index; i++) {
                  if (!completedContent.has(contenidos[i].id)) {
                    return true; // Si se encuentra un contenido anterior sin completar, se bloquea.
                  }
                }
                return false; // Si todos los anteriores están completos, se desbloquea.
              })();

              // Lógica de búsqueda: si no coincide con el término, no se renderiza.
              const matchesSearch = item.titulo.toLowerCase().includes(terminoDeBusqueda.toLowerCase());
              if (terminoDeBusqueda && !matchesSearch) {
                return null;
              }

              const Icon = {
                lectura: BookOpen,
                video: Video,
                cuestionario: HelpCircle,
              }[item.tipo];

              return (
                <div key={item.id} className={`contenido-item-card ${isLocked ? 'is-locked' : ''}`}>
                  <div className="contenido-icon-container">
                    {Icon && <Icon size={24} />}
                  </div>
                  <div className="contenido-text-container">
                    <h3>{item.titulo}</h3>
                    <p>
                      {item.tipo} {isCompleted && !isLocked && '✓'}
                    </p>
                  </div>
                  <div className="contenido-action-container">
                    {isLocked ? (
                      <Lock size={24} className="lock-icon" />
                    ) : (
                      <button className="ver-contenido-btn" onClick={() => setSelectedContent(item)}>
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
      {selectedContent && (
        <ContentViewerModal content={selectedContent} onClose={() => setSelectedContent(null)} onMarkAsComplete={handleMarkAsComplete} isCompleted={completedContent.has(selectedContent.id)} />
      )}
    </div>
  );
};

export default CursoDetalle;