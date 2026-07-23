/*
  Archivo: UserProgressPage.jsx
  Función: Muestra una tabla con el progreso del usuario actual en todos los cursos.
  Tipo: Componente de Frontend.
*/
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useRouteLoading } from '../components/RouteLoadingContext'; 
import UserProgressCard from '../components/UserProgressCard'; // Importamos el nuevo componente de tarjeta
import '../AdminProgresoPage.css'; // Reutilizamos los estilos de la página de admin

const UserProgressPage = () => {
  const [progressData, setProgressData] = useState([]);
  const { setIsRouteLoading } = useRouteLoading();

  useEffect(() => {
    const fetchProgress = async () => {
      setIsRouteLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuario no autenticado.");

        // Llamamos a la función RPC para obtener el progreso del usuario actual.
        const { data, error } = await supabase.rpc('get_user_course_progress', { p_user_id: user.id });
        if (error) throw error;

        // Adaptamos los datos para que sean compatibles con el nuevo componente de tarjeta.
        // Ya no necesitamos el nombre de usuario.
        const formattedData = data.map(item => ({
            id: item.course_id,
            courseName: item.course_name,
            progress: item.progress,
            status: item.progress === 100 ? 'Completado' : 'En Progreso'
        }));
        setProgressData(formattedData);

      } catch (err) {
        console.error("Error al cargar el progreso del usuario:", err);
        setProgressData([]);
      } finally {
        setIsRouteLoading(false);
      }
    };
    fetchProgress();
  }, [setIsRouteLoading]);

  return (
    <div className="admin-progreso-container">
      <h1>Mi Progreso</h1>
      {progressData.length > 0 ? (
        // Creamos una cuadrícula para las nuevas tarjetas de progreso.
        <div className="user-progress-grid">
          {progressData.map(item => (
            <UserProgressCard
              key={item.id}
              courseName={item.courseName}
              progress={item.progress}
              status={item.status}
            />
          ))}
        </div>
      ) : (
        <p>Aún no has iniciado ningún curso. ¡Empieza a aprender ahora!</p>
      )}
    </div>
  );
};

export default UserProgressPage;