import { useState } from 'react';
import './Login.css';

function Login() {
    /*controlar si se esta en regristro o inico de sesion*/
  const [esRegistro, setEsRegistro] = useState(false);

  return (
    <div className="container">
      <div className="panel-imagen">
        <img src="/logo.png" alt="Logo" />
       <h2 id="eslogan">El conocimiento va </h2></div>
      <div className="panel-formulario">
        <h1>{esRegistro ? "Registrarse" : "Iniciar Sesión"}</h1>
          {esRegistro && (
          <input type="text" placeholder="Nombre completo" />
           )}
        <input placeholder="Correo" />
        <input type="password" placeholder="Contraseña" />
        <button>{esRegistro ? "Crear cuenta" : "Entrar"}</button>
       
        {/*boton dinamico cambia si el usuario se registra*/}
        
        <p onClick={() => setEsRegistro(!esRegistro)}>
          {esRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </p>
      </div>
    </div>
  );
}

export default Login;
