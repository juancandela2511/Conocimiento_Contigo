import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route,Navigate  } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import ProtectedRoute from './components/ProtectedRoute';
// Importa todos tus componentes aquí
import Login from './pages/Login';
// Asegúrate de escribirlo así exactamente:
import AdminDashboard from "./components/Admin/AdminDashboard";
import HomePage from './components/HomePage'; // Asegúrate que este archivo exista
import Navbar from './components/Navbar';
import ContactsInfo from './components/ContactsInfo';
import Loading from './components/Loading';

export default function App() {
  // Inicializamos en false porque al cargar la app, 
  // Supabase verificará si hay sesión activa.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
   // 1. Agregamos un estado de carga inicial
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([
    { id: 1, title: "Introducción a la Empresa", status: "completado" },
    { id: 2, title: "Productividad Call Center", status: "en-progreso" },
  ]);
   
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Mantenemos el timeout para probar, pero ahora no destruirá el DOM
      setTimeout(() => {
        setIsLoggedIn(!!session);
        setIsLoading(false);
      }, 2000);
    });

    // 2. Escuchamos cambios (si el usuario hace login o logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

   
    if (isLoading) {
    return <Loading isLoading={true} />;
  } 
  

  const addCourse = (newCourse) => {
    setCourses([...courses, newCourse]);
  };

  return (
<BrowserRouter>
    <Navbar isLoggedIn={isLoggedIn} />
    
    <Routes>
      {/* Redirigir la raíz ('/') a una página u otra según el estado */}
      <Route 
        path="/" 
        element={isLoggedIn ? <HomePage courses={courses} /> : <Navigate to="/login" />} 
      />
      
      <Route path="/login" element={<Login />} />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <AdminDashboard addCourse={addCourse} />
          </ProtectedRoute>
        } 
      />
    </Routes>
    
    <ContactsInfo/>
  </BrowserRouter>
  );
}