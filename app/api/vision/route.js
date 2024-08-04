//GoogleVision Api

/**require('dotenv').config();
const crypto = require('crypto');
const vision = require('@google-cloud/vision');

function decrypt(text, key, iv) {
  let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(text, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const encryptedData = process.env.NEXT_PUBLIC_GOOGLE_APPLICATION_CREDENTIALS;
const encryptionKey = Buffer.from(process.env.NEXT_PUBLIC_ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(process.env.NEXT_PUBLIC_IV, 'hex');
const decryptedData = decrypt(encryptedData, encryptionKey, iv);

const credentials = JSON.parse(decryptedData);

const client = new vision.ImageAnnotatorClient({
  credentials: credentials
});

export async function POST(req) {
  const { imageBase64 } = await req.json();

  try {
    const request = {
      image: { content: imageBase64 },
      features: [
        { type: 'WEB_DETECTION' },
        { type: 'LABEL_DETECTION' },
        { type: 'OBJECT_LOCALIZATION' }
      ]
    };

    const [result] = await client.annotateImage(request);
    const webDetection = result.webDetection;
    const labelAnnotations = result.labelAnnotations;
    const objectAnnotations = result.localizedObjectAnnotations;

    let descriptions = [];

    if (webDetection.webEntities.length > 0) {
      descriptions.push(...webDetection.webEntities.map(entity => entity.description));
    }

    if (labelAnnotations.length > 0) {
      descriptions.push(...labelAnnotations.map(label => label.description));
    }

    if (objectAnnotations.length > 0) {
      descriptions.push(...objectAnnotations.map(object => object.name));
    }
    
    console.log(descriptions)
  
    const uniqueDescriptions = [...new Set(descriptions)];

    if (uniqueDescriptions.length > 0) {
      return new Response(JSON.stringify({ name: uniqueDescriptions[0] }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'No relevant entities found' }), { status: 404 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
**/   

//OpenAI API
require('dotenv').config();
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

export async function POST(req) {
  const { imageBase64 } = await req.json();
  try {
    const messages = [
      {
        role: "user",
        content: "Detect the main item in this image and return a single word or the most specific term representing that item.",
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/*;base64,${imageBase64}`,
            },
          },
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 15,
    });

    const itemDescription = response.choices[0].message.content.trim();

    if (itemDescription) {
      return new Response(JSON.stringify({ name: itemDescription }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'No relevant item found' }), { status: 404 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
