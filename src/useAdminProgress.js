/*
  Archivo: useAdminProgress.js
  Función: Hook personalizado para obtener y procesar los datos de progreso de todos los usuarios.
           Obtiene los datos directamente de las tablas para mayor robustez.
  Tipo: Hook de React (Lógica de Frontend).
*/
import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient';

export const useAdminProgress = () => {
  // Estado para almacenar los datos de progreso ya formateados.
  const [datosProgreso, definirDatosProgreso] = useState([]);
  // Estado para controlar la visualización del indicador de carga.
  const [estaCargando, definirEstaCargando] = useState(true);
  // Estado para almacenar cualquier error que ocurra durante la carga.
  const [error, definirError] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      definirEstaCargando(true);
      definirError(null);
      try {
        // Paso 1: Obtener todos los usuarios con el rol 'usuario'.
        const { data: usuarios, error: errorUsuarios } = await supabase
          .from('Usuario')
          .select('id, Usuario')
          .eq('profile', 'usuario');
        if (errorUsuarios) throw errorUsuarios;

        // Paso 2: Obtener todos los cursos y su conteo total de contenidos.
        const { data: cursos, error: errorCursos } = await supabase
          .from('cursos')
          .select('id, curso, contenidos(count)');
        if (errorCursos) throw errorCursos;

        // Paso 3: Obtener todos los registros de 'contenido_completado'.
        const { data: completados, error: errorCompletados } = await supabase
          .from('contenido_completado')
          .select('user_id, curso_id');
        if (errorCompletados) throw errorCompletados;

        // Paso 4: Procesar los datos en el cliente para construir la tabla de progreso.
        // Creamos un mapa para contar los contenidos completados por usuario y por curso.
        const progresoPorUsuario = {};
        for (const item of completados) {
          const claveUsuario = item.user_id;
          const claveCurso = item.curso_id;
          if (!progresoPorUsuario[claveUsuario]) {
            progresoPorUsuario[claveUsuario] = {};
          }
          progresoPorUsuario[claveUsuario][claveCurso] = (progresoPorUsuario[claveUsuario][claveCurso] || 0) + 1;
        }

        const resultadoFinal = [];
        // Iteramos sobre cada usuario para generar sus filas de progreso.
        for (const usuario of usuarios) {
          const progresosDelUsuario = progresoPorUsuario[usuario.id];

          // Si el usuario tiene progreso en al menos un curso, lo procesamos.
          if (progresosDelUsuario) {
            for (const idCurso in progresosDelUsuario) {
              const curso = cursos.find(c => c.id.toString() === idCurso);
              if (curso) {
                const contenidosTotales = curso.contenidos[0]?.count || 0;
                const contenidosCompletados = progresosDelUsuario[idCurso];

                if (contenidosTotales > 0) {
                  const porcentaje = (contenidosCompletados / contenidosTotales) * 100;
                  resultadoFinal.push({
                    id: `${usuario.id}-${curso.id}`,
                    userName: usuario.Usuario,
                    courseName: curso.curso,
                    progress: Math.round(porcentaje),
                    remaining: 100 - Math.round(porcentaje),
                    status: porcentaje === 100 ? 'Completado' : 'En Progreso'
                  });
                }
              }
            }
          }
        }
        definirDatosProgreso(resultadoFinal);
      } catch (err) {
        console.error("Error al cargar los datos de progreso:", err);
        definirError(err);
      } finally {
        definirEstaCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // 3. Devuelve los datos y los estados para que el componente que use el hook pueda utilizarlos.
  return { progressData: datosProgreso, isLoading: estaCargando, error };
};