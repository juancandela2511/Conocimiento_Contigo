/*
  Archivo: ContactsInfo.jsx
  Función: Renderiza el pie de página con la información de contacto y soporte.
  Tipo: Componente de Frontend.
*/
import { Mail, Phone, MapPin } from 'lucide-react';
import './ContactsInfo.css';

export default function InfoContactos() {
  return (
    <footer id="soporte" className="info-contactos-container">
      <div className="info-contactos-content">
        <h2>Contacto y Soporte</h2>
        <div className="info-contactos-grid">
          <div className="info-contactos-item">
            <Mail size={40} className="icon" />
            <h3>Correo Electrónico</h3>
            <p>Para consultas generales y soporte técnico.</p>
            <a href="mailto:soporte@aprendecontigo.com">soporte@aprendecontigo.com</a>
          </div>
          <div className="info-contactos-item">
            <Phone size={40} className="icon" />
            <h3>Teléfono</h3>
            <p>Atención de Lunes a Viernes de 9am a 5pm.</p>
            <a href="tel:+1234567890">+1 (234) 567-890</a>
          </div>
          <div className="info-contactos-item">
            <MapPin size={40} className="icon" />
            <h3>Oficina Principal</h3>
            <p>Calle Falsa 123, Ciudad Ejemplo</p>
            <p>Colombia</p>
          </div>
        </div>
      </div>
    </footer>
  );
}