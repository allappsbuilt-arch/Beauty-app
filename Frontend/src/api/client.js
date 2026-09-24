// Production backend deployed on Render.
// For local development, set EXPO_PUBLIC_API_URL in a .env.local file:
// EXPO_PUBLIC_API_URL=http://192.168.1.x:4000
const PRODUCTION_URL = 'https://beauty-app-g16l.onrender.com';

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

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0, null);
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(data?.error || 'Something went wrong', response.status, data);
  }

  return data;
}

export { ApiError };
