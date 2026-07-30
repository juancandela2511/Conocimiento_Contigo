/*
  Archivo: ProgresoTableRow.jsx
  Función: Componente que renderiza una única fila (<tr>) de la tabla de progreso.
  Tipo: Componente de Frontend.
*/
import { User } from 'lucide-react';
import AnimatedProgressBar from './AnimatedProgressBar';

const ProgresoTableRow = ({ item, onClick, isSelected, isHighlighted }) => {
  return (
    <tr className={`progreso-table-row ${isSelected ? 'is-selected' : ''} ${isHighlighted ? 'search-highlight-row' : ''}`} onClick={onClick}>
      <td>
        <div className="user-cell-progreso">
          <User size={18} className="user-icon-progreso" />
          <span>{item.userName}</span>
        </div>
      </td>
      <td>
        <div className="course-cell-progreso">
          <span>{item.courseName}</span>
        </div>
      </td>
      <td>
        <AnimatedProgressBar percentage={item.progress} />
      </td>
      <td>
        <span className={`status-badge-progreso status-${item.progress === 100 ? 'completado' : 'en-progreso'}`}>
          {item.progress === 100 ? 'Completado' : 'En Progreso'}
        </span>
      </td>
    </tr>
  );
};

export default ProgresoTableRow;