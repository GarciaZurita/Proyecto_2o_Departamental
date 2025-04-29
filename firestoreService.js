import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

export const guardarPokemonFavorito = async (user, pokemonData) => {
  if (!user?.uid) {
    throw new Error("Usuario no autenticado");
  }

  try {
    // Crear referencia al documento con el ID del Pokémon
    const pokemonRef = doc(db, "usuarios", user.uid, "favoritos", pokemonData.id.toString());
    
    // Preparar datos del Pokémon
    const pokemon = {
      id: pokemonData.id.toString(),
      nombre: pokemonData.name || pokemonData.nombre,
      imagen: pokemonData.sprites?.front_default || pokemonData.imagen,
      altura: pokemonData.height ? pokemonData.height / 10 : pokemonData.altura,
      tipo: pokemonData.types ? 
            pokemonData.types.map(t => t.type.name).join(", ") : 
            pokemonData.tipo || "Desconocido",
      poder: pokemonData.base_experience || pokemonData.poder || "N/A",
      fecha: new Date().toISOString()
    };

    // Guardar en Firestore
    await setDoc(pokemonRef, pokemon);
    
    return pokemon;
  } catch (error) {
    console.error("Error al guardar Pokémon favorito:", error);
    throw error;
  }
};