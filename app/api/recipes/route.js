require('dotenv').config();
const OpenAI = require("openai");


const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY});

export async function POST(req) {
  const { recipeList } = {"tomato":2,"onion":3,"milk":4};
  try {
    const prompt= "I will give you a JSON object representing pantry items and their quantities. Based on this, create a single recipe. the recipe should be in JSON format and include the recipe name, items with their quantities, and a detailed description of how to make it. I need all the response in single parsed json object."
    const combinedPrompt= `${prompt}\n\nPantry items:\n${JSON.stringify(recipeList, null, 2)}`;
    const messages = [
    {
        role: "system",
        content:[ {
            type:"text",
            text:"return the json structure based on user requirement. Only return the json structure, nothing else. in the sample format of {\"recipe_name\":\"Recipe Name\",\"items\":{\"item1\":\"quantity\",\"item2\":\"quantity\",...},\"description\":\"Step-by-step instructions on how to make the recipe.\" ```json}",     
        },
    ],
    },
    {
        role: "user",
        content: combinedPrompt
            
    },
      
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    const recipe = response.choices[0].message.content.trim();

    if (recipe) {
        return new Response(JSON.stringify({ recipe }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'cannot get recipe' }), { status: 404 });
      }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}