<template>
  <div class="relative h-[600px] overflow-hidden rounded-lg bg-gradient-to-b from-blue-400 via-sky-300 to-green-300">
    <!-- Battle message box in center -->
    <div class="absolute top-1/4 left-0 right-0 flex justify-center z-10">
      <div v-if="battleMessage" class="bg-white px-8 py-4 rounded-3xl shadow-lg text-center max-w-md animate-fadeIn">
        <p class="font-medium text-lg">{{ battleMessage }}</p>
      </div>
    </div>
    
    <!-- Battle arena with properly positioned Pokémon -->
    <!-- Player Pokémon (bottom left) -->
    <div class="absolute bottom-48 left-10">
      <!-- Player platform -->
      <div class="absolute bottom-0 left-0 w-64 h-16 bg-gray-400 bg-opacity-50 rounded-full transform -translate-x-1/4"></div>
      
      <img
        v-if="playerPokemon?.sprites?.back_default"
        :src="playerPokemon.sprites.back_default"
        :alt="playerPokemon.name"
        class="h-32 transform scale-150 relative z-10"
        :class="{ 'animate-shake': playerTakingDamage }"
      />
    </div>
    
    <!-- Player HP info card -->
    <div class="absolute top-[36%] left-8 w-60 bg-white rounded-lg p-2 shadow-md">
      <div class="flex justify-between items-center">
        <span class="font-bold capitalize">{{ playerPokemon?.name || "Charmander" }}</span>
        <span class="text-sm">Lv{{ playerLevel }}</span>
      </div>
      <div class="mt-1">
        <div class="flex items-center">
          <span class="text-sm font-medium mr-1">HP</span>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="h-2 rounded-full bg-green-500 transition-all duration-500"
                :style="{ width: playerHealth + '%' }"></div>
          </div>
        </div>
        <div class="text-right text-sm">
          {{ Math.ceil(playerCurrentHP) }}/{{ playerMaxHP }}
        </div>
      </div>
    </div>
    
    <!-- Opponent Pokémon (top right) -->
    <div class="absolute top-32 right-12">
      <!-- Enemy platform -->
      <div class="absolute bottom-0 right-0 w-64 h-16 bg-gray-400 bg-opacity-50 rounded-full transform translate-x-1/4"></div>
      
      <img
        v-if="opponentPokemon?.sprites?.front_default"
        :src="opponentPokemon.sprites.front_default"
        :alt="opponentPokemon.name"
        class="h-28 transform scale-150 relative z-10"
        :class="{ 'animate-shake': opponentTakingDamage }"
      />
    </div>
    
    <!-- Opponent HP info card -->
    <div class="absolute top-8 right-8 w-60 bg-white rounded-lg p-2 shadow-md">
      <div class="flex justify-between items-center">
        <span class="font-bold capitalize">{{ opponentPokemon?.name || "Pikachu" }}</span>
        <span class="text-sm">Lv{{ opponentLevel }}</span>
      </div>
      <div class="mt-1">
        <div class="flex items-center">
          <span class="text-sm font-medium mr-1">HP</span>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="h-2 rounded-full bg-green-500 transition-all duration-500"
                :style="{ width: opponentHealth + '%' }"></div>
          </div>
        </div>
        <div class="text-right text-sm">
          {{ Math.ceil(opponentCurrentHP) }}/{{ opponentMaxHP }}
        </div>
      </div>
    </div>
    
    <!-- Battle controls -->
    <div class="absolute bottom-0 left-0 right-0 overflow-hidden">
      <!-- Main battle menu -->
      <div v-if="battleStep === 1" class="grid grid-cols-2 gap-px">
        <button 
          @click="battleStep = 0"
          class="py-6 px-8 text-center text-lg font-medium bg-red-100 hover:bg-red-200 transition"
        >
          Fight
        </button>
        <button 
          @click="openBag"
          class="py-6 px-8 text-center text-lg font-medium bg-blue-100 hover:bg-blue-200 transition"
          :disabled="!playerItems.length || attacking"
        >
          Bag ({{ playerItems.length }})
        </button>
        <button 
          @click="tryToRun"
          class="col-span-2 py-6 px-8 text-center text-lg font-medium bg-green-100 hover:bg-green-200 transition"
          :disabled="isTrainerBattle || attacking"
        >
          Run
        </button>
      </div>
      
      <!-- Fight moves menu -->
      <div v-if="battleStep === 0" class="grid grid-cols-2 gap-px">
        <button
          v-for="move in playerMoves"
          :key="move.id"
          @click="selectMove(move)"
          class="py-2 px-6 text-left font-medium capitalize hover:opacity-90 transition"
          :class="getMoveTypeClass(move.type)"
          :disabled="attacking || move.pp <= 0"
        >
          <div class="font-bold text-base">{{ move.name }}</div>
          <div class="flex justify-between w-full mt-1">
            <span class="text-xs opacity-80">{{ move.type }}</span>
            <span class="text-xs">PP: {{ move.pp }}/{{ move.maxPp }}</span>
          </div>
        </button>
        <button 
          @click="battleStep = 1" 
          class="col-span-2 py-4 text-center text-base font-medium bg-gray-200 hover:bg-gray-300 transition"
        >
          Back
        </button>
      </div>
      
      <!-- Bag menu -->
      <div v-if="battleStep === 2" class="grid grid-cols-2 gap-px">
        <button
          v-for="item in playerItems.slice(0, 4)"
          :key="item.id"
          @click="useItem(item)"
          class="py-5 px-6 text-left bg-yellow-100 hover:bg-yellow-200 transition"
          :disabled="attacking || item.quantity <= 0"
        >
          <div class="font-bold">{{ item.name }}</div>
          <div class="flex justify-between items-center mt-1">
            <div class="text-xs text-gray-600">{{ item.description }}</div>
            <div class="text-xs font-bold">x{{ item.quantity }}</div>
          </div>
        </button>
        <button 
          @click="battleStep = 1" 
          class="col-span-2 py-4 text-center text-base font-medium bg-gray-200 hover:bg-gray-300 transition"
        >
          Back
        </button>
      </div>
      
      <!-- Opponent turn indicator -->
      <div v-if="battleStep === 3" class="p-8 text-center bg-white">
        <div class="text-lg font-medium">
          {{ opponentPokemon?.name || "Opponent" }} is making a move...
        </div>
      </div>
    </div>
    
    <!-- Battle result overlay -->
    <div v-if="battleComplete" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div class="bg-white p-6 rounded-xl shadow-xl max-w-sm mx-auto">
        <h3 class="text-xl font-bold mb-3 text-center">
          {{ battleResult === "player" ? "Victory!" : 
             battleResult === "capture" ? "Gotcha!" : 
             battleResult === "run" ? "Escaped!" : "Defeat!" }}
        </h3>
        <p class="text-center mb-4">{{ battleResultMessage }}</p>
        
        <div v-if="battleStats.experienceGained" class="my-4 p-3 bg-blue-100 rounded-lg">
          <div class="text-center">
            {{ playerPokemon?.name || "Your Pokémon" }} gained <span class="font-bold">{{ battleStats.experienceGained }} EXP</span>.
          </div>
          <div v-if="battleStats.levelUp" class="font-bold text-blue-700 text-center mt-2">
            Level Up! Now level {{ battleStats.newLevel }}!
          </div>
        </div>
        
        <button @click="$emit('battle-close', battleResult, battleStats)" 
          class="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition shadow-md">
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
    default: () => ({ name: "Your Pokémon" }),
  },
  opponentPokemon: {
    type: Object,
    default: () => ({ name: "Wild Pokémon" }),
  },
  initialResult: {
    type: String,
    default: null,
  },
  isTrainerBattle: {
    type: Boolean,
    default: false,
  },
  playerLevel: {
    type: Number,
    default: 5,
  },
  opponentLevel: {
    type: Number,
    default: 5,
  },
  playerItems: {
    type: Array,
    default: () => [],
  },
  autoCompleteWithResult: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["battle-close", "move-selected"]);

