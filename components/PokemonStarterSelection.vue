<template>
  <TransitionRoot :show="show" as="div">
    <!-- The Dialog is forced (not dismissible via escape or backdrop click) -->
    <Dialog as="div" class="fixed inset-0 z-50 overflow-y-auto" @close="noop">
      <div class="flex items-center justify-center min-h-screen px-4 text-center">
        <!-- Backdrop with glass effect -->
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <DialogOverlay class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md" />
        </TransitionChild>

        <!-- Centering trick -->
        <span class="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

        <!-- Modal panel -->
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leave-from="opacity-100 translate-y-0 sm:scale-100"
          leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <DialogPanel class="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
            <!-- Header -->
            <div class="p-4 bg-red-600 text-white rounded-t-lg">
              <h3 class="text-xl font-bold text-center">Choose Your First Pokémon</h3>
              <p class="text-center text-sm mt-1">
                This Pokémon will be your trusted partner on your journey!
              </p>
            </div>

            <!-- Professor Oak greeting -->
            <div class="p-6 bg-gray-100 border-b border-gray-200">
              <div class="flex items-center space-x-4">
                <div class="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  <img
                    src="/oak.png"
                    alt="Professor Oak"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1">
                  <p class="text-gray-800">
                    Welcome to the world of Pokémon! I'm Professor Oak. Every trainer begins their journey by choosing their first Pokémon companion. This decision marks the start of your adventure together!
                  </p>
                </div>
              </div>
            </div>

            <!-- Starter selection content -->
            <div class="p-6">
              <div v-if="loadingStarters" class="flex justify-center py-12">
                <div class="animate-bounce bg-red-600 p-2 w-10 h-10 ring-1 ring-slate-900/5 shadow-lg rounded-full flex items-center justify-center">
                  <svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                  </svg>
                </div>
              </div>

              <div v-else>
                <!-- Generation selector -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Choose Generation:</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="gen in generations"
                      :key="gen.id"
                      @click="selectGeneration(gen.id)"
                      class="px-3 py-1 rounded-md text-sm"
                      :class="selectedGeneration === gen.id ? 'bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300'"
                    >
                      {{ gen.name }}
                    </button>
                  </div>
                </div>

                <!-- Starters grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    v-for="starter in currentStarters"
                    :key="starter.name"
                    class="border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                    :class="{'ring-2 ring-red-600': hoveredStarter === starter.name}"
                    @mouseenter="hoveredStarter = starter.name"
                    @mouseleave="hoveredStarter = null"
                    @click="selectStarter(starter)"
                  >
                    <!-- Pokémon image with type background -->
                    <div class="h-40 flex items-center justify-center p-2" :class="getTypeBackground(starter.types[0])">
                      <img
                        v-if="starter.sprites && starter.sprites.other && starter.sprites.other['official-artwork'] && starter.sprites.other['official-artwork'].front_default"
                        :src="starter.sprites.other['official-artwork'].front_default"
                        :alt="starter.name"
                        class="h-full object-contain"
                      />
                      <img
                        v-else-if="starter.sprites && starter.sprites.front_default"
                        :src="starter.sprites.front_default"
                        :alt="starter.name"
                        class="h-32 object-contain"
                      />
                      <div v-else class="text-white text-xl capitalize">{{ starter.name }}</div>
                    </div>

                    <div class="p-4">
                      <h4 class="font-bold text-lg capitalize">{{ starter.name }}</h4>
                      <!-- Display Pokémon types -->
                      <div class="flex gap-2 mt-2">
                        <span
                          v-for="type in starter.types"
                          :key="type"
                          class="px-2 py-1 rounded text-xs text-white font-semibold capitalize"
                          :class="getTypeClass(type)"
                        >
                          {{ type }}
                        </span>
                      </div>
                      <!-- Basic stats preview -->
                      <div class="mt-3 text-sm text-gray-600">
                        <div class="grid grid-cols-3 gap-1">
                          <div>HP: {{ getStatValue(starter, 'hp') }}</div>
                          <div>ATK: {{ getStatValue(starter, 'attack') }}</div>
                          <div>DEF: {{ getStatValue(starter, 'defense') }}</div>
                        </div>
                      </div>
                      <button
                        @click.stop="selectStarter(starter)"
                        class="mt-3 w-full bg-red-600 text-white py-2 rounded-full hover:bg-red-700 transition"
                      >
                        I Choose You!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- End of modal content -->
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Dialog, DialogPanel, DialogOverlay, TransitionChild, TransitionRoot } from '@headlessui/vue'

// The modal is controlled via the "show" prop from the parent.
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emit events for when a starter is selected.
const emit = defineEmits(['close', 'select-starter'])

