/*
  Archivo: Login.jsx
  Función: Gestiona la interfaz y lógica de autenticación (inicio de sesión y registro) del usuario.
  Tipo: Página (Componente de Frontend).
*/

// Hooks de React para manejar el estado y la navegación.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Cliente de Supabase para interactuar con el backend.
import { supabase } from '../services/supabaseClient';

// Componentes y estilos.
import Cargando from '../components/Loading';
import './Login.css';

// Define la función principal del componente Login.
function InicioSesion() {
  // --- ESTADOS DEL COMPONENTE ---
  const [esRegistro, definirEsRegistro] = useState(false);
  const [correo, definirCorreo] = useState('');
  const [contrasena, definirContrasena] = useState('');
  const [nombreUsuario, definirNombreUsuario] = useState('');
  const [estaCargando, definirEstaCargando] = useState(false);
    
  // Hook para la navegación programática.
  const navegar = useNavigate();

  // Función que se ejecuta al enviar el formulario.
  const manejarAutenticacion = async (e) => {
    e.preventDefault(); // Previene la recarga de la página.
    
    definirEstaCargando(true);

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

        alert("¡Registro exitoso! Por favor, inicia sesión.");
        definirEsRegistro(false); // Cambia al modo de inicio de sesión.

      } else {
        // Lógica para el inicio de sesión de un usuario existente.
        const { data: datosAutenticacion, error } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contrasena,
        });
        if (error) throw error;

        // Redirige al usuario a la página principal tras un inicio de sesión exitoso.
        navegar('/');
      }
    } catch (err) {
      // Captura y muestra cualquier error de Supabase.
      console.error("Error de autenticación:", err.message);
      alert("Error: " + err.message);
    } finally {
      // Se ejecuta siempre, haya o no error.
      definirEstaCargando(false);
    }
  };

  // Muestra la pantalla de carga mientras se procesa la solicitud.
  if (estaCargando) {
    return <Cargando />;
  }

  return (
    <div className="container">
      <div className="panel-imagen">
        <img src="/logo.png" alt="Logo" />
      </div>
      <div className="panel-formulario">
        <form onSubmit={manejarAutenticacion}>
          <h1>{esRegistro ? "Registrarse" : "Iniciar Sesión"}</h1>
          
          {esRegistro && (
            <input
              type="text"
              placeholder="Nombre de usuario"
              onChange={(e) => definirNombreUsuario(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Correo"
            onChange={(e) => definirCorreo(e.target.value)}
          />
          
          <input
            type="password"
            placeholder="Contraseña"
            onChange={(e) => definirContrasena(e.target.value)}
          />
          
          <button type="submit">{esRegistro ? "Crear cuenta" : "Entrar"}</button>
        </form>

        <p onClick={() => definirEsRegistro(!esRegistro)}>
          {esRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </p>
      </div>
    </div>
  );
}

export default InicioSesion;