export const CENTRIFUGO_CONFIG = {
  URL: import.meta.env.VITE_CENTRIFUGO_URL,
  TOKEN: import.meta.env.VITE_CENTRIFUGO_TOKEN,
} as const;

// Centrifugo channels
export const CENTRIFUGO_CHANNELS = {
  tokens: 'tokens',
  tokensPrices: 'tokens',
  token: (id: string) => `token:${id}`,
  tokenTrades: (id: string) => `token:${id}:trades`,
  orders: 'orders',
  trades: 'trades',
} as const;