// A no-op function disables user-initiated closing.
const noop = () => {}

// Data and logic for starter selection.
const loadingStarters = ref(true)
const starterPokemon = ref({})
const selectedGeneration = ref(1)
const hoveredStarter = ref(null)

const generations = [
  { id: 1, name: 'Kanto (Gen I)', starters: ['bulbasaur', 'charmander', 'squirtle'] },
  { id: 2, name: 'Johto (Gen II)', starters: ['chikorita', 'cyndaquil', 'totodile'] },
  { id: 3, name: 'Hoenn (Gen III)', starters: ['treecko', 'torchic', 'mudkip'] },
  { id: 4, name: 'Sinnoh (Gen IV)', starters: ['turtwig', 'chimchar', 'piplup'] },
  { id: 5, name: 'Unova (Gen V)', starters: ['snivy', 'tepig', 'oshawott'] },
  { id: 6, name: 'Kalos (Gen VI)', starters: ['chespin', 'fennekin', 'froakie'] },
  { id: 7, name: 'Alola (Gen VII)', starters: ['rowlet', 'litten', 'popplio'] },
  { id: 8, name: 'Galar (Gen VIII)', starters: ['grookey', 'scorbunny', 'sobble'] }
]

const currentStarters = computed(() => {
  const gen = generations.find((g) => g.id === selectedGeneration.value)
  if (!gen) return []
  return gen.starters.map((name) => starterPokemon.value[name]).filter(Boolean)
})

const selectGeneration = (genId) => {
  selectedGeneration.value = genId
  const gen = generations.find((g) => g.id === genId)
  if (gen) {
    fetchStartersForGeneration(gen)
  }
}

const fetchStartersForGeneration = async (gen) => {
  const promises = gen.starters.map(async (name) => {
    if (starterPokemon.value[name]) return
    try {
      const response = await fetch(`/api/pokemon-info?name=${name}`)
      if (!response.ok) throw new Error(`Failed to fetch ${name}`)
      const data = await response.json()
      const types = data.types.map((t) => t.type.name)
      starterPokemon.value[name] = { ...data, types }
    } catch (error) {
      console.error(`Error fetching ${name}:`, error)
    }
  })
  await Promise.all(promises)
}

const selectStarter = (pokemon) => {
  // Emit the chosen starter. The parent should update state and close the modal programmatically.
  emit('select-starter', pokemon)
}

const getTypeClass = (type) => {
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
  }
  return typeColors[type] || 'bg-gray-400'
}

const getTypeBackground = (type) => {
  const typeBackgrounds = {
    normal: 'bg-gradient-to-b from-gray-300 to-gray-400',
    fire: 'bg-gradient-to-b from-red-400 to-red-500',
    water: 'bg-gradient-to-b from-blue-400 to-blue-500',
    electric: 'bg-gradient-to-b from-yellow-300 to-yellow-400',
    grass: 'bg-gradient-to-b from-green-400 to-green-500',
    ice: 'bg-gradient-to-b from-blue-200 to-blue-300',
    fighting: 'bg-gradient-to-b from-red-600 to-red-700',
    poison: 'bg-gradient-to-b from-purple-400 to-purple-500',
    ground: 'bg-gradient-to-b from-yellow-500 to-yellow-600',
    flying: 'bg-gradient-to-b from-indigo-200 to-indigo-300',
    psychic: 'bg-gradient-to-b from-pink-400 to-pink-500',
    bug: 'bg-gradient-to-b from-green-300 to-green-400',
    rock: 'bg-gradient-to-b from-yellow-600 to-yellow-700',
    ghost: 'bg-gradient-to-b from-purple-600 to-purple-700',
    dragon: 'bg-gradient-to-b from-indigo-500 to-indigo-600',
    dark: 'bg-gradient-to-b from-gray-600 to-gray-700',
    steel: 'bg-gradient-to-b from-gray-400 to-gray-500',
    fairy: 'bg-gradient-to-b from-pink-200 to-pink-300'
  }
  return typeBackgrounds[type] || 'bg-gradient-to-b from-gray-300 to-gray-400'
}

const getStatValue = (pokemon, statName) => {
  if (!pokemon || !pokemon.stats) return '??'
  const stat = pokemon.stats.find((s) => s.stat.name === statName)
  return stat ? stat.base_stat : '??'
}

// Fetch initial starter Pokémon data on mount (Generation 1 by default)
onMounted(async () => {
  const gen1 = generations.find((g) => g.id === 1)
  await fetchStartersForGeneration(gen1)
  loadingStarters.value = false
})
</script>