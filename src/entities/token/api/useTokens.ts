import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { QUERY_KEYS, API_ENDPOINTS } from '@app/config/api';
import { apiClient } from '@shared/api/client';
import type { PaginationParams } from '@shared/api/types';
import bs58 from 'bs58';
import type {
  Token,
  TokenDraftRequest,
  TokenDraftResponse,
  SignTokenTxRequest,
  SignTokenTxResponse,
  GenerateTokenTxRequest,
  GenerateTokenTxResponse,
  TokenTrade,
} from '../model/types';
import type { SignMessageRequest, SignMessageResponse } from '@shared/api/types';

export interface UseTokensParams extends PaginationParams {
  search?: string;
  sort?: 'price' | 'volume' | 'market_cap' | 'created_at';
  order?: 'asc' | 'desc';
}

export function useTokens(params?: UseTokensParams) {
  return useQuery({
    queryKey: QUERY_KEYS.tokens.list(params),
    queryFn: async () => {
      const response = await apiClient.post<{ tokens: Record<string, Token> }>(
        API_ENDPOINTS.tokens,
        params || {}
      );
      const tokensObject = response.data?.tokens || {};
      return Object.values(tokensObject);
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

interface TokensPage {
  items: Token[];
  nextPage?: number;
}

export function useInfiniteTokens(params?: Omit<UseTokensParams, 'page'>) {
  const limit = params?.limit ?? 20;

  return useInfiniteQuery<TokensPage>({
    queryKey: QUERY_KEYS.tokens.list(params),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    queryFn: async ({ pageParam }) => {
      const response = await apiClient.post<{ tokens: Record<string, Token> }>(
        API_ENDPOINTS.tokens,
        { ...params, page: pageParam, limit }
      );
      const tokensObject = response.data?.tokens || {};
      const items = Object.values(tokensObject);

      return {
        items,
        nextPage: items.length < limit ? undefined : (pageParam as number) + 1,
      };
    },
    staleTime: 30000,
  });
}

export function useTokensLive(params?: Omit<UseTokensParams, 'page'>) {
  return useQuery({
    queryKey: QUERY_KEYS.tokens.live(params),
    queryFn: async () => {
      const response = await apiClient.post<{ tokens: Record<string, Token> }>(
        API_ENDPOINTS.tokensLive,
        params || {}
      );
      const tokensObject = response.data?.tokens || {};
      return Object.values(tokensObject);
    },
    staleTime: 5000,
    refetchInterval: 10000,
  });
}

export function useTokenTrades(tokenAddress?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tokens.trades(tokenAddress),
    queryFn: async () => {
      if (!tokenAddress) return null;

      const response = await apiClient.post<TokenTrade[]>(API_ENDPOINTS.tokenTrades, {
        token: tokenAddress,
      });
      return response.data;
    },
    enabled: !!tokenAddress,
    staleTime: 10000,
    refetchInterval: 30000,
  });
}

export function useCreateTokenDraft() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TokenDraftRequest) => {
      const response = await apiClient.post<TokenDraftResponse>(API_ENDPOINTS.tokenDraft, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tokens.list() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tokens.live() });
    },
  });
}

export function useSignTokenTx() {
  return useMutation({
    mutationFn: async (data: SignTokenTxRequest) => {
      const transactionBuffer = bs58.decode(data.transaction);
      const transactionBase64 = Buffer.from(transactionBuffer).toString('base64');
      
      const response = await apiClient.post<{ success: true; signedTransaction: string }>(
        API_ENDPOINTS.signTokenTx,
        {
          ...data,
          transaction: transactionBase64,
        }
      );
      
      const signedBuffer = Buffer.from(response.data.signedTransaction, 'base64');
      const signedTransaction = bs58.encode(signedBuffer);
      
      return {
        success: true,
        signedTransaction,
      } as SignTokenTxResponse;
    },
  });
}

export function useGenerateTokenTx() {
  return useMutation({
    mutationFn: async (data: GenerateTokenTxRequest) => {
      const response = await apiClient.post<{ success: true; signedTransactionBase64: string; tokenMint: string }>(
        API_ENDPOINTS.generateTokenTx,
        data
      );
      const transactionBuffer = Buffer.from(response.data.signedTransactionBase64, 'base64');
      const signedTransaction = bs58.encode(transactionBuffer);
      
      return {
        success: true,
        signedTransaction,
        tokenMint: response.data.tokenMint,
      } as GenerateTokenTxResponse;
    },
  });
}

export function useGetSignMessage() {
  return useMutation({
    mutationFn: async (data: SignMessageRequest) => {
      const response = await apiClient.post<SignMessageResponse>(API_ENDPOINTS.sign, data);
      return response.data;
    },
  });
}

