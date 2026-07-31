/*
  Archivo: UserProgressPage.jsx
  Función: Muestra al usuario su progreso personal en todos los cursos en los que está inscrito.
  Tipo: Página de Frontend.
*/
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useRouteLoading } from '../contexto/RouteLoadingContext';
import UserProgressCard from '../components/ui/UserProgressCard'; // Usamos la tarjeta de progreso reutilizable
import { BarChart2 } from 'lucide-react';
import './UserProgressPage.css'; // Nuevos estilos para esta página

const UserProgressPage = () => {
  const [progressData, setProgressData] = useState([]);
  const { setIsRouteLoading } = useRouteLoading();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProgress = async () => {
      setIsRouteLoading(true);
      setIsLoading(true);
      setError(null);
      try {
        // 1. Obtener el usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuario no autenticado.");

        // 2. Llamar a la función RPC para obtener el progreso del usuario
        const { data, error: rpcError } = await supabase.rpc('get_user_course_progress', {
          p_user_id: user.id,
        });

        if (rpcError) throw rpcError;

        // 3. Guardar los datos en el estado
        setProgressData(data || []);
      } catch (e) {
        console.error("Error al cargar el progreso del usuario:", e);
        setError("No se pudo cargar tu progreso. Inténtalo de nuevo más tarde.");
      } finally {
        setIsRouteLoading(false);
        setIsLoading(false);
      }
    };

    fetchUserProgress();
  }, [setIsRouteLoading]);

  if (isLoading) {
    // No mostramos nada más que el spinner global
    return null;
  }

  if (error) {
    return <div className="user-progreso-page error-container">{error}</div>;
  }

  return (
    <div className="user-progreso-page">
      <div className="user-progreso-header">
        <h1>Mi Progreso</h1>
        <p>Aquí puedes ver tu avance en cada uno de los módulos. ¡Sigue así!</p>
      </div>

      {progressData.length > 0 ? (
        <div className="user-progreso-grid">
          {progressData.map(progressItem => (
            <UserProgressCard key={progressItem.course_id} progress={progressItem} />
          ))}
        </div>
      ) : (
        <div className="no-progreso-container">
          <BarChart2 size={64} className="no-progreso-icon" />
          <h2>Aún no has iniciado ningún curso</h2>
          <p>Explora los módulos disponibles y comienza tu ruta de aprendizaje.</p>
        </div>
      )}
    </div>
  );
};

export default UserProgressPage;