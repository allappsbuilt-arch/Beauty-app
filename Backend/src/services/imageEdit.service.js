const { openaiApiKey, openaiImageModel } = require('../config');
const { HttpError } = require('../utils/httpError');
const { toDataUrl } = require('./vision.service');

const OPENAI_EDITS_URL = 'https://api.openai.com/v1/images/edits';
// Image generation is much slower than analysis.
const TIMEOUT_MS = 120000;

// Sends the user's photo + an edit instruction to OpenAI's image-edit
// endpoint and returns the edited photo as a data URL. Nothing is stored.
async function editPhoto(image, prompt) {
  if (!openaiApiKey) {
    throw new HttpError(503, 'AI visualizers are not configured yet. Add OPENAI_API_KEY to the backend.');
  }

  const dataUrl = toDataUrl(image);
  const [, mime, b64] = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  const ext = mime.split('/')[1];

  const form = new FormData();
  form.append('model', openaiImageModel);
  form.append('prompt', prompt);
  form.append('size', 'auto');
  form.append('quality', 'medium');
  form.append('image', new Blob([Buffer.from(b64, 'base64')], { type: mime }), `photo.${ext}`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(OPENAI_EDITS_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { Authorization: `Bearer ${openaiApiKey}` },
      body: form,
    });
  } catch (err) {
    throw new HttpError(504, err.name === 'AbortError' ? 'The AI took too long. Please try again.' : 'Could not reach the AI service.');
  } finally {
    clearTimeout(timer);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message || '';
    console.error('OpenAI image edit error', response.status, message);
    if (response.status === 401) throw new HttpError(503, 'The AI service key is invalid. Check OPENAI_API_KEY.');
    if (response.status === 403) throw new HttpError(503, 'Image generation is not enabled for this OpenAI account (it may need organization verification).');
    if (response.status === 429) throw new HttpError(503, 'The AI service is busy or out of credit. Please try again later.');
    if (response.status === 400 && /safety|moderation/i.test(message)) {
      throw new HttpError(422, 'The AI could not edit this photo. Try a different, clear selfie.');
    }
    throw new HttpError(502, 'The AI service returned an error. Please try again.');
  }

  const out = body?.data?.[0]?.b64_json;
  if (!out) throw new HttpError(502, 'The AI service returned no image. Please try again.');
  return `data:image/png;base64,${out}`;
}

module.exports = { editPhoto };
