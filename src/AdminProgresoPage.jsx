/*
  Archivo: AdminProgresoPage.jsx
  Función: Muestra una tabla con el progreso de todos los usuarios en los diferentes cursos.
           Esta página es exclusiva para administradores.
  Tipo: Componente de Frontend.
*/
import { useAdminProgress } from './useAdminProgress'; // Hook personalizado
import Loading from './components/Loading';
import ProgresoTable from './ProgresoTable'; // Componente de la tabla
import './AdminProgresoPage.css';

const AdminProgresoPage = () => {
  // La lógica de fetching y procesamiento de datos ahora está en el hook.
  const { progressData, isLoading, error } = useAdminProgress();

  if (isLoading) {
    return <Loading isLoading={true} />;
  }

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