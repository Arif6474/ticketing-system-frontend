const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Retrieve the current authentication token from storage.
 * @returns {string|null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store the authentication token.
 * @param {string} token
 */
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Remove the authentication token.
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Retrieve stored user details.
 * @returns {object|null}
 */
export function getUser() {
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

/**
 * Store user details.
 * @param {object} user
 */
export function setUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Remove user details.
 */
export function removeUser() {
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if a token exists in storage.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(getToken());
}

/**
 * Clear all authentication data from storage.
 */
export function clearAuth() {
  removeToken();
  removeUser();
}
