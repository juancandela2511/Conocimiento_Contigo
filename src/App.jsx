import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importa todos tus componentes aquí
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import HomePage from './components/HomePage'; // Asegúrate que este archivo exista
import Navbar from './components/Navbar';
import ContactsInfo from './components/ContactsInfo';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // El estado central vive aquí
  const [courses, setCourses] = useState([
    { id: 1, title: "Introducción a la Empresa", status: "completado" },
    { id: 2, title: "Productividad Call Center", status: "en-progreso" }
  ]);

  // La función central para modificar el estado
  const addCourse = (newCourse) => {
    setCourses([...courses, newCourse]);
  };

  return (
    <BrowserRouter>
      {/* 1. Componentes Fijos */}
      <Navbar isLoggedIn={isLoggedIn} />
      
      <Routes>
        {/* Aquí está el cambio importante: pasamos la función onLogin */}
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        
        {/* Ruta principal */}
        <Route path="/" element={<HomePage courses={courses} />} />
        
        {/* Ruta de administración */}
        <Route 
           path="/admin" 
           element={<AdminDashboard addCourse={addCourse} />} 
        />
      </Routes>
      
      <ContactsInfo/>
    </BrowserRouter>
  );
}