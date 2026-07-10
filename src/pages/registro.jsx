import { useState } from 'react';
import { supabase } from '../services/supabaseClient';

// LOG DE PRUEBA: Si no ves esto en la consola al cargar la página,
// el archivo ni siquiera se está importando correctamente en tu app.
console.log("Registro.jsx cargado correctamente");

console.log("Supabase cliente:", supabase);
export default function Registro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    console.log("¡Función handleSignUp activada!"); // ESTO DEBE SALIR SI O SI

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { Usuario: username }
        }
      });

      if (error) throw error;
      
      console.log("ID del usuario:", data.user?.id);

      if (data.user) {
        const { error: insertError } = await supabase
          .from('public.Usuario')
          .insert([
            { 
              id: data.user.id, 
              "Usuario": username, 
              profiles: 'usuario' 
            }
          ]);
        
        if (insertError) throw insertError;
        console.log("Paso 2: Inserción OK");
        alert("¡Registro exitoso!");
      }
    } catch (err) {
      console.error("ERROR CRÍTICO:", err);
      alert("Error capturado: " + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid black' }}>
      <h2>Crear Cuenta</h2>
      
      <input type="text" placeholder="Nombre" onChange={(e) => setUsername(e.target.value)} />
      <input type="email" placeholder="Correo" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Contraseña" onChange={(e) => setPassword(e.target.value)} />
      
      {/* BOTÓN CON EVENTO DIRECTO */}
      <button onClick={() => {
        console.log("¡Click detectado!");
        handleSignUp({ preventDefault: () => {} });
      }}>
        Registrarse
      </button>
    </div>
  );}