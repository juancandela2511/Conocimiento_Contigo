/*
  Archivo: ProgresoTableRow.jsx
  Función: Componente que renderiza una única fila (<tr>) de la tabla de progreso.
  Tipo: Componente de Frontend.
*/

import ProgressBar from './ProgressBar';

const ProgresoTableRow = ({ item }) => {
  return (
    <tr>
      <td>{item.userName}</td>
      <td>{item.courseName}</td>
      <td>
        <ProgressBar percentage={item.progress} />
      </td>
      <td>{item.status !== 'Completado' ? `${item.remaining}%` : '—'}</td>
    </tr>
  );
};

export default ProgresoTableRow;