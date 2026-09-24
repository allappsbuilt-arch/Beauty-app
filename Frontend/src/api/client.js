import Constants from 'expo-constants';
import { Platform } from 'react-native';

// The backend listens on port 4000 (see Backend/.env). On web / iOS
// simulator "localhost" reaches the dev machine directly. On a physical
// device (Expo Go) "localhost" means the phone itself, so we derive the
// dev machine's LAN IP from the Metro bundler's host address instead.
function resolveApiBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri && Platform.OS !== 'web') {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:4000`;
  }
  return 'http://localhost:4000';
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
