/*
  Archivo: ThemeSwitcher.jsx
  Función: Componente para cambiar entre tema claro y oscuro.
  Tipo: Componente de Frontend.
*/
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react'; // Usando lucide-react para consistencia
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  // Inicializa el estado desde localStorage o prefiere el esquema de color del sistema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return JSON.parse(savedMode);
    }
    // Prefiere el modo oscuro si el sistema del usuario lo tiene configurado
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Efecto para aplicar la clase al body y guardar en localStorage
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div className="theme-switcher-container">
      <label className="theme-switch">
        <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
        <span className="slider">
          <Sun size={16} className="sun-icon" />
          <Moon size={16} className="moon-icon" />
        </span>
      </label>
    </div>
  );
};

export default ThemeSwitcher;