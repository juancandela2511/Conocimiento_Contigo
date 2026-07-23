/*
  Archivo: SettingsModal.jsx
  Función: Muestra un panel de configuración con opciones generales y de administrador.
  Tipo: Componente de Frontend.
*/
import { Link } from 'react-router-dom';
import { X, User, Shield, Palette } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import './SettingsModal.css';

export default function SettingsModal({ isOpen, onClose, userRole }) {
  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>Configuración</h2>
          <button onClick={onClose} className="settings-close-btn">
            <X size={24} />
          </button>
        </div>
        <div className="settings-modal-body">
          {/* --- Sección General (para todos) --- */}
          <div className="settings-section">
            <h3>General</h3>
            <div className="setting-item">
              <div className="setting-item-label">
                <Palette size={20} />
                <span>Tema de la Aplicación</span>
              </div>
              <ThemeSwitcher />
            </div>
            {/* Aquí se podrían añadir más configuraciones generales en el futuro */}
          </div>

          {/* --- Sección de Administración (solo para admins) --- */}
          {userRole === 'administrador' && (
            <div className="settings-section">
              <h3>Administración</h3>
              <Link to="/admin/usuarios" className="setting-item-link" onClick={onClose}>
                <User size={20} />
                <span>Gestionar Usuarios</span>
              </Link>
              <Link to="/admin/progreso" className="setting-item-link" onClick={onClose}>
                <Shield size={20} />
                <span>Ver Progreso General</span>
              </Link>
              {/* Aquí se podrían añadir más enlaces de administración */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}