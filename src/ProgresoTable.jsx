/*
  Archivo: ProgresoTable.jsx
  Función: Componente presentacional que renderiza la tabla de progreso.
           Recibe los datos como props y los muestra.
  Tipo: Componente de Frontend.
*/

import ProgresoTableRow from './ProgresoTableRow';

const ProgresoTable = ({ data }) => {
  return (
    <table className="progreso-table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Curso</th>
          <th>Progreso</th>
          <th>Porcentaje Faltante</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <ProgresoTableRow key={item.id} item={item} />
        ))}
      </tbody>
    </table>
  );
};

export default ProgresoTable;