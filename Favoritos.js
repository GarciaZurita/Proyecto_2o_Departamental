import React, { useEffect, useState, useCallback } from "react";
import { db } from "./firebase";
import { collection, doc, deleteDoc, onSnapshot } from "firebase/firestore";
import { guardarPokemonFavorito } from "./firestoreService";
import './Favoritos.css';

const Favoritos = ({ user, pokemonSeleccionado }) => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const guardarPokemon = useCallback(async (pokemonData) => {
    if (!user?.uid || !pokemonData) return;

    setGuardando(true);
    setError(null);
    
    try {
      await guardarPokemonFavorito(user, pokemonData);
    } catch (err) {
      console.error("Error al guardar:", err);
      setError("No se pudo guardar el Pokémon");
    } finally {
      setGuardando(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setFavoritos([]);
      return;
    }

    const q = collection(db, "usuarios", user.uid, "favoritos");
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        try {
          const favoritosData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setFavoritos(favoritosData);
          setError(null);
        } catch (err) {
          console.error("Error al procesar datos:", err);
          setError("Error al procesar los Pokémon favoritos");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error al obtener favoritos:", err);
        setError("Error al cargar favoritos");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (pokemonSeleccionado && user?.uid) {
      guardarPokemon(pokemonSeleccionado);
    }
  }, [pokemonSeleccionado, user, guardarPokemon]);

  const eliminarFavorito = async (id) => {
    if (!user?.uid) return;

    try {
      setFavoritos(prev => prev.filter(poke => poke.id !== id));
      await deleteDoc(doc(db, "usuarios", user.uid, "favoritos", id));
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      setFavoritos(prev => [...prev, prev.find(poke => poke.id === id)]);
      setError("No se pudo eliminar el Pokémon");
    }
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <h2 className="neon-title">Pokémon Favoritos</h2>
        <div className="neon-spinner"></div>
        <p className="neon-text">Cargando tus Pokémon favoritos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container error-state">
        <h2 className="neon-title">Pokémon Favoritos</h2>
        <p className="error-message neon-text">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="neon-button retry-button"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="header-section">
        <h2 className="neon-title">Pokémon Favoritos</h2>
        {guardando && (
          <div className="saving-indicator">
            <span className="neon-dot"></span>
            <span className="neon-dot"></span>
            <span className="neon-dot"></span>
            <span className="neon-text">Guardando...</span>
          </div>
        )}
      </div>
      
      {favoritos.length === 0 ? (
        <div className="empty-state">
          <p className="neon-text">No hay Pokémon en favoritos aún.</p>
          {pokemonSeleccionado && (
            <button 
              onClick={() => guardarPokemon(pokemonSeleccionado)}
              className="neon-button save-button"
            >
              ❤️ Guardar Pokémon Actual
            </button>
          )}
        </div>
      ) : (
        <div className="pokemon-grid">
          {favoritos.map((poke) => (
            <div key={poke.id} className="pokemon-card">
              <div className="card-header">
                <h3 className="pokemon-name">{poke.nombre}</h3>
                <button 
                  className="neon-button delete-button" 
                  onClick={() => eliminarFavorito(poke.id)}
                  aria-label={`Eliminar ${poke.nombre} de favoritos`}
                >
                  ❌
                </button>
              </div>
              <img 
                src={poke.imagen} 
                alt={poke.nombre} 
                loading="lazy"
                className="pokemon-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=Pokemon+no+disponible';
                }}
              />
              <div className="pokemon-details">
                <p><strong>Altura:</strong> {poke.altura} m</p>
                <p><strong>Tipo:</strong> {poke.tipo}</p>
                <p><strong>Poder:</strong> {poke.poder}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favoritos;