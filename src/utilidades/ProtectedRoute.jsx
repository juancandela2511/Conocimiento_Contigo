/* 
  Archivo: ProtectedRoute.jsx
  Función: Componente de orden superior (HOC) que protege rutas.
           Verifica si el usuario ha iniciado sesión y si tiene el rol adecuado.
           Si no cumple las condiciones, redirige a otra página.
*/
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ sesionIniciada, rolUsuario, rolesAutorizados, children }) {
  
  // 1. Verifica si el usuario tiene una sesión activa.
  if (!sesionIniciada) {
    // Si no, lo redirige al login. `replace` evita que esta ruta quede en el historial del navegador.
    return <Navigate to="/login" replace />;
  }

  // 2. Si la ruta requiere roles específicos, verifica si el rol del usuario está en la lista de roles autorizados.
  if (rolesAutorizados && rolesAutorizados.length > 0 && !rolesAutorizados.includes(rolUsuario)) {
    // Si no tiene el rol adecuado, lo redirige a la página principal.
    return <Navigate to="/" replace />;
  }

  // 3. Si todas las validaciones pasan, renderiza el componente hijo (la página protegida).
  return children;
}