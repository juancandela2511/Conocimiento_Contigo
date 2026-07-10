//Este componente solo debe aparecer cuando el administrador hace clic en editar.

export default function EditModal({ isOpen, onClose, course, onSave }) {
  if (!isOpen) return null;

  return (
    <div className="modal-over">
      <div className="modal-content">
        <h2>Editar Contenido</h2>
        
        {/* Usamos 'course' en lugar de 'data' */}
        <input defaultValue={course?.title} placeholder="Título del módulo" />
        <textarea defaultValue={course?.description} placeholder="Descripción"/>
        
        <button onClick={onSave}>Guardar cambios</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}