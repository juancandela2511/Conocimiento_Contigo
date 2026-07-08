import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom'; // Necesario para redirección
import './Login.css';
import Loading from '../components/Loading';


function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] =useState(true);
   
  useEffect(() =>{
    const timer = setTimeout (() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate(); // Hook de navegación

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {

    if (esRegistro) {
      // Registro
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { Nombre_Usuario: username } }
      });
      if (error) alert(error.message);
      else alert('Registro exitoso, verifica tu correo.');
    } else {
      // Inicio de Sesión
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        alert("Error: " + error.message);
      } else {
        // Consulta a tu tabla pública 'Usuarios'
        const { data: userData, error: userError } = await supabase
          .from('Usuarios')
          .select('Nombre_Usuario')
          .eq('identificacion', authData.user.id)
          .single();
        
        if (userError) {
          console.error("Error al obtener nombre:", userError);
         
        } else {
          alert('¡Bienvenido, ' + userData.Nombre_Usuario + '!');
        }
        
        // Redirigir a la página principal tras el login exitoso
        navigate('/'); 
      }
    }
  } catch (err) {
    console.error(err);
    } finally {
      setIsLoading(false);
    }
    };

    //renderizar la condicional
    if (isLoading) {
      return <Loading/>;
    }

  return (
    <div className="container">
      <div className="panel-imagen">
        <img src="/logo.png" alt="Logo" />
      </div>
      <div className="panel-formulario">
        <form onSubmit={handleAuth}>
          <h1>{esRegistro ? "Registrarse" : "Iniciar Sesión"}</h1>
          
          {esRegistro && (
            <input 
              type="text" 
              placeholder="Nombre de usuario" 
              onChange={(e) => setUsername(e.target.value)} 
            />
          )}

          <input 
            type="email" 
            placeholder="Correo" 
            onChange={(e) => setEmail(e.target.value)} 
          />
          
          <input 
            type="password" 
            placeholder="Contraseña" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          <button type="submit">{esRegistro ? "Crear cuenta" : "Entrar"}</button>
        </form>

        <p onClick={() => setEsRegistro(!esRegistro)}>
          {esRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </p>
      </div>
    </div>
  );
}

export default Login;