// server/api/pokemon-info.js
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const name = query.name?.toLowerCase();
    
    if (!name) {
      return { error: 'Pokémon name is required' };
    }
    
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      
      if (!response.ok) {
        throw new Error(`Pokémon not found: ${name}`);
      }
      
      const data = await response.json();
      
      // Process the data for easier frontend consumption
      return {
        id: data.id,
        name: data.name,
        height: data.height,
        weight: data.weight,
        base_experience: data.base_experience,
        types: data.types,
        stats: data.stats,
        abilities: data.abilities,
        moves: data.moves,
        sprites: {
          front_default: data.sprites.front_default,
          back_default: data.sprites.back_default,
          other: data.sprites.other
        }
      };
    } catch (error) {
      return { error: error.message };
    }
  });