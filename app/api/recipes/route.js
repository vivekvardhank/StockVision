require('dotenv').config();
const OpenAI = require("openai");
const { z } = require('zod');

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

export async function POST(req) {
  const recipeList = await req.json();
  try {
    const prompt = "I will give you a JSON object representing pantry items and their quantities. Based on this, create a single recipe. The recipe should be in JSON format and include the recipe name, items with their quantities, and a detailed description of how to make it. I need all the response in a single parsed JSON object.";
    const combinedPrompt = `${prompt}\n\nPantry items:\n${JSON.stringify(recipeList, null, 2)}`;
    const messages = [
      {
        role: "system",
        content: "return the JSON structure based on user requirement. Only return the JSON structure, nothing else. in the sample format of \"recipe\":{\"recipe_name\":\"Recipe Name\",\"items\":{\"item1\":\"quantity\",\"item2\":\"quantity\",...},\"description\":\"how to make the recipe in steps .\" }```json}",
      },
      {
        role: "user",
        content: combinedPrompt
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    let recipeData = response.choices[0].message.content.trim();
    if (recipeData.startsWith('```json')) {
      recipeData = recipeData.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    console.log('Raw recipe data:', recipeData);
   

    // Validate response using zod
    const recipeSchema = z.object({
      recipe_name: z.string(),
      items: z.record(z.string()),
      description: z.string(),
    });

    const outerSchema = z.object({
      recipe: recipeSchema,
    });

    try {
      const validatedJson = JSON.parse(recipeData);
      outerSchema.parse(validatedJson);

      console.log('Validated JSON:', validatedJson);
      return new Response(JSON.stringify({ recipe: validatedJson.recipe }), { status: 200 });
    } catch (error) {
      console.error('Invalid JSON:', error);
      return new Response(JSON.stringify({ error: 'Invalid JSON response from OpenAI' }), { status: 500 });
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
