export default function ContactsInfo() {
  return (
    // Quitamos marginTop: '40px' porque eso crea el salto de página y el espacio extra
    <div id="ContactInfo"  
    >
      <h3>Información de Soporte y Empresa</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li>📧 Soporte al cliente: soporte@urbancloset.com</li>
        <li>📞 WhatsApp: +57 300 000 0000</li>
      </ul>
      <p style={{ fontSize: '0.8rem', color: '#666' }}>
        &copy; {new Date().getFullYear()} Contigo Call Center. Todos los derechos reservados.
      </p>
    </div>
  );
}