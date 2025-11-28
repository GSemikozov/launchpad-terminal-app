import { useMutation } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { apiClient } from '@shared/api/client';
import { API_ENDPOINTS } from '@app/config/api';
import type { SignMessageRequest, SignMessageResponse } from '@shared/api/types';

export function useSignIn() {
  const { publicKey, signMessage } = useWallet();

  return useMutation({
    mutationFn: async () => {
      if (!publicKey || !signMessage) {
        throw new Error('Wallet not connected or does not support message signing');
      }

      const walletAddress = publicKey.toBase58();

      const getMessageResponse = await apiClient.post<SignMessageResponse>(API_ENDPOINTS.sign, {
        wallet: walletAddress,
      } as SignMessageRequest);

      if (!getMessageResponse?.data) {
        throw new Error('Invalid API response');
      }

      const challenge = getMessageResponse.data.code || getMessageResponse.data.message;
      if (!challenge) {
        throw new Error('Failed to get signing challenge from API');
      }

      const messageToSign = new TextEncoder().encode(challenge);
      const signature = await signMessage(messageToSign);

      const signatureArray = Array.from(signature);
      const signatureBase64 = btoa(String.fromCharCode(...signatureArray));

      const authResponse = await apiClient.post<SignMessageResponse>(API_ENDPOINTS.sign, {
        wallet: walletAddress,
        message: challenge,
        signature: signatureBase64,
      } as SignMessageRequest);

      const token = authResponse.data?.token || authResponse.data?.access_token;
      if (token) {
        return { token };
      }

      throw new Error('No token received from API');
    },
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      // no-op for now – backend auth will be revisited later
    },
  });
}

export function useAuth() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();
  return {
    isAuthenticated: false,
    token: null,
    wallet: walletAddress,
  };
}

