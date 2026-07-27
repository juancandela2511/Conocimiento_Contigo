/*
  Archivo: AdminProgresoPage.jsx
  Función: Muestra una tabla de aprendices con filas expandibles para ver su progreso.
  Tipo: Componente de Frontend (Página).
*/
import { useState, useEffect, Fragment } from 'react';
import { supabase } from './services/supabaseClient';
import AnimatedProgressBar from './components/AnimatedProgressBar';
import './AdminProgresoPage.css';
import { ChevronDown } from 'lucide-react';

const PaginaProgresoAdmin = () => {
  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [learnersRes, coursesRes] = await Promise.all([
        // Corregido: Se selecciona la columna 'Usuario' (con mayúscula) en lugar de 'email'.
        // La tabla 'Usuario' contiene el nombre de usuario, no el email.
        supabase.from('Usuario').select('id, Usuario').eq('profile', 'usuario'),
        supabase.from('cursos').select('id, curso')
      ]);

      if (learnersRes.error || coursesRes.error) {
        console.error('Error fetching initial data:', learnersRes.error || coursesRes.error);
      } else {
        setLearners(learnersRes.data || []);
        setCourses(coursesRes.data || []);
        console.log("DEBUG: Aprendices cargados:", learnersRes.data);
        console.log("DEBUG: Cursos cargados:", coursesRes.data);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleLearnerClick = async (learner) => {
    if (selectedLearner?.id === learner.id) {
      setSelectedLearner(null);
      return;
    }

    setSelectedLearner(learner);
    setIsDetailsLoading(true);
    setProgressData([]);

    const { data, error } = await supabase.rpc('get_user_course_progress', {
      p_user_id: learner.id,
    });

    if (error) {
      console.error('DEBUG: Error al obtener progreso para el usuario:', error);
      console.error('Error fetching progress for user:', error);
      setProgressData([]);
    } else {
      const progressWithNames = courses.map(course => {
        const progressItem = data.find(p => p.course_id === course.id);
        return {
          course_id: course.id,
          courseName: course.curso,
          progress: progressItem ? progressItem.progress : 0,
        };
      });
      console.log("DEBUG: Datos de progreso RPC para el aprendiz seleccionado:", data);
      console.log("DEBUG: Datos de progreso mapeados para el aprendiz:", progressWithNames);
      setProgressData(progressWithNames);
    }
    setIsDetailsLoading(false);
  };

  if (isLoading) {
    return <div className="admin-progreso-loading">Cargando datos de aprendices...</div>;
  }

  return (
    <div className="admin-progreso-table-page">
      <h1 className="admin-progreso-title">Progreso de Aprendices</h1>
      <div className="table-wrapper">
        <table className="learners-table">
          <thead>
            <tr>
              <th>Aprendiz</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {learners.map(learner => {
              const isSelected = selectedLearner?.id === learner.id;
              return (
                <Fragment key={learner.id}>
                  <tr
                    className="learner-table-row"
                    onClick={() => handleLearnerClick(learner)}
                    tabIndex="0"
                    role="button"
                    aria-expanded={isSelected}
                  >
                    <td>{learner.Usuario}</td>
                    <td>
                      <ChevronDown className={`accordion-chevron ${isSelected ? 'open' : ''}`} size={24} />
                    </td>
                  </tr>
                  {isSelected && (
                    <tr className="progress-details-row">
                      <td colSpan="2">
                        <div className="details-inner-content">
                          {isDetailsLoading ? <p>Cargando progreso...</p> : (
                            progressData.length > 0 ? (
                              <div className="progress-cards-grid">
                                {progressData.map(item => (
                                  <div key={item.course_id} className="progress-card">
                                    <h4>{item.courseName}</h4>
                                    <AnimatedProgressBar percentage={item.progress} />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p>No hay progreso disponible para este aprendiz o no hay cursos creados.</p>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaginaProgresoAdmin;