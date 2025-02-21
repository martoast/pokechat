<template>
  <div class="fixed inset-0 z-50 bg-green-100 bg-opacity-50 overflow-hidden">
    <!-- Mobile full screen battle environment -->
    <div
      class="sm:hidden fixed inset-0"
      style="
        background-image: linear-gradient(
          to bottom,
          #b8f4b8 0%,
          #b8f4b8 50%,
          #a0e8a0 100%
        );
      "
    >
      <!-- Battle field for mobile -->
      <div class="absolute inset-0 pt-16 pb-32 px-4">
        <!-- Opponent side (right) -->
        <div class="relative h-1/2 mb-4">
          <!-- Opponent info box - GBA style -->
          <div
            class="absolute top-0 right-6 w-48 sm:w-56 bg-cream border-2 border-black rounded-r-md"
          >
            <div class="flex justify-between items-center p-1 pl-2">
              <div class="font-bold uppercase text-sm">
                {{ opponentPokemon?.name }}
              </div>
              <div class="text-xs font-medium">Lv{{ opponentLevel }}</div>
            </div>
            <div class="p-1 pl-2 pr-2">
              <div class="flex items-center gap-1">
                <span class="text-xs font-bold">HP</span>
                <div class="flex-1 h-2.5 bg-gray-300 border border-gray-700">
                  <div
                    class="h-1.5 mt-px ml-px"
                    :class="[healthBarColor(opponentHealth)]"
                    :style="{ width: `calc(${opponentHealth}% - 2px)` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <!-- Opponent platform - GBA style - Raised position -->
          <div
            class="absolute right-8 w-32 h-16 bg-green-300 rounded-full shadow-inner border-2 border-green-400"
            style="bottom: 9rem;"
          ></div>

          <!-- Opponent Pokémon - Raised position and larger -->
          <div class="absolute right-16" style="bottom: 9rem;">
            <img
              v-if="opponentPokemon?.sprites?.front_default"
              :src="opponentPokemon.sprites.front_default"
              :alt="opponentPokemon.name"
              class="h-28 sm:h-32 object-contain"
              :class="{ 'animate-shake': opponentTakingDamage }"
            />
          </div>
        </div>

        <!-- Player side (left) -->
        <div class="relative h-1/2">
          <!-- Player info box - GBA style -->
          <div
            class="absolute top-6 left-2 w-56 sm:w-64 bg-cream border-2 border-black rounded-r-md"
          >
            <div class="flex justify-between items-center p-1 pl-2">
              <div class="font-bold uppercase text-sm">
                {{ playerPokemon?.name }}
              </div>
              <div class="text-xs font-medium">Lv{{ playerLevel }}</div>
            </div>
            <div class="p-1 pl-2 pr-2">
              <div class="flex items-center gap-1">
                <span class="text-xs font-bold">HP</span>
                <div class="flex-1 h-2.5 bg-gray-300 border border-gray-700">
                  <div
                    class="h-1.5 mt-px ml-px"
                    :class="[healthBarColor(playerHealth)]"
                    :style="{ width: `calc(${playerHealth}% - 2px)` }"
                  ></div>
                </div>
              </div>
              <div class="mt-0.5 flex justify-between items-center">
                <div class="text-xs font-medium">
                  {{ Math.ceil(playerCurrentHP) }}/{{ playerMaxHP }}
                </div>
                <div class="text-xs font-medium">
                  <span v-if="playerLevel >= 100">EXP</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Player platform - GBA style - Raised position -->
          <div
            class="absolute left-8 w-32 h-16 bg-green-300 rounded-full shadow-inner border-2 border-green-400"
            style="bottom: 9rem;"
          ></div>

          <!-- Player Pokémon - Raised position and larger -->
          <div class="absolute left-16" style="bottom: 9rem;">
            <img
              v-if="playerPokemon?.sprites?.back_default"
              :src="playerPokemon.sprites.back_default"
              :alt="playerPokemon.name"
              class="h-28 sm:h-32 object-contain"
              :class="{ 'animate-shake': playerTakingDamage }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop windowed battle environment -->
    <div class="hidden sm:flex items-center justify-center h-full w-full">
      <div
        class="relative w-[800px] h-[600px] rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800"
        style="
          background-image: linear-gradient(
            to bottom,
            #b8f4b8 0%,
            #b8f4b8 50%,
            #a0e8a0 100%
          );
        "
      >
        <!-- Battle field for desktop -->
        <div class="absolute inset-0 pt-16 pb-32 px-4">
          <!-- Opponent side (right) -->
          <div class="relative h-2/3 mb-4">
            <!-- Opponent info box - GBA style -->
            <div
              class="absolute right-8 w-56 bg-cream border-2 border-black rounded-r-md"
              style="top: -2rem;"
            >
              <div class="flex justify-between items-center p-1 pl-2">
                <div class="font-bold uppercase text-sm">
                  {{ opponentPokemon?.name }}
                </div>
                <div class="text-xs font-medium">Lv{{ opponentLevel }}</div>
              </div>
              <div class="p-1 pl-2 pr-2">
                <div class="flex items-center gap-1">
                  <span class="text-xs font-bold">HP</span>
                  <div class="flex-1 h-2.5 bg-gray-300 border border-gray-700">
                    <div
                      class="h-1.5 mt-px ml-px"
                      :class="[healthBarColor(opponentHealth)]"
                      :style="{ width: `calc(${opponentHealth}% - 2px)` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Opponent platform - GBA style - Raised position -->
            <div
              class="absolute bottom-24 right-12 w-40 h-20 bg-green-300 rounded-full shadow-inner border-2 border-green-400"
            ></div>

            <!-- Opponent Pokémon - Raised position and larger -->
            <div class="absolute bottom-28" style="right:4rem">
              <img
                v-if="opponentPokemon?.sprites?.front_default"
                :src="opponentPokemon.sprites.front_default"
                :alt="opponentPokemon.name"
                class="h-36 object-contain"
                :class="{ 'animate-shake': opponentTakingDamage }"
              />
            </div>
          </div>

          <!-- Player side (left) -->
          <div class="relative h-2/3">
            <!-- Player info box - GBA style -->
            <div
              class="absolute left-8 w-64 bg-cream border-2 border-black rounded-r-md"
              style="top: -55px;"
            >
              <div class="flex justify-between items-center p-1 pl-2">
                <div class="font-bold uppercase text-sm">
                  {{ playerPokemon?.name }}
                </div>
                <div class="text-xs font-medium">Lv{{ playerLevel }}</div>
              </div>
              <div class="p-1 pl-2 pr-2">
                <div class="flex items-center gap-1">
                  <span class="text-xs font-bold">HP</span>
                  <div class="flex-1 h-2.5 bg-gray-300 border border-gray-700">
                    <div
                      class="h-1.5 mt-px ml-px"
                      :class="[healthBarColor(playerHealth)]"
                      :style="{ width: `calc(${playerHealth}% - 2px)` }"
                    ></div>
                  </div>
                </div>
                <div class="mt-0.5 flex justify-between items-center">
                  <div class="text-xs font-medium">
                    {{ Math.ceil(playerCurrentHP) }}/{{ playerMaxHP }}
                  </div>
                  <div class="text-xs font-medium">
                    <span v-if="playerLevel >= 100">EXP</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Player platform - GBA style - Raised position -->
            <div
              class="absolute bottom-28 left-12 w-40 h-20 bg-green-300 rounded-full shadow-inner border-2 border-green-400"
            ></div>

            <!-- Player Pokémon - Raised position and larger -->
            <div class="absolute bottom-32" style="left:4rem">
              <img
                v-if="playerPokemon?.sprites?.back_default"
                :src="playerPokemon.sprites.back_default"
                :alt="playerPokemon.name"
                class="h-36 object-contain"
                :class="{ 'animate-shake': playerTakingDamage }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Type effectiveness message -->
    <div
      v-if="showEffectiveness"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
    >
      <div class="bg-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
        <p :class="effectivenessClass">{{ effectivenessMessage }}</p>
      </div>
    </div>

    <!-- Battle message box - GBA style -->
    <div
      class="absolute bottom-0 left-0 right-0 h-32 bg-red-100 border-t-4 border-red-600 sm:left-1/2 sm:right-auto sm:w-[800px] sm:transform sm:-translate-x-1/2 sm:rounded-b-lg"
    >
      <div class="bg-white m-2 p-3 h-24 border-2 border-black rounded">
        <div v-if="introMessage" class="text-black text-base">
          <p>{{ introMessage }}</p>
          <div class="mt-2 flex justify-end">
            <button
              @click="dismissIntro"
              class="text-sm font-bold px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              ▶
            </button>
          </div>
        </div>
        <p v-else-if="battleMessage" class="text-black text-base">
          {{ battleMessage }}
        </p>
        <p v-else class="text-black text-base">
          {{
            battleStep === 1
              ? "What will " + (playerPokemon?.name || "POOCHYENA") + " do?"
              : battleStep === 0
              ? "Choose a move!"
              : battleStep === 2
              ? "Choose an item!"
              : "..."
          }}
        </p>
      </div>
    </div>

    <!-- Battle command menu - GBA style (overlays on message box when active) -->
    <div
      v-if="!battleMessage && !introMessage && battleStep === 1"
      class="absolute bottom-0 right-0 w-1/2 h-32 sm:right-auto sm:left-1/2 sm:transform sm:translate-x-0 sm:w-[400px]"
    >
      <div class="grid grid-cols-2 grid-rows-2 h-full p-2">
        <button
          @click="battleStep = 0"
          class="font-bold text-black border-2 border-black m-1 bg-white hover:bg-gray-100 active:bg-gray-200 rounded"
        >
          FIGHT
        </button>
        <button
          @click="openBag"
          class="font-bold text-black border-2 border-black m-1 bg-white hover:bg-gray-100 active:bg-gray-200 rounded"
          :disabled="!playerItems.length || attacking"
        >
          BAG
        </button>
        <button
          @click="tryToRun"
          class="font-bold text-black border-2 border-black m-1 bg-white hover:bg-gray-100 active:bg-gray-200 rounded"
          :disabled="isTrainerBattle || attacking"
        >
          RUN
        </button>
        <button
          class="font-bold text-black border-2 border-black m-1 bg-white hover:bg-gray-100 active:bg-gray-200 rounded"
        >
          POKéMON
        </button>
      </div>
    </div>

    <!-- Moves menu - GBA style -->
    <div
      v-if="battleStep === 0"
      class="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-black sm:left-1/2 sm:right-auto sm:w-[800px] sm:transform sm:-translate-x-1/2"
    >
      <div class="grid grid-cols-2 gap-px">
        <button
          v-for="move in playerMoves"
          :key="move.id"
          @click="selectMove(move)"
          class="h-16 px-4 py-2 border-2 border-black m-1 text-left uppercase font-bold hover:bg-gray-100 active:bg-gray-200 rounded"
          :disabled="attacking || move.pp <= 0"
        >
          {{ move.name }}
          <div class="text-right text-xs mt-1">
            PP: {{ move.pp }}/{{ move.maxPp }}
          </div>
        </button>
      </div>
      <div class="flex justify-end p-2">
        <button
          @click="battleStep = 1"
          class="font-bold text-black border-2 border-black px-4 py-1 bg-white hover:bg-gray-100 active:bg-gray-200 rounded"
        >
          BACK
        </button>
      </div>
    </div>

    <!-- Items menu - now matches moves menu style -->
    <div
      v-if="battleStep === 2"
      class="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-black sm:left-1/2 sm:right-auto sm:w-[800px] sm:transform sm:-translate-x-1/2"
    >
      <div class="grid grid-cols-2 gap-px">
        <button
          v-for="item in playerItems"
          :key="item.id"
          @click="useItem(item)"
          class="h-16 px-4 py-2 border-2 border-black m-1 text-left uppercase font-bold hover:bg-gray-100 active:bg-gray-200 rounded"
          :disabled="attacking"
        >
          {{ item.name }}
          <div class="flex justify-between mt-1">
            <span class="text-xs">{{ item.description }}</span>
            <span class="text-xs font-medium" v-if="item.quantity"
              >x{{ item.quantity }}</span
            >
          </div>
        </button>
      </div>
      <div class="flex justify-end p-2">
        <button
          @click="battleStep = 1"
          class="font-bold text-black border-2 border-black px-4 py-1 bg-white hover:bg-gray-100 active:bg-gray-200 rounded"
        >
          BACK
        </button>
      </div>
    </div>

    <!-- Battle result overlay -->
    <div
      v-if="battleComplete"
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-20"
    >
      <div
        class="bg-white p-5 m-4 border-4 border-black rounded max-w-sm w-full"
      >
        <h3 class="text-xl font-bold mb-3 text-center">
          {{
            battleResult === "player"
              ? "Victory!"
              : battleResult === "capture"
              ? "Gotcha!"
              : battleResult === "run"
              ? "Escaped!"
              : "Defeat!"
          }}
        </h3>
        <p class="text-center mb-4">{{ battleResultMessage }}</p>

        <div
          v-if="battleStats.experienceGained"
          class="my-4 p-3 bg-blue-100 border-2 border-blue-300 rounded"
        >
          <div class="text-center">
            {{ playerPokemon?.name || "Your Pokémon" }} gained
            <span class="font-bold">{{ battleStats.experienceGained }} EXP</span
            >.
          </div>
          <div
            v-if="battleStats.levelUp"
            class="font-bold text-blue-700 text-center mt-2"
          >
            Level Up! Now level {{ battleStats.newLevel }}!
          </div>
        </div>

        <button
          @click="$emit('battle-close', battleResult, battleStats)"
          class="w-full py-2 bg-red-600 text-white font-bold border-2 border-black rounded hover:bg-red-700 active:bg-red-800"
        >
          Continue Adventure
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
  playerPokemon: {
    type: Object,
    default: () => ({
      name: "POOCHYENA",
      sprites: {
        back_default:
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/261.png",
      },
    }),
  },
  opponentPokemon: {
    type: Object,
    default: () => ({
      name: "KIRLIA",
      sprites: {
        front_default:
          "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/front/281.png",
      },
    }),
  },
  playerLevel: {
    type: Number,
    default: 13,
  },
  opponentLevel: {
    type: Number,
    default: 100,
  },
  isWildBattle: {
    type: Boolean,
    default: true,
  },
  playerItems: {
    type: Array,
    default: () => [
      {
        id: 1,
        name: "Potion",
        description: "Restores 20 HP",
        type: "healing",
        value: 20,
        quantity: 3,
      },
      {
        id: 2,
        name: "Poké Ball",
        description: "Catches wild Pokémon",
        type: "pokeball",
        value: 1,
        quantity: 5,
      },
    ],
  },
  initialResult: {
    type: String,
    default: null,
  },
  autoCompleteWithResult: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "battle-close",
  "move-selected",
  "item-used",
  "run-attempted",
]);

// Image loading state
const playerImageLoaded = ref(false);
const opponentImageLoaded = ref(false);

// Battle state
const introMessage = ref("A wild Pokémon appeared!");
const battleMessage = ref("");
const battleStep = ref(1); // 0 = move selection, 1 = main menu, 2 = bag, 3 = opponent turn
const attacking = ref(false);
const battleComplete = ref(false);
const battleResult = ref("");
const playerTakingDamage = ref(false);
const opponentTakingDamage = ref(false);
const effectivenessMessage = ref("");
const effectivenessClass = ref("");
const showEffectiveness = ref(false);
const battleStats = ref({
  turns: 0,
  damageDealt: 0,
  damageTaken: 0,
  criticalHits: 0,
  movesUsed: [],
  experienceGained: 0,
  levelUp: false,
  newLevel: props.playerLevel,
});

// Calculate max HP based on base stats and level
const playerMaxHP = computed(() => {
  if (!props.playerPokemon?.stats) return 20 + props.playerLevel * 4;
  const baseHP =
    props.playerPokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ||
    50;
  return (
    Math.floor((baseHP * 2 * props.playerLevel) / 100) + props.playerLevel + 10
  );
});

const opponentMaxHP = computed(() => {
  if (!props.opponentPokemon?.stats) return 20 + props.opponentLevel * 4;
  const baseHP =
    props.opponentPokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ||
    50;
  return (
    Math.floor((baseHP * 2 * props.opponentLevel) / 100) +
    props.opponentLevel +
    10
  );
});

