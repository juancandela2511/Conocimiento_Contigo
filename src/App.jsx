import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import HeroPrincipal from './components/HeroPrincipal';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from "./components/Admin/AdminDashboard";
import HomePage from './components/HomePage'; 
import Navbar from './components/Navbar';
import ContactsInfo from './components/ContactsInfo';
import Loading from './components/Loading';

export default function App() {

  // --- ESTADOS DE LA APLICACIÓN ---
  
  // Estado para capturar el texto ingresado en el buscador del Navbar
  const [terminoDeBusqueda, setTerminoDeBusqueda] = useState('');
  
  // Estados de autenticación y carga
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); 
  
  // Lista de cursos inicial (datos locales)
  const [courses, setCourses] = useState([
    { id: 1, title: "Introducción a la Empresa", status: "completado" },
    { id: 2, title: "Productividad Call Center", status: "en-progreso" },
  ]);
   
  // --- INICIALIZACIÓN Y SESIÓN ---

  // Efecto que se dispara al cargar la aplicación para verificar la autenticación del usuario en Supabase
  useEffect(() => {
    const initApp = async () => {
      // Obtenemos la sesión actual desde Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsLoggedIn(true);
        
        // Consultamos el rol (perfil) del usuario logueado en la tabla 'Usuario'
        const { data: userData } = await supabase
          .from('Usuario')
          .select('profiles')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUserRole(userData.profiles);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
      setIsLoading(false); // Finalizamos la carga una vez verificada la sesión
    };

    initApp();
  }, []);

  // --- FUNCIONES AUXILIARES ---

  // Función para agregar un nuevo curso a la lista existente, actualizando el estado 'courses'
  const addCourse = (newCourse) => {
    setCourses([...courses, newCourse]);
  };

  // --- RENDERIZADO CONDICIONAL ---

  // Mientras se verifica la sesión en el useEffect, mostramos el componente de carga para evitar parpadeos
  if (isLoading) {
    return <Loading isLoading={true} />;
  } 
  
  return (
    <BrowserRouter>
      {/* Barra de navegación global: le enviamos la función para actualizar la búsqueda */}
      <Navbar 
        isLoggedIn={isLoggedIn} 
        alBuscar={setTerminoDeBusqueda} 
      />
      
      {/* Definición de rutas: estructura las diferentes vistas de la SPA */}
      <Routes>

       
        {/* Ruta principal: Home. Si el usuario está autenticado muestra el dashboard, sino redirige al login */}
        <Route 
          path="/" 
          element={isLoggedIn ? (
            <>
              {/* Aquí ambos componentes conviven dentro de la ruta raíz */}
              <HeroPrincipal />
              <HomePage 
                courses={courses} 
                userRole={userRole} 
                terminoDeBusqueda={terminoDeBusqueda} 
              />
            </>
          ) : <Navigate to="/login" />} 
        />
        
        {/* Página de inicio de sesión: muestra el formulario de autenticación */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta protegida: utiliza el componente ProtectedRoute para verificar si el usuario tiene acceso a la zona de administración */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <AdminDashboard 
                addCourse={addCourse} 
                terminoDeBusqueda={terminoDeBusqueda} 
              />
            </ProtectedRoute>
          } 
        />
        
      </Routes>
      
      {/* Información de contacto: componente que permanece estático al pie de página en toda la navegación */}
      <ContactsInfo/>
    </BrowserRouter>
  );
}