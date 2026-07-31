/*
Qué hace: Es el contenedor de la tabla. Recibe la lista completa de datos (data) y crea la estructura <table> con las cabeceras 
 (Usuario, Curso, Progreso, Porcentaje Faltante). Luego hace un bucle (.map) para renderizar cada fila.

ProgresoTableRow.jsx:
  Archivo: ProgresoTable.jsx
  Función: Componente presentacional que renderiza la tabla de progreso.
           Recibe los datos como props y los muestra.
  Tipo: Componente de Frontend.
*/
import  { useState, useMemo } from 'react';
import { Search, User, Award, TrendingUp, BarChart2, ArrowLeft } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import './ProgresoTable.css';
import ProgresoDetallePanel from '../../pages/ProgresoDetallePanel';

// ==========================================
// 1. HOOK PERSONALIZADO (LÓGICA DE NEGOCIO)
// ==========================================

/**
 * Custom Hook para agrupar, procesar y filtrar la información de los aprendices.
 * @param {Array} data - Array plano de progresos recibido por props.
 * @param {string} busqueda - Texto de filtro por nombre.
 */
const useAprendicesData = (data, busqueda) => {
  // Agrupa los registros planos por usuario y calcula estadísticas básicas
  const aprendicesAgrupados = useMemo(() => {
    if (!Array.isArray(data)) return [];

    const mapa = {};

    data.forEach((item) => {
      const id = item.userId || item.userName;
      if (!mapa[id]) {
        mapa[id] = {
          id,
          nombre: item.userName,
          email: item.userEmail || 'Aprendiz SENA',
          cursos: [],
          totalProgreso: 0,
        };
      }

      mapa[id].cursos.push({
        id: item.courseId,
        curso: item.courseName,
        porcentaje: item.progress,
      });
      mapa[id].totalProgreso += item.progress;
    });

    return Object.values(mapa).map((aprendiz) => {
      const totalCursos = aprendiz.cursos.length || 1;
      const promedio = Math.round(aprendiz.totalProgreso / totalCursos);

      // Estimación simulada de aptitudes según el promedio
      const aptitudes = [
        { area: 'Lógica', valor: Math.min(100, promedio + 5) },
        { area: 'Frontend', valor: promedio },
        { area: 'Backend', valor: Math.max(20, promedio - 10) },
        { area: 'Bases de Datos', valor: Math.min(100, promedio + 2) },
        { area: 'Diseño/UI', valor: Math.max(30, promedio - 15) },
      ];

      return {
        ...aprendiz,
        promedioGeneral: promedio,
        aptitudes,
      };
    });
  }, [data]);

  // Filtra la lista según el término ingresado en el buscador
  const aprendicesFiltrados = useMemo(() => {
    return aprendicesAgrupados.filter((a) =>
      a.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [aprendicesAgrupados, busqueda]);

  return { aprendicesAgrupados, aprendicesFiltrados };
};

// ==========================================
// 2. SUBCOMPONENTES PRESENTACIONALES
// ==========================================

/** Subcomponente: Lista lateral con buscador y tabla de aprendices */
const ListaAprendices = ({
  busqueda,
  setBusqueda,
  aprendicesFiltrados,
  aprendizActivoId,
  onSeleccionarAprendiz
}) => (
  <aside className="columna-lista">
    <div className="caja-busqueda-lista">
      <Search size={18} className="icono-busqueda" />
      <input
        type="text"
        placeholder="Buscar aprendiz..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
    </div>

    <div className="wrapper-tabla">
      <table className="tabla-aprendices">
        <thead>
          <tr>
            <th>Aprendiz</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {aprendicesFiltrados.length === 0 ? (
            <tr>
              <td colSpan="2" style={{ textAlign: 'center', padding: '1rem' }}>
                Sin resultados
              </td>
            </tr>
          ) : (
            aprendicesFiltrados.map((aprendiz) => {
              const esSeleccionado = aprendizActivoId === aprendiz.id;
              return (
                <tr
                  key={aprendiz.id}
                  className={esSeleccionado ? 'fila-activa' : ''}
                  onClick={() => onSeleccionarAprendiz(aprendiz.id)}
                >
                  <td>
                    <div className="info-aprendiz-celda">
                      <User size={18} />
                      <div>
                        <span className="nombre-celda">{aprendiz.nombre}</span>
                        <small className="doc-celda">{aprendiz.cursos.length} curso(s)</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button
                      className={`btn-ver ${esSeleccionado ? 'btn-activo' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeleccionarAprendiz(aprendiz.id);
                      }}
                    >
                      {esSeleccionado ? 'Viendo' : 'Ver'}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </aside>
);

/** Subcomponente: Encabezado del perfil del aprendiz seleccionado */
const PerfilResumen = ({ aprendiz }) => (
  <div className="tarjeta-resumen-aprendiz">
    <div className="perfil-header">
      <div className="avatar-placeholder">
        {aprendiz.nombre ? aprendiz.nombre.charAt(0) : 'U'}
      </div>
      <div>
        <h3>{aprendiz.nombre}</h3>
        <p>{aprendiz.email}</p>
      </div>
    </div>
    <div className="badgets-resumen">
      <div className="badge-item destacado">
        <Award size={16} />
        <span>Promedio General: <strong>{aprendiz.promedioGeneral}%</strong></span>
      </div>
    </div>
  </div>
);

/** Subcomponente: Gráfica de Radar para Aptitudes */
const GraficoRadar = ({ aptitudes }) => (
  <div className="tarjeta-grafico">
    <div className="grafico-titulo">
      <TrendingUp size={18} />
      <h4>Inclinación y Aptitudes (Radial)</h4>
    </div>
    <div className="contenedor-chart">
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart outerRadius={75} data={aptitudes}>
          <PolarGrid />
          <PolarAngleAxis dataKey="area" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar
            name="Aptitud"
            dataKey="valor"
            stroke="#4f46e5"
            fill="#6366f1"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

/** Subcomponente: Gráfica de Barras para el Avance de Cursos */
const GraficoBarras = ({ cursos, onBarClick }) => (
  <div className="tarjeta-grafico">
    <div className="grafico-titulo">
      <BarChart2 size={18} />
      <h4>Avance por Curso (%)</h4>
    </div>
    <div className="contenedor-chart">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={cursos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="curso" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}%`, 'Avance']} />
          <Bar dataKey="porcentaje" radius={[4, 4, 0, 0]} onClick={onBarClick} style={{ cursor: 'pointer' }}>
            {cursos.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.porcentaje >= 80 ? '#10b981' : '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

/**
 * ProgresoTable - Dashboard de seguimiento y rendimiento por aprendiz.
 * @param {Array} data - Registros de progreso de los aprendices.
 */
const ProgresoTable = ({ data = [] }) => {
  const [busqueda, setBusqueda] = useState('');
  const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState(null);
  const [cursoDetallado, setCursoDetallado] = useState(null); // { userId, courseId, userName, courseName }

  // Hook personalizado para abstraer la lógica de manipulación de datos
  const { aprendicesAgrupados, aprendicesFiltrados } = useAprendicesData(data, busqueda);

  // Resolver el aprendiz que debe mostrarse en el panel detallado
  const aprendizActivo = useMemo(() => {
    if (usuarioSeleccionadoId) {
      return aprendicesAgrupados.find((a) => a.id === usuarioSeleccionadoId) || aprendicesAgrupados[0];
    }
    return aprendicesAgrupados[0];
  }, [aprendicesAgrupados, usuarioSeleccionadoId]);

  // Cuando se selecciona un nuevo aprendiz, se resetea la vista de detalle del curso.
  const handleSeleccionarAprendiz = (id) => {
    setUsuarioSeleccionadoId(id);
    setCursoDetallado(null);
  };

  // Se activa al hacer clic en una barra del gráfico
  const handleBarClick = (barData) => {
    if (!barData || !barData.activePayload || !barData.activePayload[0] || !aprendizActivo) return;
    
    const payload = barData.activePayload[0].payload; // Datos del curso en la barra
    setCursoDetallado({
      userId: aprendizActivo.id,
      userName: aprendizActivo.nombre,
      courseId: payload.id,
      courseName: payload.curso,
    });
  };

  // Si no hay información inicial
  if (!data || data.length === 0) {
    return <div className="mensaje-vacio">No hay datos de progreso disponibles.</div>;
  }

  return (
    <div className="contenedor-estadisticas">
      <div className="panel-dashboard">
        
        {/* Lista de selección izquierda */}
        <ListaAprendices
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          aprendicesFiltrados={aprendicesFiltrados}
          aprendizActivoId={aprendizActivo?.id}
          onSeleccionarAprendiz={handleSeleccionarAprendiz}
        />

        {/* Panel principal de estadísticas derecha */}
        <main className="columna-detalle">
          {aprendizActivo && cursoDetallado ? (
            // VISTA DE DETALLE DE CURSO
            <div>
              <button className="btn-volver" onClick={() => setCursoDetallado(null)}>
                <ArrowLeft size={16} /> Volver a los gráficos
              </button>
              <ProgresoDetallePanel
                userId={cursoDetallado.userId}
                courseId={cursoDetallado.courseId}
                userName={cursoDetallado.userName}
                courseName={cursoDetallado.courseName}
              />
            </div>
          ) : aprendizActivo ? (
            // VISTA DE GRÁFICOS GENERALES
            <>
              <PerfilResumen aprendiz={aprendizActivo} />
              
              <div className="grid-graficos">
                <GraficoRadar aptitudes={aprendizActivo.aptitudes} />
                <GraficoBarras cursos={aprendizActivo.cursos} onBarClick={handleBarClick} />
              </div>
            </>
          ) : (
            // VISTA INICIAL O SIN RESULTADOS
            <div className="mensaje-vacio-detalle">
              <BarChart2 size={48} />
              <p>Selecciona un aprendiz de la lista para ver sus estadísticas de progreso.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default ProgresoTable;