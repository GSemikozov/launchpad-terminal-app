// Re-export entity types for backward compatibility
export type {
  Token,
  TokenDetail,
  TokenDraftRequest,
  TokenDraftResponse,
  SignTokenTxRequest,
  SignTokenTxResponse,
  GenerateTokenTxRequest,
  GenerateTokenTxResponse,
  TokenTrade,
  TokenTradesRequest,
  Transaction,
} from '@entities/token';
export type {
  Order,
  OrderSide,
  OrderType,
  OrderStatus,
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersByWalletParams,
  GetOrdersByTokenParams,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  CancelOrderRequest,
  CancelOrderResponse,
} from '@entities/order';
export type {
  UserProfile,
  ProfileRequest,
  PortfolioToken,
  PortfolioRequest,
} from '@entities/profile';
export type {
  Wallet,
  CreateWalletRequest,
  CreateWalletResponse,
  SetDefaultWalletRequest,
  SetDefaultWalletResponse,
} from '@entities/wallet';

// Common API types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Authentication types
export interface SignMessageRequest {
  wallet: string;
  message?: string;
  signature?: string;
  publicKey?: string;
}

export interface SignMessageResponse {
  message?: string;
  code?: string;
  token?: string;
  access_token?: string;
}
