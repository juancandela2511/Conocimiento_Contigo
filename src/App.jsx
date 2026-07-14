/*
  Archivo: App.jsx
  Función: Es el componente raíz de la aplicación. Gestiona el estado global (sesión, rol, cursos),
           la autenticación y la estructura de las rutas.
  Tipo: Componente de Frontend que orquesta la lógica y las llamadas al Backend.
*/

import { useState, useEffect } from 'react'; // Hooks de React para estado y efectos.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import HeroPrincipal from './components/HeroPrincipal';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import HomePage from './components/HomePage'; 
import Navbar from './components/Navbar';
import EditorNavbar from './components/EditorNavbar';
import CursoDetalle from './pages/CursoDetalle'; // 1. Importa el nuevo componente
import ContactsInfo from './components/ContactsInfo';
import AddCard from './components/Admin/AddCard';
import Loading from './components/Loading';
import ChatIA from './ChatIA';

export default function App() {

  // --- ESTADOS GLOBALES DE LA APLICACIÓN (Lógica de Frontend) ---
  
  // Almacena el texto del buscador para pasarlo a otros componentes.
  const [terminoDeBusqueda, setTerminoDeBusqueda] = useState('');
  
  // Controlan si el usuario ha iniciado sesión y si la app está en estado de carga inicial.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Almacena el rol del usuario ('administrador', 'usuario').
  const [userRole, setUserRole] = useState(null); 
  // Controla la visibilidad del modal para agregar nuevos módulos.
  const [isAddModuleVisible, setIsAddModuleVisible] = useState(false); // Estado para el modal
  
  // Almacena la lista de cursos traída desde la base de datos.
  const [courses, setCourses] = useState([]);
   
  // --- LÓGICA DE INICIALIZACIÓN Y SESIÓN (Frontend interactuando con Backend) ---

  // Este efecto se ejecuta una vez y se encarga de gestionar la sesión del usuario.
  useEffect(() => {
    // Activa la pantalla de carga inicial.
    setIsLoading(true); 

    // Variable para asegurar que la pantalla de carga solo se muestre una vez.
    let initialLoadComplete = false;

    // --- INTERACCIÓN CON EL BACKEND (AUTH) ---
    // Se suscribe a los cambios de estado de autenticación de Supabase (login, logout).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Si hay una sesión activa, actualiza el estado del Frontend.
        setIsLoggedIn(true);

        // --- INTERACCIÓN CON EL BACKEND (BASE DE DATOS) ---
        // Busca el rol del usuario en la tabla 'Usuario'.
        const { data: userData } = await supabase
          .from('Usuario')
          .select('profile')
          .eq('id', session.user.id)
          .single();

        // Actualiza el rol en el estado del Frontend.
        setUserRole(userData?.profile || null);
        console.log('Rol del usuario recuperado:', userData?.profile);

        // --- INTERACCIÓN CON EL BACKEND (BASE DE DATOS) ---
        // Carga todos los cursos de la tabla 'cursos'.
        const { data: coursesData, error: coursesError } = await supabase
          .from('cursos')
          .select('*');
        
        if (coursesError) console.error("Error cargando cursos:", coursesError);
        else setCourses(coursesData); // Actualiza la lista de cursos en el estado del Frontend.

      } else {
        // Si no hay sesión, resetea los estados del Frontend.
        setIsLoggedIn(false);
        setUserRole(null);
        setCourses([]);
      }
      // Desactiva la pantalla de carga después del primer chequeo de sesión.
      if (!initialLoadComplete) {
        setIsLoading(false);
        initialLoadComplete = true;
      }
    });

    // Función de limpieza: se desuscribe del "oyente" para evitar fugas de memoria.
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // --- FUNCIONES AUXILIARES (Lógica de Frontend) ---

  // Añade un nuevo curso a la lista local para que la UI se actualice al instante.
  const addCourse = (newCourse) => {
    setCourses([...courses, newCourse]);
  };

  // --- RENDERIZADO (Frontend) ---

  // Muestra la pantalla de carga mientras se verifica la sesión inicial.
  if (isLoading) {
    return <Loading isLoading={true} />;
  } 
  
  return (
    <BrowserRouter>
      {/* Componentes globales que se muestran en todas las páginas si el usuario está logueado. */}
      <Navbar 
        isLoggedIn={isLoggedIn} 
        alBuscar={setTerminoDeBusqueda} 
        userRole={userRole}
      />

      {/* Lógica de Frontend: Muestra la barra de edición solo si el rol es 'administrador'. */}
      {userRole === 'administrador' && (
        <EditorNavbar onAddModuleClick={() => setIsAddModuleVisible(true)} />
      )}

      {/* Lógica de Frontend: Muestra el modal de agregar curso si el estado es true. */}
      {isAddModuleVisible && (
        <AddCard onCourseAdded={addCourse} onClose={() => setIsAddModuleVisible(false)} />
      )}

      {/* Lógica de Frontend: Muestra el chat de IA si el usuario ha iniciado sesión. */}
      {isLoggedIn && <ChatIA />}


      {/* Sistema de rutas de la aplicación (Frontend). */}
      <Routes>

       
        {/* Ruta principal ('/'). Protegida: solo accesible si isLoggedIn es true. */}
        <Route 
          path="/" 
          element={isLoggedIn ? (
            <>
              <HeroPrincipal />
              <HomePage 
                courses={courses} 
                userRole={userRole} 
                terminoDeBusqueda={terminoDeBusqueda} 
              />
            </>
          ) : <Navigate to="/login" />} 
        />
        
        {/* Ruta para la página de login. */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta para ver el detalle de un curso. También protegida. */}
        <Route 
          path="/curso/:id" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CursoDetalle />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      {/* Componente de pie de página. */}
      <ContactsInfo/>
    </BrowserRouter>
  );
}