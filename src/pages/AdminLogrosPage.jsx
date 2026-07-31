import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useRouteLoading } from '../contexto/RouteLoadingContext';
import { Award, Edit, Save, X, PlusCircle } from 'lucide-react';
import './AdminLogrosPage.css';

const AdminLogrosPage = () => {
  const [courses, setCourses] = useState([]);
  const [achievements, setAchievements] = useState(new Map());
  const [editingAchievement, setEditingAchievement] = useState(null); // { course_id, title, description, icon }
  const { setIsRouteLoading } = useRouteLoading();

  useEffect(() => {
    const fetchData = async () => {
      setIsRouteLoading(true);
      try {
        const [coursesRes, achievementsRes] = await Promise.all([
          supabase.from('cursos').select('id, curso').order('curso', { ascending: true }),
          supabase.from('logros').select('*')
        ]);

        if (coursesRes.error) throw coursesRes.error;
        if (achievementsRes.error) throw achievementsRes.error;

        setCourses(coursesRes.data);

        const achievementMap = new Map(achievementsRes.data.map(ach => [ach.curso_id, ach]));
        setAchievements(achievementMap);

      } catch (error) {
        console.error("Error fetching data for admin achievements page:", error);
        alert("Error al cargar los datos: " + error.message);
      } finally {
        setIsRouteLoading(false);
      }
    };
    fetchData();
  }, [setIsRouteLoading]);

  const handleEditClick = (course) => {
    const existingAchievement = achievements.get(course.id);
    setEditingAchievement({
      id: existingAchievement?.id || null,
      curso_id: course.id,
      titulo: existingAchievement?.titulo || `Completaste: ${course.curso}`,
      descripcion: existingAchievement?.descripcion || `Un reconocimiento por haber finalizado con éxito el módulo "${course.curso}".`,
      icono: existingAchievement?.icono || 'Trophy', // Default icon
    });
  };

  const handleSave = async () => {
    if (!editingAchievement) return;
    setIsRouteLoading(true);

    // Prepara el objeto para upsert. Si el 'id' es nulo (logro nuevo),
    // no lo incluimos para que Supabase lo genere.
    const payload = { ...editingAchievement };
    if (payload.id === null) {
      delete payload.id;
    }

    try {
      const { data, error } = await supabase.from('logros').upsert(payload).select().single();

      if (error) throw error;

      // Actualiza el estado local para reflejar el cambio
      setAchievements(prevMap => new Map(prevMap).set(data.curso_id, data));
      setEditingAchievement(null);
      alert("Logro guardado con éxito!");

    } catch (error) {
      console.error("Error saving achievement:", error);
      alert("Error al guardar el logro: " + error.message);
    } finally {
      setIsRouteLoading(false);
    }
  };

  return (
    <div className="admin-logros-page">
      <header className="admin-logros-header">
        <h1>Gestionar Logros por Curso</h1>
        <p>Asigna un logro a cada curso. Este se otorgará automáticamente cuando un usuario complete todos los contenidos del módulo.</p>
      </header>

      <div className="courses-list-container">
        {courses.map(course => {
          const achievement = achievements.get(course.id);
          return (
            <div key={course.id} className="course-achievement-item">
              <div className="course-info">
                <span className="course-name">{course.curso}</span>
                {achievement ? (
                  <span className="achievement-status has-achievement">
                    <Award size={16} /> Logro Asignado
                  </span>
                ) : (
                  <span className="achievement-status no-achievement">
                    <X size={16} /> Sin Logro
                  </span>
                )}
              </div>
              <div className="course-actions">
                <button onClick={() => handleEditClick(course)} className="btn-edit-achievement">
                  {achievement ? <><Edit size={16} /> Editar Logro</> : <><PlusCircle size={16} /> Crear Logro</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingAchievement && (
        <div className="modal-overlay">
          <div className="modal-content achievement-modal">
            <h2>{editingAchievement.id ? 'Editar' : 'Crear'} Logro</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="form-group">
                <label htmlFor="logro-titulo">Título del Logro</label>
                <input id="logro-titulo" type="text" value={editingAchievement.titulo} onChange={(e) => setEditingAchievement({ ...editingAchievement, titulo: e.target.value })} required />
              </div>
              <div className="form-group">
                <label htmlFor="logro-descripcion">Descripción</label>
                <textarea id="logro-descripcion" rows="4" value={editingAchievement.descripcion} onChange={(e) => setEditingAchievement({ ...editingAchievement, descripcion: e.target.value })} required />
              </div>
              <div className="form-group">
                <label htmlFor="logro-icono">Icono (Nombre de Lucide Icon)</label>
                <input id="logro-icono" type="text" value={editingAchievement.icono} onChange={(e) => setEditingAchievement({ ...editingAchievement, icono: e.target.value })} placeholder="Ej: Trophy, Award, Star" />
                <small>Usa un nombre de ícono de la librería <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer">Lucide</a>.</small>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setEditingAchievement(null)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary"><Save size={16} /> Guardar Logro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogrosPage;