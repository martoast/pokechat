<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <!-- Starter Selection Modal -->
    <PokemonStarterSelection
      :show="showStarterSelection"
      @close="showStarterSelection = false"
      @select-starter="handleStarterSelection"
    />

    <!-- Battle modal -->
    <div
      v-if="showBattle"
      class="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg w-full max-w-2xl">
        <div
          class="p-4 border-b border-gray-200 flex justify-between items-center"
        >
          <h3 class="text-xl font-bold">Pokémon Battle</h3>
          <button
            @click="handleBattleClose()"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <PokemonBattle
          :playerPokemon="battleState.playerPokemon"
          :opponentPokemon="battleState.opponentPokemon"
          :initialResult="battleState.result"
          :playerLevel="getPokemonLevel(battleState.playerPokemon?.name)"
          :opponentLevel="getWildPokemonLevel()"
          :playerItems="playerItems"
          :isTrainerBattle="false"
          @battle-close="handleBattleClose"
          @move-selected="handleMoveSelection"
        />
      </div>
    </div>

    <!-- Main Chat Area -->
    <main class="flex-1 overflow-y-auto p-4 space-y-4" ref="chatContainer">
      <div
        v-for="(message, index) in conversation"
        :key="index"
        :class="[
          'rounded-lg max-w-3/4 break-words p-3',
          message.role === 'user'
            ? 'bg-blue-500 text-white ml-auto'
            : 'bg-gray-200 text-gray-800',
        ]"
      >
        <!-- Render the text content -->
        <div v-html="message.content"></div>
        <!-- If message has associated Pokémon data, render the card -->
        <div v-if="message.pokemonData" class="mt-4">
          <PokemonCard :pokemon="message.pokemonData" />
        </div>
        <!-- Battle result message -->
        <div
          v-if="message.battleData"
          class="mt-4 p-4 bg-white rounded-lg shadow flex flex-col items-center"
        >
          <h4 class="font-bold mb-2">Battle Results</h4>
          <div class="flex items-center justify-center space-x-4">
            <img
              v-if="
                battleState.playerPokemon &&
                battleState.playerPokemon.sprites &&
                battleState.playerPokemon.sprites.front_default
              "
              :src="battleState.playerPokemon.sprites.front_default"
              :alt="battleState.playerPokemon.name"
              class="w-16 h-16 object-contain"
            />
            <span class="text-xl font-bold">VS</span>
            <img
              v-if="
                battleState.opponentPokemon &&
                battleState.opponentPokemon.sprites &&
                battleState.opponentPokemon.sprites.front_default
              "
              :src="battleState.opponentPokemon.sprites.front_default"
              :alt="battleState.opponentPokemon.name"
              class="w-16 h-16 object-contain"
            />
          </div>
          <div
            class="mt-4 text-center font-bold py-2 px-4 rounded"
            :class="
              message.battleData.result === 'player'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            "
          >
            {{
              message.battleData.result === "player"
                ? (battleState.playerPokemon?.name || "Your Pokémon") + " won!"
                : message.battleData.result === "capture"
                ? "Gotcha! " +
                  (battleState.opponentPokemon?.name || "The wild Pokémon") +
                  " was caught!"
                : message.battleData.result === "run"
                ? "Got away safely!"
                : (battleState.playerPokemon?.name || "Your Pokémon") +
                  " fainted!"
            }}
          </div>
        </div>
      </div>
      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-center p-4">
        <div
          class="animate-bounce bg-red-600 p-2 w-10 h-10 ring-1 ring-slate-900/5 shadow-lg rounded-full flex items-center justify-center"
        >
          <svg
            class="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </div>
      </div>
    </main>

    <!-- Suggestion Buttons -->
    <div v-if="!isLoading" class="bg-white px-4 py-2 border-t border-gray-200">
      <div class="flex overflow-x-auto space-x-2 pb-2">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          @click="sendSuggestion(suggestion)"
          class="px-3 py-1 bg-gray-200 rounded-full text-sm whitespace-nowrap hover:bg-gray-300 transition"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>

    <!-- Input Area -->
    <footer class="border-t border-gray-300 p-4 bg-white">
      <div class="flex space-x-2">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          :disabled="isLoading"
        />
        <button
          @click="sendMessage"
          :disabled="isLoading || !userInput.trim()"
          class="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import PokemonCard from "./PokemonCard.vue";
import PokemonBattle from "./PokemonBattle.vue";
import PokemonStarterSelection from "./PokemonStarterSelection.vue";

const props = defineProps({
  gameState: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["update-game-state"]);

const userInput = ref("");
const conversation = ref([
  {
    role: "assistant",
    content:
      "Welcome to the world of Pokémon! I'm Professor Oak. Let's begin your adventure!",
  },
]);
const localGameState = ref(props.gameState || {});
const chatContainer = ref(null);
const isLoading = ref(false);
const showBattle = ref(false);
const showStarterSelection = ref(false);
const showChat = ref(true);
const battleState = ref({});
const battleStats = ref({});
const playerItems = ref([
  {
    id: 1,
    name: "Potion",
    type: "healing",
    value: 20,
    description: "Restores 20 HP",
    quantity: 3,
  },
  {
    id: 2,
    name: "Super Potion",
    type: "healing",
    value: 50,
    description: "Restores 50 HP",
    quantity: 1,
  },
  {
    id: 3,
    name: "Poké Ball",
    type: "pokeball",
    description: "Catches wild Pokémon",
    quantity: 5,
  },
]);

// Suggestion buttons for common actions
const suggestions = ref([
  "Show me a random Pokémon",
  "What are some water type Pokémon?",
  "Tell me about Pikachu",
  "I want to start a battle",
  "What Pokémon should I use?",
]);

// Toggle between chat and collection views
const toggleView = () => {
  showChat.value = !showChat.value;
};

// Helper functions for Pokémon levels
const getPokemonLevel = (pokemonName) => {
  if (!pokemonName) return 5;

  // Check if we have stats for this Pokémon
  if (localGameState.value.pokemonStats?.[pokemonName]?.level) {
    return localGameState.value.pokemonStats[pokemonName].level;
  }

  // Default level for player's Pokémon if not found
  return 5;
};

const getWildPokemonLevel = () => {
  // Simple formula: base level + badges + random factor
  const badges = localGameState.value.badges || [];
  const baseLevel = 5;
  const levelBoost = badges.length * 3;

  // Add some randomness (-1, 0, or +1)
  const randomFactor = Math.floor(Math.random() * 3) - 1;

  return baseLevel + levelBoost + randomFactor;
};

// Initialize Pokémon stats
const initializePokemonStats = (pokemonName) => {
  if (!pokemonName) return;

  // Initialize stats object if needed
  if (!localGameState.value.pokemonStats) {
    localGameState.value.pokemonStats = {};
  }

  // Only initialize if not already present
  if (!localGameState.value.pokemonStats[pokemonName]) {
    localGameState.value.pokemonStats[pokemonName] = {
      level: 5,
      experience: 0,
      battlesWon: 0,
      battlesLost: 0,
      totalDamageDealt: 0,
      evolutionStage: 1,
    };
  }
};

// Update Pokémon experience after battles
const updatePokemonExperience = (pokemonName, experienceGained, newLevel) => {
  if (!pokemonName) return;

  // Initialize stats object if needed
  if (!localGameState.value.pokemonStats) {
    localGameState.value.pokemonStats = {};
  }

  // Initialize this Pokémon's stats if needed
  if (!localGameState.value.pokemonStats[pokemonName]) {
    initializePokemonStats(pokemonName);
  }

  // Update experience
  localGameState.value.pokemonStats[pokemonName].experience += experienceGained;

  // Handle level up
  if (newLevel) {
    localGameState.value.pokemonStats[pokemonName].level = newLevel;

    // Add a message to chat about leveling up
    conversation.value.push({
      role: "assistant",
      content: `Your ${pokemonName} grew to level ${newLevel}!`,
    });
  }
};

// Check if the player needs to select a starter Pokémon
const checkForStarter = () => {
  if (
    !localGameState.value.collection ||
    localGameState.value.collection.length === 0
  ) {
    showStarterSelection.value = true;
  }
};

// Handle starter selection: update state, add a message, etc.
const handleStarterSelection = async (pokemon) => {
  localGameState.value.collection = localGameState.value.collection || [];
  localGameState.value.collection.push(pokemon.name);
  localGameState.value.activePokemon = pokemon.name;

  // Initialize stats for starter Pokémon
  initializePokemonStats(pokemon.name);

  emit("update-game-state", localGameState.value);
  showStarterSelection.value = false;

  conversation.value.push({
    role: "assistant",
    content: `Excellent choice! ${
      pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
    } will be your trusted partner on this journey. Would you like to learn more about ${
      pokemon.name
    }, or are you ready to explore the world of Pokémon?`,
    pokemonData: pokemon, // Expect full Pokémon data including sprites
  });

  suggestions.value = [
    "Show me a random Pokémon",
    "Tell me more about my Pokémon",
    "Let's go exploring",
    "I want to start a battle",
    "What type is strong against my Pokémon?",
  ];

  await scrollToBottom();
};

watch(
  () => props.gameState,
  (newState) => {
    localGameState.value = { ...newState };
  },
  { deep: true }
);

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const formatConversationForApi = () => {
  return conversation.value.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
};

// Handle move selection during battle
const handleMoveSelection = (move) => {
  console.log("Move selected:", move);

  // You could implement effects based on the move
  // For example, add special effects for certain signature moves
};

const getBattleResultMessage = (result, state) => {
  const playerName = state.playerPokemon?.name || "Your Pokémon";
  const opponentName = state.opponentPokemon?.name || "the opponent";

  if (result === "player") {
    return `Victory! ${playerName} defeated ${opponentName}!`;
  } else if (result === "capture") {
    return `You caught ${opponentName}!`;
  } else if (result === "run") {
    return `Got away safely from ${opponentName}.`;
  } else {
    return `${playerName} was defeated by ${opponentName}.`;
  }
};

// Handle battle completion
const handleBattleClose = (result, stats) => {
    console.log("Battle closed with result:", result);

    // Hide the battle modal
    showBattle.value = false;

    // If no result was passed (just closing the window), don't process anything
    if (!result) return;

    // Save the battle stats
    battleStats.value = stats || {};

    // Update battleState with the final result
    battleState.value.result = result;

    // Add the battle result to the conversation
    conversation.value.push({
    role: "assistant",
    content: getBattleResultMessage(result, battleState.value),
    battleData: {
        player: battleState.value.playerPokemon?.name,
        opponent: battleState.value.opponentPokemon?.name,
        result: result // This is the crucial line - battle results are passed
    }
    });

  // Process the battle results
  if (result) {
    // Save the final result to game state
    if (!localGameState.value.battleHistory) {
      localGameState.value.battleHistory = [];
    }

    // Add battle to history
    localGameState.value.battleHistory.unshift({
      playerPokemon: battleState.value.playerPokemon?.name,
      opponentPokemon: battleState.value.opponentPokemon?.name,
      result:
        result === "player"
          ? "victory"
          : result === "capture"
          ? "capture"
          : "defeat",
      date: new Date().toISOString(),
      turns: battleStats.value?.turns || 1,
    });

    // Limit history size
    if (localGameState.value.battleHistory.length > 10) {
      localGameState.value.battleHistory =
        localGameState.value.battleHistory.slice(0, 10);
    }

    // Update player Pokémon stats with experience gained
    if (
      (result === "player" || result === "capture") &&
      battleStats.value?.experienceGained
    ) {
      updatePokemonExperience(
        battleState.value.playerPokemon?.name,
        battleStats.value.experienceGained,
        battleStats.value.levelUp ? battleStats.value.newLevel : undefined
      );
    }

    // If Pokémon was caught, add to collection
    if (result === "capture") {
      // Add the caught Pokémon to collection if not already there
      if (
        battleState.value.opponentPokemon?.name &&
        !localGameState.value.collection.includes(
          battleState.value.opponentPokemon.name
        )
      ) {
        localGameState.value.collection.push(
          battleState.value.opponentPokemon.name
        );

        // Initialize stats for the new Pokémon
        initializePokemonStats(battleState.value.opponentPokemon.name);

        // Add a message to chat about capturing the Pokémon
        conversation.value.push({
          role: "assistant",
          content: `Congratulations! You caught a ${battleState.value.opponentPokemon.name}!`,
          pokemonData: battleState.value.opponentPokemon,
        });
      }
    }

    // Update game state
    emit("update-game-state", localGameState.value);
  }
};

// Updated extraction function that fetches full details if wildPokemon is returned
const extractPokemonData = async (responseData) => {
  try {
    if (responseData.gameState && responseData.gameState.wildPokemon) {
      const wild = responseData.gameState.wildPokemon;
      // Fetch full data (including sprites) for the wild Pokémon
      const res = await fetch(`/api/pokemon-info?name=${wild.name}`);
      if (res.ok) {
        return await res.json();
      }
      return wild;
    }
    if (responseData.message && responseData.message.tool_calls) {
      for (const toolCall of responseData.message.tool_calls) {
        if (toolCall.function.name === "getPokemonInfo") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            // Fetch full data for this Pokémon
            const res = await fetch(`/api/pokemon-info?name=${args.name}`);
            if (res.ok) {
              return await res.json();
            }
            return { name: args.name };
          } catch (e) {
            console.error("Error parsing tool call arguments", e);
          }
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting Pokémon data:", error);
    return null;
  }
};

// Extract battle data from API response
const extractBattleData = (responseData) => {
  try {
    if (responseData.message && responseData.message.tool_calls) {
      for (const toolCall of responseData.message.tool_calls) {
        if (toolCall.function.name === "startBattle") {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            return {
              player: args.playerPokemon,
              opponent: args.opponentPokemon,
              playerLevel: getPokemonLevel(args.playerPokemon),
              opponentLevel: args.opponentLevel || getWildPokemonLevel(),
              result: null,
            };
          } catch (e) {
            console.error("Error parsing battle arguments", e);
          }
        }
      }
    }

    // Add this check for the startingBattle flag
    if (responseData.gameState && responseData.gameState.startingBattle) {
      return {
        player: responseData.gameState.lastBattle.player,
        opponent: responseData.gameState.lastBattle.opponent,
        playerLevel: getPokemonLevel(responseData.gameState.lastBattle.player),
        opponentLevel:
          responseData.gameState.lastBattle.opponentLevel ||
          getWildPokemonLevel(),
        result: null,
      };
    }

    // Keep the existing check for reviewing past battles
    if (responseData.gameState && responseData.gameState.reviewingBattle) {
      return {
        player: responseData.gameState.lastBattle.player,
        opponent: responseData.gameState.lastBattle.opponent,
        playerLevel: getPokemonLevel(responseData.gameState.lastBattle.player),
        opponentLevel:
          responseData.gameState.lastBattle.opponentLevel ||
          getWildPokemonLevel(),
        result: responseData.gameState.lastBattle.result,
      };
    }

    return null;
  } catch (error) {
    console.error("Error extracting battle data:", error);
    return null;
  }
};

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;

  conversation.value.push({ role: "user", content: userInput.value });
  const message = userInput.value;
  userInput.value = "";
  isLoading.value = true;
  await scrollToBottom();

  try {
    const response = await fetch("/api/pokemon-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: formatConversationForApi(),
        gameState: localGameState.value,
      }),
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    if (data.error) {
      conversation.value.push({
        role: "assistant",
        content: `Sorry, there was an error: ${data.error}`,
      });
    } else {
      const pokemonData = await extractPokemonData(data);
      const battleData = extractBattleData(data);
      const assistantMessage =
        data.message?.content || "I'm not sure how to respond to that.";
      conversation.value.push({
        role: "assistant",
        content: assistantMessage,
        pokemonData,
        battleData: battleData && battleData.result ? battleData : null,
      });

      if (data.gameState) {
        localGameState.value = data.gameState;
        emit("update-game-state", data.gameState);

        // Check for battle data from either tool_calls or gameState.startingBattle
        if (battleData) {
          console.log("Battle data found:", battleData);
          try {
            // Fetch Pokémon data for both player and opponent
            const [playerPokemonResp, opponentPokemonResp] = await Promise.all([
              fetch(`/api/pokemon-info?name=${battleData.player}`),
              fetch(`/api/pokemon-info?name=${battleData.opponent}`),
            ]);

            if (!playerPokemonResp.ok || !opponentPokemonResp.ok) {
              throw new Error("Failed to fetch Pokémon data for battle");
            }

            const playerPokemonData = await playerPokemonResp.json();
            const opponentPokemonData = await opponentPokemonResp.json();

            // Initialize stats for the player's Pokémon if needed
            initializePokemonStats(battleData.player);

            // Set up battle state
            battleState.value = {
              playerPokemon: playerPokemonData,
              opponentPokemon: opponentPokemonData,
              playerLevel:
                battleData.playerLevel || getPokemonLevel(battleData.player),
              opponentLevel: battleData.opponentLevel || getWildPokemonLevel(),
              // Only set result if it's from a previous battle that's being reviewed
              result: data.gameState.reviewingBattle ? battleData.result : null,
            };

            console.log("Battle state prepared:", battleState.value);

            // Show battle UI
            showBattle.value = true;

            // Reset the startingBattle flag to prevent showing the battle again
            if (data.gameState.startingBattle) {
              data.gameState.startingBattle = false;
              localGameState.value.startingBattle = false;
              emit("update-game-state", localGameState.value);
            }
          } catch (error) {
            console.error("Error preparing battle:", error);
            conversation.value.push({
              role: "assistant",
              content:
                "There was an error preparing the battle. Please try again.",
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in sendMessage:", error);
    conversation.value.push({
      role: "assistant",
      content:
        "Sorry, there was an error processing your request. Please try again.",
    });
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

const sendSuggestion = (suggestion) => {
  userInput.value = suggestion;
  sendMessage();
};

onMounted(() => {
  scrollToBottom();
  checkForStarter();

  // Initialize stats for all Pokémon in the collection
  if (
    localGameState.value.collection &&
    localGameState.value.collection.length > 0
  ) {
    localGameState.value.collection.forEach((pokemonName) => {
      initializePokemonStats(pokemonName);
    });
  }

  // Add more battle-related suggestions
  suggestions.value = [
    ...suggestions.value,
    "Battle a wild Pokémon",
    "Check my Pokémon's stats",
    "Use a Potion",
  ];
});

watch(
  conversation,
  () => {
    scrollToBottom();
  },
  { deep: true }
);
</script>
