/*
  Archivo: Login.jsx
  Función: Gestiona la interfaz y lógica de autenticación (inicio de sesión y registro) del usuario.
  Tipo: Página (Componente de Frontend) con estilo Neumórfico 3D.
*/

// Hooks de React para manejar el estado y la navegación.
import { useState } from 'react';

// Cliente de Supabase para interactuar con el backend.
import { supabase } from '../services/supabaseClient';

// Componentes y estilos.
import './Login.css';
import { User } from 'lucide-react'; // Ícono para el avatar

// Define la función principal del componente Login.
function InicioSesion() {
  // --- ESTADOS DEL COMPONENTE ---
  const [esRegistro, definirEsRegistro] = useState(false);
  const [correo, definirCorreo] = useState('');
  const [contrasena, definirContrasena] = useState('');
  const [nombreUsuario, definirNombreUsuario] = useState('');

  // Función que se ejecuta al enviar el formulario.
  const manejarAutenticacion = async (e) => {
    e.preventDefault(); // Previene la recarga de la página.

    try {
      // Lógica para el registro de un nuevo usuario.
      if (esRegistro) {
        // 1. Crea el usuario en el sistema de autenticación de Supabase.
        const { data: datos, error } = await supabase.auth.signUp({
          email: correo,
          password: contrasena,
          options: { data: { Usuario: nombreUsuario } },
        });

        if (error) throw error;

        // 2. Inserta el perfil del usuario en la tabla 'Usuario' pública.
        const { error: errorInsercion } = await supabase
          .from('Usuario')
          .insert([{
            id: datos.user.id,
            Usuario: nombreUsuario,
            profile: 'usuario',
          }]);
        
        if (errorInsercion) throw errorInsercion;

        // El registro fue exitoso. Supabase inicia sesión automáticamente.
        alert("¡Registro exitoso! Bienvenido a Aprende Contigo.");
        definirEsRegistro(false);

      } else {
        // Lógica para el inicio de sesión de un usuario existente.
        const { error } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contrasena,
        });
        if (error) throw error;
      }
    } catch (err) {
      // Captura y muestra cualquier error de Supabase.
      console.error("Error de autenticación:", err.message);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="login-page-container">
      {/* Carga del logo desde la carpeta /public directamente */}
      <img src="/logo.png" alt="Logo Aprende Contigo" className="brand-logo-top-left" />
      
      {/* La clase 'show-signup' controla la animación de giro */}
      <div className={`login-card ${esRegistro ? 'show-signup' : ''}`}>
        <div className="login-card-inner">
          {/* --- Cara Frontal: Iniciar Sesión --- */}
          <div className="login-card-front">
            <div className="login-avatar">
              <User size={40} strokeWidth={1.5} />
            </div>
            <form onSubmit={manejarAutenticacion} className="auth-form">
              <h2>Iniciar Sesión</h2>
              <div className="input-group">
                <input 
                  type="email" 
                  placeholder="Correo" 
                  required 
                  value={correo}
                  onChange={(e) => definirCorreo(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  required 
                  value={contrasena}
                  onChange={(e) => definirContrasena(e.target.value)} 
                />
              </div>
              <button type="submit">LOGIN</button>
              <p className="toggle-link" onClick={() => definirEsRegistro(true)}>
                ¿No tienes cuenta? <strong>Regístrate</strong>
              </p>
            </form>
          </div>

          {/* --- Cara Trasera: Registro --- */}
          <div className="login-card-back">
            <div className="login-avatar">
              <User size={40} strokeWidth={1.5} />
            </div>
            <form onSubmit={manejarAutenticacion} className="auth-form">
              <h2>Crear Cuenta</h2>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Nombre de usuario" 
                  required 
                  value={nombreUsuario}
                  onChange={(e) => definirNombreUsuario(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <input 
                  type="email" 
                  placeholder="Correo" 
                  required 
                  value={correo}
                  onChange={(e) => definirCorreo(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  required 
                  value={contrasena}
                  onChange={(e) => definirContrasena(e.target.value)} 
                />
              </div>
              <button type="submit">REGISTRARME</button>
              <p className="toggle-link" onClick={() => definirEsRegistro(false)}>
                ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InicioSesion;