import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "./firebase";
import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs
} from "firebase/firestore";

const PokemonAleatorio = ({ user }) => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [showHistory, setShowHistory] = useState(true); // Nuevo estado para controlar visibilidad

  // Limpiar el audio cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  // Cargar historial cuando el usuario cambie
  useEffect(() => {
    if (!user?.uid) return;

    const cargarHistorial = async () => {
      setCargandoHistorial(true);
      try {
        const historialRef = collection(db, "usuarios", user.uid, "historial");
        const q = query(historialRef, orderBy("fecha", "desc"), limit(10));
        const querySnapshot = await getDocs(q);
        
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          fecha: doc.data().fecha?.toDate() // Convertir Firestore timestamp a Date
        }));
        
        setHistorial(items);
      } catch (error) {
        console.error("Error al obtener historial:", error);
      } finally {
        setCargandoHistorial(false);
      }
    };

    cargarHistorial();
  }, [user]);

  const guardarEnHistorial = async (pokemonData) => {
    if (!user?.uid) return;
    
    try {
      const historialRef = collection(db, "usuarios", user.uid, "historial");
      
      await addDoc(historialRef, {
        id: pokemonData.id.toString(),
        nombre: capitalizar(pokemonData.name),
        imagen: pokemonData.sprites.front_default,
        tipo: pokemonData.types.map(t => t.type.name).join(", "),
        fecha: serverTimestamp(),
        metodo: searchTerm ? "búsqueda" : "aleatorio"
      });

      // Actualizar el estado del historial localmente
      setHistorial(prev => [{
        id: pokemonData.id.toString(),
        nombre: capitalizar(pokemonData.name),
        imagen: pokemonData.sprites.front_default,
        tipo: pokemonData.types.map(t => t.type.name).join(", "),
        fecha: new Date(),
        metodo: searchTerm ? "búsqueda" : "aleatorio"
      }, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error("Error al guardar en historial:", error);
    }
  };

  const obtenerPokemonAleatorio = async () => {
    // Limpiar audio anterior
    if (audio) {
      audio.pause();
      setAudio(null);
    }
    setSoundPlaying(false);
    
    setLoading(true);
    setError(null);
    const numeroAleatorio = Math.floor(Math.random() * 898) + 1;
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${numeroAleatorio}`);
      setPokemon(response.data);
      guardarEnHistorial(response.data);
    } catch (error) {
      console.error("Error al obtener Pokémon:", error);
      setError("No se pudo cargar el Pokémon");
    } finally {
      setLoading(false);
    }
  };

  const buscarPokemonPorNombre = async () => {
    // Limpiar audio anterior
    if (audio) {
      audio.pause();
      setAudio(null);
    }
    setSoundPlaying(false);
    
    if (!searchTerm.trim()) {
      setError("Por favor ingresa un nombre de Pokémon");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
      setPokemon(response.data);
      guardarEnHistorial(response.data);
    } catch (error) {
      console.error("Error al buscar Pokémon:", error);
      setError("No se encontró el Pokémon. Verifica el nombre e intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const playPokemonSound = () => {
    if (!pokemon) return;
    
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setSoundPlaying(true);
    
    const soundUrl = `https://play.pokemonshowdown.com/audio/cries/${pokemon.name.toLowerCase()}.mp3`;
    const fallbackSoundUrl = `https://play.pokemonshowdown.com/audio/cries/${pokemon.id}.mp3`;
    
    const newAudio = new Audio(soundUrl);
    
    newAudio.onerror = () => {
      newAudio.src = fallbackSoundUrl;
      newAudio.play().catch(e => {
        console.error("Error al reproducir sonido:", e);
        setSoundPlaying(false);
      });
    };
    
    newAudio.onended = () => setSoundPlaying(false);
    
    newAudio.play().catch(e => {
      console.error("Error al reproducir sonido:", e);
      setSoundPlaying(false);
    });
    
    setAudio(newAudio);
  };

  const capitalizar = (nombre) => nombre.charAt(0).toUpperCase() + nombre.slice(1);

  const agregarAFavoritos = async () => {
    if (!pokemon || !user?.uid) {
      setError("Debes iniciar sesión para guardar favoritos");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const pokemonRef = doc(db, "usuarios", user.uid, "favoritos", pokemon.id.toString());
      
      await setDoc(pokemonRef, {
        id: pokemon.id.toString(),
        nombre: capitalizar(pokemon.name),
        imagen: pokemon.sprites.front_default,
        tipo: pokemon.types.map(t => t.type.name).join(", "),
        poder: pokemon.base_experience,
        altura: pokemon.height / 10,
        fecha: new Date().toISOString(),
        sonido: `https://play.pokemonshowdown.com/audio/cries/${pokemon.id}.mp3`
      });

      alert(`✅ ${capitalizar(pokemon.name)} fue agregado a tus favoritos`);
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
      setError("No se pudo guardar el Pokémon");
    } finally {
      setGuardando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      buscarPokemonPorNombre();
    }
  };

  return (
    <div className="pokemon-container">
      <h2>Pokémon Aleatorio</h2>
      
      {/* Buscador */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar Pokémon por nombre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button 
          onClick={buscarPokemonPorNombre}
          disabled={loading || !searchTerm.trim()}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>
      
      <button 
        className="toggle-button" 
        onClick={obtenerPokemonAleatorio} 
        disabled={loading}
      >
        {loading ? "Buscando..." : "Obtener Pokémon Aleatorio"}
      </button>

      {error && <p className="error-message">{error}</p>}

      {pokemon && (
        <div className="pokemon-info">
          <h3>
            {capitalizar(pokemon.name)}{" "}
            <button 
              className="heart-button" 
              onClick={agregarAFavoritos}
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "❤️"}
            </button>
            <button
              className="sound-button"
              onClick={playPokemonSound}
              disabled={soundPlaying}
            >
              {soundPlaying ? "🔊..." : "🔊"}
            </button>
          </h3>
          <img 
            src={pokemon.sprites.front_default} 
            alt={pokemon.name} 
            loading="lazy"
          />
          <p><strong>ID:</strong> {pokemon.id}</p>
          <p><strong>Altura:</strong> {pokemon.height / 10} m</p>
          <p><strong>Tipo:</strong> {pokemon.types.map(type => type.type.name).join(", ")}</p>
          <p><strong>Poder:</strong> {pokemon.base_experience}</p>
        </div>
      )}

      {/* Botón para mostrar/ocultar historial */}
      <button 
        className="toggle-history-button"
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? 'Ocultar Historial' : 'Mostrar Historial'}
      </button>

      {/* Sección de Historial (condicional) */}
      {showHistory && (
        <div className="historial-section">
          <h3>Historial de Búsquedas</h3>
          {cargandoHistorial ? (
            <p>Cargando historial...</p>
          ) : historial.length === 0 ? (
            <p>No hay búsquedas recientes</p>
          ) : (
            <ul className="historial-list">
              {historial.map((item) => (
                <li key={`${item.id}-${item.fecha?.getTime()}`} className="historial-item">
                  <img 
                    src={item.imagen} 
                    alt={item.nombre} 
                    width="50" 
                    onClick={() => buscarPokemonPorNombre(item.nombre.toLowerCase())}
                    style={{ cursor: 'pointer' }}
                  />
                  <div>
                    <strong>{item.nombre}</strong>
                    <small>({item.metodo})</small>
                    <br />
                    <small>
                      {item.fecha?.toLocaleDateString()} {item.fecha?.toLocaleTimeString()}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default PokemonAleatorio;