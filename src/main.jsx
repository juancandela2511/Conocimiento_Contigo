/*
  Archivo: main.jsx
  Función: Es el punto de entrada de la aplicación React.
           Se encarga de renderizar el componente raíz (`App`) en el DOM.
*/
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Importa los estilos globales
import App from './App.jsx' // Importa el componente principal de la aplicación

// 1. `createRoot` crea una raíz de renderizado para la aplicación en el elemento del DOM con id 'root'.
//    Este es el método moderno de renderizado de React 18.
createRoot(document.getElementById('root')).render(
  // 2. `StrictMode` es una herramienta para destacar problemas potenciales en la aplicación.
  //    No renderiza ninguna UI visible, pero activa advertencias y comprobaciones adicionales.
  <StrictMode>
    {/* 3. `App` es el componente que envuelve toda la lógica y la interfaz de la aplicación. */}
    <App />
  </StrictMode>,
)
