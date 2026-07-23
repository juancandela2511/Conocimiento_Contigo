/*
  Archivo: LogrosPage.jsx
  Función: Muestra la página con la colección de logros obtenidos por el usuario.
  Tipo: Componente de Frontend.
*/
import { useEffect, useState } from 'react'; // Hooks de React
import { Trophy, Award } from 'lucide-react'; // Importamos los íconos de trofeo y premio
import { supabase } from '../services/supabaseClient';
import { useRouteLoading } from '../components/RouteLoadingContext'; // Importamos el hook de carga
import LogroItem from '../components/LogroItem';
import CompletedCourseCard from '../components/CompletedCourseCard'; // Importamos la nueva tarjeta
import './LogrosPage.css';

const LogrosPage = () => {
  const [logros, setLogros] = useState([]);
  const [cursosCompletados, setCursosCompletados] = useState([]);
  const [progresoCursos, setProgresoCursos] = useState({ completados: 0, total: 0 });
  const { setIsRouteLoading } = useRouteLoading(); // Usamos el estado de carga global

  useEffect(() => {
    const fetchDatos = async () => {
      setIsRouteLoading(true); // Activamos el cargador global
      try {
        // 1. Obtener el usuario actual para saber de quién son los logros.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuario no autenticado.");

        // Hacemos las dos consultas en paralelo para mayor eficiencia.
        const [logrosResponse, progressResponse, coursesResponse] = await Promise.all([
          supabase.from('logros_obtenidos').select('logros(*)').eq('user_id', user.id),
          supabase.rpc('get_user_course_progress', { p_user_id: user.id }),
          supabase.from('cursos').select('id, imagen_url') // Traemos las imágenes de los cursos
        ]);

        const { data, error } = logrosResponse;
        if (error) throw new Error(`Error al cargar logros: ${error.message}`);

        // 3. Mapear los datos para obtener una lista limpia de objetos de logro.
        const logrosObtenidos = data.map(item => item.logros);
        setLogros(logrosObtenidos);

        const { data: progressData, error: progressError } = progressResponse;
        if (progressError) throw new Error(`Error al cargar progreso: ${progressError.message}`);

        const { data: coursesData, error: coursesError } = coursesResponse;
        if (coursesError) throw new Error(`Error al cargar imágenes de cursos: ${coursesError.message}`);

        // Creamos un mapa de imágenes para un acceso rápido
        const courseImageMap = new Map(coursesData.map(c => [c.id, c.imagen_url]));

        // Calculamos el total de cursos y los completados.
        const cursosCompletadosData = progressData
          .filter(p => p.progress === 100)
          .map(p => ({ ...p, imagen_url: courseImageMap.get(p.course_id) })); // Añadimos la URL de la imagen

        const totalCursos = progressData.length;
        setProgresoCursos({ completados: cursosCompletadosData.length, total: totalCursos });
        setCursosCompletados(cursosCompletadosData);

      } catch (error) {
        console.error('Error al cargar los logros del usuario:', error);
        setLogros([]);
        setCursosCompletados([]);
        setProgresoCursos({ completados: 0, total: 0 });
      } finally {
        setIsRouteLoading(false); // Desactivamos el cargador global
      }
    };

    fetchDatos();
  }, []); // El array vacío asegura que se ejecute solo una vez.

  return (
    <div className="logros-page-container">
      <div className="logros-header">
        <h1>Mis Logros</h1>
        <p>¡Felicidades! Aquí puedes ver todas las medallas que has ganado completando cursos y desafíos.</p>
      </div>

      {/* Nuevo componente para mostrar el progreso general de cursos */}
      <div className="progreso-general-container">
        <Trophy className="progreso-general-icon" size={48} />
        <div className="progreso-general-text">
          <h2>Progreso de Cursos</h2>
          <p>Has completado <strong>{progresoCursos.completados}</strong> de <strong>{progresoCursos.total}</strong> cursos.</p>
        </div>
      </div>

      {/* Nueva sección para listar los cursos culminados */}
      <div className="cursos-culminados-container">
        <h3> ({cursosCompletados.length})</h3>
        {cursosCompletados.length > 0 ? (
          <div className="cursos-culminados-grid">
            {cursosCompletados.map((curso, index) => (
              <CompletedCourseCard 
                key={curso.course_id} 
                course={curso} 
                style={{ animationDelay: `${index * 100}ms` }} />
            ))}
          </div>
        ) : (
          <p className="no-cursos-culminados">Sigue esforzándote para ver tus cursos aquí.</p>
        )}
      </div>

      {logros.length > 0 ? (
        <div className="logros-grid">
          {logros.map(logro => (
            <LogroItem key={logro.id} logro={logro} /> // Renderiza cada logro
          ))}
        </div>
      ) : (
        <div className="no-logros">
          <Award size={64} className="no-logros-icon" /> {/* Ícono para el estado vacío */}
          <h2>¡Aún no tienes logros!</h2>
          <p>¡Sigue aprendiendo y pronto empezarás a coleccionar medallas y a ver tus cursos culminados aquí!</p>
        </div>
      )}
    </div>
  );
};

export default LogrosPage;