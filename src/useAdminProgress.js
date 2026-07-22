/*
  Archivo: useAdminProgress.js
  Función: Hook personalizado que encapsula toda la lógica para obtener y procesar
           los datos de progreso de los usuarios desde Supabase.
  Tipo: Lógica de Frontend (Hook).
*/
import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';

export const useAdminProgress = () => {
  const [progressData, setProgressData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Obtener todos los usuarios con el rol 'usuario'
        const { data: students, error: studentsError } = await supabase
          .from('Usuario')
          .select('id, Usuario')
          .eq('profile', 'usuario');
        if (studentsError) throw studentsError;

        // 2. Obtener todos los cursos y su conteo de contenidos
        const { data: coursesWithContent, error: coursesError } = await supabase
          .from('cursos')
          .select('id, curso, contenidos(count)');
        if (coursesError) throw coursesError;

        // 3. Obtener todos los registros de 'contenido_completado'
        const { data: completions, error: completionsError } = await supabase
          .from('contenido_completado')
          .select('user_id, curso_id');
        if (completionsError) throw completionsError;

        // 4. Procesar los datos para construir la tabla de progreso
        const studentProgress = {};
        for (const completion of completions) {
          if (!studentProgress[completion.user_id]) {
            studentProgress[completion.user_id] = {};
          }
          studentProgress[completion.user_id][completion.curso_id] = (studentProgress[completion.user_id][completion.curso_id] || 0) + 1;
        }

        const result = [];
        for (const student of students) {
          const progressEntries = studentProgress[student.id];
          if (progressEntries) {
            for (const courseId in progressEntries) {
              const course = coursesWithContent.find(c => c.id.toString() === courseId);
              if (course) {
                const totalContents = course.contenidos[0]?.count || 0;
                const completedContents = progressEntries[courseId];

                if (totalContents > 0) {
                  const percentage = (completedContents / totalContents) * 100;
                  result.push({
                    id: `${student.id}-${course.id}`, // Genera una clave única para el mapeo en React
                    userName: student.Usuario,
                    courseName: course.curso,
                    progress: Math.round(percentage),
                    remaining: 100 - Math.round(percentage),
                    status: percentage === 100 ? 'Completado' : 'En Progreso'
                  });
                }
              }
            }
          }
        }
        setProgressData(result);
      } catch (err) {
        console.error("Error al cargar los datos de progreso:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { progressData, isLoading, error };
};