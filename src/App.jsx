/*
  Archivo: App.jsx
  Función: Es el componente raíz de la aplicación. Gestiona el estado global (sesión, rol, cursos),
           la autenticación, los modales y la estructura de las rutas.
  Tipo: Componente de Frontend que orquesta la lógica y las llamadas al Backend.
*/

// =================================================================
// 1. IMPORTACIONES
// =================================================================
// Hooks de React para manejar el estado y el ciclo de vida del componente.
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

// --- Componentes de Modales para Administradores ---
import ModalAgregarModulo from './components/Admin/AddCard';
import ModalAgregarLectura from './components/Admin/AddLecturaModal';
import ModalEditarModulo from './components/Admin/EditCard';
import ModalAgregarVideo from './components/Admin/AddVideoModal';
import ModalAgregarCuestionario from './components/Admin/AddCuestionarioModal';

// Importación directa de los estilos del pie de página para asegurar su carga.
import './components/ContactsInfo.css';

export default function Aplicacion() {

  // =================================================================
  // 2. ESTADOS DEL COMPONENTE
  // =================================================================
  // Aquí definimos todas las "piezas de información" que pueden cambiar y que 
  // necesitan que la interfaz se vuelva a dibujar cuando cambian.
  
  // --- Estados de Sesión y Usuario ---
  const [sesionIniciada, definirSesionIniciada] = useState(false);
  const [rolUsuario, definirRolUsuario] = useState(null);
  const [estaCargando, definirEstaCargando] = useState(true);

  // --- Estados de la Interfaz y Navegación ---
  const [terminoDeBusqueda, definirTerminoDeBusqueda] = useState('');
  const [claveContenido, definirClaveContenido] = useState(0);

  // --- Estados de Datos (Cursos) ---
  const [cursos, definirCursos] = useState([]);
  const [cursoEditandose, definirCursoEditandose] = useState(null);
  const [idCursoActual, definirIdCursoActual] = useState(null);

  // --- Estados de Visibilidad de Modales ---
  const [esVisibleModalAgregarModulo, definirEsVisibleModalAgregarModulo] = useState(false);
  const [esVisibleModalEditarModulo, definirEsVisibleModalEditarModulo] = useState(false);
  const [esVisibleModalAgregarLectura, definirEsVisibleModalAgregarLectura] = useState(false);
  const [esVisibleModalAgregarVideo, definirEsVisibleModalAgregarVideo] = useState(false);
  const [esVisibleModalAgregarCuestionario, definirEsVisibleModalAgregarCuestionario] = useState(false);
   
  // =================================================================
  // 3. EFECTOS (LÓGICA DE INICIALIZACIÓN Y SUSCRIPCIONES)
  // =================================================================

  // Este `useEffect` es el corazón de la gestión de sesión. Se ejecuta solo una vez cuando la app carga.
  useEffect(() => {
    const tiempoInicio = Date.now();

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

        // Cargamos la lista completa de cursos desde la base de datos.
        const { data: datosCursos, error: errorCursos } = await supabase
          .from('cursos')
          .select('*');
        
        if (errorCursos) console.error("Error cargando cursos:", errorCursos);
        else definirCursos(datosCursos); // Guardamos los cursos en el estado.

      } else {
        // --- SI NO HAY SESIÓN (USUARIO NO LOGUEADO) ---
        definirSesionIniciada(false);
        definirRolUsuario(null);
        definirCursos([]);
      }
      
      // 4. Ocultamos la pantalla de carga, asegurando que se muestre por lo menos 2 segundos.
      const tiempoTranscurrido = Date.now() - tiempoInicio;
      const tiempoRestante = 2000 - tiempoTranscurrido;

      if (tiempoRestante > 0) {
        setTimeout(() => definirEstaCargando(false), tiempoRestante);
      } else {
        definirEstaCargando(false);
      }
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
    definirCursos(cursosAnteriores => [...cursosAnteriores, nuevoCurso]);
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
    definirCursos(cursosAnteriores => cursosAnteriores.map(curso =>
      curso.id === cursoActualizado.id ? cursoActualizado : curso
    ));
    // CORRECCIÓN: Se cierra el modal y se limpia el estado de edición después de guardar.
    definirEsVisibleModalEditarModulo(false);
    definirCursoEditandose(null);
  };

  /**
   * Abre el modal correspondiente para agregar contenido (lectura, video, etc.)
   * y guarda el ID del curso al que pertenece.
   * @param {function} modalSetter - La función `setIs...Visible` para el modal específico.
   * @param {string} idCurso - El ID del curso actual.
   */
  const abrirModalAgregarContenido = (definirVisibilidadModal, idCurso) => {
    if (idCurso) {
      definirIdCursoActual(idCurso);
      definirVisibilidadModal(true);
    } else {
      console.error("No se puede agregar contenido sin un ID de curso.");
    }
  };

  /**
   * Se ejecuta cuando un nuevo contenido ha sido agregado exitosamente.
   * Cierra todos los modales de contenido y fuerza una recarga de la página de detalles del curso.
   */
  const manejarContenidoAgregado = () => {
    definirEsVisibleModalAgregarVideo(false);
    definirEsVisibleModalAgregarCuestionario(false);
    definirEsVisibleModalAgregarLectura(false);
    // Cambiamos la 'key' para que React piense que es un componente nuevo y lo vuelva a renderizar.
    definirClaveContenido(claveAnterior => claveAnterior + 1); 
    definirIdCursoActual(null); // Limpia el ID del curso actual.
  };

  // =================================================================
  // 5. RENDERIZADO DEL COMPONENTE
  // =================================================================

  // Muestra la pantalla de carga global mientras se verifica la sesión inicial.
  if (estaCargando) {
    return <Cargando isLoading={true} />;
  } 
  
  return (
    // BrowserRouter envuelve toda la app para habilitar el enrutamiento.
    <BrowserRouter>
      {/* Componentes globales que se muestran en casi todas las páginas */}
      <BarraNavegacion 
        sesionIniciada={sesionIniciada} 
        alBuscar={definirTerminoDeBusqueda} 
        rolUsuario={rolUsuario}
      />

      {/* La barra de edición solo se muestra si el usuario es administrador. */}
      {rolUsuario === 'administrador' && (
        <BarraNavegacionEditor 
          alHacerClicAgregarModulo={() => definirEsVisibleModalAgregarModulo(true)}
          alHacerClicAgregarLectura={(idCurso) => abrirModalAgregarContenido(definirEsVisibleModalAgregarLectura, idCurso)}
          alHacerClicAgregarVideo={(idCurso) => abrirModalAgregarContenido(definirEsVisibleModalAgregarVideo, idCurso)}
          alHacerClicAgregarCuestionario={(idCurso) => abrirModalAgregarContenido(definirEsVisibleModalAgregarCuestionario, idCurso)}
        />
      )}

      {/* El chat de IA solo se muestra si el usuario ha iniciado sesión. */}
      {sesionIniciada && <AsistenteIA />}

      {/* --- Renderizado Condicional de Modales --- */}
      {/* Cada modal solo se renderiza si su estado de visibilidad es `true`. */}

      {esVisibleModalAgregarModulo && (
        <ModalAgregarModulo onCourseAdded={agregarCurso} onClose={() => definirEsVisibleModalAgregarModulo(false)} />
      )}

      {esVisibleModalEditarModulo && cursoEditandose && (
        <ModalEditarModulo
          isOpen={esVisibleModalEditarModulo}
          onClose={() => {
            definirEsVisibleModalEditarModulo(false);
            definirCursoEditandose(null);
          }}
          course={cursoEditandose}
          onCourseUpdated={manejarCursoActualizado}
        />
      )}

      {esVisibleModalAgregarLectura && (
        <ModalAgregarLectura curso_id={idCursoActual} isOpen={esVisibleModalAgregarLectura} onClose={() => definirEsVisibleModalAgregarLectura(false)} onContentAdded={manejarContenidoAgregado} />
      )}
      {esVisibleModalAgregarVideo && (
        <ModalAgregarVideo curso_id={idCursoActual} isOpen={esVisibleModalAgregarVideo} onClose={() => definirEsVisibleModalAgregarVideo(false)} onContentAdded={manejarContenidoAgregado} />
      )}
      {esVisibleModalAgregarCuestionario && (
        <ModalAgregarCuestionario curso_id={idCursoActual} isOpen={esVisibleModalAgregarCuestionario} onClose={() => definirEsVisibleModalAgregarCuestionario(false)} onContentAdded={manejarContenidoAgregado} />
      )}

      {/* --- Sistema de Rutas --- */}
      {/* `Routes` define qué componente se muestra para cada URL. */}
      <Routes>

       
        {/* Ruta principal ('/'). Protegida. */}
        <Route 
          path="/" 
          element={sesionIniciada ? (
            // Si el usuario está logueado, muestra la página de inicio.
            <>
              <HeroPrincipal />
              <PaginaPrincipal 
                courses={cursos} 
                userRole={rolUsuario} 
                terminoDeBusqueda={terminoDeBusqueda} 
                onEditCourseClick={manejarClicEditarCurso}
              />
            </>
          ) : (
            // Si un usuario no logueado intenta acceder a la raíz, es redirigido a la página de login.
            <Navigate to="/login" />
          )} 
        />
        
        {/* Ruta para la página de login. Es pública. */}
        <Route path="/login" element={<InicioSesion />} />
        
        {/* Ruta para ver el detalle de un curso. Es una ruta dinámica (el `:id` cambia). */}
        <Route 
          path="/curso/:id" 
          element={
            // Usamos `ProtectedRoute` para asegurar que solo usuarios logueados puedan entrar.
            <RutaProtegida sesionIniciada={sesionIniciada} rolUsuario={rolUsuario}>
              <DetalleCurso key={claveContenido} terminoDeBusqueda={terminoDeBusqueda} />
            </RutaProtegida>
          } 
        />

        {/* Ruta para la página de logros. También protegida. */}
        <Route
          path="/logros"
          element={
            <RutaProtegida sesionIniciada={sesionIniciada} rolUsuario={rolUsuario}>
              <PaginaLogros />
            </RutaProtegida>
          }
        />

        {/* Ruta para la página de progreso de usuarios (solo para administradores) */}
        <Route
          path="/admin/progreso"
          element={
            <RutaProtegida sesionIniciada={sesionIniciada} rolUsuario={rolUsuario} authorizedRoles={['administrador']}>
              <PaginaProgresoAdmin />
            </RutaProtegida>
          }
        />
      </Routes>
      
      {/* Componente de pie de página, visible en todas las páginas. */}
      <InfoContactos/>
    </BrowserRouter>
  );
}