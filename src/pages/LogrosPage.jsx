/*
  Archivo: LogrosPage.jsx
  Función: Muestra la página con la colección de logros obtenidos por el usuario.
  Tipo: Componente de Frontend.
*/
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import Loading from '../components/Loading';
import LogroItem from '../components/LogroItem';
import './LogrosPage.css';

const LogrosPage = () => {
  const [logros, setLogros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogros = async () => {
      setIsLoading(true);
      // --- INTERACCIÓN CON EL BACKEND (BASE DE DATOS) ---
      // Por ahora, traemos todos los logros disponibles para mostrarlos.
      // En un futuro, aquí se consultaría una tabla que relacione usuarios y logros obtenidos.
      const { data, error } = await supabase
        .from('logros')
        .select('*');

      if (error) {
        console.error('Error al cargar los logros:', error);
        setLogros([]);
      } else {
        setLogros(data);
      }
      setIsLoading(false);
    };

    fetchLogros();
  }, []);

  if (isLoading) {
    return <Loading isLoading={true} />;
  }

  return (
    <div className="logros-page-container">
      <div className="logros-header">
        <h1>Mis Logros</h1>
        <p>¡Felicidades! Aquí puedes ver todas las medallas que has ganado completando cursos y desafíos.</p>
      </div>
      {logros.length > 0 ? (
        <div className="logros-grid">
          {logros.map(logro => (
            <LogroItem key={logro.id} logro={logro} />
          ))}
        </div>
      ) : (
        <div className="no-logros">
          <h2>Aún no tienes logros</h2>
          <p>¡Sigue aprendiendo y pronto empezarás a coleccionar medallas!</p>
        </div>
      )}
    </div>
  );
};

export default LogrosPage;