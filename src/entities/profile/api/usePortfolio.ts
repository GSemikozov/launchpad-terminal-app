import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, API_ENDPOINTS } from '@app/config/api';
import { apiClient } from '@shared/api/client';
import type { PortfolioToken } from '../model/types';

export function usePortfolio(walletAddress: string | undefined, signature?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.portfolio(walletAddress),
    queryFn: async () => {
      if (!walletAddress) return null;

      const formData = new URLSearchParams();
      formData.append('wallet', walletAddress);
      if (signature) {
        formData.append('signature', signature);
      }

      const response = await apiClient.post<PortfolioToken[]>(
        API_ENDPOINTS.portfolio,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data;
    },
    enabled: !!walletAddress,
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

