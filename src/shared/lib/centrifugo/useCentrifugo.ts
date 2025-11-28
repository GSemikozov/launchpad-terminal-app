import { Centrifuge, type Subscription } from 'centrifuge';
import { useEffect, useRef, useState } from 'react';
import { CENTRIFUGO_CONFIG } from '@app/config/centrifugo';

export interface UseCentrifugoOptions {
  channel: string;
  onMessage?: (data: any) => void;
  onSubscribe?: () => void;
  onUnsubscribe?: () => void;
  enabled?: boolean;
}

export function useCentrifugo({
  channel,
  onMessage,
  onSubscribe,
  onUnsubscribe,
  enabled = true,
}: UseCentrifugoOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const centrifugeRef = useRef<Centrifuge | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    if (!enabled) {
      setError(null);
      return;
    }

    if (!CENTRIFUGO_CONFIG.URL || !CENTRIFUGO_CONFIG.TOKEN) {
      setError(null);
      return;
    }

    const centrifuge = new Centrifuge(CENTRIFUGO_CONFIG.URL, {
      token: CENTRIFUGO_CONFIG.TOKEN,
    });

    centrifuge.on('connected', () => {
      setIsConnected(true);
      setError(null);
    });

    centrifuge.on('disconnected', (ctx) => {
      setIsConnected(false);
      if (ctx.reason) {
        setError(new Error(`Disconnected: ${ctx.reason}`));
        console.error('Centrifugo disconnected:', ctx.reason);
      }
    });

    centrifuge.on('error', (ctx) => {
      const errorMessage = (ctx as any).message || 'Unknown error';
      setError(new Error(`Centrifugo error: ${errorMessage}`));
      console.error('Centrifugo error:', ctx);
    });

    try {
      centrifuge.connect();
      centrifugeRef.current = centrifuge;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect to Centrifugo'));
      console.error('Failed to initialize Centrifuge:', err);
    }

    return () => {
      try {
        centrifuge.disconnect();
      } catch (err) {
        console.error('Error disconnecting Centrifugo:', err);
      }
      centrifugeRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !centrifugeRef.current || !channel) return;

    const centrifuge = centrifugeRef.current;

    // Subscribe to channel
    const subscription = centrifuge.newSubscription(channel);

    subscription.on('publication', (ctx) => {
      try {
        onMessage?.(ctx.data);
      } catch (err) {
        console.error('Error handling message:', err);
      }
    });

    subscription.on('subscribed', () => {
      setIsSubscribed(true);
      setError(null);
      onSubscribe?.();
    });

    subscription.on('unsubscribed', (ctx) => {
      setIsSubscribed(false);
      if (ctx.reason) {
        setError(new Error(`Unsubscribed: ${ctx.reason}`));
        console.error(`Unsubscribed from channel ${channel}:`, ctx.reason);
      }
      onUnsubscribe?.();
    });

    subscription.on('error', (ctx) => {
      const errorMessage = (ctx as any).message || 'Unknown error';
      setError(new Error(`Subscription error: ${errorMessage}`));
      console.error(`Subscription error on channel ${channel}:`, ctx);
    });

    try {
      subscription.subscribe();
      subscriptionRef.current = subscription;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to subscribe to channel'));
      console.error('Failed to subscribe to channel:', err);
    }

    return () => {
      try {
        subscription.unsubscribe();
      } catch (err) {
        console.error('Error unsubscribing from channel:', err);
      }
      subscriptionRef.current = null;
    };
  }, [channel, enabled, onMessage, onSubscribe, onUnsubscribe]);

  const publish = (data: any) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.publish(data);
    }
  };

  return {
    isConnected,
    isSubscribed,
    error,
    publish,
  };
}
