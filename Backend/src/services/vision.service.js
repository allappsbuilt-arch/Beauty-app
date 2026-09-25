const { openaiApiKey, openaiModel } = require('../config');
const { HttpError } = require('../utils/httpError');

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 60000;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

// Accepts raw base64 or a data URL; returns a data URL OpenAI can read.
function toDataUrl(image) {
  if (typeof image !== 'string' || image.length < 100) {
    throw new HttpError(400, 'A photo is required');
  }
  const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
  const mime = match ? match[1] : 'image/jpeg';
  const b64 = match ? match[2] : image;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(b64.slice(0, 200))) {
    throw new HttpError(400, 'Photo must be base64-encoded');
  }
  if ((b64.length * 3) / 4 > MAX_IMAGE_BYTES) {
    throw new HttpError(413, 'Photo is too large — please use a smaller image');
  }
  return `data:${mime};base64,${b64}`;
}

// Sends one image + instructions to OpenAI and returns JSON matching `schema`
// (enforced by Structured Outputs, so the shape is guaranteed).
async function analyzeImage({ system, prompt, image, schemaName, schema, detail = 'high' }) {
  if (!openaiApiKey) {
    throw new HttpError(503, 'AI analysis is not configured yet. Add OPENAI_API_KEY to the backend.');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(OPENAI_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiApiKey}` },
      body: JSON.stringify({
        model: openaiModel,
        temperature: 0.2,
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: toDataUrl(image), detail } },
            ],
          },
        ],
        response_format: { type: 'json_schema', json_schema: { name: schemaName, strict: true, schema } },
      }),
    });
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(504, err.name === 'AbortError' ? 'AI analysis timed out. Please try again.' : 'Could not reach the AI service.');
  } finally {
    clearTimeout(timer);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    console.error('OpenAI error', response.status, body?.error?.message);
    if (response.status === 401) throw new HttpError(503, 'The AI service key is invalid. Check OPENAI_API_KEY.');
    if (response.status === 429) throw new HttpError(503, 'The AI service is busy or out of credit. Please try again later.');
    throw new HttpError(502, 'The AI service returned an error. Please try again.');
  }

  const message = body?.choices?.[0]?.message;
  if (message?.refusal) throw new HttpError(422, 'The AI could not analyse this photo. Try a different one.');
  try {
    return JSON.parse(message?.content);
  } catch {
    throw new HttpError(502, 'The AI service returned an unreadable answer. Please try again.');
  }
}

module.exports = { analyzeImage, toDataUrl };
