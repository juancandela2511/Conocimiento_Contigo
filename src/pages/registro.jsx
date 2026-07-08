import { useState } from 'react';
import { supabase } from '../services/supabaseClient'; // Importamos la conexión

export default function Registro() {
  // Definimos estados para capturar lo que el usuario escribe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar

    // Llamamos a Supabase para crear el usuario en su base de datos interna
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
     
    data: {
      nombre_usuario: username // Todo en minúsculas
          }
      
    });

    if (error) {
      alert('Error al registrar: ' + error.message);
    } else {
      alert('¡Registro exitoso! Por favor, verifica tu correo.');
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <h2>Crear Cuenta</h2>
      
      <input 
        type="text" 
        placeholder="Nombre de usuario" 
        onChange={(e) => setUsername(e.target.value)} 
      />
      
      <input 
        type="email" 
        placeholder="Correo electrónico" 
        onChange={(e) => setEmail(e.target.value)} 
      />
      
      <input 
        type="password" 
        placeholder="Contraseña" 
        onChange={(e) => setPassword(e.target.value)} 
      />
      
      <button type="submit">Registrarse</button>
    </form>
  );
}