export interface Token {
  _id?: string;
  token: string;
  name: string;
  symbol: string;
  description?: string;
  photo?: string;
  metadataUri?: string;
  price?: number;
  priceSol?: number;
  priceUsd?: number;
  marketCapUsd?: number;
  volumeUsd?: number;
  volumeSol?: number;
  holders?: number;
  creator?: string;
  createdAt?: string;
  updatedAt?: string;
  isCurrentlyLive?: boolean;
  tokenType?: string;
  progress?: number;
  buys?: number;
  sells?: number;
  version?: number;
  supply?: number;
  decimals?: number;
  mint_time?: number;
  website?: string;
  x?: string;
  telegram?: string;
  pool?: string;
  hardcap?: number;
  list_time?: number;
  isMigrated?: boolean;
  migrationPool?: string | null;
  lastTradeId?: string;
  lastTradeExecutionPositionKey?: string | null;
  _balanceSol?: number;
  _balanceTokens?: number;
  last_tx_time?: number;
  txCount?: number;
  volume30sSol?: number;
  volume30sUsd?: number;
  smartVolume30sSol?: number;
  smartVolume30sUsd?: number;
  topHoldersPercentage?: number;
  topHoldersList?: Array<{
    wallet: string;
    amount: number;
    percentage: number;
    _id: string;
  }>;
  creatorSharePercentage?: number;
  smartHoldersCount?: number;
  whaleHoldersCount?: number;
  isDraft?: boolean;
  configAddress?: string | null;
  liveStartTime?: string | null;
  numLivestreamParticipants?: number | null;
  id?: string;
  image_url?: string;
  change_24h?: number;
  mint_address?: string;
  market_cap?: number;
  volume_24h?: number;
  creator_address?: string;
}

export interface TokenDetail extends Token {
  website_url?: string;
  twitter_url?: string;
  telegram_url?: string;
  x?: string;
  telegram?: string;
  total_supply?: number;
  circulating_supply?: number;
  bonding_curve_progress?: number;
  king_of_hill_timestamp?: string;
}

export interface TokenDraftRequest {
  name: string;
  symbol: string;
  description: string;
  decimals: number;
  supply: number;
  photo: string;
  metadataUri: string;
  hardcap: number;
  website?: string;
  x?: string;
  telegram?: string;
  version: number;
}

export interface TokenDraftResponse {
  success: true;
  token: string;
  message: string;
}

export interface SignTokenTxRequest {
  transaction: string;
  token: string;
}

export interface SignTokenTxResponse {
  success: true;
  signedTransaction: string;
}

export interface GenerateTokenTxRequest {
  tokenName: string;
  tokenSymbol: string;
  metadataUri: string;
  userPubkey: string;
  firstBuyAmount: number;
  fairlaunchHardcap: number;
  fairLaunchSupplyVariation: number;
}

export interface GenerateTokenTxResponse {
  success: true;
  signedTransaction: string;
  tokenMint: string;
}

export interface TokenTrade {
  time: number;
  token: string;
  maker: string;
  side: number;
  sol: number;
  tokens: number;
  price: number;
  tx: string;
  block: number;
}

export interface TokenTradesRequest {
  token: string;
}

export interface Transaction {
  id: string;
  token_id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  wallet_address: string;
  tx_signature: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

