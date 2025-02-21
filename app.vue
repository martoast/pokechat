<template>
  <div class="min-h-screen bg-gray-100">
    <div class="max-w-7xl mx-auto p-4">
      <!-- Header -->
      <header class="bg-red-600 text-white rounded-t-lg p-6 shadow-lg">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold">PokéChat</h1>
          <button 
            @click="toggleView"
            class="bg-white text-red-600 px-4 py-2 rounded-full hover:bg-red-100 transition"
          >
            {{ showChat ? 'View Collection' : 'Return to Chat' }}
          </button>
        </div>
        <p class="mt-2 text-red-100">
          Chat with your AI Pokémon assistant. Explore, battle, and collect Pokémon!
        </p>
      </header>
      
      <div class="bg-white min-h-screen rounded-b-lg shadow-lg">
        <!-- Main content area -->
        <keep-alive>
          <PokemonChat 
            v-if="showChat"
            @update-game-state="updateGameState" 
            :gameState="gameState"
          />
        </keep-alive>
        <!-- Collection view -->
        <PokemonCollection 
          v-if="!showChat"
          :collection="gameState.collection" 
          :activePokemon="gameState.activePokemon" 
          @select-pokemon="selectPokemon"
        />
      </div>
      
      <!-- Footer -->
      <footer class="mt-6 text-center text-gray-500 text-sm pb-8">
        <p>PokéChat - Your AI Pokémon Adventure</p>
        <p class="mt-1">
          Data provided by 
          <a href="https://pokeapi.co/" target="_blank" class="text-blue-500 hover:underline">
            PokéAPI
          </a>
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PokemonChat from '~/components/PokemonChat.vue';
import PokemonCollection from '~/components/PokemonCollection.vue';

const showChat = ref(true);
const gameState = ref({
  collection: [],
  activePokemon: null
});

// Toggle between chat and collection views without losing state
const toggleView = () => {
  showChat.value = !showChat.value;
};

// Update game state from the chat component
const updateGameState = (newState) => {
  console.log("Updating game state:", newState);
  gameState.value = {
    ...gameState.value,
    ...newState
  };

  // Ensure collection is always an array
  if (!gameState.value.collection) {
    gameState.value.collection = [];
  }
};

// Select a Pokémon as active
const selectPokemon = (name) => {
  gameState.value = {
    ...gameState.value,
    activePokemon: name
  };
  // Return to chat after selection
  showChat.value = true;
};
</script>
