// server/api/pokemon.js
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to fetch Pokémon data from PokeAPI
async function fetchPokemonData(name) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
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
    const response = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`);
    if (!response.ok) {
      throw new Error(`Type not found: ${type}`);
    }
    const data = await response.json();
    return data.pokemon.slice(0, 10).map(p => p.pokemon.name); // Return first 10 results
  } catch (error) {
    return { error: error.message };
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { messages } = body;

  // Define tools for OpenAI
  const tools = [
    {
      type: "function",
      function: {
        name: "getPokemonInfo",
        description: "Get detailed information about a specific Pokémon by name",
        parameters: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the Pokémon to look up"
            }
          },
          required: ["name"],
          additionalProperties: false
        },
        strict: true
      }
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
              description: "The type of Pokémon to search for (e.g., water, fire, electric)"
            }
          },
          required: ["type"],
          additionalProperties: false
        },
        strict: true
      }
    }
  ];

  try {
    // Initial request to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools,
      tool_choice: "auto",
    });

    let assistantResponse = completion.choices[0].message;

    // Check if the assistant wants to call a function
    if (assistantResponse.tool_calls) {
      // Add the assistant's response to messages array
      const updatedMessages = [...messages, assistantResponse];
      
      // Process each tool call
      for (const toolCall of assistantResponse.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        
        let functionResponse;
        
        // Execute the appropriate function
        if (functionName === "getPokemonInfo") {
          functionResponse = await fetchPokemonData(functionArgs.name);
        } else if (functionName === "searchPokemonByType") {
          functionResponse = await searchPokemonByType(functionArgs.type);
        }
        
        // Add the function response to messages
        updatedMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(functionResponse)
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
      conversation: [...messages, assistantResponse]
    };
  } catch (error) {
    console.error("Error:", error);
    return { error: error.message };
  }
});