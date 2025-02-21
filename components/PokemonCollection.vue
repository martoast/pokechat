<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Your Pokémon Collection</h2>
    
    <div v-if="!collection || collection.length === 0" class="bg-gray-100 p-4 rounded-lg text-center">
      <p>You haven't caught any Pokémon yet. Start exploring and battling to build your collection!</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div 
        v-for="pokemon in pokemonDetails" 
        :key="pokemon.name"
        class="flex flex-col items-center"
      >
        <!-- Re-use the PokemonCard to display full details -->
        <PokemonCard :pokemon="pokemon" />
        <button 
          @click="selectPokemon(pokemon.name)"
          class="mt-2 bg-red-600 text-white text-sm py-1 px-3 rounded-full hover:bg-red-700 transition"
        >
          {{ isActive(pokemon.name) ? 'Active' : 'Select' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import PokemonCard from './PokemonCard.vue';

const props = defineProps({
  collection: {
    type: Array,
    default: () => []
  },
  activePokemon: {
    type: String,
    default: null
  }
});
const emit = defineEmits(['select-pokemon']);

const pokemonDetails = ref([]);

// Fetch full details for each Pokémon in the collection so we can show their sprite, stats, etc.
const fetchPokemonDetails = async () => {
  const details = await Promise.all(
    props.collection.map(async (name) => {
      try {
        const response = await fetch(`/api/pokemon-info?name=${name}`);
        return await response.json();
      } catch (error) {
        console.error(`Error fetching details for ${name}:`, error);
        return { name, error: true };
      }
    })
  );
  pokemonDetails.value = details;
};

// Re-fetch details whenever the collection prop changes
watch(
  () => props.collection,
  () => {
    if (props.collection && props.collection.length > 0) {
      fetchPokemonDetails();
    }
  },
  { immediate: true }
);

// Check if this Pokémon is currently active
const isActive = (name) => props.activePokemon === name;

// Emit an event to the parent when a Pokémon is selected as active
const selectPokemon = (name) => {
  emit('select-pokemon', name);
};
</script>