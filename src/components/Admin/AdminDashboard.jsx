//Este archivo será el "cerebro"
//Propósito:
//Mantiene el estado de todos los cursos (useState).
//Hace la llamada a Supabase para cargar la lista
//Muestra el grid (cuadrícula) con las tarjetas.
//Decide cuándo mostrar u ocultar el EditModal.
import { useState, useEffect } from 'react';
// Prueba con tres puntos para subir dos niveles (hasta llegar a src)
import { supabase } from "../../services/supabaseClient";
import styles from './AdminDashboard.module.css';
import CourseCard from './CourseCard'; // Aún no lo creamos, pero lo dejamos listo

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    

  const fetchCourses = async () => {
    const { data } = await supabase.from('Cursos').select('*');
    if (data) setCourses(data);
  };

  fetchCourses();
  }, []);

  return (
    <div className={styles.gridContainer}>
      {/* 1. Mapeo de cursos existentes */}
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}

      {/* 2. Botón de Agregar (el último cuadro) */}
      <div className={styles.addCard} onClick={() => console.log("Abrir modal de creación")}>
        <span>+ Agregar Nuevo Curso</span>
      </div>
    </div>
  );
}