/*
  Archivo: AdminProgresoPage.jsx
  Función: Muestra una tabla con el progreso de todos los usuarios en los diferentes cursos.
           Esta página es exclusiva para administradores.
  Tipo: Componente de Frontend.
*/
import { useEffect } from 'react';
import { useAdminProgress } from './useAdminProgress'; // Hook personalizado
import { useRouteLoading } from './components/RouteLoadingContext'; // Importamos el hook de carga
import ProgresoTable from './ProgresoTable'; // Componente de la tabla
import './AdminProgresoPage.css';

const AdminProgresoPage = () => {
  // La lógica de fetching y procesamiento de datos ahora está en el hook.
  const { progressData, isLoading, error } = useAdminProgress();
  const { setIsRouteLoading } = useRouteLoading();

  // Sincronizamos el estado de carga del hook con el estado de carga global.
  useEffect(() => {
    setIsRouteLoading(isLoading);
    // Función de limpieza para asegurar que el cargador se apague si el componente se desmonta.
    return () => {
      setIsRouteLoading(false);
    };
  }, [isLoading, setIsRouteLoading]);

  // El cargador ya no se renderiza aquí, sino en App.jsx.
  // Solo manejamos el caso de error o el renderizado del contenido.
  if (error) {
    return <div className="admin-progreso-container"><p>Error al cargar los datos: {error.message}</p></div>;
  }

  return (
    <div className="admin-progreso-container">
      <h1>Progreso de Usuarios</h1>
      {progressData.length > 0 ? (
        <ProgresoTable data={progressData} />
      ) : (
        <p>Ningún usuario ha iniciado un curso todavía.</p>
      )}
    </div>
  );
};

export default AdminProgresoPage;