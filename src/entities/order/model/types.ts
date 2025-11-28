export type OrderSide = 'buy' | 'sell';
export type OrderType = 'limit' | 'market';
export type OrderStatus =
  | 'pending'
  | 'triggered'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'expired';

export interface Order {
  orderId: string;
  wallet: string;
  token: string;
  side: OrderSide;
  status: OrderStatus;
  signature?: string;
  orderType?: OrderType;
  triggerPriceSol: number;
  triggerPriceUsd: number;
  amountSol: number;
  amountTokens: number;
  slippagePercent: number;
  createdAt: number;
  updatedAt: number;
  triggeredAt?: number;
  executedAt?: number;
  expiresAt: number;
  txSignature?: string;
  executedPriceSol?: number;
  executedPriceUsd?: number;
  executedAmountSol?: number;
  executedAmountTokens?: number;
  feeSol?: number;
  errorMessage?: string;
  executionAttempts?: number;
  lastAttemptAt?: number;
  notes?: string;
  enableStopLoss?: boolean;
  enableTakeProfit?: boolean;
}

export interface CreateOrderRequest {
  wallet: string;
  token: string;
  side: OrderSide;
  orderType: OrderType;
  triggerPriceSol: number;
  triggerPriceUsd: number;
  amountSol: number;
  amountTokens: number;
  slippagePercent: number;
  expiresAt: number;
  notes?: string;
  enableStopLoss?: boolean;
  enableTakeProfit?: boolean;
}

export interface CreateOrderResponse {
  orderId: string;
  wallet: string;
  token: string;
  side: OrderSide;
  status: OrderStatus;
  signature?: string;
  triggerPriceSol: number;
  triggerPriceUsd: number;
  amountSol: number;
  amountTokens: number;
  slippagePercent: number;
  createdAt: number;
  updatedAt: number;
  triggeredAt: number;
  executedAt: number;
  expiresAt: number;
  txSignature: string;
  executedPriceSol: number;
  executedPriceUsd: number;
  executedAmountSol: number;
  executedAmountTokens: number;
  feeSol: number;
  errorMessage: string;
  executionAttempts: number;
  lastAttemptAt: number;
  notes: string;
}

export interface GetOrdersByWalletParams {
  wallet: string;
  status?: OrderStatus;
}

export interface GetOrdersByTokenParams {
  token: string;
  status?: OrderStatus;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  triggeredAt?: number;
  executedAt?: number;
  txSignature?: string;
  executedPriceSol?: number;
  executedPriceUsd?: number;
  executedAmountSol?: number;
  executedAmountTokens?: number;
  feeSol?: number;
  errorMessage?: string;
  executionAttempts?: number;
  lastAttemptAt?: number;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  message: string;
}

export interface CancelOrderRequest {
  wallet: string;
}

export interface CancelOrderResponse {
  success: boolean;
  message: string;
}

