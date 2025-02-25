// server/api/pokemon-game.js
import { OpenAI } from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to fetch Pokémon data from PokeAPI
async function fetchPokemonData(name) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
    );
    if (!response.ok) {
      throw new Error(`Pokémon not found: ${name}`);
    }
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

// Function to search Pokémon by type
async function searchPokemonByType(type) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/type/${type.toLowerCase()}`
    );
    if (!response.ok) {
      throw new Error(`Type not found: ${type}`);
    }
    const data = await response.json();
    return data.pokemon.slice(0, 10).map((p) => p.pokemon.name); // Return first 10 results
  } catch (error) {
    return { error: error.message };
  }
}

// Get a random Pokémon
async function getRandomPokemon() {
  try {
    // There are currently about 1000 Pokémon, so pick a random ID
    const randomId = Math.floor(Math.random() * 898) + 1;
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${randomId}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch random Pokémon`);
    }
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

// Get Pokémon moves
async function getPokemonMoves(name) {
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
    );
    if (!response.ok) {
      throw new Error(`Pokémon not found: ${name}`);
    }
    const data = await response.json();
    // Return a list of moves (max 10)
    return data.moves.slice(0, 10).map((move) => move.move.name);
  } catch (error) {
    return { error: error.message };
  }
}

// Calculate battle outcome
function calculateBattleOutcome(playerPokemon, opponentPokemon) {
  // A simple battle calculation based on stats
  const playerTotal = playerPokemon.stats.reduce(
    (sum, stat) => sum + stat.base_stat,
    0
  );
  const opponentTotal = opponentPokemon.stats.reduce(
    (sum, stat) => sum + stat.base_stat,
    0
  );

  // Add some randomness
  const playerScore = playerTotal * (0.8 + Math.random() * 0.4);
  const opponentScore = opponentTotal * (0.8 + Math.random() * 0.4);

  return {
    winner: playerScore > opponentScore ? "player" : "opponent",
    playerScore,
    opponentScore,
    playerTotal,
    opponentTotal,
  };
}

