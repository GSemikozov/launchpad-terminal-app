// App configuration constants
export const APP_CONFIG = {
  APP_NAME: 'Launchpad Terminal',
  VERSION: '1.0.0',
  DEFAULT_SLIPPAGE: 1, // 1%
  MIN_SOL_BALANCE: 0.05, // Minimum SOL for transactions
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  TOKEN: '/token/:id',
  PROFILE: '/profile',
  CREATE: '/create',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'launchpad-theme',
  WALLET_PREFERENCE: 'launchpad-wallet-pref',
  SLIPPAGE: 'launchpad-slippage',
} as const;

// Solana configuration
export const SOLANA_CONFIG = {
  NETWORK: import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta',
  RPC_URL: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
} as const;
