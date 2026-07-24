/*
  hacer un componente de administar de usuarios 

  Archivo: App.jsx
  Función: Es el componente raíz de la aplicación. Gestiona el estado global (sesión, rol, cursos),
           la autenticación, los modales y la estructura de las rutas.
  Tipo: Componente de Frontend que orquesta la lógica y las llamadas al Backend.
*/

// =================================================================
// 1. IMPORTACIONES
// =================================================================
// Hooks y utilidades de React.
import { useState, useEffect } from 'react';
// Componentes de 'react-router-dom' para crear el sistema de navegación y rutas.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Cliente de Supabase para interactuar con el backend.
import { supabase } from './services/supabaseClient';

//Componentes de la Interfaz
import HeroPrincipal from './components/HeroPrincipal'; // Mantenido por ser un nombre propio del componente
import RutaProtegida from './components/ProtectedRoute'; // Componente para proteger rutas
import PaginaPrincipal from './components/HomePage'; 
import BarraNavegacion from './components/Navbar';
import BarraNavegacionEditor from './components/EditorNavbar';
import InfoContactos from './components/ContactsInfo';
import Cargando from './components/Loading';
import AsistenteIA from './ChatIA';

// --- Componentes de Páginas (Vistas) ---
import InicioSesion from './pages/Login';
import DetalleCurso from './pages/CursoDetalle';
import PaginaLogros from './pages/LogrosPage';
import PaginaProgresoAdmin from './AdminProgresoPage';
import AdminUsuariosPage from './pages/AdminUsuariosPage'; // Nueva página de admin
import UserProgressPage from './pages/UserProgressPage'; // Nueva página

// --- Componentes de Modales para Administradores ---
import ModalAgregarModulo from './components/Admin/AddCard'; // Renombrado a AddCourseModal
import ModalEditarModulo from './components/Admin/EditCard'; // Renombrado a EditCourseModal
import AddContentModal from './components/Admin/AddContentModal'; // El nuevo modal genérico

// --- Contexto para la Carga de Rutas ---
// Importamos el proveedor y el hook del nuevo contexto.
import { RouteLoadingProvider, useRouteLoading } from './components/RouteLoadingContext';

// Importación directa de los estilos del pie de página para asegurar su carga.
import './components/ContactsInfo.css';

