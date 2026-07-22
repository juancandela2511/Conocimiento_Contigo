/* 
   FUNCIÓN: Este componente actúa como un "filtro de seguridad".
   Su labor es proteger rutas privadas, asegurando que solo los usuarios 
   que han iniciado sesión puedan ver el contenido (children) y redirigiendo 
   automáticamente a quienes no lo han hecho hacia la página de login.
*/
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ sesionIniciada, rolUsuario, authorizedRoles, children }) {
  
  // Verificamos si el usuario no tiene una sesión activa
  if (!sesionIniciada) {
    // Si no está logueado, lo enviamos al login.
    // "replace" evita que el usuario pueda volver atrás al sitio protegido.
    return <Navigate to="/login" replace />;
  }

  // Si la ruta requiere roles específicos, verificamos si el usuario tiene uno de ellos.
  if (authorizedRoles && authorizedRoles.length > 0 && !authorizedRoles.includes(rolUsuario)) {
    // Si el usuario no tiene el rol adecuado, lo redirigimos a la página principal.
    // Esto evita que un usuario normal acceda a rutas de administrador.
    return <Navigate to="/" replace />;
  }

  // Si la validación pasa (está logueado), permitimos que renderice el contenido solicitado
  return children;
}

/* 
   CONEXIÓN: Este componente debe estar conectado en App.jsx 
   que gestione la sesión de usuario de Supabase. Debes alimentar la prop 'isLoggedIn' con una 
   variable de estado (ej: const [session, setSession] = useState(null)) que se actualice 
   mediante un 'useEffect' escuchando 'supabase.auth.onAuthStateChange'.
*/