import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS, QUERY_KEYS } from '@app/config/api';
import { apiClient } from '@shared/api/client';
import type {
  Wallet,
  CreateWalletRequest,
  CreateWalletResponse,
  SetDefaultWalletRequest,
  SetDefaultWalletResponse,
} from '@shared/api/types';

export function useWallets() {
  return useQuery({
    queryKey: QUERY_KEYS.wallets.list,
    queryFn: async () => {
      const response = await apiClient.get<Wallet[]>(API_ENDPOINTS.wallets);
      return response.data;
    },
    staleTime: 30000,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWalletRequest) => {
      const response = await apiClient.post<CreateWalletResponse>(API_ENDPOINTS.wallets, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallets.list });
    },
  });
}

export function useSetDefaultWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetDefaultWalletRequest) => {
      const response = await apiClient.post<SetDefaultWalletResponse>(
        API_ENDPOINTS.walletsSetDefault(data.publicKey),
        {}
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallets.list });
    },
  });
}

export function useDefaultWallet() {
  const { data: wallets, isLoading, error } = useWallets();

  const defaultWallet = wallets?.find((wallet) => wallet.isDefault);

  return {
    data: defaultWallet,
    isLoading,
    error,
  };
}

export function useWalletByPublicKey(publicKey?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.wallets.byPublicKey(publicKey),
    queryFn: async () => {
      if (!publicKey) return null;

      const response = await apiClient.get<Wallet>(API_ENDPOINTS.walletByPublicKey(publicKey));
      return response.data;
    },
    enabled: !!publicKey,
    staleTime: 30000,
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      publicKey: string;
      data: { name?: string; isDefault?: boolean };
    }) => {
      const response = await apiClient.put<Wallet>(
        API_ENDPOINTS.walletByPublicKey(params.publicKey),
        params.data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallets.list });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallets.byPublicKey(data.address) });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicKey: string) => {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        API_ENDPOINTS.walletByPublicKey(publicKey)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wallets.list });
    },
  });
}

export function useWalletPublicKey() {
  return useQuery({
    queryKey: ['wallets', 'publickey'],
    queryFn: async () => {
      const response = await apiClient.get<{ publicKey: string }>(API_ENDPOINTS.walletPublicKey);
      return response.data;
    },
    staleTime: 60000,
  });
}
