<template>
    <div class="bg-white rounded-lg shadow-lg overflow-hidden max-w-xs">
      <!-- Pokémon image -->
      <div 
        class="h-48 flex items-center justify-center"
        :class="typeColorClass"
      >
        <img 
          v-if="pokemon.sprites && pokemon.sprites.front_default" 
          :src="pokemon.sprites.front_default" 
          :alt="pokemon.name" 
          class="h-40 w-40 object-contain"
        />
        <div v-else class="text-white text-xl capitalize">{{ pokemon.name || 'No image' }}</div>
      </div>
      
      <!-- Pokémon details -->
      <div class="p-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-xl font-bold capitalize">{{ pokemon.name }}</h3>
          <span class="text-gray-600" v-if="pokemon.id">#{{ pokemon.id }}</span>
        </div>
        
        <!-- Types -->
        <div class="flex gap-2 mb-3" v-if="displayTypes.length > 0">
          <span 
            v-for="type in displayTypes" 
            :key="type"
            class="px-2 py-1 rounded text-xs text-white font-semibold capitalize"
            :class="typeBackgroundClass(type)"
          >
            {{ type }}
          </span>
        </div>
        
        <!-- Stats -->
        <div class="space-y-2" v-if="pokemon.stats && pokemon.stats.length > 0">
          <div v-for="stat in pokemon.stats" :key="stat.stat.name" class="text-sm">
            <div class="flex justify-between mb-1">
              <span class="capitalize">{{ formatStatName(stat.stat.name) }}</span>
              <span>{{ stat.base_stat }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full" 
                :style="{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    pokemon: {
      type: Object,
      required: true
    }
  });
  
  // Format stat names for display
  const formatStatName = (name) => {
    const nameMap = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      'speed': 'Speed'
    };
    return nameMap[name] || name;
  };
  
  // Handle different type formats
  const displayTypes = computed(() => {
    if (!props.pokemon.types) return [];
    
    // Handle array of strings
    if (Array.isArray(props.pokemon.types) && typeof props.pokemon.types[0] === 'string') {
      return props.pokemon.types;
    }
    
    // Handle array of objects with type.name
    if (Array.isArray(props.pokemon.types) && props.pokemon.types[0]?.type?.name) {
      return props.pokemon.types.map(t => t.type.name);
    }
    
    // Fallback to empty array
    return [];
  });
  
  // Get background color based on type
  const typeBackgroundClass = (type) => {
    const typeColors = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-300',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-300',
      psychic: 'bg-pink-500',
      bug: 'bg-green-400',
      rock: 'bg-yellow-700',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-600',
      dark: 'bg-gray-700',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300'
    };
    
    return typeColors[type] || 'bg-gray-400';
  };
  
  // Get background color for the card header based on primary type
  const typeColorClass = computed(() => {
    const primaryType = displayTypes.value[0] || '';
    
    const typeColors = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-300',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-300',
      psychic: 'bg-pink-500',
      bug: 'bg-green-400',
      rock: 'bg-yellow-700',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-600',
      dark: 'bg-gray-700',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300'
    };
    
    return typeColors[primaryType] || 'bg-gray-400';
  });
  </script>