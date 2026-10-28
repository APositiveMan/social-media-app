/** expo-secure-store doesn't support web, so the browser keeps the token in localStorage. */
const KEY = 'session-token';

export async function loadToken(): Promise<string | null> {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token: string) {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // Storage blocked (e.g. private mode): the session lasts until the page reloads.
  }
}

export async function clearToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
