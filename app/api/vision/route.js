require('dotenv').config();
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
    };

    const [result] = await client.webDetection(request);
    const webDetection = result.webDetection;

    if (webDetection.webEntities.length > 0) {
      return new Response(JSON.stringify({ name: webDetection.webEntities[0].description }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'No web entities found' }), { status: 404 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
