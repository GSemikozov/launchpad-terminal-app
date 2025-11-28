import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@app/config/api';
import { apiClient } from '@shared/api/client';

export interface ChatMessage {
  token: string;
  wallet: string;
  message: string;
  time: number;
}

export interface ChatRequest {
  token: string;
  wallet: string;
  message: string;
}

export type ChatMessagesResponse = ChatMessage[];

export interface ChatSendResponse {
  result: 'success';
}

export function useChatMessages(token: string, wallet: string) {
  return useQuery({
    queryKey: ['chat', 'messages', token, wallet],
    queryFn: async () => {
      if (!token || !wallet) return null;

      const response = await apiClient.post<ChatMessagesResponse>(API_ENDPOINTS.chat, {
        token,
        wallet,
        message: '',
      });
      return response.data;
    },
    enabled: !!token && !!wallet,
    staleTime: 10000,
    refetchInterval: 30000,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChatRequest) => {
      const response = await apiClient.post<ChatSendResponse>(API_ENDPOINTS.chat, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['chat', 'messages', variables.token, variables.wallet],
      });
    },
  });
}

export function useChat() {
  return useSendChatMessage();
}