// Image loading state
const playerImageLoaded = ref(false);
const opponentImageLoaded = ref(false);

// Battle state
const playerHealth = ref(100);
const opponentHealth = ref(100);
const battleComplete = ref(false);
const battleResult = ref(null);
const battleStep = ref(1); // 0: Move selection, 1: Main menu, 2: Bag, 3: Opponent's turn
const battleMessage = ref("");
const attacking = ref(false);
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
  if (!props.playerPokemon?.stats) return 100;
  const baseHP =
    props.playerPokemon.stats.find((s) => s.stat.name === "hp")?.base_stat ||
    50;
  return (
    Math.floor((baseHP * 2 * props.playerLevel) / 100) + props.playerLevel + 10
  );
});

const opponentMaxHP = computed(() => {
  if (!props.opponentPokemon?.stats) return 100;
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

// Process player's Pokémon moves to include power and PP
const playerMoves = ref([]);

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
      // Try to get detailed move data from the move URL or use default data
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

// Get background color based on move type
const getMoveTypeClass = (type) => {
  const typeColors = {
    normal: "bg-gray-200",
    fire: "bg-red-200 text-red-800",
    water: "bg-blue-200 text-blue-800",
    electric: "bg-yellow-200 text-yellow-800",
    grass: "bg-green-200 text-green-800",
    ice: "bg-blue-100 text-blue-800",
    fighting: "bg-red-300 text-red-800",
    poison: "bg-purple-200 text-purple-800",
    ground: "bg-yellow-300 text-yellow-800",
    flying: "bg-indigo-200 text-indigo-800",
    psychic: "bg-pink-200 text-pink-800",
    bug: "bg-green-300 text-green-800",
    rock: "bg-yellow-400 text-yellow-900",
    ghost: "bg-purple-300 text-purple-900",
    dragon: "bg-indigo-300 text-indigo-900",
    dark: "bg-gray-700 text-white",
    steel: "bg-gray-400 text-gray-900",
    fairy: "bg-pink-100 text-pink-900",
  };

  return typeColors[type] || "bg-gray-200";
};

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

// Process a move's status effects
const applyStatusEffect = (move) => {
  if (!move.statusEffect) return null;

  // Simple implementation for now
  return {
    type: move.statusEffect,
    chance: move.statusEffectChance || 100,
    applied: Math.random() * 100 < (move.statusEffectChance || 100),
  };
};

// Handle using an item
const useItem = async (item) => {
  if (attacking.value) return;
  attacking.value = true;

  battleMessage.value = `Used ${item.name}!`;

  await new Promise((resolve) => setTimeout(resolve, 800));

  // Handle different item types
  if (item.type === "healing") {
    const healAmount = item.value || 20;
    playerCurrentHP.value = Math.min(
      playerMaxHP.value,
      playerCurrentHP.value + healAmount
    );
    playerHealth.value = (playerCurrentHP.value / playerMaxHP.value) * 100;

    battleMessage.value = `${
      props.playerPokemon?.name || "Your Pokémon"
    } restored ${healAmount} HP!`;

    // Reduce item quantity
    const itemIndex = props.playerItems.findIndex((i) => i.id === item.id);
    if (itemIndex !== -1 && props.playerItems[itemIndex].quantity > 0) {
      props.playerItems[itemIndex].quantity--;
    }
  } else if (item.type === "pokeball") {
    // Handle capture attempt
    if (props.isTrainerBattle) {
      battleMessage.value = "You can't catch another Trainer's Pokémon!";
    } else {
      // Reduce item quantity first
      const itemIndex = props.playerItems.findIndex((i) => i.id === item.id);
      if (itemIndex !== -1 && props.playerItems[itemIndex].quantity > 0) {
        props.playerItems[itemIndex].quantity--;
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

    // Reduce item quantity
    const itemIndex = props.playerItems.findIndex((i) => i.id === item.id);
    if (itemIndex !== -1 && props.playerItems[itemIndex].quantity > 0) {
      props.playerItems[itemIndex].quantity--;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // After using item, opponent's turn
  battleStep.value = 3;
  await handleOpponentTurn();

  attacking.value = false;
};

// Try to run from battle
const tryToRun = async () => {
  if (attacking.value) return;
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
};

// Open bag
const openBag = () => {
  battleStep.value = 2;
};

// Handle player move selection
const selectMove = async (move) => {
  if (attacking.value || battleComplete.value) return;

  attacking.value = true;
  battleStats.value.turns++;

  // Record move usage
  battleStats.value.movesUsed.push(move.name);

  // Reduce PP
  const moveIndex = playerMoves.value.findIndex((m) => m.id === move.id);
  if (moveIndex !== -1 && playerMoves.value[moveIndex].pp > 0) {
    playerMoves.value[moveIndex].pp--;
  }

  // Emit move selected event
  emit("move-selected", move.name);

  battleMessage.value = `${props.playerPokemon?.name || "Your Pokémon"} used ${
    move.name
  }!`;

  await new Promise((resolve) => setTimeout(resolve, 800));

  // Calculate damage with type effectiveness
  const playerTypes = getPokemonTypes(props.playerPokemon);
  const opponentTypes = getPokemonTypes(props.opponentPokemon);

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
  battleStep.value = 3;
  effectivenessMessage.value = "";
  showEffectiveness.value = false;

  // Opponent's turn
  await handleOpponentTurn();
  attacking.value = false;
};

// Handle opponent's turn
const handleOpponentTurn = async () => {
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
    playerHealth.value = (playerCurrentHP.value / playerMaxHP.value) * 100;

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
  effectivenessMessage.value = "";
  showEffectiveness.value = false;
  battleMessage.value = "What will you do?";
  battleStep.value = 1; // Back to main menu
};

// End the battle
const endBattle = (result) => {
  battleResult.value = result;
  battleComplete.value = true;

  // If player won, calculate experience
  if (result === "player") {
    // Base experience calculation
    const baseExp = props.opponentLevel * 30;
    const trainerBonus = props.isTrainerBattle ? 1.5 : 1;

    battleStats.value.experienceGained = Math.floor(baseExp * trainerBonus);
  }
};

// Preload images when component mounts or when Pokémon change
watch(
  [() => props.playerPokemon, () => props.opponentPokemon],
  async ([newPlayerPokemon, newOpponentPokemon]) => {
    // Only reset HP and battle state if battle isn't complete and no initial result
    if (!battleComplete.value && !props.initialResult) {
      // Reset battle state when Pokémon change
      playerCurrentHP.value = playerMaxHP.value;
      opponentCurrentHP.value = opponentMaxHP.value;
      playerHealth.value = 100;
      opponentHealth.value = 100;
      battleStep.value = 1;
      battleMessage.value = "A wild Pokémon appeared!";
      processPlayerMoves();
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

onMounted(async () => {
  // Initialize HP values correctly
  playerCurrentHP.value = playerMaxHP.value;
  opponentCurrentHP.value = opponentMaxHP.value;

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
      playerHealth.value = 0;
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
    endBattle(props.initialResult);
  }
});
</script>

<style scoped>
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
