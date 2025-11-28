import { type Subscription } from 'centrifuge';
import { useEffect, useRef, useState } from 'react';
import { getCentrifugeInstance, releaseCentrifugeInstance, getOrCreateSubscription, releaseSubscription, subscribeToConnection } from './centrifugeInstance';

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
  const centrifugeRef = useRef<ReturnType<typeof getCentrifugeInstance>>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    if (!enabled) {
      setError(null);
      return;
    }

    const centrifuge = getCentrifugeInstance();
    if (!centrifuge) {
      setError(null);
      return;
    }

    centrifugeRef.current = centrifuge;

    // Subscribe to connection events via callback system to avoid memory leaks
    const unsubscribe = subscribeToConnection({
      onConnected: () => {
        setIsConnected(true);
        setError(null);
      },
      onDisconnected: (reason) => {
        setIsConnected(false);
        // Only set error for unexpected disconnections
        if (reason && reason !== 'disconnect called') {
          setError(new Error(`Disconnected: ${reason}`));
        }
      },
      onError: (err) => {
        setError(err);
      },
    });

    // Check if already connected
    if (centrifuge.state === 'connected') {
      setIsConnected(true);
    }

    return () => {
      unsubscribe();
      releaseCentrifugeInstance();
      centrifugeRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !centrifugeRef.current || !channel) return;

    // Get or create subscription with reference counting
    const subscription = getOrCreateSubscription(channel);
    if (!subscription) {
      return;
    }

    subscriptionRef.current = subscription;

    const handlePublication = (ctx: any) => {
      try {
        onMessage?.(ctx.data);
      } catch (err) {
        console.error('Error handling message:', err);
      }
    };

    const handleSubscribed = () => {
      setIsSubscribed(true);
      setError(null);
      onSubscribe?.();
    };

    const handleUnsubscribed = (ctx: any) => {
      setIsSubscribed(false);
      // Only log unexpected unsubscriptions, not normal cleanup
      if (ctx.reason && ctx.reason !== 'unsubscribe called') {
        setError(new Error(`Unsubscribed: ${ctx.reason}`));
        console.error(`Unsubscribed from channel ${channel}:`, ctx.reason);
      }
      onUnsubscribe?.();
    };

    const handleError = (ctx: any) => {
      const errorMessage = (ctx as any).message || 'Unknown error';
      setError(new Error(`Subscription error: ${errorMessage}`));
      console.error(`Subscription error on channel ${channel}:`, ctx);
    };

    // Add event listeners
    subscription.on('publication', handlePublication);
    subscription.on('subscribed', handleSubscribed);
    subscription.on('unsubscribed', handleUnsubscribed);
    subscription.on('error', handleError);

    // Check if already subscribed
    if (subscription.state === 'subscribed') {
      setIsSubscribed(true);
    } else {
      // Subscribe if not already subscribed
      try {
        subscription.subscribe();
      } catch (err) {
        // If subscription already exists, that's okay - it means another component already subscribed
        if (err instanceof Error && err.message.includes('already exists')) {
          setIsSubscribed(true);
        } else {
          setError(err instanceof Error ? err : new Error('Failed to subscribe to channel'));
          console.error('Failed to subscribe to channel:', err);
        }
      }
    }

    return () => {
      // Remove event listeners
      subscription.off('publication', handlePublication);
      subscription.off('subscribed', handleSubscribed);
      subscription.off('unsubscribed', handleUnsubscribed);
      subscription.off('error', handleError);
      
      // Release subscription reference
      releaseSubscription(channel);
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
