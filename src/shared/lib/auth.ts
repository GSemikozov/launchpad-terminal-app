const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_WALLET_KEY = 'auth_wallet';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string, wallet: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_WALLET_KEY, wallet);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_WALLET_KEY);
}

export function getAuthWallet(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_WALLET_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

