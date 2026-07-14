import { useParams } from 'react-router-dom';

export default function CursoDetalle() {
  // Usamos el hook useParams para obtener los parámetros de la URL
  const { id } = useParams();

  return (
    <div style={{ padding: '50px', marginTop: '80px' }}>
      <h1>Detalle del Curso</h1>
      <p>Estás viendo la página de detalles para el curso con ID: <strong>{id}</strong>.</p>
      {/* Aquí puedes agregar la lógica para buscar y mostrar la información del curso usando el 'id' */}
    </div>
  );
}