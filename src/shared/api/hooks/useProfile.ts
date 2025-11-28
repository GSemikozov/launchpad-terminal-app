import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, API_ENDPOINTS } from '@app/config/api';
import { apiClient } from '@shared/api/client';
import type { UserProfile, ProfileRequest } from '@shared/api/types';

export function useProfile(walletAddress: string | undefined, signature?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.profile(walletAddress),
    queryFn: async () => {
      if (!walletAddress) return null;

      const formData = new URLSearchParams();
      formData.append('wallet', walletAddress);
      if (signature) {
        formData.append('signature', signature);
      }

      const response = await apiClient.post<UserProfile>(
        API_ENDPOINTS.profile,
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
    staleTime: 60000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileRequest) => {
      const formData = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await apiClient.post<UserProfile>(
        API_ENDPOINTS.profile,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile(data.wallet_address) });
    },
  });
}
