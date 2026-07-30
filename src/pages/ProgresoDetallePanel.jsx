import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import './ProgresoDetallePanel.css';

const ProgresoDetallePanel = ({ userId, courseId, userName, courseName }) => {
  const [contentList, setContentList] = useState([]);
  const [completedContent, setCompletedContent] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !courseId) return;

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const [contentRes, completedRes] = await Promise.all([
          supabase.from('contenidos').select('id, titulo, tipo').eq('curso_id', courseId).order('orden', { ascending: true }),
          supabase.from('contenido_completado').select('contenido_id').eq('user_id', userId).eq('curso_id', courseId)
        ]);

        if (contentRes.error) throw contentRes.error;
        if (completedRes.error) throw completedRes.error;

        setContentList(contentRes.data || []);
        setCompletedContent(new Set((completedRes.data || []).map(item => item.contenido_id)));
      } catch (error) {
        console.error("Error fetching progress details:", error);
        setContentList([]);
        setCompletedContent(new Set());
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [userId, courseId]);

  if (isLoading) {
    return (
      <div className="progreso-detalle-panel-loading">
        <Loader2 className="animate-spin" size={48} />
        <p>Cargando detalles...</p>
      </div>
    );
  }

  return (
    <div className="progreso-detalle-panel">
      <div className="pdp-header">
        <h3>{courseName}</h3>
        <p>Progreso de <strong>{userName}</strong></p>
      </div>
      <div className="pdp-content-list">
        {contentList.length > 0 ? (
          contentList.map(content => (
            <div key={content.id} className="pdp-content-item">
              {completedContent.has(content.id) ? (
                <CheckCircle size={20} className="pdp-icon-completed" />
              ) : (
                <Circle size={20} className="pdp-icon-pending" />
              )}
              <span className="pdp-item-title">{content.titulo}</span>
              <span className="pdp-item-type">{content.tipo}</span>
            </div>
          ))
        ) : (
          <p className="pdp-empty">Este curso no tiene contenido registrado.</p>
        )}
      </div>
    </div>
  );
};

export default ProgresoDetallePanel;