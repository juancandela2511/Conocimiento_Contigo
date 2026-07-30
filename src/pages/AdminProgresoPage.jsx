import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useRouteLoading } from '../components/RouteLoadingContext';
import ProgresoTableRow from '../components/ProgresoTableRow';
import ProgresoDetallePanel from './ProgresoDetallePanel';
import { ListChecks } from 'lucide-react';
// Importamos los estilos que hemos añadido a otros archivos
import './AdminUsuariosPage.css'; 
import './ProgresoDetallePanel.css';

const AdminProgresoPage = ({ terminoDeBusqueda = '' }) => {
  const [progressData, setProgressData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const { setIsRouteLoading } = useRouteLoading();

  useEffect(() => {
    const fetchAllProgress = async () => {
      setIsRouteLoading(true);
      try {
        // Esta función RPC debe ser creada en Supabase para obtener todos los progresos.
        const { data, error } = await supabase.rpc('get_all_user_progress');
        if (error) throw error;
        setProgressData(data || []);
      } catch (error) {
        console.error("Error fetching all user progress:", error);
        setProgressData([]);
      } finally {
        setIsRouteLoading(false);
      }
    };
    fetchAllProgress();
  }, [setIsRouteLoading]);

  const handleRowClick = (item) => {
    setSelectedItem(item);
  };

  const filteredProgressData = progressData.filter(item =>
    item.userName.toLowerCase().includes(terminoDeBusqueda.toLowerCase())
  );

  return (
    <div className="admin-page-container">
      <header className="admin-page-header">
        <h1>Progreso de Aprendices</h1>
      </header>
      <div className="admin-progreso-layout">
        <div className="progreso-table-container">
          <div className="admin-usuarios-table-wrapper">
            <table className="admin-usuarios-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Curso</th>
                  <th>Progreso</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredProgressData.length > 0 ? (
                  filteredProgressData.map((item) => (
                    <ProgresoTableRow
                      key={`${item.userId}-${item.courseId}`}
                      item={item}
                      onClick={() => handleRowClick(item)}
                      isSelected={selectedItem?.userId === item.userId && selectedItem?.courseId === item.courseId}
                    isHighlighted={terminoDeBusqueda.length > 0}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                      No se encontraron registros de progreso.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="progreso-detail-container">
          {selectedItem ? (
            <ProgresoDetallePanel
              userId={selectedItem.userId}
              courseId={selectedItem.courseId}
              userName={selectedItem.userName}
              courseName={selectedItem.courseName}
            />
          ) : (
            <div className="progreso-detail-placeholder">
              <div>
                <ListChecks size={48} />
                <p>Selecciona un registro para ver los detalles del contenido completado.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProgresoPage;