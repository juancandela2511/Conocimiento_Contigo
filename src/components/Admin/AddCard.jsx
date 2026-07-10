//Para que mantenga el mismo tamaño que las demás, crea este componente que simula ser una tarjeta vacía.
import { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import styles from './AdminDashboard.module.css';

export default function AddCard({ onCourseAdded }) {
  const [title, setTitle] = useState('');
 

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Insertamos en la tabla 'Cursos' de Supabase
    const { data, error } = await supabase
      .from('Cursos')
      .insert([{ title, status, image_url: 'https://via.placeholder.com/150' }]);

    if (error) {
      console.error("Error al crear:", error);
    } else {
      console.log("Curso creado:", data);
      onCourseAdded(); // Avisamos al padre para que recargue la lista
    }
  };

  return (
    <form className={styles.addCard} onSubmit={handleCreate}>
      <input 
        placeholder="Nombre del curso" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required 
      />
      <button type="submit">Guardar Curso</button>
    </form>
  );
}