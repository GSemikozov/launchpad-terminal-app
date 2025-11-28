export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  TIMEOUT: 30000,
} as const;

export const API_ENDPOINTS = {
  tokens: '/api/tokens',
  tokensLive: '/api/tokens/live',
  tokenTrades: '/api/txs',
  tokenDraft: '/api/tokens/draft',
  signTokenTx: '/api/sign-token-tx',
  generateTokenTx: '/api/generate-token-tx',
  sign: '/api/sign',
  chat: '/api/chat',
  rewards: '/api/rewards',
  orders: '/api/orders',
  orderById: (id: string) => `/api/orders/${id}`,
  ordersByWallet: (wallet: string) => `/api/orders/wallet/${wallet}`,
  ordersByToken: (token: string) => `/api/orders/token/${token}`,
  ordersExpired: '/api/orders/expired',
  orderUpdateStatus: (id: string) => `/api/orders/${id}/status`,
  orderCancel: (id: string) => `/api/orders/${id}/cancel`,
  wallets: '/api/wallets',
  walletByPublicKey: (publicKey: string) => `/api/wallets/${publicKey}`,
  walletPublicKey: '/api/wallets/publickey',
  walletsSetDefault: (publicKey: string) => `/api/wallets/${publicKey}/set-default`,
  profile: '/api/profile',
  portfolio: '/api/portfolio',
  upload: '/api/upload',
} as const;

export const QUERY_KEYS = {
  tokens: {
    list: (params?: any) => ['tokens', 'list', params] as const,
    live: (params?: any) => ['tokens', 'live', params] as const,
    trades: (tokenId?: string) => ['tokens', 'trades', tokenId] as const,
    detail: (tokenId?: string) => ['tokens', 'detail', tokenId] as const,
  },
  orders: {
    list: ['orders'] as const,
    byId: (orderId?: string) => ['orders', 'id', orderId] as const,
    byWallet: (wallet?: string, status?: string) => ['orders', 'wallet', wallet, status] as const,
    byToken: (token?: string, status?: string) => ['orders', 'token', token, status] as const,
    expired: ['orders', 'expired'] as const,
  },
  profile: (walletAddress?: string) => ['profile', walletAddress] as const,
  portfolio: (walletAddress?: string) => ['portfolio', walletAddress] as const,
  wallets: {
    list: ['wallets'] as const,
    byPublicKey: (publicKey?: string) => ['wallets', 'publicKey', publicKey] as const,
  },
  rewards: ['rewards'] as const,
  upload: ['upload'] as const,
} as const;
