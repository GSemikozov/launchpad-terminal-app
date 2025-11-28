import { useCallback, useState } from 'react';
import { useCentrifugo } from './useCentrifugo';
import { CENTRIFUGO_CHANNELS } from '@app/config/centrifugo';

export interface TokenPriceUpdate {
  token_id: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  timestamp: string;
}

export function useTokenPrices() {
  const [prices, setPrices] = useState<Map<string, TokenPriceUpdate>>(new Map());

  const handleMessage = useCallback((data: TokenPriceUpdate) => {
    setPrices((prev) => {
      const updated = new Map(prev);
      updated.set(data.token_id, data);
      return updated;
    });
  }, []);

  const { isConnected, isSubscribed, error } = useCentrifugo({
    channel: CENTRIFUGO_CHANNELS.tokensPrices,
    onMessage: handleMessage,
  });

  const getPrice = useCallback(
    (tokenId: string) => {
      return prices.get(tokenId);
    },
    [prices]
  );

  return {
    prices,
    getPrice,
    isConnected,
    isSubscribed,
    error,
  };
}
