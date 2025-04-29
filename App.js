import React, { useEffect, useState } from "react";
import "./App.css";
import Contador from "./componentes/Contador";
import Formulario from "./componentes/Formulario";
import PokemonAleatorio from "./componentes/PokemonAleatorio";
import Favoritos from "./componentes/Favoritos";
import Auth from "./componentes/Auth";
import { auth } from "./componentes/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const App = () => {
  const [activeComponent, setActiveComponent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Manejo de estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setAuthError(null);
      
      // Resetear componente activo al cerrar sesión
      if (!currentUser) {
        setActiveComponent(null);
      }
    }, (error) => {
      console.error("Error en autenticación:", error);
      setAuthError("Error al verificar sesión");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };

  const cerrarSesion = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setAuthError("Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Estados de carga
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando aplicación...</p>
      </div>
    );
  }

  // Manejo de errores de autenticación
  if (authError) {
    return (
      <div className="error-container">
        <h2>Error de autenticación</h2>
        <p>{authError}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  // Página de autenticación
  if (!user) {
    return <Auth onLoginSuccess={() => setUser(auth.currentUser)} />;
  }

  // Aplicación principal
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Aplicación Pokémon</h1>
        <div className="user-info">
          <span>Bienvenido, {user.email}</span>
          <button onClick={cerrarSesion} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <nav className="navigation">
        <button 
          onClick={() => handleComponentChange("contador")} 
          className={`nav-button ${activeComponent === "contador" ? "active" : ""}`}
        >
          Contador
        </button>
        <button 
          onClick={() => handleComponentChange("formulario")} 
          className={`nav-button ${activeComponent === "formulario" ? "active" : ""}`}
        >
          Formulario
        </button>
        <button 
          onClick={() => handleComponentChange("pokemon")} 
          className={`nav-button ${activeComponent === "pokemon" ? "active" : ""}`}
        >
          Pokémon Aleatorio
        </button>
        <button 
          onClick={() => handleComponentChange("favoritos")} 
          className={`nav-button ${activeComponent === "favoritos" ? "active" : ""}`}
        >
          Favoritos
        </button>
      </nav>

      <main className="component-container">
        {activeComponent === "contador" && <Contador />}
        {activeComponent === "formulario" && <Formulario />}
        {activeComponent === "pokemon" && <PokemonAleatorio user={user} />}
        {activeComponent === "favoritos" && <Favoritos user={user} />}
        
        {!activeComponent && (
          <div className="welcome-message">
            <h2>Bienvenido a la PokéApp</h2>
            <p>Selecciona una opción del menú para comenzar</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;