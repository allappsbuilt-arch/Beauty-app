// Production backend deployed on Render.
// For local development, set EXPO_PUBLIC_API_URL in a .env.local file:
// EXPO_PUBLIC_API_URL=http://192.168.1.x:4000
const PRODUCTION_URL = 'https://beauty-app-g16l.onrender.com';

// Render's free tier sleeps when idle and can take ~50s to wake up, so allow
// for that — but never let a request hang forever and freeze the screen.
const REQUEST_TIMEOUT_MS = 60000;

function resolveApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return PRODUCTION_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Called when an authenticated request comes back 401 (expired/invalid token),
// so AuthContext can sign the user out instead of every screen failing silently.
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// Fire-and-forget ping so a sleeping Render instance starts waking up while
// the user is still on the splash/login screen.
export function warmUpServer() {
  fetch(`${API_BASE_URL}/health`).catch(() => {});
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new ApiError('The server is taking too long to respond. Please try again.', 0, null);
    }
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, null);
  } finally {
    clearTimeout(timer);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401 && token && unauthorizedHandler) {
      unauthorizedHandler(token);
    }
    throw new ApiError(data?.error || 'Something went wrong', response.status, data);
  }

  return data;
}

export { ApiError };
