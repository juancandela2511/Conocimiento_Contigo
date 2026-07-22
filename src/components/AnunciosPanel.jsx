/*
  Archivo: AnunciosPanel.jsx
  Función: Renderiza un panel lateral con anuncios importantes.
  Tipo: Componente de Frontend.
*/
import './AnunciosPanel.css';

export default function AnunciosPanel() {
  // Por ahora, los anuncios están definidos aquí.
  // En el futuro, podrían venir de una base de datos.
  const anuncios = [
    {
      id: 1,
      titulo: "¡Nuevo Módulo!",
      texto: "Ya está disponible el módulo de Comunicación Asertiva. ¡No te lo pierdas!"
    },
    {
      id: 2,
      titulo: "Mantenimiento Programado",
      texto: "El próximo domingo de 2am a 3am realizaremos mantenimiento en la plataforma."
    }
  ];

  return (
    <aside className="announcements-panel">
      <h2>Anuncios</h2>
      {anuncios.map(anuncio => (
        <div key={anuncio.id} className="announcement-item">
          <h4>{anuncio.titulo}</h4>
          <p>{anuncio.texto}</p>
        </div>
      ))}
    </aside>
  );
}