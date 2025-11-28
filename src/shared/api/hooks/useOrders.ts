import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, API_ENDPOINTS } from '@app/config/api';
import { apiClient } from '@shared/api/client';
import type {
  Order,
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersByWalletParams,
  GetOrdersByTokenParams,
  OrderStatus,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
  CancelOrderRequest,
  CancelOrderResponse,
} from '@shared/api/types';

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      const response = await apiClient.post<CreateOrderResponse>(API_ENDPOINTS.orders, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.byWallet(data.wallet) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.byToken(data.token) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.list });
    },
  });
}

export function useOrderById(orderId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.orders.byId(orderId),
    queryFn: async () => {
      if (!orderId) return null;

      const response = await apiClient.get<Order>(API_ENDPOINTS.orderById(orderId));
      return response.data;
    },
    enabled: !!orderId,
    staleTime: 10000,
  });
}

export function useOrdersByWallet(params: GetOrdersByWalletParams) {
  const { wallet, status } = params;

  return useQuery({
    queryKey: QUERY_KEYS.orders.byWallet(wallet, status),
    queryFn: async () => {
      if (!wallet) return null;

      const url = API_ENDPOINTS.ordersByWallet(wallet);
      const response = await apiClient.get<Order[]>(url, {
        params: status ? { status } : undefined,
      });
      return response.data;
    },
    enabled: !!wallet,
    staleTime: 15000,
    refetchInterval: 30000,
    retry: (failureCount, error: any) => {
      if (error?.code === 'HTTP_401') {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useOrdersByToken(params: GetOrdersByTokenParams) {
  const { token, status } = params;

  return useQuery({
    queryKey: QUERY_KEYS.orders.byToken(token, status),
    queryFn: async () => {
      if (!token) return null;

      const url = API_ENDPOINTS.ordersByToken(token);
      const response = await apiClient.get<Order[]>(url, {
        params: status ? { status } : undefined,
      });
      return response.data;
    },
    enabled: !!token,
    staleTime: 15000,
    refetchInterval: 30000,
  });
}

export function useMyOrders(walletAddress?: string, status?: OrderStatus) {
  return useOrdersByWallet({
    wallet: walletAddress || '',
    status,
  });
}

export function useActiveOrders(walletAddress?: string) {
  const pendingOrders = useOrdersByWallet({ wallet: walletAddress || '', status: 'pending' });
  const triggeredOrders = useOrdersByWallet({ wallet: walletAddress || '', status: 'triggered' });
  const executingOrders = useOrdersByWallet({ wallet: walletAddress || '', status: 'executing' });

  const allActiveOrders = [
    ...(pendingOrders.data || []),
    ...(triggeredOrders.data || []),
    ...(executingOrders.data || []),
  ];

  return {
    data: allActiveOrders,
    isLoading: pendingOrders.isLoading || triggeredOrders.isLoading || executingOrders.isLoading,
    error: pendingOrders.error || triggeredOrders.error || executingOrders.error,
  };
}

export function useExpiredOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.orders.expired,
    queryFn: async () => {
      const response = await apiClient.get<Order[]>(API_ENDPOINTS.ordersExpired);
      return response.data;
    },
    staleTime: 60000,
  });
}

export function useUpdateOrderStatus(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOrderStatusRequest) => {
      const response = await apiClient.patch<UpdateOrderStatusResponse>(
        API_ENDPOINTS.orderUpdateStatus(orderId),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.list });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { orderId: string } & CancelOrderRequest) => {
      const response = await apiClient.post<CancelOrderResponse>(
        API_ENDPOINTS.orderCancel(params.orderId),
        { wallet: params.wallet }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.list });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.byWallet(variables.wallet) });
    },
  });
}
