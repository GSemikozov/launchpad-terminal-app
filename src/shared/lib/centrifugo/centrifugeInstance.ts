import { Centrifuge, type Subscription } from 'centrifuge';
import { CENTRIFUGO_CONFIG } from '@app/config/centrifugo';

let centrifugeInstance: Centrifuge | null = null;
let connectionCount = 0;
let isConnected = false;
const connectionCallbacks = new Set<{
  onConnected?: () => void;
  onDisconnected?: (reason?: string) => void;
  onError?: (error: Error) => void;
}>();
const subscriptionRefs = new Map<string, { subscription: Subscription; refCount: number }>();

function notifyConnectionCallbacks() {
  connectionCallbacks.forEach((callbacks) => {
    if (isConnected) {
      callbacks.onConnected?.();
    }
  });
}

export function getCentrifugeInstance(): Centrifuge | null {
  if (!CENTRIFUGO_CONFIG.URL || !CENTRIFUGO_CONFIG.TOKEN) {
    return null;
  }

  if (!centrifugeInstance) {
    centrifugeInstance = new Centrifuge(CENTRIFUGO_CONFIG.URL, {
      token: CENTRIFUGO_CONFIG.TOKEN,
    });

    // Add event listeners only once at the global level
    centrifugeInstance.on('connected', () => {
      isConnected = true;
      notifyConnectionCallbacks();
    });

    centrifugeInstance.on('disconnected', (ctx: any) => {
      isConnected = false;
      const reason = ctx.reason;
      connectionCallbacks.forEach((callbacks) => {
        callbacks.onDisconnected?.(reason);
      });
      // Only log unexpected disconnections
      if (reason && reason !== 'disconnect called') {
        console.error('Centrifugo disconnected:', reason);
      }
    });

    centrifugeInstance.on('error', (ctx: any) => {
      const errorMessage = (ctx as any).message || 'Unknown error';
      const error = new Error(`Centrifugo error: ${errorMessage}`);
      console.error('Centrifugo error:', ctx);
      connectionCallbacks.forEach((callbacks) => {
        callbacks.onError?.(error);
      });
    });

    try {
      centrifugeInstance.connect();
    } catch (err) {
      console.error('Failed to initialize Centrifuge:', err);
      centrifugeInstance = null;
      return null;
    }
  }

  connectionCount++;
  return centrifugeInstance;
}

export function subscribeToConnection(callbacks: {
  onConnected?: () => void;
  onDisconnected?: (reason?: string) => void;
  onError?: (error: Error) => void;
}) {
  connectionCallbacks.add(callbacks);
  // Notify immediately if already connected
  if (isConnected) {
    callbacks.onConnected?.();
  }
  return () => {
    connectionCallbacks.delete(callbacks);
  };
}

export function releaseCentrifugeInstance() {
  connectionCount--;
  // Don't disconnect if there are still active connections
  // The connection will be kept alive for the lifetime of the app
}

export function getOrCreateSubscription(channel: string): Subscription | null {
  if (!centrifugeInstance) {
    return null;
  }

  const existing = subscriptionRefs.get(channel);
  if (existing) {
    existing.refCount++;
    return existing.subscription;
  }

  // Try to get existing subscription first
  let subscription = centrifugeInstance.getSubscription(channel);
  if (!subscription) {
    // Only create new subscription if it doesn't exist
    subscription = centrifugeInstance.newSubscription(channel);
  }
  
  subscriptionRefs.set(channel, { subscription, refCount: 1 });
  return subscription;
}

export function releaseSubscription(channel: string) {
  const existing = subscriptionRefs.get(channel);
  if (existing) {
    existing.refCount--;
    if (existing.refCount <= 0) {
      subscriptionRefs.delete(channel);
      // Don't unsubscribe - let Centrifuge manage it
      // The subscription will be cleaned up automatically when not used
    }
  }
}

