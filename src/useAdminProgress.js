/*
  Archivo: useAdminProgress.js
  Función: Hook personalizado para obtener y procesar los datos de progreso de todos los usuarios.
           Utiliza una función RPC de Supabase para máxima eficiencia y para evitar problemas de RLS.
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
        // Se llama a una única función RPC que realiza todo el trabajo pesado en la base de datos.
        // Esto es más eficiente y soluciona problemas de permisos (RLS) al leer datos de otros usuarios.
        const { data, error: rpcError } = await supabase.rpc('get_all_users_progress_matrix');

        if (rpcError) {
          throw rpcError;
        }

        definirDatosProgreso(data);

      } catch (err) {
        console.error("Error al cargar los datos de progreso:", err);
        definirError(err.message);
      } finally {
        definirEstaCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // 3. Devuelve los datos y los estados para que el componente que use el hook pueda utilizarlos.
  return { progressData: datosProgreso, isLoading: estaCargando, error };
};