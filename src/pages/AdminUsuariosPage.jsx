/*
  Archivo: AdminUsuariosPage.jsx
  Función: Muestra una tabla para administrar todos los usuarios de la plataforma.
  Tipo: Página de Administración (Frontend).
*/
import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useRouteLoading } from '../components/RouteLoadingContext';
import { User, Shield, Trash2, Edit } from 'lucide-react';
import './AdminUsuariosPage.css';

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const { setIsRouteLoading } = useRouteLoading();

  useEffect(() => {
    const fetchUsers = async () => {
      setIsRouteLoading(true);
      try {
        // Llamamos a la función RPC que creamos para obtener los datos de forma segura
        const { data, error } = await supabase.rpc('get_all_users_with_details');
        if (error) throw error;
        setUsuarios(data);
      } catch (err) {
        console.error("Error al cargar los usuarios:", err);
      } finally {
        setIsRouteLoading(false);
      }
    };
    fetchUsers();
  }, [setIsRouteLoading]);

  // Lógica para editar rol o eliminar usuario (a implementar)
  const handleEditRole = (userId) => {
    alert(`Funcionalidad para editar rol del usuario: ${userId} (próximamente).`);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      alert(`Funcionalidad para eliminar usuario: ${userId} (próximamente).`);
    }
  };

  return (
    <div className="admin-usuarios-container">
      <h1>Administración de Usuarios</h1>
      <div className="admin-usuarios-table-wrapper">
        <table className="admin-usuarios-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>
                  <div className="user-cell">
                    <User size={16} /> {usuario.usuario || 'N/A'}
                  </div>
                </td>
                <td>{usuario.email}</td>
                <td>
                  <div className={`role-badge role-${usuario.profile}`}>
                    <Shield size={14} /> {usuario.profile}
                  </div>
                </td>
                <td>{new Date(usuario.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEditRole(usuario.id)} className="action-btn edit-btn" title="Editar Rol">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteUser(usuario.id)} className="action-btn delete-btn" title="Eliminar Usuario">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}