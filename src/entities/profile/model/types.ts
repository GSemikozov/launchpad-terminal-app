export interface UserProfile {
  wallet_address: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileRequest {
  wallet: string;
  signature?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
}

export interface PortfolioToken {
  token_id: string;
  token_name: string;
  token_symbol: string;
  token_image_url?: string;
  amount: number;
  average_buy_price?: number;
  current_price?: number;
  total_value?: number;
  pnl?: number;
  pnl_percentage?: number;
}

export interface PortfolioRequest {
  wallet: string;
  signature?: string;
}