// Current HP values
const playerCurrentHP = ref(0);
const opponentCurrentHP = ref(0);

// Health percentages
const playerHealth = computed(
  () => (playerCurrentHP.value / playerMaxHP.value) * 100
);
const opponentHealth = ref(100);

// Type effectiveness chart
const typeEffectiveness = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    grass: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
    fairy: 2,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: { fighting: 2, poison: 0.5, bug: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

// Default moves if no moves are provided
const defaultMoves = [
  {
    id: 1,
    name: "Tackle",
    type: "normal",
    power: 40,
    accuracy: 100,
    pp: 35,
    maxPp: 35,
  },
  {
    id: 2,
    name: "Growl",
    type: "normal",
    power: 0,
    accuracy: 100,
    pp: 40,
    maxPp: 40,
    statEffect: { target: "opponent", stat: "attack", change: -1 },
  },
  {
    id: 3,
    name: "Tail Whip",
    type: "normal",
    power: 0,
    accuracy: 100,
    pp: 30,
    maxPp: 30,
    statEffect: { target: "opponent", stat: "defense", change: -1 },
  },
  {
    id: 4,
    name: "Sand Attack",
    type: "ground",
    power: 0,
    accuracy: 100,
    pp: 15,
    maxPp: 15,
    statEffect: { target: "opponent", stat: "accuracy", change: -1 },
  },
];

// Process player's Pokémon moves
const playerMoves = ref([]);

// Message to display at the end of battle
const battleResultMessage = computed(() => {
  if (battleResult.value === "player") {
    return `Congratulations! Your ${
      props.playerPokemon?.name || "Pokémon"
    } defeated ${props.opponentPokemon?.name || "the opponent"}!`;
  } else if (battleResult.value === "run") {
    return `Got away safely!`;
  } else if (battleResult.value === "capture") {
    return `You caught ${props.opponentPokemon?.name || "the wild Pokémon"}!`;
  } else {
    return `Your ${props.playerPokemon?.name || "Pokémon"} was defeated by ${
      props.opponentPokemon?.name || "the opponent"
    }. Better luck next time!`;
  }
});

// Computed properties
const isTrainerBattle = computed(() => !props.isWildBattle);

// Process and assign real moves from the Pokémon
const processPlayerMoves = async () => {
  if (
    !props.playerPokemon ||
    !props.playerPokemon.moves ||
    props.playerPokemon.moves.length === 0
  ) {
    playerMoves.value = defaultMoves;
    return;
  }

  let movesToUse = [];
  // Take up to 4 moves from the Pokémon's move list
  const pokemonMovesList = props.playerPokemon.moves.slice(0, 4);

  for (const move of pokemonMovesList) {
    try {
      // Try to get detailed move data
      const moveData = {
        id: move.id || Math.random().toString(36).substr(2, 9),
        name: move.move?.name || move.name || "Unknown Move",
        type: move.type || "normal",
        power: move.power || 40,
        accuracy: move.accuracy || 100,
        pp: move.pp || 20,
        maxPp: move.maxPp || 20,
      };
      movesToUse.push(moveData);
    } catch (error) {
      console.error("Error processing move:", error);
    }
  }

  // If we couldn't get any valid moves, use the defaults
  if (movesToUse.length === 0) {
    movesToUse = defaultMoves;
  } else if (movesToUse.length < 4) {
    // Fill remaining slots with default moves
    movesToUse = [
      ...movesToUse,
      ...defaultMoves.slice(0, 4 - movesToUse.length),
    ];
  }

  playerMoves.value = movesToUse;
};

// Health bar color changes based on remaining health
const healthBarColor = (health) => {
  if (health > 50) return "bg-green-500";
  if (health > 20) return "bg-yellow-500";
  return "bg-red-500";
};

// Get types from a Pokémon
const getPokemonTypes = (pokemon) => {
  if (!pokemon || !pokemon.types) return ["normal"];

  // Handle different type formats
  if (Array.isArray(pokemon.types) && typeof pokemon.types[0] === "string") {
    return pokemon.types;
  }

  if (Array.isArray(pokemon.types) && pokemon.types[0]?.type?.name) {
    return pokemon.types.map((t) => t.type.name);
  }

  return ["normal"];
};

// Determine move effectiveness and multiplier
const getMoveEffectiveness = (moveType, defenderTypes) => {
  if (!moveType || !defenderTypes || defenderTypes.length === 0) {
    return { multiplier: 1, message: "" };
  }

  let multiplier = 1;
  const types = Array.isArray(defenderTypes) ? defenderTypes : [defenderTypes];

  // Calculate effectiveness against each of defender's types
  for (const defenderType of types) {
    const typeChart = typeEffectiveness[moveType] || {};
    const effectiveness = typeChart[defenderType] || 1;
    multiplier *= effectiveness;
  }

  let message = "";
  if (multiplier > 1) {
    message = "It's super effective!";
  } else if (multiplier === 0) {
    message = "It has no effect...";
  } else if (multiplier < 1) {
    message = "It's not very effective...";
  }

  return { multiplier, message };
};

// Calculate damage with type effectiveness and critical hit chance
const calculateDamage = (move, attacker, defender, isPlayer) => {
  // Base damage formula
  let power = move.power || 40;

  // If it's a status move with no power, return 0 damage
  if (power === 0) return { damage: 0, critical: false, effectiveness: 1 };

  // Get relevant stats from attacker and defender
  const attackStat =
    attacker.stats?.find(
      (s) =>
        s.stat.name ===
        (move.category === "special" ? "special-attack" : "attack")
    )?.base_stat || 50;
  const defenseStat =
    defender.stats?.find(
      (s) =>
        s.stat.name ===
        (move.category === "special" ? "special-defense" : "defense")
    )?.base_stat || 50;

  // Attacker level
  const level = isPlayer ? props.playerLevel : props.opponentLevel;

  // Determine STAB (Same Type Attack Bonus)
  const attackerTypes = getPokemonTypes(attacker);
  const stab = attackerTypes.includes(move.type) ? 1.5 : 1;

  // Determine type effectiveness
  const defenderTypes = getPokemonTypes(defender);
  const { multiplier: typeEffectiveness } = getMoveEffectiveness(
    move.type,
    defenderTypes
  );

  // Calculate critical hit (1/16 chance)
  const critical = Math.random() < 0.0625;
  const criticalMultiplier = critical ? 1.5 : 1;

  // Random factor (0.85-1.00)
  const random = 0.85 + Math.random() * 0.15;

  // Calculate damage using Pokémon's formula
  const baseDamage =
    (((2 * level) / 5 + 2) * power * (attackStat / defenseStat)) / 50 + 2;
  const finalDamage = Math.floor(
    baseDamage * stab * typeEffectiveness * criticalMultiplier * random
  );

  return {
    damage: Math.max(1, finalDamage), // Always at least 1 damage
    critical,
    effectiveness: typeEffectiveness,
  };
};

// Methods
function dismissIntro() {
  introMessage.value = "";
  battleMessage.value = ""; // Clear the battle message as well
}

function displayMessage(message, duration = 2000) {
  battleMessage.value = message;
  // Clear the message after duration
  return new Promise((resolve) => {
    setTimeout(() => {
      battleMessage.value = "";
      resolve();
    }, duration);
  });
}

function openBag() {
  if (attacking.value) return;
  battleStep.value = 2;
}

// Try to run from battle
async function tryToRun() {
  if (attacking.value || isTrainerBattle.value) return;
  attacking.value = true;

  battleMessage.value = "Trying to run away...";

  await new Promise((resolve) => setTimeout(resolve, 800));

  // Base escape formula - higher player level increases chance
  // Lower opponent level and more attempts also increase chance
  const escapeChance =
    ((props.playerLevel * 128) / props.opponentLevel +
      30 * battleStats.value.turns) %
    256;
  const escapeSuccess = Math.random() * 256 < escapeChance;

  if (escapeSuccess) {
    battleMessage.value = "Got away safely!";
    await new Promise((resolve) => setTimeout(resolve, 800));

    battleResult.value = "run";
    battleComplete.value = true;
  } else {
    battleMessage.value = "Can't escape!";
    await new Promise((resolve) => setTimeout(resolve, 800));

    // If can't escape, opponent's turn
    battleStep.value = 3;
    await handleOpponentTurn();
  }

  attacking.value = false;
}

// Handle using an item
async function useItem(item) {
  if (attacking.value) return;
  attacking.value = true;

  battleMessage.value = `Used ${item.name}!`;

  await new Promise((resolve) => setTimeout(resolve, 800));

  // Handle different item types
  if (item.type === "healing" || item.effect === "heal") {
    const healAmount = item.value || 20;
    playerCurrentHP.value = Math.min(
      playerMaxHP.value,
      playerCurrentHP.value + healAmount
    );

    battleMessage.value = `${
      props.playerPokemon?.name || "Your Pokémon"
    } restored ${healAmount} HP!`;

    // Reduce item quantity if available
    if (item.quantity) {
      item.quantity--;
    }
  } else if (item.type === "pokeball" || item.effect === "capture") {
    // Handle capture attempt
    if (props.isTrainerBattle) {
      battleMessage.value = "You can't catch another Trainer's Pokémon!";
    } else {
      // Reduce item quantity if available
      if (item.quantity) {
        item.quantity--;
      }

      // Calculate catch rate - lower HP means higher chance
      const catchRate =
        (3 * opponentMaxHP.value - 2 * opponentCurrentHP.value) *
        (opponentMaxHP.value > 200 ? 0.1 : 0.2);
      const catchSuccess = Math.random() * 100 < catchRate;

      battleMessage.value = "The ball is thrown...";
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (catchSuccess) {
        battleMessage.value = "Gotcha! The Pokémon was caught!";
        await new Promise((resolve) => setTimeout(resolve, 1200));

        battleResult.value = "capture";
        battleComplete.value = true;
        attacking.value = false;
        return;
      } else {
        battleMessage.value = "Oh no! The Pokémon broke free!";
      }
    }
  } else if (item.type === "status") {
    battleMessage.value = `The ${item.name} failed to work!`;

    // Reduce item quantity if available
    if (item.quantity) {
      item.quantity--;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // After using item, opponent's turn
  battleStep.value = 3;
  await handleOpponentTurn();

  attacking.value = false;
}

// Handle player move selection
async function selectMove(move) {
  if (attacking.value || battleComplete.value) return;

  attacking.value = true;
  battleStats.value.turns++;

  // Close the move selection UI immediately
  battleStep.value = 1;

  // Record move usage
  battleStats.value.movesUsed.push(move.name);

  // Reduce PP
  const moveIndex = playerMoves.value.findIndex((m) => m.id === move.id);
  if (moveIndex !== -1 && playerMoves.value[moveIndex].pp > 0) {
    playerMoves.value[moveIndex].pp--;
  }

  // Emit move selected event
  emit("move-selected", move.name);

  // Show the attack message and wait for it to complete
  battleMessage.value = `${props.playerPokemon?.name || "Your Pokémon"} used ${
    move.name
  }!`;
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Rest of your existing selectMove function...
  // Calculate damage with type effectiveness
  const { damage, critical, effectiveness } = calculateDamage(
    move,
    props.playerPokemon,
    props.opponentPokemon,
    true
  );

  // Handle status or stat moves
  if (move.power === 0 && move.statEffect) {
    battleMessage.value = `${props.opponentPokemon?.name || "Opponent"}'s ${
      move.statEffect.stat
    } ${move.statEffect.change < 0 ? "fell" : "rose"}!`;
    await new Promise((resolve) => setTimeout(resolve, 800));

    // No actual damage for stat moves
    battleStep.value = 3;
    await handleOpponentTurn();
    attacking.value = false;
    return;
  }

  // Set effectiveness message
  if (effectiveness !== 1) {
    effectivenessMessage.value =
      effectiveness > 1
        ? "It's super effective!"
        : effectiveness === 0
        ? "It had no effect..."
        : "It's not very effective...";

    effectivenessClass.value =
      effectiveness > 1
        ? "text-red-600 font-bold"
        : effectiveness === 0
        ? "text-gray-600"
        : "text-blue-600";

    showEffectiveness.value = true;
    await new Promise((resolve) => setTimeout(resolve, 800));
    showEffectiveness.value = false;
  }

  // Show critical hit message
  if (critical) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    battleMessage.value = "A critical hit!";
    battleStats.value.criticalHits++;
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  // Apply damage to opponent
  if (damage > 0) {
    // Show the opponent taking damage with visual effect
    opponentTakingDamage.value = true;
    setTimeout(() => {
      opponentTakingDamage.value = false;
    }, 300);

    // Calculate and update HP
    opponentCurrentHP.value = Math.max(0, opponentCurrentHP.value - damage);
    opponentHealth.value =
      (opponentCurrentHP.value / opponentMaxHP.value) * 100;

    // Track damage dealt for stats
    battleStats.value.damageDealt += damage;
  }

  // Check if opponent fainted
  if (opponentCurrentHP.value <= 0) {
    battleMessage.value = `${
      props.opponentPokemon?.name || "Opponent"
    } fainted!`;
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Calculate experience gained
    const expGain = Math.floor(
      props.opponentLevel * 50 * (props.isTrainerBattle ? 1.5 : 1)
    );
    battleStats.value.experienceGained = expGain;

    // Check if level up occurred (simplified calculation)
    const expToNextLevel = props.playerLevel * props.playerLevel * 50;
    if (expGain >= expToNextLevel) {
      battleStats.value.levelUp = true;
      battleStats.value.newLevel = props.playerLevel + 1;
    }

    endBattle("player");
    attacking.value = false;
    return;
  }

  // Move to opponent's turn
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Opponent's turn
  await handleOpponentTurn();
  attacking.value = false;
}

// Handle opponent's turn
async function handleOpponentTurn() {
  if (battleComplete.value) return;

  await new Promise((resolve) => setTimeout(resolve, 800));

  // Get opponent's moves
  let opponentMoves = [];

  if (props.opponentPokemon?.moves && props.opponentPokemon.moves.length > 0) {
    // Select up to 4 random moves
    const availableMoves = props.opponentPokemon.moves.slice(
      0,
      Math.min(4, props.opponentPokemon.moves.length)
    );
    opponentMoves = availableMoves.map((move) => ({
      name: move.move?.name || "Attack",
      type: "normal", // Default to normal type
      power: 40, // Default power
      accuracy: 95, // Default accuracy
    }));
  } else {
    // Default moves if none are available
    opponentMoves = [
      { name: "Tackle", type: "normal", power: 40, accuracy: 100 },
      {
        name: "Growl",
        type: "normal",
        power: 0,
        accuracy: 100,
        statEffect: { target: "player", stat: "attack", change: -1 },
      },
    ];
  }

  // Select a random move
  const selectedMoveIndex = Math.floor(Math.random() * opponentMoves.length);
  const selectedMove = opponentMoves[selectedMoveIndex];

  // Display the move being used
  battleMessage.value = `${props.opponentPokemon?.name || "Opponent"} used ${
    selectedMove.name
  }!`;
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Calculate damage and effectiveness
  const { damage, critical, effectiveness } = calculateDamage(
    selectedMove,
    props.opponentPokemon,
    props.playerPokemon,
    false
  );

  // Handle status or stat moves
  if (selectedMove.power === 0 && selectedMove.statEffect) {
    battleMessage.value = `${props.playerPokemon?.name || "Your Pokémon"}'s ${
      selectedMove.statEffect.stat
    } ${selectedMove.statEffect.change < 0 ? "fell" : "rose"}!`;
    await new Promise((resolve) => setTimeout(resolve, 800));
    battleStep.value = 1; // Return to player's main menu
    battleMessage.value = ""; // Clear message to ensure menu appears
    return;
  }

  // Set effectiveness message
  if (effectiveness !== 1) {
    effectivenessMessage.value =
      effectiveness > 1
        ? "It's super effective!"
        : effectiveness === 0
        ? "It had no effect..."
        : "It's not very effective...";

    effectivenessClass.value =
      effectiveness > 1
        ? "text-red-600 font-bold"
        : effectiveness === 0
        ? "text-gray-600"
        : "text-blue-600";

    showEffectiveness.value = true;
    await new Promise((resolve) => setTimeout(resolve, 800));
    showEffectiveness.value = false;
  }

  // Show critical hit message
  if (critical) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    battleMessage.value = "A critical hit!";
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  // Apply damage to player
  if (damage > 0) {
    // Show the player taking damage with visual effect
    playerTakingDamage.value = true;
    setTimeout(() => {
      playerTakingDamage.value = false;
    }, 300);

    // Calculate and update HP
    playerCurrentHP.value = Math.max(0, playerCurrentHP.value - damage);

    // Track damage taken for stats
    battleStats.value.damageTaken += damage;
  }

  // Check if player fainted
  if (playerCurrentHP.value <= 0) {
    battleMessage.value = `${
      props.playerPokemon?.name || "Your Pokémon"
    } fainted!`;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    endBattle("opponent");
    return;
  }

  // Return to player's main menu
  await new Promise((resolve) => setTimeout(resolve, 800));
  battleMessage.value = ""; // Clear the message to ensure menu shows up
  battleStep.value = 1; // Back to main menu
}

// End the battle
function endBattle(result) {
  battleResult.value = result;
  battleComplete.value = true;

  // If player won, calculate experience
  if (result === "player") {
    // Base experience calculation
    const baseExp = props.opponentLevel * 30;
    const trainerBonus = props.isTrainerBattle ? 1.5 : 1;

    battleStats.value.experienceGained = Math.floor(baseExp * trainerBonus);
  }
}

// Initialize the battle
onMounted(async () => {
  // Initialize HP values correctly
  playerCurrentHP.value = playerMaxHP.value;
  opponentCurrentHP.value = opponentMaxHP.value;
  opponentHealth.value = 100;

  // Set initial battle message
  battleMessage.value = "A wild Pokémon appeared!";

  // Process moves to ensure proper PP and typing
  await processPlayerMoves();

  // Handle auto-complete with result (for reviewing past battles)
  if (props.initialResult && props.autoCompleteWithResult) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    battleMessage.value = "The battle is already over!";

    if (props.initialResult === "player") {
      opponentCurrentHP.value = 0;
      opponentHealth.value = 0;
    } else {
      playerCurrentHP.value = 0;
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
    endBattle(props.initialResult);
  }
});

// Preload images when component mounts or when Pokémon change
watch(
  [() => props.playerPokemon, () => props.opponentPokemon],
  async ([newPlayerPokemon, newOpponentPokemon]) => {
    // Only reset HP and battle state if battle isn't complete and no initial result
    if (!battleComplete.value && !props.initialResult) {
      // Reset battle state when Pokémon change
      playerCurrentHP.value = playerMaxHP.value;
      opponentCurrentHP.value = opponentMaxHP.value;
      opponentHealth.value = 100;
      battleStep.value = 1;
      battleMessage.value = "A wild Pokémon appeared!";
      await processPlayerMoves();
    }

    // Preload player image
    if (newPlayerPokemon?.sprites?.back_default) {
      const playerImg = new Image();
      playerImg.onload = () => {
        playerImageLoaded.value = true;
      };
      playerImg.src = newPlayerPokemon.sprites.back_default;
    } else {
      playerImageLoaded.value = true;
    }

    // Preload opponent image
    if (newOpponentPokemon?.sprites?.front_default) {
      const opponentImg = new Image();
      opponentImg.onload = () => {
        opponentImageLoaded.value = true;
      };
      opponentImg.src = newOpponentPokemon.sprites.front_default;
    } else {
      opponentImageLoaded.value = true;
    }
  },
  { deep: true, immediate: true }
);
</script>

<style scoped>
.bg-cream {
  background-color: #f8f0d8;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-5px);
  }
  40%,
  80% {
    transform: translateX(5px);
  }
}

.animate-shake {
  animation: shake 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0) scale(1.5);
  }
  20%,
  60% {
    transform: translateX(-5px) scale(1.5);
  }
  40%,
  80% {
    transform: translateX(5px) scale(1.5);
  }
}
.shake {
  animation: shake 0.3s;
}
</style>
