import { Navigate } from 'react-router-dom';

// isLoggedIn se lo pasas desde App.js
export default function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    // Si no está logueado, lo mandamos al login
    return <Navigate to="/login" replace />;
  }
  // Si está logueado, renderizamos el contenido (el Dashboard)
  return children;
}