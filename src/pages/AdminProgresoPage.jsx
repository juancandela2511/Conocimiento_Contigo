/*
  Archivo: AdminProgresoPage.jsx
  Función: Muestra un dashboard de administración con el progreso de todos los aprendices,
           utilizando un componente de tabla y gráficos avanzados.
*/
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import ProgresoTable from '../components/ui/ProgresoTable';
import './AdminProgresoPage.css';

const PaginaProgresoAdmin = () => {
  const [progressData, setProgressData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllProgress = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Paso 1: Obtener todos los usuarios con sus detalles usando la función RPC.
        // Esta función une 'auth.users' con la tabla 'Usuario' para obtener el email y el rol.
        const { data: allUsers, error: usersError } = await supabase
          .rpc('get_all_users_with_details');

        if (usersError) throw usersError;

        // Filtramos para quedarnos solo con los aprendices.
        const users = allUsers.filter(u => u.profile === 'usuario' || u.profile === 'aprendiz');

        // Paso 2: Para cada usuario, obtener su progreso usando la función RPC.
        const progressPromises = users.map(user =>
          supabase.rpc('get_user_course_progress', { p_user_id: user.id })
            .then(({ data: progressData, error: progressError }) => {
              if (progressError) {
                console.error(`Error al obtener progreso para el usuario ${user.id}:`, progressError);
                return []; // Devolver un array vacío si hay un error para este usuario.
              }
              // Adjuntar la información del usuario a cada registro de progreso.
              return (progressData || []).map(progressItem => ({
                userId: user.id,
                userName: user.usuario, // El RPC devuelve el nombre de usuario como 'usuario' (minúscula)
                userEmail: user.email,
                courseId: progressItem.course_id,
                courseName: progressItem.course_name,
                progress: progressItem.progress,
              }));
            })
        );

        // Paso 3: Esperar a que todas las consultas de progreso terminen y aplanar el resultado.
        const allProgressNested = await Promise.all(progressPromises);
        const finalFlattenedData = allProgressNested.flat();

        setProgressData(finalFlattenedData);

      } catch (e) {
        console.error('Error cargando el progreso de todos los usuarios:', e);
        setError('No se pudo cargar la información de progreso. Inténtalo de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProgress();
  }, []);

  if (isLoading) return <div className="admin-progreso-loading">Cargando datos de progreso...</div>;
  if (error) return <div className="admin-progreso-error">{error}</div>;

  return (
    <div className="admin-progreso-page">
      <h1 className="admin-progreso-title">Panel de Progreso de Aprendices</h1>
      <ProgresoTable data={progressData} />
    </div>
  );
};

export default PaginaProgresoAdmin;