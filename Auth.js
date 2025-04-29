import React, { useState } from "react";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "./firebase";
import "./Auth.css";

const Auth = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, facebookProvider);
      onLoginSuccess();
    } catch (error) {
      setError(getAuthErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getAuthErrorMessage = (code) => {
    switch(code) {
      case "auth/invalid-email": return "Correo electrónico inválido";
      case "auth/user-disabled": return "Usuario deshabilitado";
      case "auth/user-not-found": return "Usuario no encontrado";
      case "auth/wrong-password": return "Contraseña incorrecta";
      case "auth/email-already-in-use": return "El correo ya está registrado";
      case "auth/weak-password": return "La contraseña debe tener al menos 6 caracteres";
      case "auth/account-exists-with-different-credential": return "El correo ya está registrado con otro método";
      default: return "Error al autenticar. Intenta nuevamente.";
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
      
      <div className="social-buttons">
        <button 
          className="google-btn"
          onClick={signInWithGoogle} 
          disabled={loading}
        >
          Continuar con Google
        </button>
        <button 
          className="facebook-btn"
          onClick={signInWithFacebook} 
          disabled={loading}
        >
          Continuar con Facebook
        </button>
      </div>
      
      <div className="separator">
        <span>o</span>
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          minLength={6}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
        </button>
      </form>
      
      <button 
        onClick={() => setIsLogin(!isLogin)} 
        className="toggle-auth-mode"
        disabled={loading}
      >
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
      
      {error && <div className="message error">{error}</div>}
    </div>
  );
};

export default Auth;