// Get starter Pokémon by generation
async function getStarterPokemon(generation = 1) {
  try {
    const starters = {
      1: ["bulbasaur", "charmander", "squirtle"],
      2: ["chikorita", "cyndaquil", "totodile"],
      3: ["treecko", "torchic", "mudkip"],
      4: ["turtwig", "chimchar", "piplup"],
      5: ["snivy", "tepig", "oshawott"],
      6: ["chespin", "fennekin", "froakie"],
      7: ["rowlet", "litten", "popplio"],
      8: ["grookey", "scorbunny", "sobble"],
    };

    const genStarters = starters[generation] || starters[1];

    const starterData = await Promise.all(
      genStarters.map(async (name) => {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${name}`
        );
        if (!response.ok) throw new Error(`Failed to fetch ${name}`);
        return await response.json();
      })
    );

    return starterData.map((pokemon) => ({
      name: pokemon.name,
      id: pokemon.id,
      types: pokemon.types.map((t) => t.type.name),
      sprites: {
        front_default: pokemon.sprites.front_default,
        other: pokemon.sprites.other,
      },
    }));
  } catch (error) {
    return { error: error.message };
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { messages, gameState } = body;

  // Define tools for OpenAI
  const tools = [
    {
      type: "function",
      function: {
        name: "getPokemonInfo",
        description:
          "Get detailed information about a specific Pokémon by name",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the Pokémon to look up",
            },
          },
          required: ["name"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "searchPokemonByType",
        description: "Search for Pokémon of a specific type",
        parameters: {
          type: "object",
          properties: {
            type: {
              type: "string",
              description:
                "The type of Pokémon to search for (e.g., water, fire, electric)",
            },
          },
          required: ["type"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "getRandomPokemon",
        description: "Get a random Pokémon for encounter or battle",
        parameters: {
          type: "object",
          properties: {},
          required: [],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "getPokemonMoves",
        description: "Get a list of moves for a specific Pokémon",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the Pokémon to get moves for",
            },
          },
          required: ["name"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "startBattle",
        description:
          "Start a battle between the player's Pokémon and an opponent",
        parameters: {
          type: "object",
          properties: {
            playerPokemon: {
              type: "string",
              description: "The name of the player's Pokémon",
            },
            opponentPokemon: {
              type: "string",
              description: "The name of the opponent's Pokémon",
            },
          },
          required: ["playerPokemon", "opponentPokemon"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "selectStarterPokemon",
        description: "Choose a starter Pokémon to begin the adventure",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the starter Pokémon to select",
            },
          },
          required: ["name"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "getStarterPokemon",
        description: "Get a list of starter Pokémon options by generation",
        parameters: {
          type: "object",
          properties: {
            generation: {
              type: "integer",
              description: "The Pokémon generation number (1-8)",
            },
          },
          required: ["generation"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  ];

  // First, create a system message to guide the AI's behavior
  const systemMessage = {
    role: "system",
    content: `You are a Pokémon game master. You help players explore the world of Pokémon, catch new Pokémon, battle with others, and learn about different species.
    
    If the player doesn't have any Pokémon in their collection, guide them to select a starter Pokémon first. Players cannot battle or catch wild Pokémon without having at least one Pokémon in their collection.
    
    You should use the available tools to fetch accurate information about Pokémon. When users ask about specific Pokémon or want to battle, use the appropriate functions to get data.
    
    Keep responses conversational and enthusiastic, as if the player is on a real Pokémon adventure. Make references to the games, anime, and Pokémon lore when appropriate.
    
    Current game state: ${gameState ? JSON.stringify(gameState) : "New game"}`,
  };

  // Add system message if starting a new conversation
  const conversationMessages =
    messages.length > 0 && messages[0].role === "system"
      ? messages
      : [systemMessage, ...messages];

  try {
    // Initial request to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: conversationMessages,
      tools,
      tool_choice: "auto",
    });

    let assistantResponse = completion.choices[0].message;
    let updatedGameState = gameState || {};

    // Check if the assistant wants to call a function
    if (assistantResponse.tool_calls) {
      // Add the assistant's response to messages array
      const updatedMessages = [...conversationMessages, assistantResponse];

      // Process each tool call
      for (const toolCall of assistantResponse.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        let functionResponse;

        // Execute the appropriate function
        switch (functionName) {
          case "getPokemonInfo":
            functionResponse = await fetchPokemonData(functionArgs.name);
            break;
          case "searchPokemonByType":
            functionResponse = await searchPokemonByType(functionArgs.type);
            break;
          case "getRandomPokemon":
            functionResponse = await getRandomPokemon();
            // Update game state with wild Pokémon
            updatedGameState.wildPokemon = {
              name: functionResponse.name,
              id: functionResponse.id,
              types: functionResponse.types.map((t) => t.type.name),
            };
            break;
          case "getPokemonMoves":
            functionResponse = await getPokemonMoves(functionArgs.name);
            break;
            case "startBattle":
              // Only allow battles if player has a Pokémon
              if (!updatedGameState.activePokemon) {
                functionResponse = { error: "You need to select an active Pokémon first!" };
              } else {
                // Don't calculate battle outcome immediately - let the UI handle it
                functionResponse = {
                  message: "Starting battle between " + functionArgs.playerPokemon + " and " + functionArgs.opponentPokemon
                };
                
                // Just record the battle participants without determining a result
                updatedGameState.lastBattle = {
                  player: functionArgs.playerPokemon,
                  opponent: functionArgs.opponentPokemon
                };
                
                // Add this line to indicate a battle should start
                updatedGameState.startingBattle = true;
                
                // Set wild Pokemon for display purposes
                updatedGameState.wildPokemon = {
                  name: functionArgs.opponentPokemon
                };
                
                // Fetch basic Pokemon information for the opponent
                try {
                  const opponentData = await fetchPokemonData(functionArgs.opponentPokemon);
                  if (opponentData && !opponentData.error) {
                    updatedGameState.wildPokemon.id = opponentData.id;
                    updatedGameState.wildPokemon.types = opponentData.types.map(t => t.type.name);
                  }
                } catch (error) {
                  console.error("Error fetching opponent data:", error);
                }
              }
              break;
          case "selectStarterPokemon":
            functionResponse = await fetchPokemonData(functionArgs.name);
            // Update game state with starter Pokémon
            updatedGameState.collection = updatedGameState.collection || [];
            // Prevent duplicates in collection
            if (!updatedGameState.collection.includes(functionArgs.name)) {
              updatedGameState.collection.push(functionArgs.name);
            }
            updatedGameState.activePokemon = functionArgs.name;
            break;
          case "getStarterPokemon":
            const generation = functionArgs.generation || 1;
            functionResponse = await getStarterPokemon(generation);
            break;
        }

        // Add the function response to messages
        updatedMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(functionResponse),
        });
      }

      // Get a new response from the assistant
      const secondCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: updatedMessages,
        tools,
        tool_choice: "auto",
      });

      assistantResponse = secondCompletion.choices[0].message;
    }

    return {
      message: assistantResponse,
      conversation: [...conversationMessages, assistantResponse],
      gameState: updatedGameState,
    };
  } catch (error) {
    console.error("Error:", error);
    return { error: error.message };
  }
});
