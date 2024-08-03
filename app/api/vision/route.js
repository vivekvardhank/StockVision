const vision = require('@google-cloud/vision');
const keyFilename = "../tracker/pantry.json";


const client = new vision.ImageAnnotatorClient({
  keyFilename: keyFilename
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