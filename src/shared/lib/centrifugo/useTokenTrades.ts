import { useCallback, useState } from 'react';
import { useCentrifugo } from './useCentrifugo';
import { CENTRIFUGO_CHANNELS } from '@app/config/centrifugo';

export interface Trade {
  id: string;
  token_id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  wallet_address: string;
  timestamp: string;
}

export function useTokenTrades(tokenId: string | undefined) {
  const [trades, setTrades] = useState<Trade[]>([]);

  const handleMessage = useCallback((data: Trade) => {
    setTrades((prev) => [data, ...prev].slice(0, 50)); // Keep last 50 trades
  }, []);

  const { isConnected, isSubscribed, error } = useCentrifugo({
    channel: tokenId ? CENTRIFUGO_CHANNELS.tokenTrades(tokenId) : '',
    onMessage: handleMessage,
    enabled: !!tokenId,
  });

  return {
    trades,
    isConnected,
    isSubscribed,
    error,
  };
}
