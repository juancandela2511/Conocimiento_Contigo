/*
  Archivo: RouteLoadingContext.jsx
  Función: Provee un estado global para saber si una ruta está cargando datos.
           Esto permite tener un único indicador de carga que no parpadea durante la navegación.
  Tipo: Contexto de React (Frontend).
*/
import { createContext, useState, useContext } from 'react';

const RouteLoadingContext = createContext(null);

export const RouteLoadingProvider = ({ children }) => {
    const [isRouteLoading, setIsRouteLoading] = useState(false);
    return (
        <RouteLoadingContext.Provider value={{ isRouteLoading, setIsRouteLoading }}>
            {children}
        </RouteLoadingContext.Provider>
    );
};

export const useRouteLoading = () => {
    return useContext(RouteLoadingContext);
};