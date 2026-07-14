/* Archivo: Login.jsx - Gestiona la interfaz y lógica de autenticación (Login/Registro) del usuario. */

// Importa el hook para manejar el ciclo de vida del componente y el estado local de React.
import { useEffect, useState } from 'react';
// "Trae las herramientas básicas de React para controlar datos y efectos secundarios."

// Importa la instancia configurada de Supabase para realizar consultas a los servicios de Backend.
import { supabase } from '../services/supabaseClient';
// "Conecta con nuestra base de datos en la nube para validar o guardar usuarios."

// Importa el hook para la navegación programática entre rutas dentro de la aplicación.
import { useNavigate } from 'react-router-dom';
// "Nos permite mover al usuario de una página a otra automáticamente."

// Importa los estilos CSS específicos para este componente.
import './Login.css';
// "Define cómo se ve la página, colores, tamaños y posiciones."

// Importa el componente de pantalla de carga para mejorar la experiencia de usuario (UX).
import Loading from '../components/Loading';
// "Un aviso visual que muestra que algo está cargando."

// Define la función principal del componente Login.
function Login() {
  // "Aquí empieza el código que crea la pantalla de inicio de sesión."

  // Define un estado booleano para alternar entre el formulario de inicio de sesión y registro.
  const [esRegistro, setEsRegistro] = useState(false);
  // "Si es verdadero, mostramos el registro; si no, el inicio de sesión."

  // Define el estado para almacenar el correo electrónico ingresado en el input.
  const [email, setEmail] = useState('');
  // "Guarda lo que el usuario escribe en la casilla del correo."

  // Define el estado para almacenar la contraseña ingresada en el input.
  const [password, setPassword] = useState('');
  // "Guarda la clave secreta que el usuario escribe."

  // Define el estado para almacenar el nombre de usuario (solo usado en registro).
  const [username, setUsername] = useState('');
  // "Guarda el apodo que el usuario quiere ponerse."

  // Define el estado para manejar el modo de carga (spinner).
  const [isLoading, setIsLoading] = useState(true);
  // "Indica si la aplicación está 'trabajando' en el fondo para mostrar el cargador."
    
  // Define un efecto que se ejecuta una vez al montar el componente.
  useEffect(() => {
    // "Configura una acción automática que sucede apenas abre la pantalla."
    
    // Configura un temporizador para desactivar el estado de carga después de 1.5 segundos.
    const timer = setTimeout(() => setIsLoading(false), 1500);
    // "Espera segundo y medio y quita la pantalla de 'cargando'."
    
    // Define la función de limpieza para eliminar el temporizador si el componente se desmonta.
    return () => clearTimeout(timer);
    // "Si el usuario cambia de página muy rápido, cancela el contador para no gastar recursos."
  }, []);

  // Inicializa el hook de navegación.
  const navigate = useNavigate();
  // "Prepara la herramienta que nos permite redirigir al usuario."

  // Define la función asíncrona para manejar el envío del formulario.
  const handleAuth = async (e) => {
    // "Esta función se dispara cuando presionan el botón de enviar."
    
    // Previene el comportamiento por defecto del formulario (recarga de página).
    e.preventDefault();
    // "Evita que la página se reinicie sola al dar clic."
    
    // Activa el estado de carga antes de iniciar la solicitud a Supabase.
    setIsLoading(true);
    // "Muestra el indicador de carga porque vamos a enviar datos a la red."
    
    try {
      // Inicia el bloque para capturar posibles errores de red o base de datos.
      // "Intenta hacer lo siguiente, y si sale mal, ve al bloque 'catch'."

      // Verifica si el formulario está en modo de registro.
      if (esRegistro) {
        // "Si estamos en el modo de crear cuenta nueva..."
        
        // Llama a Supabase Auth para crear el usuario en el sistema de autenticación.
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { Usuario: username } },
        });
        // "Le pide a Supabase que cree un usuario nuevo con ese correo y clave."

        // Verifica si hubo un error en el registro de autenticación.
        if (error) {
          // "Si algo salió mal al crear el usuario..."
          alert("Error en Auth: " + error.message);
          // "Muestra una alerta con el motivo del fallo."
        } else {
          // Si el registro de Auth tuvo éxito, procede a insertar datos en la tabla 'Usuario'
          const { error: insertError } = await supabase
            .from('Usuario')
            .insert([{
              id: data.user.id,
              Usuario: username,
              profile: 'usuario',
            }]);
          
          if (insertError) {
            // Si la inserción falla, muestra el error y detiene el flujo
            console.error("Error al insertar en la tabla Usuario:", insertError);
            alert("Error al crear el perfil de usuario: " + insertError.message);
          } else {
            // Si todo fue exitoso.
            alert("¡Registro exitoso!");
            // "Le felicita por crear su cuenta."
            setEsRegistro(false);
            // "Lo regresa al modo de inicio de sesión."
          }
        }
      } else {
        // Si no es registro, procede con el inicio de sesión.
        // "Si ya tiene cuenta, vamos a entrar."
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        // "Le pide a Supabase que valide si el correo y la clave son correctos."
        
        // Verifica si hubo un error al iniciar sesión.
        if (error) {
          // "Si los datos son incorrectos..."
          alert("Error: " + error.message);
          // "Muestra el aviso del error."
        } else {
          // Consulta la tabla 'Usuario' para obtener detalles adicionales del usuario autenticado.
          const { data: userData, error: userError } = await supabase
            .from('Usuario')
            .select('Usuario')
            .eq('id', authData.user.id)
            .single();
          // "Busca el nombre del usuario en nuestra tabla para saludarlo por su nombre."
          
          // Verifica si hubo un error al consultar la base de datos.
          if (userError) {
            // "Si no encontramos el nombre en nuestra tabla..."
            console.error("Error al obtener nombre:", userError);
            // "Registra el error en consola."
            alert('¡Bienvenido!');
            // "Aun así, le damos la bienvenida."
          } else {
            // Si la consulta fue exitosa.
            alert('¡Bienvenido, ' + userData.Usuario + '!');
            // "Lo saludamos personalmente por su nombre."
          }
          
          // Redirige al usuario a la página principal.
          navigate('/');
          // "Lo enviamos a la pantalla principal después de entrar."
        }
      }
    } catch (err) {
      // Captura cualquier error inesperado en la ejecución.
      console.error(err);
      // "Si algo muy grave pasó, lo guardamos en la consola para analizarlo."
    } finally {
      // Asegura que el estado de carga se desactive independientemente del resultado.
      setIsLoading(false);
      // "Apaga la pantalla de cargando pase lo que pase."
    }
  };

  // Condicional de renderizado: si está cargando, muestra el componente Loading.
  if (isLoading) {
    // "Mientras la aplicación se prepara..."
    return <Loading />;
    // "...mostramos la pantalla de carga."
  }

  // Estructura visual del componente (JSX).
  return (
    <div className="container">
      {/* "Caja principal que contiene todo el diseño." */}
      <div className="panel-imagen">
        <img src="/logo.png" alt="Logo" />
        {/* "Caja que muestra el logo de la marca." */}
      </div>
      <div className="panel-formulario">
        <form onSubmit={handleAuth}>
          <h1>{esRegistro ? "Registrarse" : "Iniciar Sesión"}</h1>
          {/* "Título que cambia según si va a registrarse o entrar." */}
          
          {esRegistro && (
            <input
              type="text"
              placeholder="Nombre de usuario"
              onChange={(e) => setUsername(e.target.value)}
            />
          )}
          {/* "Casilla de nombre, solo aparece cuando el usuario se está registrando." */}

          <input
            type="email"
            placeholder="Correo"
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* "Casilla para escribir el correo electrónico." */}
          
          <input
            type="password"
            placeholder="Contraseña"
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* "Casilla para escribir la clave privada." */}
          
          <button type="submit">{esRegistro ? "Crear cuenta" : "Entrar"}</button>
          {/* "Botón para ejecutar el registro o el inicio de sesión." */}
        </form>

        <p onClick={() => setEsRegistro(!esRegistro)}>
          {esRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </p>
        {/* "Texto clicable para saltar entre el formulario de registro y el de login." */}
      </div>
    </div>
  );
}

// Exporta el componente para poder usarlo en otras partes de la aplicación.
export default Login;
// "Hace que este componente esté disponible para el resto del sitio."