// =================================================================
// COMPONENTE PRINCIPAL DEL CONTENIDO DE LA APP
// =================================================================
// Movemos toda la lógica a un componente hijo `AppContent` para que pueda
// acceder al contexto de carga de rutas.
function AppContent() {
  // =================================================================
  // 2. ESTADOS DEL COMPONENTE
  // =================================================================
  // Aquí definimos todas las "piezas de información" que pueden cambiar y que 
  // necesitan que la interfaz se vuelva a dibujar cuando cambian.
  
  // --- Estados de Sesión y Usuario ---
  const [sesionIniciada, definirSesionIniciada] = useState(false);
  const [rolUsuario, definirRolUsuario] = useState(null);
  const [estaCargandoApp, definirEstaCargandoApp] = useState(true); // Carga inicial de la app
  const { estaCargandoRuta } = useRouteLoading(); // Carga durante la navegación entre páginas

  // --- Estados de la Interfaz y Navegación ---
  const [terminoDeBusqueda, definirTerminoDeBusqueda] = useState('');
  const [claveContenido, definirClaveContenido] = useState(0);

  // --- Estados de Datos (Cursos) ---
  const [listaCursos, definirListaCursos] = useState([]);
  const [cursoEditandose, definirCursoEditandose] = useState(null);
  const [idCursoActual, definirIdCursoActual] = useState(null);

  // --- Estados de Visibilidad de Modales ---
  const [esVisibleModalAgregarModulo, definirEsVisibleModalAgregarModulo] = useState(false);
  const [esVisibleModalEditarModulo, definirEsVisibleModalEditarModulo] = useState(false);
  const [esVisibleModalAgregarContenido, definirEsVisibleModalAgregarContenido] = useState(false);
  const [tipoContenidoParaAgregar, definirTipoContenidoParaAgregar] = useState(null); // 'lectura', 'video', 'cuestionario'
   
  // =================================================================
  // 3. EFECTOS (LÓGICA DE INICIALIZACIÓN Y SUSCRIPCIONES)
  // =================================================================

  // Este `useEffect` es el corazón de la gestión de sesión. Se ejecuta solo una vez cuando la app carga.
  useEffect(() => {
    // 2. Nos suscribimos a los eventos de autenticación de Supabase.
    //    Supabase nos avisará cada vez que un usuario inicie sesión, cierre sesión o se refresque la sesión.
    const { data: { subscription: suscripcion } } = supabase.auth.onAuthStateChange(async (_evento, sesion) => {
      // 3. Verificamos si hay una sesión activa.
      if (sesion) {
        // --- SI HAY SESIÓN (USUARIO LOGUEADO) ---
        definirSesionIniciada(true);

        // Buscamos en nuestra tabla 'Usuario' para obtener el rol ('profile').
        const { data: datosUsuario } = await supabase
          .from('Usuario')
          .select('profile')
          .eq('id', sesion.user.id)
          .single();

        // Guardamos el rol en el estado.
        definirRolUsuario(datosUsuario?.profile || null);
        console.log('Rol del usuario recuperado:', datosUsuario?.profile);

        // Usamos la nueva función RPC para obtener el progreso y los cursos.
        const { data: todosLosCursos, error: errorCursos } = await supabase.from('cursos').select('*');
        const { data: datosProgreso, error: errorProgreso } = await supabase.rpc('get_user_course_progress', { p_user_id: sesion.user.id });

        if (errorCursos || errorProgreso) {
          console.error("Error cargando cursos o progreso:", errorCursos || errorProgreso);
          definirListaCursos(todosLosCursos || []); // Muestra los cursos incluso si el progreso falla
        } else {
          // Creamos un mapa para buscar el progreso de cada curso eficientemente.
          const mapaProgreso = new Map(datosProgreso.map(p => [p.course_id, p.progress]));
          const cursosConProgreso = todosLosCursos.map(curso => ({
            ...curso,
            estaCompleto: (mapaProgreso.get(curso.id) || 0) === 100
          }));
          definirListaCursos(cursosConProgreso);
        }

      } else {
        // --- SI NO HAY SESIÓN (USUARIO NO LOGUEADO) ---
        definirSesionIniciada(false);
        definirRolUsuario(null);
        definirListaCursos([]);
      }
      
      // 4. Ocultamos la pantalla de carga tan pronto como la verificación de sesión termina.
      definirEstaCargandoApp(false);
    });

    // 5. FUNCIÓN DE LIMPIEZA:
    //    Cuando el componente 'App' se "desmonte" (lo que nunca pasa, pero es buena práctica),
    //    nos desuscribimos para evitar fugas de memoria.
    return () => {
      suscripcion?.unsubscribe();
    };
  }, []); // El array vacío `[]` asegura que este efecto se ejecute solo una vez.

  // =================================================================
  // 4. FUNCIONES CONTROLADORAS (HANDLERS)
  // =================================================================
  // Estas funciones son llamadas por componentes hijos para modificar el estado de App.jsx.

  /**
   * Añade un nuevo curso al estado `courses` para que la UI se actualice al instante
   * sin tener que recargar la página.
   * @param {object} newCourse - El objeto del curso recién creado en la base de datos.
   */
  const agregarCurso = (nuevoCurso) => {
    definirListaCursos(cursosAnteriores => [...cursosAnteriores, nuevoCurso]);
  };

  /**
   * Abre el modal de edición y guarda el curso que se va a editar.
   * @param {object} course - El curso en el que el usuario hizo clic para editar.
   */
  const manejarClicEditarCurso = (curso) => {
    definirCursoEditandose(curso);
    definirEsVisibleModalEditarModulo(true);
  };

  /**
   * Actualiza la lista de cursos en el estado después de que uno ha sido editado.
   * @param {object} updatedCourse - El objeto del curso con los datos ya actualizados.
   */
  const manejarCursoActualizado = (cursoActualizado) => {
    // CORRECCIÓN: Se usa la función de callback para evitar problemas con estados "viejos" (stale state).
    definirListaCursos(cursosAnteriores => cursosAnteriores.map(curso =>
      curso.id === cursoActualizado.id ? cursoActualizado : curso
    ));
    // CORRECCIÓN: Se cierra el modal y se limpia el estado de edición después de guardar.
    definirEsVisibleModalEditarModulo(false);
    definirCursoEditandose(null);
  };

  /**
   * Abre el modal correspondiente para agregar contenido (lectura, video, etc.)
   * y guarda el ID del curso al que pertenece.
   * @param {string} contentType - El tipo de contenido a agregar ('lectura', 'video', 'cuestionario').
   * @param {string} idCurso - El ID del curso actual.
   */
  const abrirModalAgregarContenido = (tipoContenido, idCurso) => {
    if (idCurso) {
      definirIdCursoActual(idCurso);
      definirTipoContenidoParaAgregar(tipoContenido);
      definirEsVisibleModalAgregarContenido(true);
    } else {
      console.error("No se puede agregar contenido sin un ID de curso.");
    }
  };

  const manejarContenidoAgregado = () => {
    definirEsVisibleModalAgregarContenido(false);
    definirTipoContenidoParaAgregar(null);
    // Cambiamos la 'key' para que React piense que es un componente nuevo y lo vuelva a renderizar.
    definirClaveContenido(claveAnterior => claveAnterior + 1); 
    definirIdCursoActual(null); // Limpia el ID del curso actual.
  };

  // =================================================================
  // 5. RENDERIZADO DEL COMPONENTE
  // =================================================================

  return (
    <>
      {/* 
        BLOQUE DE CARGA GLOBAL:
        Este componente `Cargando` se muestra como una superposición (overlay) si la aplicación
        está en su carga inicial (`estaCargandoApp`) o si se está navegando entre páginas
        que cargan datos pesados (`estaCargandoRuta`).
      */}
      {(estaCargandoApp || estaCargandoRuta) && <Cargando />}

      {/* 
        CONTENEDOR PRINCIPAL DE LA APLICACIÓN:
        Este bloque solo se renderiza cuando la carga inicial de la aplicación ha finalizado.
        Esto es crucial para evitar que el usuario vea un "parpadeo" o sea redirigido
        incorrectamente antes de que se haya verificado su estado de sesión.
      */}
      {!estaCargandoApp && (
        <>
          {/* 
            Barra de Navegación Principal:
            Se muestra en todas las páginas para usuarios logueados. Recibe el estado de la sesión,
            el rol del usuario y una función para actualizar el término de búsqueda.
          */}
          <BarraNavegacion 
            sesionIniciada={sesionIniciada} 
            alBuscar={definirTerminoDeBusqueda} 
            rolUsuario={rolUsuario}
          />

          {/* 
            Barra de Navegación del Editor (Solo para Administradores):
            Este componente se renderiza condicionalmente solo si el `rolUsuario` es 'administrador'.
            Proporciona atajos para agregar y editar contenido.
          */}
          {rolUsuario === 'administrador' && (
            <BarraNavegacionEditor 
              alHacerClicAgregarModulo={() => definirEsVisibleModalAgregarModulo(true)}
              alHacerClicAgregarLectura={(idCurso) => abrirModalAgregarContenido('lectura', idCurso)}
              alHacerClicAgregarVideo={(idCurso) => abrirModalAgregarContenido('video', idCurso)}
              alHacerClicAgregarCuestionario={(idCurso) => abrirModalAgregarContenido('cuestionario', idCurso)}
            />
          )}

          {/* 
            Asistente de IA (Chat):
            Componente global que se muestra como un widget flotante para todos los usuarios logueados.
          */}
          {sesionIniciada && <AsistenteIA />}

          {/* 
            BLOQUE DE MODALES:
            Estos componentes de modal solo se montan en el DOM cuando su estado de visibilidad
            correspondiente es `true`. Esto es más eficiente que mantenerlos ocultos con CSS.
          */}
          {esVisibleModalAgregarModulo && (
            <ModalAgregarModulo onCourseAdded={agregarCurso} onClose={() => definirEsVisibleModalAgregarModulo(false)} />
          )}

          {esVisibleModalEditarModulo && cursoEditandose && (
            <ModalEditarModulo
              isOpen={esVisibleModalEditarModulo} // Prop para controlar la visibilidad interna del modal
              onClose={() => {
                definirEsVisibleModalEditarModulo(false);
                definirCursoEditandose(null);
              }}
              course={cursoEditandose} // El curso a editar
              onCourseUpdated={manejarCursoActualizado} // Función para actualizar el estado global
            />
          )}

          {esVisibleModalAgregarContenido && (
            <AddContentModal
              isOpen={esVisibleModalAgregarContenido}
              onClose={() => definirEsVisibleModalAgregarContenido(false)}
              onContentAdded={manejarContenidoAgregado}
              curso_id={idCursoActual} // ID del curso al que se agregará el contenido
              contentType={tipoContenidoParaAgregar} // Tipo de contenido a agregar
            />
          )}

          {/* Contenedor principal que crecerá para empujar el footer hacia abajo */}
          <main className="main-content">
            {/* 
              SISTEMA DE RUTAS PRINCIPAL:
              El componente `Routes` de `react-router-dom` actúa como un conmutador.
              Renderiza el primer `Route` que coincide con la URL actual.
            */}
            <Routes>
              {/* Ruta Raíz ('/'): Muestra la página principal si el usuario está logueado, de lo contrario redirige a /login. */}
              <Route 
                path="/" 
                element={sesionIniciada ? (
                  <>
                    <HeroPrincipal />
                    <PaginaPrincipal 
                      courses={listaCursos} // Pasa la lista de cursos filtrable
                      userRole={rolUsuario} // Pasa el rol para mostrar/ocultar botones de admin
                      terminoDeBusqueda={terminoDeBusqueda} 
                      onEditCourseClick={manejarClicEditarCurso} // Pasa la función para abrir el modal de edición
                    />
                  </>
                ) : (
                  <Navigate to="/login" />
                )} 
              />
              
              {/* Ruta de Inicio de Sesión ('/login'): Es una ruta pública. */}
              <Route path="/login" element={<InicioSesion />} />
              
              {/* Ruta de Detalle de Curso ('/curso/:id'): Ruta dinámica y protegida. */}
              <Route 
                path="/curso/:id" 
                element={
                  <RutaProtegida sesionIniciada={sesionIniciada} rolUsuario={rolUsuario}>
                    {/* La `key` fuerza a React a volver a montar el componente si la clave cambia, útil para recargar datos. */}
                    <DetalleCurso key={claveContenido} terminoDeBusqueda={terminoDeBusqueda} rolUsuario={rolUsuario} />
                  </RutaProtegida>
                } 
              />

              {/* Ruta de Logros ('/logros'): Protegida para usuarios logueados. */}
              <Route
                path="/logros"
                element={
                  <RutaProtegida sesionIniciada={sesionIniciada} rolUsuario={rolUsuario}>
                    <PaginaLogros />
                  </RutaProtegida>
                }
              />

              {/* Ruta de Progreso del Usuario ('/progreso'): Protegida para usuarios logueados. */}
              <Route
                path="/progreso"
                element={
                  <RutaProtegida sesionIniciada={sesionIniciada} rolUsuario={rolUsuario}>
                    <UserProgressPage />
                  </RutaProtegida>
                }
              />

              {/* Ruta de Progreso de Administrador ('/admin/progreso'): Protegida y restringida solo para el rol 'administrador'. */}
              <Route
                path="/admin/progreso"
                element={
                  <RutaProtegida 
                    sesionIniciada={sesionIniciada} 
                    rolUsuario={rolUsuario} 
                    rolesAutorizados={['administrador']}
                  >
                    <PaginaProgresoAdmin />
                  </RutaProtegida>
                }
              />

              {/* Ruta para la página de administración de usuarios (solo para administradores) */}
              <Route
                path="/admin/usuarios"
                element={
                  <RutaProtegida 
                    sesionIniciada={sesionIniciada} 
                    rolUsuario={rolUsuario} 
                    rolesAutorizados={['administrador']}>
                    <AdminUsuariosPage />
                  </RutaProtegida>
                }
              />
            </Routes>
          </main>
          
          {/* Pie de Página: Componente estático con información de contacto. */}
          <InfoContactos/>
        </>
      )}
    </>
  );
}

// =================================================================
// COMPONENTE RAÍZ DE LA APLICACIÓN
// =================================================================
// Este es el nuevo componente raíz. Su única función es configurar los
// proveedores globales como el Router y nuestro nuevo `RouteLoadingProvider`.
export default function Aplicacion() {
  return (
    <BrowserRouter>
      <RouteLoadingProvider>
        <AppContent />
      </RouteLoadingProvider>
    </BrowserRouter>
  );
}