import type { ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { SolanaWalletProvider } from './SolanaWalletProvider';
import { ToastProvider } from '@shared/ui';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <SolanaWalletProvider>
      <QueryProvider>
        <ToastProvider>{children}</ToastProvider>
      </QueryProvider>
    </SolanaWalletProvider>
  );
}
