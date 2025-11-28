import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, API_ENDPOINTS } from '@app/config/api';
import { apiClient } from '@shared/api/client';

export interface Reward {
  id?: string;
  type?: string;
  amount?: number;
  currency?: string;
  description?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown; // Allow for additional fields from API
}

export interface RewardsResponse {
  total: number;
  offset: number;
  limit: number;
  data: Reward[];
}

export interface UseRewardsParams {
  wallet: string;
  offset?: number;
  limit?: number;
}

export function useRewards(params: UseRewardsParams) {
  const { wallet, offset = 0, limit = 10 } = params;

  return useQuery({
    queryKey: [...QUERY_KEYS.rewards, wallet, offset, limit],
    queryFn: async () => {
      if (!wallet) return null;

      const response = await apiClient.get<RewardsResponse>(API_ENDPOINTS.rewards, {
        params: {
          wallet,
          offset,
          limit,
        },
      });
      return response.data;
    },
    enabled: !!wallet,
    staleTime: 60000,
    refetchInterval: 300000,
  });
}

